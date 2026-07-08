import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../database/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: { action: string; title: string }[];
}

/** Notification categories → the NotificationPreferences flag that gates them. */
type PushEventType = 'taskDue' | 'focusBlock' | 'meeting' | 'dailyPlan' | 'autopilot' | 'ritual' | 'test';

const TYPE_TO_PREF: Partial<Record<PushEventType, keyof PrefFlags>> = {
  taskDue: 'taskDueAlerts',
  focusBlock: 'focusTimeAlerts',
  meeting: 'upcomingMeetingAlerts',
};

interface PrefFlags {
  taskDueAlerts: boolean;
  focusTimeAlerts: boolean;
  upcomingMeetingAlerts: boolean;
}

@Injectable()
export class PushNotificationService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationService.name);
  private configured = false;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT') || 'mailto:support@microplanner.app';
    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
      this.logger.log('Web Push configured (VAPID keys present)');
    } else {
      this.logger.warn('Web Push not configured — set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY to enable');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Send a push to every device a user has registered, honouring their
   * notification preferences and quiet hours. Expired subscriptions are pruned.
   */
  async sendToUser(
    userId: string,
    payload: PushPayload,
    options: { eventType?: PushEventType; bypassQuietHours?: boolean } = {},
  ): Promise<{ sent: number; pruned: number; skipped?: string }> {
    if (!this.configured) return { sent: 0, pruned: 0, skipped: 'not_configured' };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true, notificationPreferences: true },
    });
    if (!user || !user.pushTokens?.length) return { sent: 0, pruned: 0, skipped: 'no_tokens' };

    const prefs: any = user.notificationPreferences;
    if (prefs) {
      if (!prefs.pushEnabled) return { sent: 0, pruned: 0, skipped: 'push_disabled' };
      const flag = options.eventType ? TYPE_TO_PREF[options.eventType] : undefined;
      if (flag && prefs[flag] === false) return { sent: 0, pruned: 0, skipped: `pref_${flag}` };
      if (!options.bypassQuietHours && this.inQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
        return { sent: 0, pruned: 0, skipped: 'quiet_hours' };
      }
    }

    let sent = 0;
    const staleEndpoints: string[] = [];
    for (const raw of user.pushTokens) {
      let subscription: any;
      try {
        subscription = JSON.parse(raw);
      } catch {
        continue; // malformed token — ignore
      }
      try {
        await this.sendToSubscription(subscription, payload);
        sent++;
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          if (subscription?.endpoint) staleEndpoints.push(subscription.endpoint);
        } else {
          this.logger.warn(`Push send failed (status ${status}): ${err?.message || err}`);
        }
      }
    }

    if (staleEndpoints.length > 0) {
      await this.pruneTokens(userId, user.pushTokens, staleEndpoints);
    }
    return { sent, pruned: staleEndpoints.length };
  }

  /** Low-level send to a single subscription. Throws with statusCode on failure. */
  async sendToSubscription(subscription: any, payload: PushPayload): Promise<void> {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  }

  private async pruneTokens(userId: string, current: string[], staleEndpoints: string[]) {
    const stale = new Set(staleEndpoints);
    const kept = current.filter((t) => {
      try {
        return !stale.has(JSON.parse(t)?.endpoint);
      } catch {
        return true;
      }
    });
    await this.prisma.user.update({ where: { id: userId }, data: { pushTokens: kept } });
    this.logger.log(`Pruned ${current.length - kept.length} expired push token(s) for user ${userId}`);
  }

  /** True when the current UTC time is within [start, end] (supports overnight wrap). */
  private inQuietHours(start?: string, end?: string): boolean {
    if (!start || !end) return false;
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const now = new Date();
    const cur = now.getUTCHours() * 60 + now.getUTCMinutes();
    const s = toMin(start);
    const e = toMin(end);
    if (s === e) return false;
    return s < e ? cur >= s && cur < e : cur >= s || cur < e;
  }
}
