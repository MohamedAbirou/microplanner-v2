import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { AutopilotService } from './autopilot.service';

/**
 * Daily morning reschedule. At 9am UTC, re-packs today for every autopilot user
 * so overdue/leftover tasks are laid out around the day's commitments. AUTO
 * users get changes applied; SUGGEST users get a pending proposal to review.
 */
@Injectable()
export class DayRescheduleJob {
  private readonly logger = new Logger(DayRescheduleJob.name);

  constructor(
    private prisma: PrismaService,
    private autopilotService: AutopilotService,
  ) {}

  @Cron('0 9 * * *', { name: 'autopilot-daily-reschedule', timeZone: 'UTC' })
  async handleDailyReschedule() {
    const users = await this.prisma.user.findMany({
      where: { autopilotEnabled: true },
      select: { id: true },
    });
    if (users.length === 0) return;

    this.logger.log(`Autopilot daily reschedule for ${users.length} user(s)`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      try {
        await this.autopilotService.rescheduleDay(user.id, today, 'daily_cron');
      } catch (err) {
        this.logger.warn(
          `Daily reschedule failed for user ${user.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }
}
