import type { SyncLog, Task } from '@microplanner/database';
import { SyncStatus } from '@microplanner/database';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConflictResolution, SyncTasksDto } from './dto/sync-tasks.dto';
import { GoogleOAuthService } from './services/google-oauth.service';
import { OutlookOAuthService } from './services/outlook-oauth.service';
import { GoogleCalendarProvider } from './services/google-calendar.provider';
import { OutlookCalendarProvider } from './services/outlook-calendar.provider';
import { CalendarWatchChannelService } from './services/calendar-watch-channel.service';
import {
  CalendarProvider,
  CalendarProviderId,
  CreateEventInput,
  NormalizedCalendarEvent,
  UpdateEventInput,
} from './services/calendar-provider.interface';

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
    private outlookOAuthService: OutlookOAuthService,
    private googleProvider: GoogleCalendarProvider,
    private outlookProvider: OutlookCalendarProvider,
    private watchChannels: CalendarWatchChannelService,
  ) {}

  // ============================================================
  // PROVIDER ROUTING
  // ============================================================

  private providerClient(id: CalendarProviderId): CalendarProvider {
    return id === 'outlook' ? this.outlookProvider : this.googleProvider;
  }

  /** Provider ids the user has connected with sync enabled. */
  private async getConnectedProviderIds(userId: string): Promise<CalendarProviderId[]> {
    const tokens = await this.prisma.calendarToken.findMany({
      where: { userId, syncEnabled: true },
      select: { provider: true },
    });
    return tokens
      .map((t) => t.provider as CalendarProviderId)
      .filter((p) => p === 'google' || p === 'outlook');
  }

  /**
   * The provider MicroPlanner writes new events to. Google is preferred when
   * both are connected; a task's own calendarProvider overrides this.
   */
  private async getWriteProviderId(userId: string): Promise<CalendarProviderId | null> {
    const ids = await this.getConnectedProviderIds(userId);
    if (ids.includes('google')) return 'google';
    if (ids.includes('outlook')) return 'outlook';
    return null;
  }

  /**
   * Get calendar events for a date range (raw-ish shape retained for the
   * conflict engine and controller), aggregated across all connected providers.
   */
  async getEvents(userId: string, startDate: Date, endDate: Date) {
    const events = await this.getEventsForPlanning(userId, startDate, endDate);
    return {
      events: events.map((e) => ({
        id: e.id,
        summary: e.title,
        description: e.description,
        start: { dateTime: e.start.toISOString() },
        end: { dateTime: e.end.toISOString() },
        status: 'confirmed',
        provider: e.provider,
      })),
      total: events.length,
    };
  }

  /**
   * Get calendar events for planning (conflict detection)
   * Returns events in a simplified format for AI planners
   */
  async getEventsForPlanning(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<NormalizedCalendarEvent[]> {
    const providerIds = await this.getConnectedProviderIds(userId);
    if (providerIds.length === 0) return [];

    // Fetch from every connected provider; a failure in one must not blank out
    // the others (planning should degrade gracefully, never hard-fail).
    const results = await Promise.all(
      providerIds.map(async (id) => {
        try {
          return await this.providerClient(id).listEvents(userId, startDate, endDate);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          this.logger.debug(`No ${id} events for planning (user ${userId}): ${msg}`);
          return [] as NormalizedCalendarEvent[];
        }
      }),
    );
    const events = results.flat();
    events.sort((a, b) => a.start.getTime() - b.start.getTime());
    this.logger.debug(`Fetched ${events.length} calendar events for planning (user ${userId})`);
    return events;
  }

  /**
   * Sync tasks to calendar with idempotency and conflict detection
   */
  async syncTasks(userId: string, syncTasksDto: SyncTasksDto): Promise<SyncResult> {
    const startTime = Date.now();

    const writeProviderId = await this.getWriteProviderId(userId);
    if (!writeProviderId) {
      throw new BadRequestException('No calendar connected. Please connect a calendar first.');
    }
    const writeProvider = this.providerClient(writeProviderId);

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

    // Get existing calendar events (all providers) to check for conflicts
    const dateRange = this.getDateRange(tasks);
    const existingEvents = await this.getEventsForPlanning(userId, dateRange.start, dateRange.end);

    for (const task of tasks) {
      try {
        // Check for conflicts
        const conflict = await this.detectConflict(task, existingEvents, tasks);

        if (conflict) {
          // Handle conflict based on resolution strategy
          const handled = await this.handleConflict(
            task,
            conflict,
            syncTasksDto.conflictResolution || ConflictResolution.SKIP,
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

        // Idempotent event creation/update via the chosen provider
        const eventId = await writeProvider.upsertTaskEvent(userId, task);

        // Update task with sync info
        await this.prisma.task.update({
          where: { id: task.id },
          data: {
            calendarEventId: eventId,
            calendarProvider: writeProviderId,
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
      where: { userId, provider: writeProviderId },
      data: { lastSyncAt: new Date() },
    });

    return result;
  }

  /**
   * Detect conflicts with existing calendar events or other tasks
   */
  private async detectConflict(
    task: Task,
    existingEvents: NormalizedCalendarEvent[],
    allTasks: Task[],
  ): Promise<ConflictInfo | null> {
    const taskStart = this.parseTaskTime(task, task.startTime);
    const taskEnd = this.parseTaskTime(task, task.endTime);

    // Check for overlaps with existing calendar events
    for (const event of existingEvents) {
      // Skip this task's own event (already synced) and all-day events.
      if (event.id && event.id === task.calendarEventId) continue;
      if (event.isAllDay) continue;

      if (this.hasTimeOverlap(taskStart, taskEnd, event.start, event.end)) {
        return {
          task,
          reason: `Overlaps with existing event: ${event.title}`,
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
    existingEvents: NormalizedCalendarEvent[],
    _allTasks: Task[],
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
        if (event.isAllDay) continue;
        if (this.hasTimeOverlap(testStart, testEnd, event.start, event.end)) {
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

  // ============================================================
  // CONNECTIONS API — shape consumed by the GraphQL gateway
  // (CalendarConnection type). Google is the only provider today;
  // other providers return a clear error instead of pretending.
  // ============================================================

  private mapTokenToConnection(token: {
    id: string;
    userId: string;
    provider: string;
    email: string | null;
    calendarId: string | null;
    calendarName: string | null;
    syncEnabled: boolean;
    lastSyncAt: Date | null;
    syncErrors: number;
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: token.id,
      userId: token.userId,
      provider: token.provider.toUpperCase(), // GraphQL enum: GOOGLE | OUTLOOK | APPLE
      email: token.email,
      calendarId: token.calendarId,
      calendarName: token.calendarName,
      syncEnabled: token.syncEnabled,
      lastSyncAt: token.lastSyncAt,
      syncErrors: token.syncErrors,
      lastError: token.lastError,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    };
  }

  async listConnections(userId: string) {
    const tokens = await this.prisma.calendarToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return tokens.map(t => this.mapTokenToConnection(t));
  }

  async getConnection(connectionId: string, userId: string) {
    const token = await this.prisma.calendarToken.findFirst({
      where: { id: connectionId, userId },
    });
    if (!token) {
      throw new BadRequestException('Calendar connection not found');
    }
    return this.mapTokenToConnection(token);
  }

  initiateAuth(userId: string, provider: string) {
    const normalized = (provider || '').toLowerCase();
    if (normalized === 'google') {
      return { url: this.googleOAuthService.generateAuthUrl(userId), provider: 'GOOGLE' };
    }
    if (normalized === 'outlook') {
      return { url: this.outlookOAuthService.generateAuthUrl(userId), provider: 'OUTLOOK' };
    }
    throw new BadRequestException(
      `${provider} calendar is not supported. Connect Google or Outlook.`,
    );
  }

  async connectFromInput(userId: string, input: { provider: string; code: string; state?: string }) {
    const normalized = (input.provider || '').toLowerCase();
    let token;
    if (normalized === 'google') {
      token = await this.googleOAuthService.handleCallback(input.code, input.state || '', userId);
    } else if (normalized === 'outlook') {
      token = await this.outlookOAuthService.handleCallback(input.code, input.state || '', userId);
    } else {
      throw new BadRequestException(
        `${input.provider} calendar is not supported. Connect Google or Outlook.`,
      );
    }
    // Register a push channel so calendar changes drive autopilot in real time.
    void this.watchChannels
      .ensureWatch(userId, normalized as 'google' | 'outlook')
      .catch((err) => this.logger.warn(`ensureWatch after connect failed: ${err?.message || err}`));
    return this.mapTokenToConnection(token as any);
  }

  async disconnectConnection(connectionId: string, userId: string) {
    // Ownership check happens in getConnection
    const connection = await this.getConnection(connectionId, userId);
    // Tear down any push channel before deleting the token that holds its ids.
    await this.watchChannels
      .stopWatch(userId, connection.provider.toLowerCase() as 'google' | 'outlook')
      .catch((err) => this.logger.warn(`stopWatch on disconnect failed: ${err?.message || err}`));
    await this.prisma.calendarToken.delete({ where: { id: connectionId } });
    this.logger.log(`Calendar connection ${connectionId} removed for user ${userId}`);
  }

  /**
   * Sync a specific connection (Google only today) and map the result to the
   * GraphQL SyncResult shape.
   */
  async syncConnection(connectionId: string, userId: string) {
    const connection = await this.getConnection(connectionId, userId);
    const startTime = Date.now();
    const result = await this.syncTasks(userId, {} as SyncTasksDto);

    return {
      success: result.failed === 0,
      provider: connection.provider,
      tasksAttempted: result.success + result.failed + result.skipped,
      tasksSucceeded: result.success,
      tasksFailed: result.failed,
      duration: Date.now() - startTime,
      errors: result.details
        .filter(d => d.status === 'failed')
        .map(d => ({ taskId: d.taskId, message: d.error || 'Sync failed', code: 'SYNC_FAILED' })),
    };
  }

  async syncAllConnections(userId: string) {
    const connections = await this.listConnections(userId);
    const results = [];
    for (const connection of connections) {
      if (!connection.syncEnabled) continue;
      results.push(await this.syncConnection(connection.id, userId));
    }
    return results;
  }

  /**
   * Busy slots for the GraphQL BusySlot type
   */
  async getBusySlots(userId: string, startDate: Date, endDate: Date) {
    const events = await this.getEventsForPlanning(userId, startDate, endDate);
    return events.map(e => ({ start: e.start, end: e.end, title: e.title }));
  }

  /**
   * Events for a specific connection, mapped to the GraphQL CalendarEvent type
   */
  async getConnectionEvents(connectionId: string, userId: string, startDate: Date, endDate: Date) {
    const connection = await this.getConnection(connectionId, userId);
    const events = await this.getEventsForPlanning(userId, startDate, endDate);
    // A connection filter narrows to that provider's events; connectionless
    // callers see the aggregate.
    const wanted = connection.provider.toLowerCase();
    return events
      .filter((e) => e.provider === wanted)
      .map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description ?? null,
        start: e.start,
        end: e.end,
        allDay: e.isAllDay,
        source: e.provider.toUpperCase(),
        attendees: e.attendees ?? [],
        location: e.location ?? null,
      }));
  }

  private toGraphqlEvent(e: NormalizedCalendarEvent) {
    return {
      id: e.id,
      title: e.title,
      description: e.description ?? null,
      start: e.start,
      end: e.end,
      allDay: e.isAllDay,
      source: e.provider.toUpperCase(),
      attendees: e.attendees ?? [],
      location: e.location ?? null,
    };
  }

  /**
   * Create a calendar event directly (not tied to a task). Writes to the user's
   * primary connected provider, or an explicitly requested one.
   */
  async createCalendarEvent(
    userId: string,
    input: { title: string; description?: string; start: string; end: string; allDay?: boolean; location?: string; provider?: string }
  ) {
    const providerId = await this.resolveWriteProvider(userId, input.provider);
    const created = await this.providerClient(providerId).createEvent(userId, {
      title: input.title,
      description: input.description,
      start: input.start,
      end: input.end,
      allDay: input.allDay,
      location: input.location,
    });
    return this.toGraphqlEvent(created);
  }

  /**
   * Update a calendar event. Routes to the provider that owns the event when the
   * user has more than one calendar connected.
   */
  async updateCalendarEvent(
    eventId: string,
    userId: string,
    input: { title?: string; description?: string; start?: string; end?: string; location?: string; provider?: string }
  ) {
    const providerId = await this.resolveOwningProvider(userId, input.provider);
    const updated = await this.providerClient(providerId).updateEvent(userId, eventId, {
      title: input.title,
      description: input.description,
      start: input.start,
      end: input.end,
      location: input.location,
    });
    return this.toGraphqlEvent(updated);
  }

  private async resolveWriteProvider(
    userId: string,
    requested?: string,
  ): Promise<CalendarProviderId> {
    if (requested) {
      const norm = requested.toLowerCase();
      if (norm === 'google' || norm === 'outlook') return norm;
    }
    const id = await this.getWriteProviderId(userId);
    if (!id) throw new BadRequestException('No calendar connected');
    return id;
  }

  private async resolveOwningProvider(
    userId: string,
    requested?: string,
  ): Promise<CalendarProviderId> {
    return this.resolveWriteProvider(userId, requested);
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: string, userId: string, provider?: string) {
    // Try every connected provider so we don't need the caller to know which
    // calendar owns the event; a 404 on the wrong provider is ignored.
    const ids = provider
      ? [provider.toLowerCase() as CalendarProviderId]
      : await this.getConnectedProviderIds(userId);
    for (const id of ids) {
      try {
        await this.providerClient(id).deleteEvent(userId, eventId);
      } catch (err) {
        this.logger.debug(`Delete on ${id} failed for event ${eventId}: ${err instanceof Error ? err.message : err}`);
      }
    }
    this.logger.log(`Calendar event ${eventId} deleted for user ${userId}`);
  }

  // ============================================================
  // FOCUS BLOCK / DIRECT PROVIDER WRITES (used by productivity + defense)
  // ============================================================

  /** Create an event on a specific provider and return the normalized result. */
  async createEventOnProvider(
    userId: string,
    providerId: CalendarProviderId,
    input: CreateEventInput,
  ): Promise<NormalizedCalendarEvent> {
    return this.providerClient(providerId).createEvent(userId, input);
  }

  async updateEventOnProvider(
    userId: string,
    providerId: CalendarProviderId,
    eventId: string,
    input: UpdateEventInput,
  ): Promise<NormalizedCalendarEvent> {
    return this.providerClient(providerId).updateEvent(userId, eventId, input);
  }

  async deleteEventOnProvider(
    userId: string,
    providerId: CalendarProviderId,
    eventId: string,
  ): Promise<void> {
    return this.providerClient(providerId).deleteEvent(userId, eventId);
  }

  async respondToEventOnProvider(
    userId: string,
    providerId: CalendarProviderId,
    eventId: string,
    response: 'declined' | 'accepted' | 'tentative',
  ): Promise<void> {
    return this.providerClient(providerId).respondToEvent(userId, eventId, response);
  }

  /** Primary connected provider id, or null when no calendar is connected. */
  async getPrimaryProvider(userId: string): Promise<CalendarProviderId | null> {
    return this.getWriteProviderId(userId);
  }
}
