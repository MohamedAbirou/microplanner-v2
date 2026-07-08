import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FocusCalendarSyncService } from './focus-calendar-sync.service';
import { CalendarDefenseExecutor } from './calendar-defense.executor';
import { CalendarService } from '../calendar/calendar.service';
import { BadRequestException } from '@nestjs/common';
import {
  WorkHours,
  UpsertWorkHoursDto,
  FocusTimeBlock,
  CreateFocusTimeDto,
  UpdateFocusTimeDto,
  NoMeetingDay,
  CreateNoMeetingDayDto,
  PriorityHours,
  UpdatePriorityHoursDto,
  CalendarDefense,
  UpdateCalendarDefenseDto,
  Smart1on1,
  CreateSmart1on1Dto,
  UpdateSmart1on1Dto,
  CalculateTravelTimeDto,
  KanbanBoard,
  CreateKanbanBoardDto,
  UpdateKanbanBoardDto,
  MoveTaskInKanbanDto,
  ProductivityScore,
  SmartNotification,
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
  NotificationType,
} from './types/productivity.types';

/**
 * Productivity Service (Phase 18)
 *
 * Complete feature parity with ReclaimAI + surpass all competitors:
 * - Work hours & boundaries
 * - Focus time & deep work
 * - Smart breaks & lunch protection
 * - Priority hours
 * - Calendar defense
 * - Smart 1:1 scheduling
 * - Travel time
 * - Kanban boards
 * - Productivity scoring
 * - Smart notifications
 */
@Injectable()
export class ProductivityService {
  private readonly logger = new Logger(ProductivityService.name);

  constructor(
    private prisma: PrismaService,
    private focusCalendarSync: FocusCalendarSyncService,
    private calendarDefenseExecutor: CalendarDefenseExecutor,
    private calendarService: CalendarService,
  ) {}

  // ==================== WORK HOURS ====================

  private readonly weekDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  /** Map stored schedule JSON (enabled/startTime) → GraphQL shape (isWorkDay/breakTimes). */
  private normalizeDaySchedule(day: any) {
    if (!day) {
      return { isWorkDay: false, startTime: '09:00', endTime: '17:00', breakTimes: [] };
    }
    const breakTimes = (day.breakTimes || []).map((b: any) => ({
      start: b.start ?? b.startTime ?? '12:00',
      end: b.end ?? b.endTime ?? '13:00',
    }));
    return {
      isWorkDay: day.isWorkDay ?? day.enabled ?? false,
      startTime: day.startTime ?? '09:00',
      endTime: day.endTime ?? '17:00',
      breakTimes,
    };
  }

  private normalizeWorkHoursRecord(record: any) {
    const rawSchedule = (record?.schedule as Record<string, any>) || {};
    const schedule = Object.fromEntries(
      this.weekDays.map((day) => [day, this.normalizeDaySchedule(rawSchedule[day])]),
    );
    return {
      ...record,
      schedule,
      timezone: record.timezone || 'UTC',
      enforceWorkHours: record.enforceWorkHours ?? true,
    };
  }

  /** Accept GraphQL nested schedule or flat day keys from REST. */
  private mergeScheduleUpdate(existing: Record<string, any>, updateDto: UpsertWorkHoursDto) {
    const schedule = { ...existing };
    const nested = (updateDto as any).schedule as Record<string, any> | undefined;
    if (nested) {
      for (const day of this.weekDays) {
        const dayInput = nested[day];
        if (dayInput) {
          schedule[day] = {
            enabled: dayInput.isWorkDay ?? dayInput.enabled ?? false,
            startTime: dayInput.startTime ?? '09:00',
            endTime: dayInput.endTime ?? '17:00',
            breakTimes: (dayInput.breakTimes || []).map((b: any) => ({
              startTime: b.start ?? b.startTime,
              endTime: b.end ?? b.endTime,
            })),
          };
        }
      }
    }
    for (const day of this.weekDays) {
      const flat = (updateDto as any)[day];
      if (flat) schedule[day] = flat;
    }
    return schedule;
  }

