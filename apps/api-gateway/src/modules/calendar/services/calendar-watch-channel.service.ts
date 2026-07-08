import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { GoogleCalendarProvider } from './google-calendar.provider';
import { OutlookCalendarProvider } from './outlook-calendar.provider';

type Provider = 'google' | 'outlook';

/**
 * Manages provider push-notification channels (Google `events.watch` /
 * Microsoft Graph subscriptions) so calendar changes trigger autopilot in
 * near-real-time instead of via a 5-minute poll.
 *
 * Pure watch lifecycle only — it has no dependency on AutopilotService, which
 * keeps the module graph acyclic (AutopilotModule → CalendarModule). The
 * reactive side (notification → reschedule) lives in the AutopilotModule
 * webhook controller, which resolves the owning user through this service.
 */
@Injectable()
export class CalendarWatchChannelService {
  private readonly logger = new Logger(CalendarWatchChannelService.name);
  // Renew a little before the provider hard-expiry so we never miss a window.
  private readonly RENEW_WITHIN_MS = 24 * 60 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly google: GoogleCalendarProvider,
    private readonly outlook: OutlookCalendarProvider,
  ) {}

  // ==================== PUBLIC URL / GUARDS ====================

  private apiBase(): string | null {
    const base =
      this.config.get<string>('API_PUBLIC_URL') ||
      this.config.get<string>('APP_URL') ||
      null;
    return base ? base.replace(/\/$/, '') : null;
  }

  /** Webhooks require a public HTTPS endpoint; localhost/http can't receive them. */
  private webhookUrl(provider: Provider): string | null {
    const base = this.apiBase();
    if (!base) return null;
    const allowInsecure = this.config.get<string>('CALENDAR_WEBHOOK_ALLOW_INSECURE') === 'true';
    if (!base.startsWith('https://') && !allowInsecure) return null;
    if (/localhost|127\.0\.0\.1/.test(base) && !allowInsecure) return null;
    return `${base}/api/v1/calendar/webhooks/${provider}`;
  }

  /** True when the deploy can register real webhooks (used to decide poll fallback). */
  webhooksAvailable(): boolean {
    return this.webhookUrl('google') !== null;
  }

  // ==================== REGISTER ====================

  /** Ensure watch channels exist for every connected, sync-enabled provider. */
  async ensureWatchesForUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { autopilotEnabled: true },
    });
    if (!user?.autopilotEnabled) return; // watches only matter for autopilot users

    const tokens = await this.prisma.calendarToken.findMany({
      where: { userId, syncEnabled: true, provider: { in: ['google', 'outlook'] } },
    });
    for (const token of tokens) {
      await this.ensureWatch(userId, token.provider as Provider).catch((err) =>
        this.logger.warn(
          `ensureWatch(${token.provider}) failed for ${userId}: ${err?.message || err}`,
        ),
      );
    }
  }

  /** Register (or refresh) a single provider's watch if missing/expiring. */
  async ensureWatch(userId: string, provider: Provider): Promise<void> {
    const url = this.webhookUrl(provider);
    if (!url) {
      this.logger.debug(
        `Skipping ${provider} watch for ${userId}: no public HTTPS webhook URL configured`,
      );
      return;
    }

    const token = await this.prisma.calendarToken.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!token || !token.syncEnabled) return;

    const stillFresh =
      token.watchExpiration &&
      token.watchExpiration.getTime() - Date.now() > this.RENEW_WITHIN_MS;
    const hasChannel = provider === 'google' ? !!token.watchChannelId : !!token.graphSubscriptionId;
    if (hasChannel && stillFresh) return; // healthy — nothing to do

    // Replace any stale channel before creating a new one.
    if (hasChannel) await this.stopWatch(userId, provider).catch(() => undefined);

    const clientState = crypto.randomBytes(24).toString('hex');
    if (provider === 'google') {
      const channelId = crypto.randomUUID();
      const { resourceId, expiration } = await this.google.watchEvents(
        userId,
        url,
        channelId,
        clientState,
      );
      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          watchChannelId: channelId,
          watchResourceId: resourceId,
          watchExpiration: expiration,
          watchClientState: clientState,
        },
      });
      this.logger.log(`Registered Google watch channel for ${userId} (expires ${expiration?.toISOString()})`);
    } else {
      const { id, expiration } = await this.outlook.createSubscription(userId, url, clientState);
      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          graphSubscriptionId: id,
          watchExpiration: expiration,
          watchClientState: clientState,
        },
      });
      this.logger.log(`Registered Graph subscription for ${userId} (expires ${expiration.toISOString()})`);
    }
  }

  // ==================== TEARDOWN ====================

  async stopWatchesForUser(userId: string): Promise<void> {
    await Promise.all([
      this.stopWatch(userId, 'google').catch(() => undefined),
      this.stopWatch(userId, 'outlook').catch(() => undefined),
    ]);
  }

  async stopWatch(userId: string, provider: Provider): Promise<void> {
    const token = await this.prisma.calendarToken.findUnique({
      where: { userId_provider: { userId, provider } },
    });
    if (!token) return;

    if (provider === 'google' && token.watchChannelId && token.watchResourceId) {
      await this.google.stopWatch(userId, token.watchChannelId, token.watchResourceId);
    } else if (provider === 'outlook' && token.graphSubscriptionId) {
      await this.outlook.deleteSubscription(userId, token.graphSubscriptionId);
    }

    await this.prisma.calendarToken.update({
      where: { id: token.id },
      data: {
        watchChannelId: null,
        watchResourceId: null,
        graphSubscriptionId: null,
        watchExpiration: null,
        watchClientState: null,
      },
    });
  }

  // ==================== RESOLUTION (used by webhook controller) ====================

  /** Verify a Google notification and return the owning user + today's date. */
  async resolveGoogleChannel(
    channelId: string,
    channelToken: string | undefined,
  ): Promise<{ userId: string } | null> {
    if (!channelId) return null;
    const token = await this.prisma.calendarToken.findFirst({
      where: { watchChannelId: channelId, provider: 'google' },
      select: { userId: true, watchClientState: true },
    });
    if (!token) return null;
    if (token.watchClientState && channelToken && token.watchClientState !== channelToken) {
      this.logger.warn(`Google webhook token mismatch for channel ${channelId}`);
      return null;
    }
    return { userId: token.userId };
  }

  /** Verify a Graph notification's clientState and return the owning user. */
  async resolveGraphSubscription(
    subscriptionId: string,
    clientState: string | undefined,
  ): Promise<{ userId: string } | null> {
    if (!subscriptionId) return null;
    const token = await this.prisma.calendarToken.findFirst({
      where: { graphSubscriptionId: subscriptionId, provider: 'outlook' },
      select: { userId: true, watchClientState: true },
    });
    if (!token) return null;
    if (token.watchClientState && token.watchClientState !== clientState) {
      this.logger.warn(`Graph webhook clientState mismatch for subscription ${subscriptionId}`);
      return null;
    }
    return { userId: token.userId };
  }

  // ==================== RENEWAL / RECONCILIATION ====================

  /**
   * Hourly: create missing channels for autopilot users and renew any that are
   * within the renewal window. Also self-heals after a Google 404 (recreates).
   */
  @Cron(CronExpression.EVERY_HOUR, { name: 'calendar-watch-renewal', timeZone: 'UTC' })
  async renewChannels() {
    if (!this.webhooksAvailable()) return;

    const users = await this.prisma.user.findMany({
      where: { autopilotEnabled: true, calendarTokens: { some: { syncEnabled: true } } },
      select: { id: true },
    });
    if (users.length === 0) return;

    this.logger.debug(`Calendar watch renewal: reconciling ${users.length} user(s)`);
    for (const user of users) {
      await this.ensureWatchesForUser(user.id).catch((err) =>
        this.logger.warn(`Renewal failed for ${user.id}: ${err?.message || err}`),
      );
    }
  }
}
