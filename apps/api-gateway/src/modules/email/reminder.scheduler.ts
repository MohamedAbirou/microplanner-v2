import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from './email.service';

/**
 * Reminder Scheduler
 *
 * Production-ready cron jobs for automated email reminders.
 * Features:
 * - Task reminders (1 day before, 1 hour before)
 * - Weekly summary emails (Sunday evenings)
 * - Robust error handling
 * - Efficient database queries
 * - Respects user notification preferences
 */
@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Check whether a user should receive a given kind of reminder email.
   * Users without a NotificationPreferences row default to enabled.
   */
  private async emailAllowed(
    userId: string,
    kind: 'taskReminder' | 'weeklySummary'
  ): Promise<boolean> {
    const prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });
    if (!prefs) return true;
    if (!prefs.emailEnabled) return false;
    return kind === 'taskReminder' ? prefs.taskDueAlerts : prefs.weeklySummary;
  }

  /**
   * Send 1-hour-before reminders
   * Runs every hour at :00
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendOneHourReminders(): Promise<void> {
    if (!this.emailService.isEmailEnabled()) {
      return;
    }

    try {
      this.logger.debug('Running 1-hour reminder job...');

      // Calculate time window: 55-65 minutes from now
      const now = new Date();
      const windowStart = new Date(now.getTime() + 55 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 65 * 60 * 1000);

      // Find tasks starting in ~1 hour
      const tasks = await this.prisma.task.findMany({
        where: {
          scheduledDate: {
            gte: windowStart,
            lte: windowEnd,
          },
          isCompleted: false,
        },
        include: {
          user: true,
        },
      });

      if (tasks.length === 0) {
        this.logger.debug('No tasks found for 1-hour reminders');
        return;
      }

      // Send reminders
      let sent = 0;
      for (const task of tasks) {
        try {
          if (!(await this.emailAllowed(task.userId, 'taskReminder'))) {
            continue;
          }

          await this.emailService.sendTaskReminder(task as any, task.user, '1_hour_before');
          sent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to send 1-hour reminder for task ${task.id}: ${errorMessage}`,
          );
          // Continue with next task
        }
      }

      this.logger.log(`Sent ${sent}/${tasks.length} 1-hour reminders`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`1-hour reminder job failed: ${errorMessage}`);
    }
  }

  /**
   * Send 1-day-before reminders
   * Runs daily at 9:00 AM
   */
  @Cron('0 9 * * *')
  async sendOneDayReminders(): Promise<void> {
    if (!this.emailService.isEmailEnabled()) {
      return;
    }

    try {
      this.logger.debug('Running 1-day reminder job...');

      // Calculate tomorrow's date range
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Find tasks scheduled for tomorrow
      const tasks = await this.prisma.task.findMany({
        where: {
          scheduledDate: {
            gte: tomorrow,
            lte: tomorrowEnd,
          },
          isCompleted: false,
        },
        include: {
          user: true,
        },
      });

      if (tasks.length === 0) {
        this.logger.debug('No tasks found for 1-day reminders');
        return;
      }

      // Send reminders
      let sent = 0;
      for (const task of tasks) {
        try {
          if (!(await this.emailAllowed(task.userId, 'taskReminder'))) {
            continue;
          }

          await this.emailService.sendTaskReminder(task as any, task.user, '1_day_before');
          sent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to send 1-day reminder for task ${task.id}: ${errorMessage}`,
          );
          // Continue with next task
        }
      }

      this.logger.log(`Sent ${sent}/${tasks.length} 1-day reminders`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`1-day reminder job failed: ${errorMessage}`);
    }
  }

  /**
   * Send weekly summary emails
   * Runs every Sunday at 6:00 PM
   */
  @Cron('0 18 * * 0')
  async sendWeeklySummaries(): Promise<void> {
    if (!this.emailService.isEmailEnabled()) {
      return;
    }

    try {
      this.logger.debug('Running weekly summary job...');

      // Calculate past week range (Mon-Sun)
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6); // Last Monday
      weekStart.setHours(0, 0, 0, 0);

      // Find all active users
      const users = await this.prisma.user.findMany();

      if (users.length === 0) {
        this.logger.debug('No users found for weekly summaries');
        return;
      }

      // Send summaries
      let sent = 0;
      for (const user of users) {
        try {
          if (!(await this.emailAllowed(user.id, 'weeklySummary'))) {
            continue;
          }

          // Gather weekly statistics
          const [goalsCreated, plansGenerated, tasksCompleted, totalTasks] =
            await Promise.all([
              this.prisma.goal.count({
                where: {
                  userId: user.id,
                  createdAt: { gte: weekStart, lte: weekEnd },
                },
              }),
              this.prisma.weeklyPlan.count({
                where: {
                  userId: user.id,
                  createdAt: { gte: weekStart, lte: weekEnd },
                },
              }),
              this.prisma.task.count({
                where: {
                  userId: user.id,
                  isCompleted: true,
                  completedAt: { gte: weekStart, lte: weekEnd },
                },
              }),
              this.prisma.task.count({
                where: {
                  userId: user.id,
                  scheduledDate: { gte: weekStart, lte: weekEnd },
                },
              }),
            ]);

          // Skip if no activity
          if (goalsCreated === 0 && plansGenerated === 0 && totalTasks === 0) {
            continue;
          }

          // Calculate completion rate
          const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

          // Determine productivity level
          let productivity: 'high' | 'medium' | 'low' = 'low';
          if (completionRate >= 80) productivity = 'high';
          else if (completionRate >= 60) productivity = 'medium';

          // Get top goals
          const topGoals = await this.getTopGoals(user.id, weekStart, weekEnd);

          // Generate recommendation
          const recommendation = this.generateRecommendation(
            completionRate,
            goalsCreated,
            tasksCompleted,
          );

          // Send email
          await this.emailService.sendWeeklySummary(user as any, {
            weekStartDate: weekStart,
            weekEndDate: weekEnd,
            goalsCreated,
            plansGenerated,
            tasksCompleted,
            totalTasks,
            completionRate,
            productivity,
            topGoals,
            recommendation,
          });

          sent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Failed to send weekly summary for user ${user.id}: ${errorMessage}`,
          );
          // Continue with next user
        }
      }

      this.logger.log(`Sent ${sent}/${users.length} weekly summaries`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Weekly summary job failed: ${errorMessage}`);
    }
  }

  /**
   * Get top performing goals for the week
   */
  private async getTopGoals(
    userId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<
    Array<{ title: string; emoji: string; completionRate: number; completions: number }>
  > {
    // Get all goals with task completion data
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
      },
      include: {
        tasks: {
          where: {
            scheduledDate: { gte: weekStart, lte: weekEnd },
          },
        },
      },
    });

    // Calculate completion rates
    const goalsWithStats = goals
      .map((goal) => {
        const totalTasks = goal.tasks.length;
        const completedTasks = goal.tasks.filter((t) => t.isCompleted).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          title: goal.title,
          emoji: goal.emoji || '🎯',
          completionRate: Math.round(completionRate),
          completions: completedTasks,
          totalTasks,
        };
      })
      .filter((g) => g.totalTasks > 0); // Only include goals with tasks

    // Sort by completion rate, then by completions
    goalsWithStats.sort((a, b) => {
      if (b.completionRate !== a.completionRate) {
        return b.completionRate - a.completionRate;
      }
      return b.completions - a.completions;
    });

    // Return top 3
    return goalsWithStats.slice(0, 3);
  }

  /**
   * Generate AI-like recommendation
   */
  private generateRecommendation(
    completionRate: number,
    _goalsCreated: number,
    _tasksCompleted: number,
  ): string {
    if (completionRate >= 80) {
      return "Outstanding week! You're in a great flow state. Consider taking on one more challenging goal to maintain momentum.";
    } else if (completionRate >= 60) {
      return "Solid progress this week! Try blocking out dedicated focus time in your calendar to boost completion rates.";
    } else if (completionRate >= 40) {
      return "You're making progress, but there's room to improve. Consider reducing your weekly goals to focus on fewer, high-impact tasks.";
    } else {
      return "It looks like you may have taken on too much this week. Next week, try starting with just 2-3 achievable goals to build momentum.";
    }
  }
}
