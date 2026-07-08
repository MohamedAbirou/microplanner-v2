import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import type { FocusTimeBlock } from '@microplanner/database';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarProviderId } from '../calendar/services/calendar-provider.interface';

/**
 * Mirrors protected focus-time blocks onto the user's primary calendar as a
 * recurring "🎯 Focus Time" event, so the time reads as busy to others. Keeps
 * events in sync (create/update/delete) via a 15-minute cron plus explicit
 * hooks from the productivity service.
 */
@Injectable()
export class FocusCalendarSyncService {
  private readonly logger = new Logger(FocusCalendarSyncService.name);

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'focus-block-calendar-sync', timeZone: 'UTC' })
  async handleScheduledSync() {
    const users = await this.prisma.user.findMany({
      where: {
        calendarTokens: { some: { syncEnabled: true } },
        focusTimeBlocks: { some: { isActive: true } },
      },
      select: { id: true },
    });
    if (users.length === 0) return;
    this.logger.debug(`Focus-block calendar sync for ${users.length} user(s)`);
    for (const user of users) {
      try {
        await this.syncFocusBlocksToCalendar(user.id);
      } catch (err) {
        this.logger.warn(
          `Focus sync failed for user ${user.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  /** Create/update the calendar event for each active, time-fixed focus block. */
  async syncFocusBlocksToCalendar(userId: string): Promise<{ synced: number }> {
    const primary = await this.calendarService.getPrimaryProvider(userId);
    if (!primary) return { synced: 0 };

    const blocks = await this.prisma.focusTimeBlock.findMany({
      where: { userId, isActive: true },
    });

    let synced = 0;
    for (const block of blocks) {
      // Auto-scheduled blocks without a fixed start time can't map to a recurring
      // calendar event; skip until they have a concrete time.
      if (!block.startTime || !block.daysOfWeek?.length) continue;

      const sig = this.signature(block, primary);
      if (block.calendarEventId && block.calendarSyncSig === sig && block.calendarProvider === primary) {
        continue; // already up to date
      }

      try {
        // Drop any stale event first (schedule/provider changed).
        if (block.calendarEventId && block.calendarProvider) {
          await this.calendarService
            .deleteEventOnProvider(userId, block.calendarProvider as CalendarProviderId, block.calendarEventId)
            .catch(() => undefined);
        }

        const { start, end } = this.firstOccurrence(block);
        const event = await this.calendarService.createEventOnProvider(userId, primary, {
          title: `🎯 ${block.title || 'Focus Time'}`,
          description: 'Protected focus time (MicroPlanner). Kept busy so meetings work around it.',
          start,
          end,
          busy: true,
          recurrenceDays: block.daysOfWeek,
        });

        await this.prisma.focusTimeBlock.update({
          where: { id: block.id },
          data: {
            calendarEventId: event.id,
            calendarProvider: primary,
            calendarSyncSig: sig,
            calendarSyncedAt: new Date(),
          },
        });
        synced++;
      } catch (err) {
        this.logger.warn(
          `Failed to sync focus block ${block.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
    return { synced };
  }

  /** Remove a focus block's calendar event (called when the block is deleted). */
  async removeFromCalendar(block: {
    userId: string;
    calendarEventId: string | null;
    calendarProvider: string | null;
  }): Promise<void> {
    if (!block.calendarEventId || !block.calendarProvider) return;
    await this.calendarService
      .deleteEventOnProvider(
        block.userId,
        block.calendarProvider as CalendarProviderId,
        block.calendarEventId,
      )
      .catch((err) =>
        this.logger.warn(`Failed to delete focus event: ${err instanceof Error ? err.message : err}`),
      );
  }

  private signature(block: FocusTimeBlock, provider: string): string {
    const canonical = [
      block.title,
      [...block.daysOfWeek].sort((a, b) => a - b).join(','),
      block.startTime,
      block.durationMinutes,
      provider,
    ].join('|');
    return crypto.createHash('sha1').update(canonical).digest('hex');
  }

  /** First upcoming datetime (today onward) matching one of the block's weekdays. */
  private firstOccurrence(block: FocusTimeBlock): { start: Date; end: Date } {
    const [h, m] = (block.startTime as string).split(':').map(Number);
    const days = new Set(block.daysOfWeek);
    const date = new Date();
    date.setHours(h, m || 0, 0, 0);
    // If today matches but the time already passed, start from tomorrow.
    if (days.has(date.getDay()) && date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1);
    }
    for (let i = 0; i < 7; i++) {
      if (days.has(date.getDay())) break;
      date.setDate(date.getDate() + 1);
    }
    const start = new Date(date);
    const end = new Date(start.getTime() + block.durationMinutes * 60 * 1000);
    return { start, end };
  }
}
