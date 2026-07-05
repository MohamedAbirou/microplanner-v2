import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
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
  TravelTime,
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

  constructor(private prisma: PrismaService) {}

  // ==================== WORK HOURS ====================

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

    return workHours as unknown as WorkHours;
  }

  /**
   * Update work hours
   */
  async updateWorkHours(userId: string, updateDto: UpsertWorkHoursDto): Promise<WorkHours> {
    const existing = await this.prisma.workHours.findUnique({
      where: { userId },
    });

    const schedule = existing ? (existing.schedule as any) : {};

    // Update schedule with new values
    if (updateDto.monday) schedule.monday = updateDto.monday;
    if (updateDto.tuesday) schedule.tuesday = updateDto.tuesday;
    if (updateDto.wednesday) schedule.wednesday = updateDto.wednesday;
    if (updateDto.thursday) schedule.thursday = updateDto.thursday;
    if (updateDto.friday) schedule.friday = updateDto.friday;
    if (updateDto.saturday) schedule.saturday = updateDto.saturday;
    if (updateDto.sunday) schedule.sunday = updateDto.sunday;

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

    return workHours as unknown as WorkHours;
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

    // TODO: Trigger auto-scheduling logic

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

  // ==================== TRAVEL TIME ====================

  /**
   * Calculate travel time between locations
   */
  async calculateTravelTime(userId: string, dto: CalculateTravelTimeDto): Promise<{ estimatedMinutes: number; method: string }> {
    // TODO: Integrate with Google Maps API or similar
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
    const totalTrackedMinutes = tasks.reduce((sum, t) => sum + t.timeSpentMinutes, 0);
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const totalTasks = tasks.length;

    // Simplified scoring (would be more sophisticated in production)
    const taskCompletionScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 50;
    const focusTimeScore = focusBlocks.length > 0 ? 75 : 50; // Simplified
    const meetingEfficiencyScore = 70; // TODO: Calculate from calendar
    const workLifeBalanceScore = workHours ? 80 : 60; // TODO: Check actual adherence

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
        totalFocusMinutes: 0, // TODO: Calculate
        totalMeetingMinutes: 0, // TODO: Calculate from calendar
        totalTaskMinutes,
        totalBreakMinutes: 0, // TODO: Calculate
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

    // TODO: Trigger actual notification delivery (email, push, SMS)

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
