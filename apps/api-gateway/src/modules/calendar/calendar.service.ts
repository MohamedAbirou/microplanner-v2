import type { SyncLog, Task } from '@microplanner/database';
import { SyncStatus } from '@microplanner/database';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../database/prisma.service';
import { ConflictResolution, SyncTasksDto } from './dto/sync-tasks.dto';
import { GoogleOAuthService } from './services/google-oauth.service';

export interface ConflictInfo {
  task: Task;
  reason: string;
  suggestedTime?: { startTime: string; endTime: string };
}

export interface SyncResult {
  success: number;
  failed: number;
  skipped: number;
  conflicts: ConflictInfo[];
  details: Array<{
    taskId: string;
    status: 'synced' | 'failed' | 'skipped' | 'conflict';
    eventId?: string;
    error?: string;
  }>;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private prisma: PrismaService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  /**
   * Get calendar events for a date range
   */
  async getEvents(userId: string, startDate: Date, endDate: Date) {
    const authClient = await this.googleOAuthService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      this.logger.log(`Fetched ${events.length} events for user ${userId}`);

      return {
        events: events.map(event => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          status: event.status,
          extendedProperties: event.extendedProperties,
        })),
        total: events.length,
      };
    } catch (error) {
      this.logger.error('Failed to fetch calendar events', error);
      throw new BadRequestException('Failed to fetch calendar events');
    }
  }

  /**
   * Get calendar events for planning (conflict detection)
   * Returns events in a simplified format for AI planners
   */
  async getEventsForPlanning(userId: string, startDate: Date, endDate: Date): Promise<Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    isAllDay: boolean;
  }>> {
    try {
      const authClient = await this.googleOAuthService.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];

      this.logger.debug(`Fetched ${events.length} calendar events for planning (user ${userId})`);

      return events
        .filter(event => event.start && event.end) // Only events with valid times
        .map(event => {
          const isAllDay = !!event.start?.date; // All-day events use 'date' instead of 'dateTime'

          return {
            id: event.id || '',
            title: event.summary || 'Untitled Event',
            start: new Date(event.start?.dateTime || event.start?.date || ''),
            end: new Date(event.end?.dateTime || event.end?.date || ''),
            isAllDay,
          };
        });
    } catch (error) {
      // If calendar not connected or error, return empty array
      // This allows planning to work even without calendar integration
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug(`No calendar events available for planning: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Sync tasks to calendar with idempotency and conflict detection
   */
  async syncTasks(userId: string, syncTasksDto: SyncTasksDto): Promise<SyncResult> {
    const startTime = Date.now();
    const authClient = await this.googleOAuthService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Get tasks to sync
    const tasks = await this.getTasksToSync(userId, syncTasksDto);

    if (tasks.length === 0) {
      throw new BadRequestException('No tasks to sync');
    }

    const result: SyncResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      conflicts: [],
      details: [],
    };

    // Get existing calendar events to check for conflicts
    const dateRange = this.getDateRange(tasks);
    const existingEvents = await this.getEvents(userId, dateRange.start, dateRange.end);

    for (const task of tasks) {
      try {
        // Check for conflicts
        const conflict = await this.detectConflict(task, existingEvents.events, tasks);

        if (conflict) {
          // Handle conflict based on resolution strategy
          const handled = await this.handleConflict(
            task,
            conflict,
            syncTasksDto.conflictResolution || ConflictResolution.SKIP,
            calendar,
          );

          if (!handled) {
            result.conflicts.push(conflict);
            result.skipped++;
            result.details.push({
              taskId: task.id,
              status: 'conflict',
              error: conflict.reason,
            });
            continue;
          }
        }

        // Idempotent event creation/update
        const eventId = await this.upsertCalendarEvent(task, calendar);

        // Update task with sync info
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            calendarEventId: eventId,
            calendarProvider: 'google',
            syncedAt: new Date(),
            syncStatus: SyncStatus.SYNCED,
            syncError: null,
          },
        });

        result.success++;
        result.details.push({
          taskId: task.id,
          status: 'synced',
          eventId,
        });

        this.logger.log(`Synced task ${task.id} to calendar event ${eventId}`);
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to sync task ${task.id}`, error);

        // Update task with error
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            syncStatus: SyncStatus.FAILED,
            syncError: err.message,
          },
        });

        result.failed++;
        result.details.push({
          taskId: task.id,
          status: 'failed',
          error: err.message,
        });
      }
    }

    // Create sync log
    const duration = Date.now() - startTime;
    await this.createSyncLog(userId, syncTasksDto.planId, tasks.length, result, duration);

    // Update calendar token sync timestamp
    await this.prisma.calendarToken.updateMany({
      where: { userId, provider: 'google' },
      data: { lastSyncAt: new Date() },
    });

    return result;
  }

  /**
   * Idempotent event creation/update
   * Searches for existing event by taskId metadata, updates if exists, creates if not
   */
  private async upsertCalendarEvent(task: Task, calendar: any): Promise<string> {
    try {
      // Search for existing event with this taskId
      const searchResponse = await calendar.events.list({
        calendarId: 'primary',
        privateExtendedProperty: `taskId=${task.id}`,
        timeMin: new Date(task.scheduledDate.setHours(0, 0, 0, 0)).toISOString(),
        timeMax: new Date(task.scheduledDate.setHours(23, 59, 59, 999)).toISOString(),
      });

      const existingEvent = searchResponse.data.items?.[0];

      const eventBody = this.buildEventBody(task);

      if (existingEvent?.id) {
        // Update existing event
        this.logger.log(`Updating existing calendar event ${existingEvent.id} for task ${task.id}`);
        const response = await calendar.events.update({
          calendarId: 'primary',
          eventId: existingEvent.id,
          requestBody: eventBody,
        });
        return response.data.id;
      } else {
        // Create new event
        this.logger.log(`Creating new calendar event for task ${task.id}`);
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventBody,
        });
        return response.data.id;
      }
    } catch (error) {
      this.logger.error(`Failed to upsert calendar event for task ${task.id}`, error);
      throw error;
    }
  }

  /**
   * Build Google Calendar event body from task
   */
  private buildEventBody(task: Task) {
    const startDateTime = new Date(task.scheduledDate);
    const [startHour, startMinute] = task.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(task.scheduledDate);
    const [endHour, endMinute] = task.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    return {
      summary: task.title,
      description: task.notes || 'Created by MicroPlanner',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC',
      },
      extendedProperties: {
        private: {
          taskId: task.id,
          goalId: task.goalId || '',
          planId: task.planId || '',
          aiGenerated: task.aiGenerated.toString(),
        },
      },
      colorId: task.goalId ? '9' : '1', // Blue for goal tasks, default for others
    };
  }

  /**
   * Detect conflicts with existing calendar events or other tasks
   */
  private async detectConflict(
    task: Task,
    existingEvents: any[],
    allTasks: Task[],
  ): Promise<ConflictInfo | null> {
    const taskStart = this.parseTaskTime(task, task.startTime);
    const taskEnd = this.parseTaskTime(task, task.endTime);

    // Check for overlaps with existing calendar events
    for (const event of existingEvents) {
      // Skip if this event is for this task (already synced)
      if (event.extendedProperties?.private?.taskId === task.id) {
        continue;
      }

      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);

      if (this.hasTimeOverlap(taskStart, taskEnd, eventStart, eventEnd)) {
        return {
          task,
          reason: `Overlaps with existing event: ${event.summary}`,
          suggestedTime: this.suggestAlternativeTime(task, existingEvents, allTasks),
        };
      }
    }

    // Check for overlaps with other tasks being synced
    for (const otherTask of allTasks) {
      if (otherTask.id === task.id) continue;

      const otherStart = this.parseTaskTime(otherTask, otherTask.startTime);
      const otherEnd = this.parseTaskTime(otherTask, otherTask.endTime);

      if (this.hasTimeOverlap(taskStart, taskEnd, otherStart, otherEnd)) {
        return {
          task,
          reason: `Overlaps with another task: ${otherTask.title}`,
        };
      }
    }

    return null;
  }

  /**
   * Handle conflict based on resolution strategy
   */
  private async handleConflict(
    task: Task,
    conflict: ConflictInfo,
    resolution: ConflictResolution,
    calendar: any,
  ): Promise<boolean> {
    switch (resolution) {
      case ConflictResolution.SKIP:
        return false; // Don't sync this task

      case ConflictResolution.ADJUST:
        if (conflict.suggestedTime) {
          // Update task with suggested time
          await this.prisma.task.update({
            where: { id: task.id },
            data: {
              startTime: conflict.suggestedTime.startTime,
              endTime: conflict.suggestedTime.endTime,
              manuallyMoved: true,
            },
          });
          return true; // Proceed with sync
        }
        return false;

      case ConflictResolution.OVERWRITE:
        return true; // Force sync anyway

      default:
        return false;
    }
  }

  /**
   * Suggest alternative time slot
   */
  private suggestAlternativeTime(
    task: Task,
    existingEvents: any[],
    allTasks: Task[],
  ): { startTime: string; endTime: string } | undefined {
    // Simple strategy: try next hour slots
    const duration = task.durationMinutes;
    const date = new Date(task.scheduledDate);

    for (let hour = 8; hour < 22; hour++) {
      const testStart = new Date(date);
      testStart.setHours(hour, 0, 0, 0);
      const testEnd = new Date(testStart.getTime() + duration * 60 * 1000);

      // Check if this slot is free
      let isFree = true;

      for (const event of existingEvents) {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        if (this.hasTimeOverlap(testStart, testEnd, eventStart, eventEnd)) {
          isFree = false;
          break;
        }
      }

      if (isFree) {
        return {
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${testEnd.getHours().toString().padStart(2, '0')}:${testEnd.getMinutes().toString().padStart(2, '0')}`,
        };
      }
    }

    return undefined;
  }

  /**
   * Check if two time ranges overlap
   */
  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Parse task time to Date object
   */
  private parseTaskTime(task: Task, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(task.scheduledDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get tasks to sync based on DTO
   */
  private async getTasksToSync(userId: string, dto: SyncTasksDto): Promise<Task[]> {
    if (dto.planId) {
      // Sync all tasks from a plan
      return this.prisma.task.findMany({
        where: {
          userId,
          planId: dto.planId,
          isCompleted: false,
          isSkipped: false,
        },
        orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      });
    } else if (dto.taskIds && dto.taskIds.length > 0) {
      // Sync specific tasks
      return this.prisma.task.findMany({
        where: {
          userId,
          id: { in: dto.taskIds },
        },
        orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      });
    } else {
      // Sync all pending tasks
      return this.prisma.task.findMany({
        where: {
          userId,
          syncStatus: SyncStatus.PENDING,
          isCompleted: false,
          isSkipped: false,
        },
        take: 50, // Limit to avoid overwhelming
        orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      });
    }
  }

  /**
   * Get date range from tasks
   */
  private getDateRange(tasks: Task[]): { start: Date; end: Date } {
    const dates = tasks.map(t => new Date(t.scheduledDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(23, 59, 59, 999);

    return { start: minDate, end: maxDate };
  }

  /**
   * Create sync log entry
   */
  private async createSyncLog(
    userId: string,
    planId: string | undefined,
    tasksAttempted: number,
    result: SyncResult,
    duration: number,
  ): Promise<SyncLog> {
    return this.prisma.syncLog.create({
      data: {
        userId,
        planId: planId || null,
        syncType: planId ? 'full' : 'partial',
        tasksAttempted,
        tasksSucceeded: result.success,
        tasksFailed: result.failed + result.skipped,
        success: result.failed === 0 && result.skipped === 0,
        errors: (result.conflicts as any).length > 0 ? (result.conflicts as any) : null,
        duration,
      },
    });
  }

  /**
   * Get sync status for user
   */
  async getSyncStatus(userId: string) {
    const token = await this.prisma.calendarToken.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'google',
        },
      },
    });

    if (!token) {
      return {
        connected: false,
        message: 'No calendar connected',
      };
    }

    const pendingTasks = await this.prisma.task.count({
      where: {
        userId,
        syncStatus: SyncStatus.PENDING,
        isCompleted: false,
        isSkipped: false,
      },
    });

    const recentLogs = await this.prisma.syncLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      connected: true,
      syncEnabled: token.syncEnabled,
      lastSyncAt: token.lastSyncAt,
      syncErrors: token.syncErrors,
      lastError: token.lastError,
      email: token.email,
      calendarName: token.calendarName,
      pendingTasks,
      recentSyncs: recentLogs,
    };
  }
}
