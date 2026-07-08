import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { PushNotificationService } from './push-notification.service';

const ICON = '/logo-icon.svg';

/**
 * Web Push scheduler. Parallels the email reminder scheduler but for browser
 * push. Windows are sized to the cron interval so each item fires exactly once.
 */
@Injectable()
export class PushScheduler {
  private readonly logger = new Logger(PushScheduler.name);

  constructor(
    private prisma: PrismaService,
    private push: PushNotificationService,
  ) {}

  /** Task due in ~15 minutes. Runs every 5 minutes (5-minute match window). */
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'push-task-due', timeZone: 'UTC' })
  async taskDueSoon() {
    if (!this.push.isConfigured()) return;
    const now = Date.now();
    const windowStart = new Date(now + 13 * 60 * 1000);
    const windowEnd = new Date(now + 18 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        scheduledDate: { gte: windowStart, lt: windowEnd },
        isCompleted: false,
        isSkipped: false,
      },
      select: { id: true, userId: true, title: true, startTime: true },
      take: 500,
    });
    for (const task of tasks) {
      await this.push
        .sendToUser(
          task.userId,
          {
            title: 'Starting soon',
            body: `${task.title} at ${task.startTime}`,
            url: `/today?task=${task.id}`,
            icon: ICON,
            tag: `task-due-${task.id}`,
            actions: [{ action: 'complete', title: 'Mark done' }],
          },
          { eventType: 'taskDue' },
        )
        .catch((e) => this.logger.warn(`task-due push failed: ${e?.message || e}`));
    }
    if (tasks.length) this.logger.debug(`Queued ${tasks.length} task-due push(es)`);
  }

  /** Focus block starting in ~5 minutes. Runs every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'push-focus-start', timeZone: 'UTC' })
  async focusBlockStarting() {
    if (!this.push.isConfigured()) return;
    const now = new Date();
    const today = now.getDay();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const blocks = await this.prisma.focusTimeBlock.findMany({
      where: { isActive: true, protected: true },
      select: { id: true, userId: true, title: true, startTime: true, daysOfWeek: true, durationMinutes: true },
      take: 1000,
    });
    for (const block of blocks) {
      if (!block.startTime || !block.daysOfWeek.includes(today)) continue;
      const [h, m] = block.startTime.split(':').map(Number);
      const startMin = h * 60 + (m || 0);
      const delta = startMin - nowMin;
      if (delta < 3 || delta >= 8) continue; // ~5 min out, once
      await this.push
        .sendToUser(
          block.userId,
          {
            title: 'Focus time starting',
            body: `${block.title} begins at ${block.startTime}`,
            url: '/today',
            icon: ICON,
            tag: `focus-${block.id}`,
          },
          { eventType: 'focusBlock' },
        )
        .catch((e) => this.logger.warn(`focus push failed: ${e?.message || e}`));
    }
  }

  /** Morning nudge at 8am UTC for users with tasks queued today. */
  @Cron('0 8 * * *', { name: 'push-morning-ritual', timeZone: 'UTC' })
  async morningRitual() {
    if (!this.push.isConfigured()) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const userIds = await this.prisma.task.findMany({
      where: { scheduledDate: { gte: start, lte: end }, isCompleted: false },
      select: { userId: true },
      distinct: ['userId'],
      take: 1000,
    });
    for (const { userId } of userIds) {
      await this.push
        .sendToUser(
          userId,
          {
            title: 'Good morning ☀️',
            body: 'Ready to plan your day? Review today’s tasks and set your intention.',
            url: '/plan-day',
            icon: ICON,
            tag: 'morning-ritual',
          },
          { eventType: 'ritual' },
        )
        .catch((e) => this.logger.warn(`morning push failed: ${e?.message || e}`));
    }
  }
}
