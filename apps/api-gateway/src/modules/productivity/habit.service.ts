import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import type { Habit } from '@microplanner/database';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarProviderId } from '../calendar/services/calendar-provider.interface';

export interface CreateHabitDto {
  title: string;
  daysOfWeek?: number[];
  preferredWindowStart: string;
  preferredWindowEnd: string;
  durationMinutes: number;
  priority?: number;
  flexible?: boolean;
  color?: string;
}
export interface UpdateHabitDto extends Partial<CreateHabitDto> {
  isActive?: boolean;
}

interface Interval {
  s: number;
  e: number;
}
const STEP = 15;

/**
 * Flexible recurring habits. Each active habit is placed into a free slot within
 * its preferred window every day (working around meetings/focus time/tasks) and
 * written to the primary calendar as a busy "🔁 …" event that moves with conflicts.
 */
@Injectable()
export class HabitService {
  private readonly logger = new Logger(HabitService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  // ==================== CRUD ====================

  async getHabits(userId: string): Promise<Habit[]> {
    return this.prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async createHabit(userId: string, dto: CreateHabitDto): Promise<Habit> {
    const habit = await this.prisma.habit.create({
      data: {
        userId,
        title: dto.title,
        daysOfWeek: dto.daysOfWeek || [1, 2, 3, 4, 5],
        preferredWindowStart: dto.preferredWindowStart,
        preferredWindowEnd: dto.preferredWindowEnd,
        durationMinutes: dto.durationMinutes,
        priority: dto.priority ?? 5,
        flexible: dto.flexible ?? true,
        color: dto.color || '#8B5CF6',
      },
    });
    void this.placeHabits(userId).catch(() => undefined);
    return habit;
  }

  async updateHabit(id: string, userId: string, dto: UpdateHabitDto): Promise<Habit> {
    const existing = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Habit not found');
    const updated = await this.prisma.habit.update({ where: { id }, data: dto });
    if (updated.isActive) void this.placeHabits(userId).catch(() => undefined);
    else void this.removeFromCalendar(updated).catch(() => undefined);
    return updated;
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Habit not found');
    await this.removeFromCalendar(existing);
    await this.prisma.habit.delete({ where: { id } });
  }

  // ==================== SCHEDULING ====================

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'habit-scheduler', timeZone: 'UTC' })
  async handleScheduledPlacement() {
    const users = await this.prisma.user.findMany({
      where: {
        calendarTokens: { some: { syncEnabled: true } },
        habits: { some: { isActive: true } },
      },
      select: { id: true },
    });
    for (const user of users) {
      try {
        await this.placeHabits(user.id);
      } catch (err) {
        this.logger.warn(`Habit placement failed for ${user.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  /** Place today's active habits into free slots and mirror to the calendar. */
  async placeHabits(userId: string): Promise<{ placed: number }> {
    const primary = await this.calendarService.getPrimaryProvider(userId);
    if (!primary) return { placed: 0 };

    const today = new Date();
    const dow = today.getDay();
    const dayStart = new Date(today);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const habits = await this.prisma.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { priority: 'asc' },
    });
    const todays = habits.filter((h) => h.daysOfWeek.includes(dow));
    if (todays.length === 0) return { placed: 0 };

    // Shared busy set for the day: calendar events + focus blocks + tasks.
    const busy = await this.dayBusy(userId, dayStart, dayEnd, dow);
    // Reserve already-placed habits so they don't stack on each other.
    const placedIntervals: Interval[] = [...busy];

    let placed = 0;
    for (const habit of todays) {
      const winStart = this.toMin(habit.preferredWindowStart);
      const winEnd = this.toMin(habit.preferredWindowEnd);
      const duration = habit.durationMinutes;

      let slot: Interval | null = null;
      if (habit.flexible) {
        slot = this.findSlot(winStart, duration, winEnd, placedIntervals);
      }
      if (!slot) {
        // Fixed habit, or no free slot: fall back to the window start.
        slot = { s: winStart, e: winStart + duration };
      }
      placedIntervals.push(slot);

      const sig = this.signature(habit, dayStart, slot.s, primary);
      if (habit.calendarEventId && habit.calendarSyncSig === sig && habit.calendarProvider === primary) {
        continue; // already correctly placed
      }

      try {
        if (habit.calendarEventId && habit.calendarProvider) {
          await this.calendarService
            .deleteEventOnProvider(userId, habit.calendarProvider as CalendarProviderId, habit.calendarEventId)
            .catch(() => undefined);
        }
        const start = new Date(dayStart);
        start.setMinutes(slot.s);
        const end = new Date(dayStart);
        end.setMinutes(slot.e);
        const event = await this.calendarService.createEventOnProvider(userId, primary, {
          title: `🔁 ${habit.title}`,
          description: 'Flexible habit (MicroPlanner). Moves around your meetings.',
          start,
          end,
          busy: true,
        });
        await this.prisma.habit.update({
          where: { id: habit.id },
          data: {
            calendarEventId: event.id,
            calendarProvider: primary,
            calendarSyncSig: sig,
            calendarSyncedAt: new Date(),
          },
        });
        placed++;
      } catch (err) {
        this.logger.warn(`Failed to place habit ${habit.id}: ${err instanceof Error ? err.message : err}`);
      }
    }
    return { placed };
  }

  async removeFromCalendar(habit: { userId: string; calendarEventId: string | null; calendarProvider: string | null }) {
    if (!habit.calendarEventId || !habit.calendarProvider) return;
    await this.calendarService
      .deleteEventOnProvider(habit.userId, habit.calendarProvider as CalendarProviderId, habit.calendarEventId)
      .catch(() => undefined);
  }

  private async dayBusy(userId: string, dayStart: Date, dayEnd: Date, dow: number): Promise<Interval[]> {
    const busy: Interval[] = [];
    const events = await this.calendarService.getEventsForPlanning(userId, dayStart, dayEnd);
    for (const ev of events) {
      if (ev.isAllDay) continue;
      const s = ev.start.getHours() * 60 + ev.start.getMinutes();
      const e = ev.end <= dayEnd ? ev.end.getHours() * 60 + ev.end.getMinutes() : 24 * 60;
      if (e > s) busy.push({ s, e });
    }
    const focus = await this.prisma.focusTimeBlock.findMany({
      where: { userId, isActive: true, protected: true },
    });
    for (const fb of focus) {
      if (fb.startTime && fb.daysOfWeek.includes(dow)) {
        const s = this.toMin(fb.startTime);
        busy.push({ s, e: s + fb.durationMinutes });
      }
    }
    const tasks = await this.prisma.task.findMany({
      where: { userId, isCompleted: false, scheduledDate: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true, endTime: true, durationMinutes: true },
    });
    for (const t of tasks) {
      if (!t.startTime) continue;
      const s = this.toMin(t.startTime);
      const e = t.endTime ? this.toMin(t.endTime) : s + (t.durationMinutes || 30);
      busy.push({ s, e });
    }
    return busy;
  }

  private findSlot(earliest: number, duration: number, windowEnd: number, busy: Interval[]): Interval | null {
    for (let start = earliest; start + duration <= windowEnd; start += STEP) {
      const end = start + duration;
      if (!busy.some((b) => start < b.e && end > b.s)) return { s: start, e: end };
    }
    return null;
  }

  private signature(habit: Habit, dayStart: Date, startMin: number, provider: string): string {
    return crypto
      .createHash('sha1')
      .update([habit.title, habit.durationMinutes, dayStart.toDateString(), startMin, provider].join('|'))
      .digest('hex');
  }

  private toMin(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  }
}
