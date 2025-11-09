import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { PlansService } from './plans.service';
import { SubscriptionTier, PlanStatus } from '@microplanner/database';

/**
 * Plan Automation Service
 *
 * Handles automatic weekly plan regeneration for PRO/PREMIUM users.
 * Features:
 * - Runs every Sunday at 8 PM (configurable)
 * - Generates plans for the upcoming week
 * - Only generates if no recent plan exists
 * - Sends email notifications when ready
 * - Tracks automation metrics
 */
@Injectable()
export class PlanAutomationService {
  private readonly logger = new Logger(PlanAutomationService.name);

  // Track automation metrics
  private metrics = {
    lastRunAt: null as Date | null,
    totalRuns: 0,
    successfulPlans: 0,
    failedPlans: 0,
    skippedUsers: 0,
  };

  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  /**
   * Weekly plan auto-regeneration cron job
   * Runs every Sunday at 8:00 PM (20:00)
   * Generates plans for PRO/PREMIUM users for the upcoming week
   */
  @Cron('0 20 * * 0', {
    name: 'weekly-plan-regeneration',
    timeZone: 'UTC',
  })
  async handleWeeklyPlanRegeneration() {
    this.logger.log('🔄 Starting weekly plan auto-regeneration...');
    const startTime = Date.now();
    this.metrics.lastRunAt = new Date();
    this.metrics.totalRuns++;

    try {
      // Calculate next week boundaries
      const nextWeekStart = this.getNextWeekStart();
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      nextWeekEnd.setHours(23, 59, 59, 999);

      this.logger.log(
        `Generating plans for week: ${nextWeekStart.toLocaleDateString()} - ${nextWeekEnd.toLocaleDateString()}`,
      );

      // Find all PRO/PREMIUM users with active goals
      const eligibleUsers = await this.findEligibleUsers();
      this.logger.log(`Found ${eligibleUsers.length} eligible PRO/PREMIUM users`);

      // Process each user
      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;

      for (const user of eligibleUsers) {
        try {
          // Check if user already has a plan for next week
          const existingPlan = await this.prisma.weeklyPlan.findFirst({
            where: {
              userId: user.id,
              weekStartDate: {
                gte: nextWeekStart,
                lt: new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
              },
              status: {
                in: [PlanStatus.DRAFT, PlanStatus.ACCEPTED, PlanStatus.APPLIED],
              },
            },
          });

          if (existingPlan) {
            this.logger.debug(
              `User ${user.id} already has a plan for next week (${existingPlan.id}), skipping`,
            );
            skippedCount++;
            continue;
          }

          // Generate plan for next week
          this.logger.debug(`Generating plan for user ${user.id} (${user.tier})`);

          await this.plansService.generate(
            user.id,
            {
              weekStartDate: nextWeekStart.toISOString().split('T')[0],
              goalIds: [], // Auto-include all active goals
            },
            user,
          );

          successCount++;
          this.logger.log(`✓ Generated plan for user ${user.id}`);
        } catch (error) {
          failCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`✗ Failed to generate plan for user ${user.id}: ${errorMessage}`);
        }

        // Add delay between users to prevent rate limiting
        await this.sleep(1000); // 1 second delay
      }

      // Update metrics
      this.metrics.successfulPlans += successCount;
      this.metrics.failedPlans += failCount;
      this.metrics.skippedUsers += skippedCount;

      const duration = (Date.now() - startTime) / 1000;
      this.logger.log(
        `✓ Weekly plan regeneration completed in ${duration.toFixed(2)}s: ${successCount} success, ${failCount} failed, ${skippedCount} skipped`,
      );

      // Track analytics
      await this.trackAutomationRun(successCount, failCount, skippedCount, duration);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Weekly plan regeneration failed: ${errorMessage}`);
    }
  }

  /**
   * Manual trigger for weekly plan regeneration (for testing/debugging)
   * Can be called via admin endpoint
   */
  async manualTrigger(): Promise<{
    success: number;
    failed: number;
    skipped: number;
    duration: number;
  }> {
    this.logger.log('🔄 Manual weekly plan regeneration triggered');
    const startTime = Date.now();

    const nextWeekStart = this.getNextWeekStart();
    const eligibleUsers = await this.findEligibleUsers();

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (const user of eligibleUsers) {
      try {
        // Check for existing plan
        const existingPlan = await this.prisma.weeklyPlan.findFirst({
          where: {
            userId: user.id,
            weekStartDate: {
              gte: nextWeekStart,
              lt: new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
            status: {
              in: [PlanStatus.DRAFT, PlanStatus.ACCEPTED, PlanStatus.APPLIED],
            },
          },
        });

        if (existingPlan) {
          skippedCount++;
          continue;
        }

        await this.plansService.generate(
          user.id,
          {
            weekStartDate: nextWeekStart.toISOString().split('T')[0],
            goalIds: [],
          },
          user,
        );

        successCount++;
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to generate plan for user ${user.id}: ${errorMessage}`);
      }

      await this.sleep(1000);
    }

    const duration = (Date.now() - startTime) / 1000;

    this.logger.log(
      `Manual regeneration completed: ${successCount} success, ${failCount} failed, ${skippedCount} skipped`,
    );

    return { success: successCount, failed: failCount, skipped: skippedCount, duration };
  }

  /**
   * Generate plan for a specific user for next week
   * Used for individual user auto-regeneration
   */
  async generateForUser(userId: string): Promise<{ success: boolean; planId?: string; error?: string }> {
    try {
      // Fetch user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check if user is PRO/PREMIUM
      if (user.tier !== SubscriptionTier.PRO && user.tier !== SubscriptionTier.PREMIUM) {
        return { success: false, error: 'Auto-regeneration only available for PRO/PREMIUM users' };
      }

      // Calculate next week
      const nextWeekStart = this.getNextWeekStart();

      // Check for existing plan
      const existingPlan = await this.prisma.weeklyPlan.findFirst({
        where: {
          userId,
          weekStartDate: {
            gte: nextWeekStart,
            lt: new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
          status: {
            in: [PlanStatus.DRAFT, PlanStatus.ACCEPTED, PlanStatus.APPLIED],
          },
        },
      });

      if (existingPlan) {
        return { success: false, error: 'Plan already exists for next week', planId: existingPlan.id };
      }

      // Generate plan
      const plan = await this.plansService.generate(
        userId,
        {
          weekStartDate: nextWeekStart.toISOString().split('T')[0],
          goalIds: [],
        },
        user,
      );

      this.logger.log(`Auto-generated plan ${plan.id} for user ${userId}`);
      return { success: true, planId: plan.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to auto-generate plan for user ${userId}: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get automation metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: process.uptime(),
    };
  }

  /**
   * Find all PRO/PREMIUM users with active goals eligible for auto-regeneration
   */
  private async findEligibleUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        tier: {
          in: [SubscriptionTier.PRO, SubscriptionTier.PREMIUM],
        },
        // User has at least one active goal
        goals: {
          some: {
            isActive: true,
            isPaused: false,
          },
        },
      },
      include: {
        goals: {
          where: {
            isActive: true,
            isPaused: false,
          },
        },
      },
    });

    // Filter users who have at least one active, non-paused goal
    return users.filter((user) => user.goals.length > 0);
  }

  /**
   * Get next Monday's date at midnight
   */
  private getNextWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Calculate days until next Monday
    // If today is Sunday (0), next Monday is 1 day away
    // If today is Monday (1), next Monday is 7 days away
    // If today is Tuesday (2), next Monday is 6 days away
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilNextMonday);
    nextMonday.setHours(0, 0, 0, 0);

    return nextMonday;
  }

  /**
   * Track automation run in analytics
   */
  private async trackAutomationRun(
    successCount: number,
    failCount: number,
    skippedCount: number,
    duration: number,
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          userId: null, // System event
          sessionId: null,
          event: 'plan_auto_regeneration',
          properties: {
            successCount,
            failCount,
            skippedCount,
            duration,
            timestamp: new Date().toISOString(),
          },
          platform: 'backend',
          appVersion: process.env.APP_VERSION || '1.0.0',
          userTier: null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to track automation run: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
