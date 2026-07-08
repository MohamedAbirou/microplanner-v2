import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoalsService } from '../goals/goals.service';
import { PatternRecognitionService } from '../analytics/pattern-recognition.service';
import { UsageLimitService } from '../../common/middleware/usage-limit.middleware';
import { RecurringTaskService, TaskInstance } from './recurring-task.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { CalendarService } from '../calendar/calendar.service';
import type { Task, SubscriptionTierType } from '@microplanner/database';
import { Prisma, SyncStatus } from '@microplanner/database';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { BulkOperationDto, BulkOperationType } from './dto/bulk-operation.dto';
import { SkipTaskDto } from './dto/skip-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private goalsService: GoalsService,
    private patternRecognitionService: PatternRecognitionService,
    private usageLimitService: UsageLimitService,
    private recurringTaskService: RecurringTaskService,
    private integrationsService: IntegrationsService,
    private calendarService: CalendarService,
  ) {}

  /**
   * Create a manual task (user-created, not AI-generated)
   */
  async create(userId: string, createTaskDto: CreateTaskDto, userTier: SubscriptionTierType): Promise<Task> {
    // Check daily task limit using centralized UsageLimitService
    await this.usageLimitService.checkTaskLimit(userId, userTier);

    this.logger.log(`Creating manual task for user ${userId}`);

    // Validate goal ownership if goalId is provided
    if (createTaskDto.goalId) {
      await this.goalsService.findOne(createTaskDto.goalId, userId);
    }

    // Calculate endTime if not provided
    let endTime: string;
    if (createTaskDto.endTime) {
      // Validate provided endTime
      const startTimeDate = this.parseTime(createTaskDto.startTime);
      const endTimeDate = this.parseTime(createTaskDto.endTime);

      if (endTimeDate.getTime() <= startTimeDate.getTime()) {
        throw new BadRequestException('End time must be after start time');
      }

      const calculatedDuration = (endTimeDate.getTime() - startTimeDate.getTime()) / (1000 * 60);
      if (Math.abs(calculatedDuration - createTaskDto.durationMinutes) > 1) {
        throw new BadRequestException('Duration must match start and end times');
      }
      endTime = createTaskDto.endTime;
    } else {
      // Calculate endTime from startTime + durationMinutes
      const startTimeDate = this.parseTime(createTaskDto.startTime);
      startTimeDate.setMinutes(startTimeDate.getMinutes() + createTaskDto.durationMinutes);
      endTime = `${String(startTimeDate.getHours()).padStart(2, '0')}:${String(startTimeDate.getMinutes()).padStart(2, '0')}`;
    }

    const task = await this.prisma.task.create({
      data: {
        userId,
        goalId: createTaskDto.goalId || null,
        projectId: createTaskDto.projectId || null,
        title: createTaskDto.title,
        notes: createTaskDto.notes || null,
        priority: createTaskDto.priority || 2, // Default to medium priority
        tags: createTaskDto.tags || [],
        scheduledDate: new Date(createTaskDto.scheduledDate),
        startTime: createTaskDto.startTime,
        endTime, // Use calculated endTime
        durationMinutes: createTaskDto.durationMinutes,
        recurrenceRule: createTaskDto.recurrenceRule
          ? JSON.parse(JSON.stringify(createTaskDto.recurrenceRule))
          : null, // Store as JSONB (DTO class instance -> plain JSON)
        aiGenerated: false,
        manuallyAdded: true,
        syncStatus: SyncStatus.PENDING,
      },
    });

    // Increment task counter after successful creation
    await this.usageLimitService.incrementTaskCount(userId);

    this.logger.log(`Manual task created: ${task.id}`);
    return task as any;
  }

  /**
   * Get all tasks with filters and pagination
   * Expands recurring tasks into instances for the requested date range
   */
  async findAll(userId: string, query: QueryTasksDto): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, date, weekStart, startDate, endDate, goalId, planId, projectId, priority, tags, search, isCompleted, aiGenerated } = query;
    const skip = (page - 1) * limit;

    // Hard cap on how wide a client-supplied date range may be. Without this a
    // single request with startDate=2000 & endDate=2100 would materialize a
    // user's entire task history (5k–20k rows) into memory before pagination.
    // 400 days comfortably covers a full year + calendar month overflow.
    const MAX_RANGE_DAYS = 400;
    const MAX_RANGE_MS = MAX_RANGE_DAYS * 24 * 60 * 60 * 1000;

    const where: any = { userId };

    // Determine date range for recurring task expansion
    let rangeStart: Date;
    let rangeEnd: Date;

    // Date filters (priority: startDate/endDate > date > weekStart)
    if (startDate && endDate) {
      // Date range filter — clamp the span so the window can never exceed
      // MAX_RANGE_DAYS. We keep the caller's start and pull end inward.
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
      if (rangeEnd.getTime() - rangeStart.getTime() > MAX_RANGE_MS) {
        this.logger.warn(
          `Clamping task query range for user ${userId}: requested ${startDate}..${endDate} exceeds ${MAX_RANGE_DAYS} days`,
        );
        rangeEnd = new Date(rangeStart.getTime() + MAX_RANGE_MS);
      }
      where.scheduledDate = { gte: rangeStart, lte: rangeEnd };
    } else if (date) {
      // Single date filter (start and end of day)
      const targetDate = new Date(date);
      rangeStart = new Date(targetDate.setHours(0, 0, 0, 0));
      rangeEnd = new Date(targetDate.setHours(23, 59, 59, 999));
      where.scheduledDate = { gte: rangeStart, lte: rangeEnd };
    } else if (weekStart) {
      // Week filter
      rangeStart = new Date(weekStart);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeStart.getDate() + 6);
      rangeEnd.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: rangeStart, lte: rangeEnd };
    } else {
      // Default: next 90 days if no date filter specified
      rangeStart = new Date();
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + 90);
    }

    // Build where clause for non-date filters
    const commonWhere: any = { userId };
    if (goalId) commonWhere.goalId = goalId;
    if (planId) commonWhere.planId = planId;
    if (projectId) commonWhere.projectId = projectId;
    if (priority !== undefined) commonWhere.priority = priority;
    if (tags && tags.length > 0) commonWhere.tags = { hasSome: tags };
    if (search) {
      commonWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isCompleted !== undefined) commonWhere.isCompleted = isCompleted;
    if (aiGenerated !== undefined) commonWhere.aiGenerated = aiGenerated;

    // Fetch regular tasks in range at the DB layer (avoids loading entire history).
    const regularTasksFromDB = await this.prisma.task.findMany({
      where: {
        ...commonWhere,
        recurrenceRule: { equals: Prisma.DbNull },
        scheduledDate: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
    });

    // Recurring templates are expanded in-memory for the requested window.
    const recurringTasksFromDB = await this.prisma.task.findMany({
      where: {
        ...commonWhere,
        NOT: { recurrenceRule: { equals: Prisma.DbNull } },
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
    });

    const regularTasks = regularTasksFromDB;

    // Expand recurring tasks to instances in date range
    const recurringInstances: TaskInstance[] = [];
    for (const recurringTask of recurringTasksFromDB) {
      const instances = this.recurringTaskService.expandRecurringTask(
        recurringTask as Task,
        rangeStart,
        rangeEnd,
      );
      recurringInstances.push(...instances);
    }

    // 4. Combine regular tasks and recurring instances
    const allTasks = [...regularTasks, ...recurringInstances] as Task[];

    // 5. Sort by scheduled date and start time
    allTasks.sort((a, b) => {
      const dateCompare = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    // 6. Apply pagination
    const total = allTasks.length;
    const paginatedTasks = allTasks.slice(skip, skip + limit);

    return { tasks: paginatedTasks as any, total, page, limit };
  }

  /**
   * Get a single task by ID
   */
  async findOne(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task as any;
  }

  /**
   * Update a task
   */
  async update(taskId: string, userId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Verify ownership
    await this.findOne(taskId, userId);

    // Validate goal ownership if goalId is being updated
    if (updateTaskDto.goalId) {
      await this.goalsService.findOne(updateTaskDto.goalId, userId);
    }

    // Validate time range if times are being updated
    if (updateTaskDto.startTime && updateTaskDto.endTime) {
      const startTime = this.parseTime(updateTaskDto.startTime);
      const endTime = this.parseTime(updateTaskDto.endTime);

      if (endTime.getTime() <= startTime.getTime()) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const data: any = {};

    if (updateTaskDto.title !== undefined) data.title = updateTaskDto.title;
    if (updateTaskDto.notes !== undefined) data.notes = updateTaskDto.notes;
    if (updateTaskDto.scheduledDate !== undefined) data.scheduledDate = new Date(updateTaskDto.scheduledDate);
    if (updateTaskDto.startTime !== undefined) data.startTime = updateTaskDto.startTime;
    if (updateTaskDto.endTime !== undefined) data.endTime = updateTaskDto.endTime;
    if (updateTaskDto.durationMinutes !== undefined) data.durationMinutes = updateTaskDto.durationMinutes;
    if (updateTaskDto.goalId !== undefined) data.goalId = updateTaskDto.goalId;
    if (updateTaskDto.projectId !== undefined) data.projectId = updateTaskDto.projectId;
    if (updateTaskDto.priority !== undefined) data.priority = updateTaskDto.priority;
    if (updateTaskDto.tags !== undefined) data.tags = updateTaskDto.tags;
    if (updateTaskDto.recurrenceRule !== undefined) data.recurrenceRule = updateTaskDto.recurrenceRule;
    if (updateTaskDto.isCompleted !== undefined) {
      data.isCompleted = updateTaskDto.isCompleted;
      if (updateTaskDto.isCompleted) {
        data.completedAt = new Date();
      } else {
        data.completedAt = null;
      }
    }

    // Mark as manually moved if date/time changed
    if (updateTaskDto.scheduledDate || updateTaskDto.startTime || updateTaskDto.endTime) {
      data.manuallyMoved = true;
    }

    this.logger.log(`Updating task ${taskId}`);

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data,
    });

    // If this update marked an imported task complete, sync the completion back
    // to its source PM tool (bi-directional). Non-blocking.
    if (data.isCompleted === true) {
      void this.integrationsService.syncTaskCompletion({
        id: updated.id,
        userId: updated.userId,
        externalId: updated.externalId,
        externalSource: updated.externalSource,
        integrationId: updated.integrationId,
      });
    }

    return updated as any;
  }

  /**
   * Delete a task
   */
  async remove(taskId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(taskId, userId);

    this.logger.log(`Deleting task ${taskId}`);

    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  /**
   * Mark task as complete and update goal analytics
   */
  async complete(taskId: string, userId: string): Promise<Task> {
    // Verify ownership
    const task = await this.findOne(taskId, userId);

    if (task.isCompleted) {
      throw new ForbiddenException('Task is already completed');
    }

    this.logger.log(`Completing task ${taskId}`);

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        isSkipped: false, // Clear skip if was previously skipped
        skippedReason: null,
        skippedAt: null,
      },
    });

    // Update goal analytics if task is linked to a goal
    if (task.goalId) {
      await this.goalsService.calculateAnalytics(task.goalId);
    }

    // Update plan completion rate if task is linked to a plan
    if (task.planId) {
      await this.updatePlanCompletion(task.planId);
    }

    // Record completion event for AI learning (PRO/PREMIUM users)
    try {
      await this.patternRecognitionService.recordCompletionEvent(taskId);
      this.logger.debug(`Recorded completion event for task ${taskId}`);
    } catch (error) {
      // Don't fail the completion if pattern recording fails
      this.logger.warn(`Failed to record completion event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Sync completion back to the source PM tool (bi-directional). Fire-and-forget
    // so a slow/broken external API never blocks or fails the local completion.
    void this.integrationsService.syncTaskCompletion({
      id: updatedTask.id,
      userId: updatedTask.userId,
      externalId: updatedTask.externalId,
      externalSource: updatedTask.externalSource,
      integrationId: updatedTask.integrationId,
    });

    return updatedTask as any;
  }

  /**
   * Mark task as skipped with optional reason
   */
  async skip(taskId: string, userId: string, skipTaskDto: SkipTaskDto): Promise<Task> {
    // Verify ownership
    const task = await this.findOne(taskId, userId);

    if (task.isSkipped) {
      throw new ForbiddenException('Task is already skipped');
    }

    this.logger.log(`Skipping task ${taskId}`);

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isSkipped: true,
        skippedReason: skipTaskDto.reason || null,
        skippedAt: new Date(),
        isCompleted: false, // Clear completion if was previously completed
        completedAt: null,
      },
    });

    // Update goal analytics if task is linked to a goal
    if (task.goalId) {
      await this.goalsService.calculateAnalytics(task.goalId);
    }

    // Update plan completion rate if task is linked to a plan
    if (task.planId) {
      await this.updatePlanCompletion(task.planId);
    }

    return updatedTask as any;
  }

  /**
   * Perform bulk operations on multiple tasks
   */
  async bulkOperation(userId: string, bulkOperationDto: BulkOperationDto): Promise<{ success: number; failed: number; results: any[] }> {
    this.logger.log(`Performing bulk ${bulkOperationDto.operation} on ${bulkOperationDto.taskIds.length} tasks`);

    let success = 0;
    let failed = 0;
    const results: any[] = [];

    for (const taskId of bulkOperationDto.taskIds) {
      try {
        // Verify ownership
        const task = await this.findOne(taskId, userId);

        switch (bulkOperationDto.operation) {
          case BulkOperationType.COMPLETE:
            if (!task.isCompleted) {
              await this.complete(taskId, userId);
              success++;
              results.push({ taskId, status: 'completed' });
            } else {
              results.push({ taskId, status: 'already_completed' });
            }
            break;

          case BulkOperationType.SKIP:
            if (!task.isSkipped) {
              await this.skip(taskId, userId, {});
              success++;
              results.push({ taskId, status: 'skipped' });
            } else {
              results.push({ taskId, status: 'already_skipped' });
            }
            break;

          case BulkOperationType.DELETE:
            await this.remove(taskId, userId);
            success++;
            results.push({ taskId, status: 'deleted' });
            break;

          case BulkOperationType.RESCHEDULE:
            if (!bulkOperationDto.data?.scheduledDate) {
              throw new BadRequestException('scheduledDate is required for reschedule operation');
            }
            await this.update(taskId, userId, {
              scheduledDate: bulkOperationDto.data.scheduledDate,
              startTime: bulkOperationDto.data.startTime,
              endTime: bulkOperationDto.data.endTime,
            });
            success++;
            results.push({ taskId, status: 'rescheduled' });
            break;
        }
      } catch (error) {
        failed++;
        const err = error as Error;
        results.push({ taskId, status: 'failed', error: err.message });
      }
    }

    return { success, failed, results };
  }

  /**
   * Suggest the next available time slot to reschedule a task.
   *
   * Respects the user's working hours and avoids collisions with their other
   * incomplete scheduled tasks and active/protected focus-time blocks. Scans
   * forward from now for up to 14 days. Returns null if nothing fits.
   */
  async suggestReschedule(
    taskId: string,
    userId: string,
  ): Promise<{
    taskId: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    reason: string;
  } | null> {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const duration = task.durationMinutes && task.durationMinutes > 0 ? task.durationMinutes : 30;
    const STEP = 15;
    const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const workHours = await this.prisma.workHours.findUnique({ where: { userId } });
    const schedule = (workHours?.schedule as Record<string, any>) || null;

    const focusBlocks = await this.prisma.focusTimeBlock.findMany({
      where: { userId, isActive: true, protected: true },
    });

    const toMinutes = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const fromMinutes = (mins: number): string =>
      `${Math.floor(mins / 60).toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}`;

    // Working window (minutes from midnight) for a given day, or null if off.
    const workWindow = (date: Date): { start: number; end: number } | null => {
      const dayName = DAY_NAMES[date.getDay()];
      if (schedule && schedule[dayName]) {
        const day = schedule[dayName];
        if (!day.isWorkDay) return null;
        return { start: toMinutes(day.startTime || '09:00'), end: toMinutes(day.endTime || '17:00') };
      }
      // Default: Mon–Fri 9–17
      const dow = date.getDay();
      if (dow === 0 || dow === 6) return null;
      return { start: 9 * 60, end: 17 * 60 };
    };

    const now = new Date();
    let scannedDays = 0;
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);

    // Pull calendar busy time (Google + Outlook) once for the whole 14-day scan
    // window so suggested slots avoid real meetings, not just tasks/focus blocks.
    const rangeStart = new Date(cursor);
    const rangeEnd = new Date(cursor);
    rangeEnd.setDate(rangeEnd.getDate() + 14);
    rangeEnd.setHours(23, 59, 59, 999);
    let calendarEvents: Array<{ start: Date; end: Date; isAllDay: boolean }> = [];
    try {
      calendarEvents = await this.calendarService.getEventsForPlanning(userId, rangeStart, rangeEnd);
    } catch {
      // Calendar optional — fall back to task/focus-block busy time only.
      calendarEvents = [];
    }

    while (scannedDays < 14) {
      const window = workWindow(cursor);
      if (window) {
        const dow = cursor.getDay();
        const dayStart = new Date(cursor);
        const dayEnd = new Date(cursor);
        dayEnd.setHours(23, 59, 59, 999);

        // Busy intervals for this day.
        const busy: Array<{ start: number; end: number }> = [];

        const dayTasks = await this.prisma.task.findMany({
          where: {
            userId,
            isCompleted: false,
            id: { not: taskId },
            scheduledDate: { gte: dayStart, lte: dayEnd },
          },
        });
        for (const t of dayTasks) {
          if (!t.startTime) continue;
          const s = toMinutes(t.startTime);
          const e = t.endTime ? toMinutes(t.endTime) : s + (t.durationMinutes || 30);
          busy.push({ start: s, end: e });
        }
        for (const fb of focusBlocks) {
          if (fb.startTime && fb.daysOfWeek.includes(dow)) {
            const s = toMinutes(fb.startTime);
            busy.push({ start: s, end: s + fb.durationMinutes });
          }
        }

        // Calendar meetings for this day become busy intervals too.
        for (const ev of calendarEvents) {
          if (ev.isAllDay) continue;
          if (ev.start < dayStart || ev.start > dayEnd) continue;
          const s = ev.start.getHours() * 60 + ev.start.getMinutes();
          // Clamp the end to end-of-day for events that spill past midnight.
          const sameDayEnd = ev.end <= dayEnd;
          const e = sameDayEnd ? ev.end.getHours() * 60 + ev.end.getMinutes() : 24 * 60;
          if (e > s) busy.push({ start: s, end: e });
        }

        // Earliest candidate: not in the past for today.
        let earliest = window.start;
        if (cursor.toDateString() === now.toDateString()) {
          const nowMins = now.getHours() * 60 + now.getMinutes();
          earliest = Math.max(window.start, Math.ceil(nowMins / STEP) * STEP);
        }

        for (let start = earliest; start + duration <= window.end; start += STEP) {
          const end = start + duration;
          const collides = busy.some((b) => start < b.end && end > b.start);
          if (!collides) {
            const scheduledDate = new Date(cursor);
            const conflictsAvoided = busy.length;
            const dayLabel = scheduledDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            return {
              taskId,
              scheduledDate: scheduledDate.toISOString(),
              startTime: fromMinutes(start),
              endTime: fromMinutes(end),
              reason: conflictsAvoided > 0
                ? `Next open slot on ${dayLabel}, clear of ${conflictsAvoided} scheduled item${conflictsAvoided === 1 ? '' : 's'} and within your working hours.`
                : `Next open slot on ${dayLabel}, within your working hours.`,
            };
          }
        }
      }

      cursor.setDate(cursor.getDate() + 1);
      scannedDays++;
    }

    return null;
  }

  /**
   * Update plan completion rate (private helper)
   */
  private async updatePlanCompletion(planId: string): Promise<void> {
    const tasks = await this.prisma.task.findMany({
      where: { planId },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    await this.prisma.weeklyPlan.update({
      where: { id: planId },
      data: {
        totalTasks,
        completedTasks,
        completionRate,
      },
    });

    this.logger.log(`Updated plan ${planId} completion: ${completedTasks}/${totalTasks} (${completionRate.toFixed(1)}%)`);
  }

  /**
   * Parse time string (HH:MM) to Date for comparison
   */
  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
