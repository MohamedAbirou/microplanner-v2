import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { AutopilotService } from './autopilot.service';

/**
 * Watches connected calendars for change and triggers a same-day autopilot
 * reschedule. Uses a 5-minute poll (a lightweight, provider-agnostic alternative
 * to Google push channels) comparing a signature of the next 48h of events.
 */
@Injectable()
export class CalendarWatchService {
  private readonly logger = new Logger(CalendarWatchService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
    private autopilotService: AutopilotService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'autopilot-calendar-watch', timeZone: 'UTC' })
  async handleCalendarWatch() {
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
