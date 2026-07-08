import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarProviderId, NormalizedCalendarEvent } from '../calendar/services/calendar-provider.interface';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Enforces Reclaim-style calendar defense: scans upcoming meetings and, per the
 * user's CalendarDefense rules, auto-declines those that land on protected focus
 * time, no-meeting days, or outside working hours. Every action is logged and
 * de-duplicated so a meeting is never declined twice.
 */
@Injectable()
export class CalendarDefenseExecutor {
  private readonly logger = new Logger(CalendarDefenseExecutor.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'calendar-defense', timeZone: 'UTC' })
  async handleScheduledDefense() {
    const users = await this.prisma.user.findMany({
      where: {
        calendarTokens: { some: { syncEnabled: true } },
        calendarDefense: { is: {} },
      },
      select: { id: true },
    });
    if (users.length === 0) return;
    this.logger.debug(`Calendar defense sweep for ${users.length} user(s)`);
    for (const user of users) {
      try {
        await this.runDefense(user.id);
      } catch (err) {
        this.logger.warn(
          `Defense failed for user ${user.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  /** Scan the next 7 days and enforce defense rules. Returns count of actions. */
  async runDefense(userId: string): Promise<{ actions: number }> {
    const defense = await this.prisma.calendarDefense.findUnique({ where: { userId } });
    if (!defense) return { actions: 0 };

    const [focusBlocks, noMeetingDays, workHours] = await Promise.all([
      this.prisma.focusTimeBlock.findMany({
        where: { userId, isActive: true, protected: true },
      }),
      this.prisma.noMeetingDay.findMany({ where: { userId, isActive: true } }),
      this.prisma.workHours.findUnique({ where: { userId } }),
    ]);

    const noMeetingSet = new Set(noMeetingDays.map((d) => d.dayOfWeek));
    const schedule = (workHours?.schedule as Record<string, any>) || null;

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    const events = await this.calendarService.getEventsForPlanning(userId, start, end);
    let actions = 0;

    for (const ev of events) {
      if (ev.isAllDay || !ev.isMeeting || ev.organizerSelf) continue;
      if (ev.selfResponse === 'declined') continue;
      if (ev.start.getTime() < Date.now()) continue;

      const reason = this.violationReason(ev, defense, focusBlocks, noMeetingSet, schedule);
      if (!reason) continue;

      // De-dupe: never act on the same event/action twice.
      const already = await this.prisma.calendarDefenseLog.findFirst({
        where: { userId, eventId: ev.id, action: 'auto_decline' },
      });
      if (already) continue;

      try {
        await this.calendarService.respondToEventOnProvider(
          userId,
          ev.provider as CalendarProviderId,
          ev.id,
          'declined',
        );
        await this.prisma.calendarDefenseLog.create({
          data: {
            userId,
            eventId: ev.id,
            provider: ev.provider,
            action: 'auto_decline',
            eventTitle: ev.title,
            eventStart: ev.start,
            reason,
          },
        });
        actions++;
        this.logger.log(`Auto-declined "${ev.title}" for user ${userId}: ${reason}`);
      } catch (err) {
        this.logger.warn(
          `Failed to decline event ${ev.id} for user ${userId}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    return { actions };
  }

  async getDefenseLog(userId: string, limit = 20) {
    return this.prisma.calendarDefenseLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
  }

  private violationReason(
    ev: NormalizedCalendarEvent,
    defense: any,
    focusBlocks: any[],
    noMeetingSet: Set<number>,
    schedule: Record<string, any> | null,
  ): string | null {
    const dow = ev.start.getDay();
    const evStart = ev.start.getHours() * 60 + ev.start.getMinutes();
    const evEnd = ev.end.getHours() * 60 + ev.end.getMinutes();

    if (noMeetingSet.has(dow)) {
      return 'Booked on a no-meeting day';
    }

    if (defense.autoDeclineDuringFocusTime) {
      for (const fb of focusBlocks) {
        if (!fb.startTime || !fb.daysOfWeek.includes(dow)) continue;
        const s = this.toMinutes(fb.startTime);
        const e = s + fb.durationMinutes;
        if (evStart < e && evEnd > s) {
          return `Overlaps protected focus time "${fb.title}"`;
        }
      }
    }

    if (defense.autoDeclineOutsideWorkHours) {
      const win = this.workWindow(schedule, ev.start);
      if (!win) return 'Booked outside your working days';
      if (evStart < win.start || evEnd > win.end) {
        return 'Booked outside your working hours';
      }
    }

    return null;
  }

  private workWindow(schedule: Record<string, any> | null, date: Date): { start: number; end: number } | null {
    const dayName = DAY_NAMES[date.getDay()];
    if (schedule && schedule[dayName]) {
      const day = schedule[dayName];
      if (!day.isWorkDay) return null;
      return { start: this.toMinutes(day.startTime || '09:00'), end: this.toMinutes(day.endTime || '17:00') };
    }
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return null;
    return { start: 9 * 60, end: 17 * 60 };
  }

  private toMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  }
}
