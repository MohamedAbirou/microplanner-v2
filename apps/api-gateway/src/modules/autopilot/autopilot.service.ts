import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { PushNotificationService } from '../notifications/push-notification.service';

interface Interval {
  s: number; // minutes from midnight
  e: number;
}

export interface AutopilotMove {
  taskId: string;
  title: string;
  fromDate: string;
  fromStart: string;
  toDate: string;
  toStart: string;
  toEnd: string;
  reason: string;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const STEP = 15;

/**
 * Full-day autopilot. Re-packs a day's incomplete tasks around fixed commitments
 * (work hours, protected focus blocks, and calendar events from every connected
 * provider), honouring priority order and same-day task dependencies. In AUTO
 * mode changes are applied immediately; in SUGGEST mode a pending proposal is
 * stored for the user to accept.
 */
@Injectable()
export class AutopilotService {
  private readonly logger = new Logger(AutopilotService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
    private pushService: PushNotificationService,
  ) {}

  // ==================== SETTINGS ====================

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { autopilotEnabled: true, autopilotMode: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const [pending, recent] = await Promise.all([
      this.prisma.autopilotProposal.findFirst({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.autopilotProposal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      enabled: user.autopilotEnabled,
      mode: user.autopilotMode,
      pending: pending || null,
      recent,
    };
  }

  async updateSettings(userId: string, input: { enabled?: boolean; mode?: string }) {
    const data: any = {};
    if (input.enabled !== undefined) data.autopilotEnabled = input.enabled;
    if (input.mode !== undefined) {
      const mode = input.mode.toUpperCase();
      if (mode !== 'AUTO' && mode !== 'SUGGEST') {
        throw new BadRequestException('mode must be AUTO or SUGGEST');
      }
      data.autopilotMode = mode;
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { autopilotEnabled: true, autopilotMode: true },
    });
    return { enabled: user.autopilotEnabled, mode: user.autopilotMode };
  }

  // ==================== PROPOSAL LIFECYCLE ====================

  async applyProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.autopilotProposal.findFirst({
      where: { id: proposalId, userId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'PENDING') {
      throw new BadRequestException('Proposal is no longer pending');
    }
    await this.applyMoves(userId, proposal.moves as unknown as AutopilotMove[]);
    return this.prisma.autopilotProposal.update({
      where: { id: proposalId },
      data: { status: 'APPLIED', appliedAt: new Date() },
    });
  }

  async dismissProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.autopilotProposal.findFirst({
      where: { id: proposalId, userId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return this.prisma.autopilotProposal.update({
      where: { id: proposalId },
      data: { status: 'DISMISSED' },
    });
  }

  // ==================== CORE RESCHEDULE ====================

  /**
   * Reschedule a single day. Returns the created proposal (AUTO_APPLIED or
   * PENDING) or null when there is nothing to move.
   */
  async rescheduleDay(
    userId: string,
    date: Date,
    trigger: 'calendar_change' | 'manual' | 'daily_cron' = 'manual',
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { autopilotMode: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const mode = user.autopilotMode === 'AUTO' ? 'AUTO' : 'SUGGEST';

    const dayStart = this.startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const dow = dayStart.getDay();

    const window = await this.workWindow(userId, dayStart);
    if (!window) return null; // day off — leave the schedule alone

    // Tasks eligible to be moved (running-timer tasks are left in place).
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        scheduledDate: { gte: dayStart, lte: dayEnd },
        isCompleted: false,
        isSkipped: false,
        isTimerRunning: false,
      },
      orderBy: [{ priority: 'asc' }, { startTime: 'asc' }],
    });
    if (tasks.length === 0) return null;

    // Fixed commitments the tasks must avoid.
    const fixed: Interval[] = [];
    const focusBlocks = await this.prisma.focusTimeBlock.findMany({
      where: { userId, isActive: true, protected: true },
    });
    for (const fb of focusBlocks) {
      if (fb.startTime && fb.daysOfWeek.includes(dow)) {
        const s = this.toMinutes(fb.startTime);
        fixed.push({ s, e: s + fb.durationMinutes });
      }
    }
    const events = await this.calendarService.getEventsForPlanning(userId, dayStart, dayEnd);
    for (const ev of events) {
      if (ev.isAllDay) continue;
      const s = this.clampToDay(ev.start, dayStart);
      const e = this.clampToDay(ev.end, dayStart);
      if (e > s) fixed.push({ s, e });
    }

    // Earliest usable minute (never schedule into the past for "today").
    let earliestFloor = window.start;
    const now = new Date();
    if (dayStart.toDateString() === now.toDateString()) {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      earliestFloor = Math.max(window.start, Math.ceil(nowMins / STEP) * STEP);
    }

    const ordered = await this.orderByDependencies(tasks);

    const placed: Interval[] = [...fixed];
    const endByTask = new Map<string, number>();
    const blockersById = await this.blockersWithin(ordered.map((t) => t.id));
    const moves: AutopilotMove[] = [];

    for (const task of ordered) {
      const duration = task.durationMinutes > 0 ? task.durationMinutes : 30;
      let earliest = earliestFloor;
      for (const blockerId of blockersById.get(task.id) || []) {
        const be = endByTask.get(blockerId);
        if (be !== undefined) earliest = Math.max(earliest, be);
      }

      const slot = this.findSlot(earliest, duration, window.end, placed);
      if (!slot) {
        // No room today — keep the task where it is and reserve that interval so
        // other tasks don't get placed on top of it.
        const cs = this.toMinutes(task.startTime);
        placed.push({ s: cs, e: cs + duration });
        endByTask.set(task.id, cs + duration);
        continue;
      }
      placed.push(slot);
      endByTask.set(task.id, slot.e);

      const newStart = this.fromMinutes(slot.s);
      const newEnd = this.fromMinutes(slot.e);
      const dateChanged = this.startOfDay(task.scheduledDate).getTime() !== dayStart.getTime();
      if (newStart !== task.startTime || dateChanged) {
        moves.push({
          taskId: task.id,
          title: task.title,
          fromDate: task.scheduledDate.toISOString(),
          fromStart: task.startTime,
          toDate: dayStart.toISOString(),
          toStart: newStart,
          toEnd: newEnd,
          reason: `Moved to ${newStart} to fit around your calendar and higher-priority work.`,
        });
      }
    }

    if (moves.length === 0) return null;

    const summary = this.buildSummary(moves.length, trigger);

    if (mode === 'AUTO') {
      await this.applyMoves(userId, moves);
      const proposal = await this.prisma.autopilotProposal.create({
        data: {
          userId,
          date: dayStart,
          mode,
          status: 'AUTO_APPLIED',
          trigger,
          summary,
          moves: moves as any,
          appliedAt: new Date(),
        },
      });
      // Notify the user their day was reshuffled.
      void this.pushService
        .sendToUser(
          userId,
          { title: 'Autopilot updated your day', body: summary, url: '/today', icon: '/logo-icon.svg', tag: 'autopilot' },
          { eventType: 'autopilot' },
        )
        .catch(() => undefined);
      return proposal;
    }

    // SUGGEST: supersede any earlier pending proposal for the same day.
    await this.prisma.autopilotProposal.updateMany({
      where: { userId, status: 'PENDING', date: dayStart },
      data: { status: 'DISMISSED' },
    });
    return this.prisma.autopilotProposal.create({
      data: {
        userId,
        date: dayStart,
        mode,
        status: 'PENDING',
        trigger,
        summary,
        moves: moves as any,
      },
    });
  }

  // ==================== HELPERS ====================

  private async applyMoves(userId: string, moves: AutopilotMove[]) {
    for (const m of moves) {
      await this.prisma.task.updateMany({
        where: { id: m.taskId, userId },
        data: {
          scheduledDate: new Date(m.toDate),
          startTime: m.toStart,
          endTime: m.toEnd,
          aiReasoning: `Autopilot: ${m.reason}`,
        },
      });
    }
  }

  /** Working window (minutes from midnight) for a day, or null if a day off. */
  private async workWindow(userId: string, date: Date): Promise<{ start: number; end: number } | null> {
    const workHours = await this.prisma.workHours.findUnique({ where: { userId } });
    const schedule = (workHours?.schedule as Record<string, any>) || null;
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

  /** Map of taskId -> blocker task ids that are also in the given set. */
  private async blockersWithin(ids: string[]): Promise<Map<string, string[]>> {
    const deps = await this.prisma.taskDependency.findMany({
      where: { dependentTaskId: { in: ids }, blockingTaskId: { in: ids } },
    });
    const map = new Map<string, string[]>();
    for (const d of deps) {
      const arr = map.get(d.dependentTaskId) || [];
      arr.push(d.blockingTaskId);
      map.set(d.dependentTaskId, arr);
    }
    return map;
  }

  /** Stable topological order: blockers before dependents, ties keep priority order. */
  private async orderByDependencies<T extends { id: string }>(tasks: T[]): Promise<T[]> {
    const blockers = await this.blockersWithin(tasks.map((t) => t.id));
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const placed = new Set<string>();
    const result: T[] = [];
    // Greedy: repeatedly emit the first task whose blockers are already placed.
    let progressed = true;
    while (result.length < tasks.length && progressed) {
      progressed = false;
      for (const t of tasks) {
        if (placed.has(t.id)) continue;
        const deps = blockers.get(t.id) || [];
        if (deps.every((d) => placed.has(d) || !byId.has(d))) {
          result.push(t);
          placed.add(t.id);
          progressed = true;
        }
      }
    }
    // Any remaining (cyclic deps) appended in original order.
    for (const t of tasks) if (!placed.has(t.id)) result.push(t);
    return result;
  }

  private findSlot(earliest: number, duration: number, windowEnd: number, busy: Interval[]): Interval | null {
    for (let start = earliest; start + duration <= windowEnd; start += STEP) {
      const end = start + duration;
      const collides = busy.some((b) => start < b.e && end > b.s);
      if (!collides) return { s: start, e: end };
    }
    return null;
  }

  private buildSummary(count: number, trigger: string): string {
    const plural = count === 1 ? 'task' : 'tasks';
    if (trigger === 'calendar_change') {
      return `${count} ${plural} rescheduled after a calendar change.`;
    }
    if (trigger === 'daily_cron') {
      return `${count} ${plural} rescheduled in your morning plan.`;
    }
    return `${count} ${plural} rescheduled.`;
  }

  private clampToDay(d: Date, dayStart: Date): number {
    const day = this.startOfDay(d);
    if (day.getTime() < dayStart.getTime()) return 0;
    if (day.getTime() > dayStart.getTime()) return 24 * 60;
    return d.getHours() * 60 + d.getMinutes();
  }

  private toMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  private fromMinutes(mins: number): string {
    return `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
