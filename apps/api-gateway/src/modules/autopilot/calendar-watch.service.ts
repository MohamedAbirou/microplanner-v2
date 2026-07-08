import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarWatchChannelService } from '../calendar/services/calendar-watch-channel.service';
import { AutopilotService } from './autopilot.service';

/**
 * FALLBACK ONLY. When the deploy has a public HTTPS endpoint, calendar changes
 * are delivered by provider push channels (Google `events.watch` / Graph
 * subscriptions) via {@link CalendarWebhookController} — see
 * {@link CalendarWatchChannelService}. This 5-minute poll is a degraded
 * alternative used only when webhooks can't be registered (e.g. local dev with
 * no public URL) or when `CALENDAR_WATCH_FALLBACK_POLL=true` forces it on.
 */
@Injectable()
export class CalendarWatchService {
  private readonly logger = new Logger(CalendarWatchService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
    private watchChannels: CalendarWatchChannelService,
    private autopilotService: AutopilotService,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'autopilot-calendar-watch', timeZone: 'UTC' })
  async handleCalendarWatch() {
    // Push webhooks are the production path — only poll when they're unavailable
    // or explicitly forced on for a webhook-less environment.
    const forcePoll = this.config.get<string>('CALENDAR_WATCH_FALLBACK_POLL') === 'true';
    if (this.watchChannels.webhooksAvailable() && !forcePoll) return;

    const users = await this.prisma.user.findMany({
      where: {
        autopilotEnabled: true,
        calendarTokens: { some: { syncEnabled: true } },
      },
      select: { id: true, autopilotCalendarSig: true },
    });
    if (users.length === 0) return;

    this.logger.debug(`Autopilot calendar watch: checking ${users.length} user(s)`);
    for (const user of users) {
      try {
        await this.checkUser(user.id, user.autopilotCalendarSig);
      } catch (err) {
        this.logger.warn(
          `Calendar watch failed for user ${user.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  private async checkUser(userId: string, previousSig: string | null) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2); // today + tomorrow

    const events = await this.calendarService.getEventsForPlanning(userId, start, end);
    const signature = this.signature(events);

    if (signature === previousSig) return;

    // First observation just establishes a baseline — nothing to reschedule yet.
    await this.prisma.user.update({
      where: { id: userId },
      data: { autopilotCalendarSig: signature },
    });
    if (previousSig === null) return;

    this.logger.log(`Calendar change detected for user ${userId} — running autopilot`);
    await this.autopilotService.rescheduleDay(userId, start, 'calendar_change');
  }

  private signature(events: { id: string; start: Date; end: Date }[]): string {
    const canonical = events
      .map((e) => `${e.id}:${e.start.getTime()}:${e.end.getTime()}`)
      .sort()
      .join('|');
    return crypto.createHash('sha1').update(canonical).digest('hex');
  }
}
