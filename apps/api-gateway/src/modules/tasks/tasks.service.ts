import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoalsService } from '../goals/goals.service';
import { PatternRecognitionService } from '../analytics/pattern-recognition.service';
import type { Task } from '@microplanner/database';
import { SyncStatus } from '@microplanner/database';
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
  ) {}

  /**
   * Create a manual task (user-created, not AI-generated)
   */
  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log(`Creating manual task for user ${userId}`);

    // Validate goal ownership if goalId is provided
    if (createTaskDto.goalId) {
      await this.goalsService.findOne(createTaskDto.goalId, userId);
    }

    // Validate time range
    const startTime = this.parseTime(createTaskDto.startTime);
    const endTime = this.parseTime(createTaskDto.endTime);

    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException('End time must be after start time');
    }

    const calculatedDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (Math.abs(calculatedDuration - createTaskDto.durationMinutes) > 1) {
      throw new BadRequestException('Duration must match start and end times');
    }

    const task = await this.prisma.task.create({
      data: {
        userId,
        goalId: createTaskDto.goalId || null,
        title: createTaskDto.title,
        notes: createTaskDto.notes || null,
        scheduledDate: new Date(createTaskDto.scheduledDate),
        startTime: createTaskDto.startTime,
        endTime: createTaskDto.endTime,
        durationMinutes: createTaskDto.durationMinutes,
        aiGenerated: false,
        manuallyAdded: true,
        syncStatus: SyncStatus.PENDING,
      },
    });

    this.logger.log(`Manual task created: ${task.id}`);
    return task as any;
  }

  /**
   * Get all tasks with filters and pagination
   */
  async findAll(userId: string, query: QueryTasksDto): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, date, weekStart, goalId, planId, isCompleted, aiGenerated } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Date filters
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.scheduledDate = { gte: startOfDay, lte: endOfDay };
    } else if (weekStart) {
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);
      where.scheduledDate = { gte: weekStartDate, lte: weekEndDate };
    }

    // Goal and plan filters
    if (goalId) where.goalId = goalId;
    if (planId) where.planId = planId;

    // Status filters
    if (isCompleted !== undefined) where.isCompleted = isCompleted;
    if (aiGenerated !== undefined) where.aiGenerated = aiGenerated;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks: tasks as any, total, page, limit };
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

    // Mark as manually moved if date/time changed
    if (updateTaskDto.scheduledDate || updateTaskDto.startTime || updateTaskDto.endTime) {
      data.manuallyMoved = true;
    }

    this.logger.log(`Updating task ${taskId}`);

    return this.prisma.task.update({
      where: { id: taskId },
      data,
    }) as any;
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