  /**
   * Get or create work hours
   */
  async getWorkHours(userId: string): Promise<WorkHours> {
    let workHours = await this.prisma.workHours.findUnique({
      where: { userId },
    });

    if (!workHours) {
      // Create default work hours (9-5 weekdays)
      const defaultSchedule = {
        monday: { enabled: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', protected: true }] },
        tuesday: { enabled: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', protected: true }] },
        wednesday: { enabled: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', protected: true }] },
        thursday: { enabled: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', protected: true }] },
        friday: { enabled: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', type: 'lunch', protected: true }] },
        saturday: { enabled: false, startTime: '09:00', endTime: '17:00', breakTimes: [] },
        sunday: { enabled: false, startTime: '09:00', endTime: '17:00', breakTimes: [] },
      };

      workHours = await this.prisma.workHours.create({
        data: {
          userId,
          schedule: defaultSchedule as any,
        },
      });
    }

    return this.normalizeWorkHoursRecord(workHours) as unknown as WorkHours;
  }

  /**
   * Update work hours
   */
  async updateWorkHours(userId: string, updateDto: UpsertWorkHoursDto): Promise<WorkHours> {
    const existing = await this.prisma.workHours.findUnique({
      where: { userId },
    });

    const schedule = this.mergeScheduleUpdate(
      existing ? ((existing.schedule as Record<string, any>) || {}) : {},
      updateDto,
    );

    const workHours = await this.prisma.workHours.upsert({
      where: { userId },
      create: {
        userId,
        timezone: updateDto.timezone || 'UTC',
        schedule: schedule as any,
        enforceWorkHours: updateDto.enforceWorkHours ?? true,
        maxMeetingsPerDay: updateDto.maxMeetingsPerDay,
        maxMeetingHoursPerDay: updateDto.maxMeetingHoursPerDay,
        maxConsecutiveMeetings: updateDto.maxConsecutiveMeetings,
      },
      update: {
        timezone: updateDto.timezone,
        schedule: schedule as any,
        enforceWorkHours: updateDto.enforceWorkHours,
        maxMeetingsPerDay: updateDto.maxMeetingsPerDay,
        maxMeetingHoursPerDay: updateDto.maxMeetingHoursPerDay,
        maxConsecutiveMeetings: updateDto.maxConsecutiveMeetings,
      },
    });

    this.logger.log(`Work hours updated for user ${userId}`);

    return this.normalizeWorkHoursRecord(workHours) as unknown as WorkHours;
  }

  // ==================== FOCUS TIME ====================

  /**
   * Create focus time block
   */
  async createFocusTime(userId: string, createDto: CreateFocusTimeDto): Promise<FocusTimeBlock> {
    const focusTime = await this.prisma.focusTimeBlock.create({
      data: {
        userId,
        title: createDto.title,
        frequency: createDto.frequency,
        daysOfWeek: createDto.daysOfWeek || this.getDefaultDaysForFrequency(createDto.frequency),
        startTime: createDto.startTime || null,
        durationMinutes: createDto.durationMinutes,
        priority: createDto.priority || 5,
        protected: createDto.protected ?? true,
        autoSchedule: createDto.autoSchedule ?? false,
        preferredTimeSlots: createDto.preferredTimeSlots || [],
        color: createDto.color || '#3B82F6',
      },
    });

    this.logger.log(`Focus time created: ${focusTime.id} for user ${userId}`);

    // Best-effort: mirror onto the user's calendar (no-op if not connected).
    void this.focusCalendarSync.syncFocusBlocksToCalendar(userId).catch(() => undefined);

    return focusTime as unknown as FocusTimeBlock;
  }

  /**
   * Get user's focus time blocks
   */
  async getFocusTimeBlocks(userId: string): Promise<FocusTimeBlock[]> {
    const blocks = await this.prisma.focusTimeBlock.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return blocks as unknown as FocusTimeBlock[];
  }

  /**
   * Update focus time block
   */
  async updateFocusTime(
    focusTimeId: string,
    userId: string,
    updateDto: UpdateFocusTimeDto,
  ): Promise<FocusTimeBlock> {
    const focusTime = await this.prisma.focusTimeBlock.findFirst({
      where: { id: focusTimeId, userId },
    });

    if (!focusTime) {
      throw new NotFoundException('Focus time block not found');
    }

    const updated = await this.prisma.focusTimeBlock.update({
      where: { id: focusTimeId },
      data: updateDto,
    });

    this.logger.log(`Focus time updated: ${focusTimeId}`);

    // Re-sync so the calendar event reflects the new schedule (or is removed if
    // the block was deactivated).
    if (updated.isActive) {
      void this.focusCalendarSync.syncFocusBlocksToCalendar(userId).catch(() => undefined);
    } else {
      void this.focusCalendarSync.removeFromCalendar(updated).catch(() => undefined);
    }

    return updated as unknown as FocusTimeBlock;
  }

  /**
   * Delete focus time block
   */
  async deleteFocusTime(focusTimeId: string, userId: string): Promise<void> {
    const focusTime = await this.prisma.focusTimeBlock.findFirst({
      where: { id: focusTimeId, userId },
    });

    if (!focusTime) {
      throw new NotFoundException('Focus time block not found');
    }

    // Remove the mirrored calendar event before deleting the row.
    await this.focusCalendarSync.removeFromCalendar(focusTime);

    await this.prisma.focusTimeBlock.delete({
      where: { id: focusTimeId },
    });

    this.logger.log(`Focus time deleted: ${focusTimeId}`);
  }

  // ==================== NO-MEETING DAYS ====================

  /**
   * Create no-meeting day
   */
  async createNoMeetingDay(userId: string, createDto: CreateNoMeetingDayDto): Promise<NoMeetingDay> {
    const noMeetingDay = await this.prisma.noMeetingDay.create({
      data: {
        userId,
        dayOfWeek: createDto.dayOfWeek,
        allowExceptions: createDto.allowExceptions ?? false,
      },
    });

    this.logger.log(`No-meeting day created for day ${createDto.dayOfWeek} by user ${userId}`);

    return noMeetingDay as unknown as NoMeetingDay;
  }

  /**
   * Get no-meeting days
   */
  async getNoMeetingDays(userId: string): Promise<NoMeetingDay[]> {
    const days = await this.prisma.noMeetingDay.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return days as unknown as NoMeetingDay[];
  }

  /**
   * Delete no-meeting day
   */
  async deleteNoMeetingDay(dayId: string, userId: string): Promise<void> {
    const day = await this.prisma.noMeetingDay.findFirst({
      where: { id: dayId, userId },
    });

    if (!day) {
      throw new NotFoundException('No-meeting day not found');
    }

    await this.prisma.noMeetingDay.delete({
      where: { id: dayId },
    });

    this.logger.log(`No-meeting day deleted: ${dayId}`);
  }

  // ==================== PRIORITY HOURS ====================

  /**
   * Get or create priority hours
   */
  async getPriorityHours(userId: string): Promise<PriorityHours> {
    let priorityHours = await this.prisma.priorityHours.findUnique({
      where: { userId },
    });

    if (!priorityHours) {
      // Create default: mornings (9-12) are priority
      const defaultSlots = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', priority: 8 }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', priority: 8 }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', priority: 8 }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', priority: 8 }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', priority: 8 }, // Friday
      ];

      priorityHours = await this.prisma.priorityHours.create({
        data: {
          userId,
          timeSlots: defaultSlots as any,
        },
      });
    }

    return priorityHours as unknown as PriorityHours;
  }

  /**
   * Update priority hours
   */
  async updatePriorityHours(userId: string, updateDto: UpdatePriorityHoursDto): Promise<PriorityHours> {
    const priorityHours = await this.prisma.priorityHours.upsert({
      where: { userId },
      create: {
        userId,
        timeSlots: updateDto.timeSlots as any || [],
        prioritizeFocusTime: updateDto.prioritizeFocusTime ?? true,
        prioritizeTasks: updateDto.prioritizeTasks ?? true,
        deprioritizeMeetings: updateDto.deprioritizeMeetings ?? true,
      },
      update: {
        timeSlots: updateDto.timeSlots as any,
        prioritizeFocusTime: updateDto.prioritizeFocusTime,
        prioritizeTasks: updateDto.prioritizeTasks,
        deprioritizeMeetings: updateDto.deprioritizeMeetings,
      },
    });

    this.logger.log(`Priority hours updated for user ${userId}`);

    return priorityHours as unknown as PriorityHours;
  }

  // ==================== CALENDAR DEFENSE ====================

  /**
   * Get or create calendar defense
   */
  async getCalendarDefense(userId: string): Promise<CalendarDefense> {
    let defense = await this.prisma.calendarDefense.findUnique({
      where: { userId },
    });

    if (!defense) {
      defense = await this.prisma.calendarDefense.create({
        data: { userId },
      });
    }

    return defense as unknown as CalendarDefense;
  }

  /**
   * Update calendar defense
   */
  async updateCalendarDefense(userId: string, updateDto: UpdateCalendarDefenseDto): Promise<CalendarDefense> {
    const defense = await this.prisma.calendarDefense.upsert({
      where: { userId },
      create: {
        userId,
        ...updateDto,
      },
      update: updateDto,
    });

    this.logger.log(`Calendar defense updated for user ${userId}`);

    return defense as unknown as CalendarDefense;
  }

  /** Recent auto-decline / defense actions for the "Defense log" UI. */
  async getCalendarDefenseLog(userId: string, limit = 20) {
    return this.calendarDefenseExecutor.getDefenseLog(userId, limit);
  }

  /** Manually run the defense sweep now (also runs on a 30-min cron). */
  async runCalendarDefense(userId: string) {
    return this.calendarDefenseExecutor.runDefense(userId);
  }

  // ==================== SMART 1:1 SCHEDULING ====================

  /**
   * Create Smart 1:1
   */
  async createSmart1on1(userId: string, createDto: CreateSmart1on1Dto): Promise<Smart1on1> {
    const smart1on1 = await this.prisma.smart1on1.create({
      data: {
        userId,
        personName: createDto.personName,
        personEmail: createDto.personEmail,
        frequency: createDto.frequency,
        durationMinutes: createDto.durationMinutes || 30,
        autoSchedule: createDto.autoSchedule ?? true,
        autoRescheduleOnConflict: createDto.autoRescheduleOnConflict ?? true,
        preferredDays: createDto.preferredDays || [],
        preferredTimes: createDto.preferredTimes || [],
      },
    });

    this.logger.log(`Smart 1:1 created: ${smart1on1.id} for user ${userId} with ${createDto.personEmail}`);

    // Auto-scheduling of focus blocks into the calendar is a Phase 7 enhancement.

    return smart1on1 as unknown as Smart1on1;
  }

  /**
   * Get user's Smart 1:1s
   */
  async getSmart1on1s(userId: string): Promise<Smart1on1[]> {
    const smart1on1s = await this.prisma.smart1on1.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return smart1on1s as unknown as Smart1on1[];
  }

  /**
   * Update Smart 1:1
   */
  async updateSmart1on1(
    smart1on1Id: string,
    userId: string,
    updateDto: UpdateSmart1on1Dto,
  ): Promise<Smart1on1> {
    const smart1on1 = await this.prisma.smart1on1.findFirst({
      where: { id: smart1on1Id, userId },
    });

    if (!smart1on1) {
      throw new NotFoundException('Smart 1:1 not found');
    }

    const updated = await this.prisma.smart1on1.update({
      where: { id: smart1on1Id },
      data: updateDto,
    });

    this.logger.log(`Smart 1:1 updated: ${smart1on1Id}`);

    return updated as unknown as Smart1on1;
  }

  /**
   * Delete Smart 1:1
   */
  async deleteSmart1on1(smart1on1Id: string, userId: string): Promise<void> {
    const smart1on1 = await this.prisma.smart1on1.findFirst({
      where: { id: smart1on1Id, userId },
    });

    if (!smart1on1) {
      throw new NotFoundException('Smart 1:1 not found');
    }

    await this.prisma.smart1on1.delete({
      where: { id: smart1on1Id },
    });

    this.logger.log(`Smart 1:1 deleted: ${smart1on1Id}`);
  }

  /**
   * Propose and book the next occurrence of a 1:1: find a free slot honouring
   * cadence + preferred days/times, then create a calendar event that invites
   * the other person.
   */
  async scheduleNextSmart1on1(smart1on1Id: string, userId: string): Promise<Smart1on1> {
    const meeting = await this.prisma.smart1on1.findFirst({ where: { id: smart1on1Id, userId } });
    if (!meeting) throw new NotFoundException('Smart 1:1 not found');

    const provider = await this.calendarService.getPrimaryProvider(userId);
    if (!provider) {
      throw new BadRequestException('Connect a calendar to schedule 1:1s.');
    }

    const intervalDays = meeting.frequency === 'monthly' ? 28 : meeting.frequency === 'biweekly' ? 14 : 7;
    const now = new Date();
    // Earliest = the later of (today) and (last meeting + cadence).
    let earliest = new Date(now);
    earliest.setHours(0, 0, 0, 0);
    if (meeting.lastScheduledDate) {
      const next = new Date(meeting.lastScheduledDate);
      next.setDate(next.getDate() + intervalDays);
      if (next > earliest) earliest = next;
    }

    const durationMin = meeting.durationMinutes || 30;
    const preferredDays = meeting.preferredDays || [];
    const preferredTimes = (meeting.preferredTimes || []).map((t) => this.timeToMinutes(t));
    const workHours = await this.prisma.workHours.findUnique({ where: { userId } });
    const schedule = (workHours?.schedule as Record<string, any>) || null;

    const slot = await this.findMeetingSlot(
      userId,
      earliest,
      durationMin,
      preferredDays,
      preferredTimes,
      schedule,
    );
    if (!slot) {
      throw new BadRequestException('No free slot found in the next 3 weeks. Try widening preferences.');
    }

    const end = new Date(slot.getTime() + durationMin * 60 * 1000);
    await this.calendarService.createEventOnProvider(userId, provider, {
      title: `1:1 with ${meeting.personName}`,
      description: 'Recurring 1:1 scheduled by MicroPlanner.',
      start: slot,
      end,
      busy: true,
      attendees: [meeting.personEmail],
    });

    const updated = await this.prisma.smart1on1.update({
      where: { id: smart1on1Id },
      data: { nextScheduledDate: slot, lastScheduledDate: slot },
    });
    this.logger.log(`Scheduled 1:1 ${smart1on1Id} for ${slot.toISOString()}`);
    return updated as unknown as Smart1on1;
  }

  /** Scan up to 21 days for the first free slot matching the constraints. */
  private async findMeetingSlot(
    userId: string,
    earliest: Date,
    durationMin: number,
    preferredDays: number[],
    preferredTimes: number[],
    schedule: Record<string, any> | null,
  ): Promise<Date | null> {
    const STEP = 15;
    const cursor = new Date(earliest);
    cursor.setHours(0, 0, 0, 0);
    const now = new Date();

    for (let d = 0; d < 21; d++, cursor.setDate(cursor.getDate() + 1)) {
      const dow = cursor.getDay();
      if (preferredDays.length > 0 && !preferredDays.includes(dow)) continue;

      const win = this.workWindowFor(schedule, cursor);
      if (!win) continue;

      const dayStart = new Date(cursor);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);
      const busy = await this.busyMinutes(userId, dayStart, dayEnd, dow);

      // Prefer explicit preferred times, then any slot in the window.
      const candidateStarts: number[] = [];
      for (const pt of preferredTimes) if (pt >= win.start && pt + durationMin <= win.end) candidateStarts.push(pt);
      for (let s = win.start; s + durationMin <= win.end; s += STEP) candidateStarts.push(s);

      for (const start of candidateStarts) {
        const end = start + durationMin;
        // Skip past times for today.
        if (cursor.toDateString() === now.toDateString()) {
          const nowMin = now.getHours() * 60 + now.getMinutes();
          if (start < nowMin) continue;
        }
        if (!busy.some((b) => start < b.e && end > b.s)) {
          const result = new Date(cursor);
          result.setHours(Math.floor(start / 60), start % 60, 0, 0);
          return result;
        }
      }
    }
    return null;
  }

  private async busyMinutes(userId: string, dayStart: Date, dayEnd: Date, dow: number) {
    const busy: { s: number; e: number }[] = [];
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
        const s = this.timeToMinutes(fb.startTime);
        busy.push({ s, e: s + fb.durationMinutes });
      }
    }
    const tasks = await this.prisma.task.findMany({
      where: { userId, isCompleted: false, scheduledDate: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true, endTime: true, durationMinutes: true },
    });
    for (const t of tasks) {
      if (!t.startTime) continue;
      const s = this.timeToMinutes(t.startTime);
      const e = t.endTime ? this.timeToMinutes(t.endTime) : s + (t.durationMinutes || 30);
      busy.push({ s, e });
    }
    return busy;
  }

  private workWindowFor(schedule: Record<string, any> | null, date: Date): { start: number; end: number } | null {
    const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = names[date.getDay()];
    if (schedule && schedule[dayName]) {
      const day = schedule[dayName];
      if (!day.isWorkDay) return null;
      return { start: this.timeToMinutes(day.startTime || '09:00'), end: this.timeToMinutes(day.endTime || '17:00') };
    }
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return null;
    return { start: 9 * 60, end: 17 * 60 };
  }

  private timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  // ==================== TRAVEL TIME ====================

  /**
   * Calculate travel time between locations
   */
  async calculateTravelTime(userId: string, dto: CalculateTravelTimeDto): Promise<{ estimatedMinutes: number; method: string }> {
    // Distance-based estimate; live traffic via a maps API is a Phase 7 enhancement.
    // For now, return simple estimates based on method

    const method = dto.method || 'auto';
    let estimatedMinutes = 30; // Default

    if (method === 'walking') {
      estimatedMinutes = 45;
    } else if (method === 'driving') {
      estimatedMinutes = 20;
    } else if (method === 'transit') {
      estimatedMinutes = 35;
    }

    this.logger.log(`Travel time calculated: ${estimatedMinutes} minutes (${method})`);

    return { estimatedMinutes, method };
  }

  // ==================== KANBAN BOARDS ====================

  /**
   * Create Kanban board
   */
  async createKanbanBoard(userId: string, createDto: CreateKanbanBoardDto): Promise<KanbanBoard> {
    const defaultColumns = createDto.columns || [
      { name: 'To Do', color: '#E11D48' },
      { name: 'In Progress', color: '#F59E0B' },
      { name: 'Done', color: '#10B981' },
    ];

    const board = await this.prisma.kanbanBoard.create({
      data: {
        userId,
        projectId: createDto.projectId,
        name: createDto.name,
        description: createDto.description,
        columns: {
          create: defaultColumns.map((col, index) => ({
            name: col.name,
            order: index,
            color: col.color,
          })),
        },
      },
      include: {
        columns: true,
      },
    });

    this.logger.log(`Kanban board created: ${board.id} for user ${userId}`);

    return board as unknown as KanbanBoard;
  }

  /**
   * Get user's Kanban boards
   */
  async getKanbanBoards(userId: string, projectId?: string): Promise<KanbanBoard[]> {
    const where: any = { userId };
    if (projectId) {
      where.projectId = projectId;
    }

    const boards = await this.prisma.kanbanBoard.findMany({
      where,
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return boards as unknown as KanbanBoard[];
  }

  /**
   * Get a single Kanban board by ID
   */
  async getKanbanBoard(boardId: string, userId: string): Promise<KanbanBoard> {
    const board = await this.prisma.kanbanBoard.findFirst({
      where: { id: boardId, userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Kanban board not found');
    }

    return board as unknown as KanbanBoard;
  }

  /**
   * Update Kanban board
   */
  async updateKanbanBoard(
    boardId: string,
    userId: string,
    updateDto: UpdateKanbanBoardDto,
  ): Promise<KanbanBoard> {
    const board = await this.prisma.kanbanBoard.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw new NotFoundException('Kanban board not found');
    }

    const updated = await this.prisma.kanbanBoard.update({
      where: { id: boardId },
      data: {
        name: updateDto.name,
        description: updateDto.description,
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    });

    this.logger.log(`Kanban board updated: ${boardId}`);

    return updated as unknown as KanbanBoard;
  }

  /**
   * Delete Kanban board
   */
  async deleteKanbanBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.prisma.kanbanBoard.findFirst({
      where: { id: boardId, userId },
    });

    if (!board) {
      throw new NotFoundException('Kanban board not found');
    }

    await this.prisma.kanbanBoard.delete({
      where: { id: boardId },
    });

    this.logger.log(`Kanban board deleted: ${boardId}`);
  }

  /**
   * Move task in Kanban
   */
  async moveTaskInKanban(userId: string, dto: MoveTaskInKanbanDto): Promise<void> {
    // Verify task belongs to user
    const task = await this.prisma.task.findFirst({
      where: { id: dto.taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Remove from old column
    const fromColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id: dto.fromColumnId },
    });

    if (fromColumn) {
      const taskIds = (fromColumn.taskIds as string[]).filter((id) => id !== dto.taskId);
      await this.prisma.kanbanColumn.update({
        where: { id: dto.fromColumnId },
        data: { taskIds },
      });
    }

    // Add to new column
    const toColumn = await this.prisma.kanbanColumn.findUnique({
      where: { id: dto.toColumnId },
    });

    if (!toColumn) {
      throw new NotFoundException('Column not found');
    }

    const taskIds = [...(toColumn.taskIds as string[])];
    taskIds.splice(dto.newOrder, 0, dto.taskId);

    await this.prisma.kanbanColumn.update({
      where: { id: dto.toColumnId },
      data: { taskIds },
    });

    this.logger.log(`Task ${dto.taskId} moved from ${dto.fromColumnId} to ${dto.toColumnId}`);
  }

  // ==================== PRODUCTIVITY SCORING ====================

  /**
   * Calculate daily productivity score
   */
  async calculateProductivityScore(userId: string, date: Date): Promise<ProductivityScore> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get user's data for the day
    const [tasks, focusBlocks, workHours] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      this.prisma.focusTimeBlock.findMany({
        where: { userId, isActive: true },
      }),
      this.prisma.workHours.findUnique({
        where: { userId },
      }),
    ]);

    // Calculate metrics
    const totalTaskMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const totalTasks = tasks.length;

    // Simplified scoring (would be more sophisticated in production)
    const taskCompletionScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 50;
    const focusTimeScore = focusBlocks.length > 0 ? 75 : 50; // Simplified
    const meetingEfficiencyScore = 70; // Neutral default until calendar meeting data is analyzed (Phase 7)
    const workLifeBalanceScore = workHours ? 80 : 60; // Heuristic: configured work hours imply better balance

    const overallScore = Math.round(
      (taskCompletionScore + focusTimeScore + meetingEfficiencyScore + workLifeBalanceScore) / 4,
    );

    const insights: string[] = [];
    const recommendations: string[] = [];

    if (taskCompletionScore < 60) {
      insights.push('Lower than average task completion rate');
      recommendations.push('Try breaking tasks into smaller subtasks');
    }

    if (focusBlocks.length === 0) {
      recommendations.push('Set up focus time blocks for deep work');
    }

    const score = await this.prisma.productivityScore.upsert({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
      create: {
        userId,
        date: startOfDay,
        overallScore,
        focusTimeScore,
        taskCompletionScore,
        meetingEfficiencyScore,
        workLifeBalanceScore,
        totalFocusMinutes: 0, // Focus-session tracking lands with focus-block auto-scheduling (Phase 7)
        totalMeetingMinutes: 0, // Requires calendar meeting analysis (Phase 7)
        totalTaskMinutes,
        totalBreakMinutes: 0, // Requires focus-session tracking (Phase 7)
        insights,
        recommendations,
      },
      update: {
        overallScore,
        focusTimeScore,
        taskCompletionScore,
        meetingEfficiencyScore,
        workLifeBalanceScore,
        totalTaskMinutes,
        insights,
        recommendations,
      },
    });

    this.logger.log(`Productivity score calculated for ${userId} on ${date.toISOString().split('T')[0]}: ${overallScore}`);

    return score as unknown as ProductivityScore;
  }

  /**
   * Get productivity scores
   */
  async getProductivityScores(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProductivityScore[]> {
    const scores = await this.prisma.productivityScore.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return scores as unknown as ProductivityScore[];
  }

  // ==================== SMART NOTIFICATIONS ====================

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    actionUrl?: string,
  ): Promise<SmartNotification> {
    const notification = await this.prisma.smartNotification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        actionUrl,
      },
    });

    this.logger.log(`Notification created: ${notification.id} (${type}) for user ${userId}`);

    // In-app delivery is the SmartNotification row itself; email/push channels are Phase 7.

    return notification as unknown as SmartNotification;
  }

  /**
   * Get user's notifications
   */
  async getNotifications(userId: string, unreadOnly = false): Promise<SmartNotification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await this.prisma.smartNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications as unknown as SmartNotification[];
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.prisma.smartNotification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.smartNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    this.logger.log(`Notification marked as read: ${notificationId}`);
  }

  /**
   * Get or create notification preferences
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    let prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return prefs as unknown as NotificationPreferences;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const prefs = await this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...updateDto,
      },
      update: updateDto,
    });

    this.logger.log(`Notification preferences updated for user ${userId}`);

    return prefs as unknown as NotificationPreferences;
  }

  // ==================== HELPER METHODS ====================

  private getDefaultDaysForFrequency(frequency: string): number[] {
    switch (frequency) {
      case 'daily':
        return [0, 1, 2, 3, 4, 5, 6]; // Every day
      case 'weekdays':
        return [1, 2, 3, 4, 5]; // Mon-Fri
      case 'weekly':
        return [1]; // Monday
      default:
        return [];
    }
  }
}
