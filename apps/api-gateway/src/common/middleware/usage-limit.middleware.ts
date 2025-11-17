import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier, SubscriptionTierType } from '@microplanner/database';

/**
 * Tier limits configuration matching frontend tier-context.tsx
 */
const TIER_LIMITS = {
  FREE: {
    maxActiveGoals: 3,
    maxPlansPerWeek: 7,
    maxTasksPerDay: 20,
  },
  STARTER: {
    maxActiveGoals: 5,
    maxPlansPerWeek: 15,
    maxTasksPerDay: 40,
  },
  PRO: {
    maxActiveGoals: 15,
    maxPlansPerWeek: -1, // Unlimited
    maxTasksPerDay: 100,
  },
  PREMIUM: {
    maxActiveGoals: -1, // Unlimited
    maxPlansPerWeek: -1,
    maxTasksPerDay: -1,
  },
};

type LimitType = 'goals' | 'plans' | 'tasks';

/**
 * Service to check and enforce usage limits based on user's tier
 */
@Injectable()
export class UsageLimitService {
  private readonly logger = new Logger(UsageLimitService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if user can create a new goal
   * @throws ForbiddenException if limit exceeded
   */
  async checkGoalLimit(userId: string, userTier: SubscriptionTierType): Promise<void> {
    const limit = TIER_LIMITS[userTier].maxActiveGoals;

    // Unlimited
    if (limit === -1) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeGoalsCount: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.activeGoalsCount >= limit) {
      this.logger.warn(`User ${userId} (${userTier}) hit goal limit: ${user.activeGoalsCount}/${limit}`);
      throw new ForbiddenException(
        `Goal limit reached (${limit} for ${userTier} tier). Upgrade to create more goals.`
      );
    }
  }

  /**
   * Check if user can create a new plan this week
   * @throws ForbiddenException if limit exceeded
   */
  async checkPlanLimit(userId: string, userTier: SubscriptionTierType): Promise<void> {
    const limit = TIER_LIMITS[userTier].maxPlansPerWeek;

    // Unlimited
    if (limit === -1) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plansCreatedThisWeek: true, weeklyPlanResetAt: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Reset weekly counter if needed
    const now = new Date();
    const weeklyResetDate = user.weeklyPlanResetAt;
    const daysSinceReset = Math.floor((now.getTime() - weeklyResetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 7) {
      // Reset weekly counter
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          plansCreatedThisWeek: 0,
          weeklyPlanResetAt: now,
        },
      });
      return; // User can create plan after reset
    }

    // Check limit
    if (user.plansCreatedThisWeek >= limit) {
      this.logger.warn(`User ${userId} (${userTier}) hit plan limit: ${user.plansCreatedThisWeek}/${limit}`);
      throw new ForbiddenException(
        `Weekly plan limit reached (${limit} for ${userTier} tier). Upgrade or wait for weekly reset.`
      );
    }
  }

  /**
   * Check if user can create a new task today
   * @throws ForbiddenException if limit exceeded
   */
  async checkTaskLimit(userId: string, userTier: SubscriptionTierType): Promise<void> {
    const limit = TIER_LIMITS[userTier].maxTasksPerDay;

    // Unlimited
    if (limit === -1) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tasksCreatedToday: true, dailyTaskResetAt: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Reset daily counter if needed
    const now = new Date();
    const dailyResetDate = user.dailyTaskResetAt;
    const hoursSinceReset = Math.floor((now.getTime() - dailyResetDate.getTime()) / (1000 * 60 * 60));

    if (hoursSinceReset >= 24) {
      // Reset daily counter
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          tasksCreatedToday: 0,
          dailyTaskResetAt: now,
        },
      });
      return; // User can create task after reset
    }

    // Check limit
    if (user.tasksCreatedToday >= limit) {
      this.logger.warn(`User ${userId} (${userTier}) hit task limit: ${user.tasksCreatedToday}/${limit}`);
      throw new ForbiddenException(
        `Daily task limit reached (${limit} for ${userTier} tier). Upgrade or wait for daily reset.`
      );
    }
  }

  /**
   * Increment goal counter after successful creation
   */
  async incrementGoalCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeGoalsCount: { increment: 1 } },
    });
  }

  /**
   * Decrement goal counter after deletion
   */
  async decrementGoalCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeGoalsCount: { decrement: 1 } },
    });
  }

  /**
   * Increment plan counter after successful creation
   */
  async incrementPlanCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plansCreatedThisWeek: { increment: 1 },
        lastPlanCreatedAt: new Date(),
      },
    });
  }

  /**
   * Increment task counter after successful creation
   */
  async incrementTaskCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tasksCreatedToday: { increment: 1 } },
    });
  }

  /**
   * Get current usage stats for a user
   */
  async getUsageStats(userId: string, userTier: SubscriptionTierType) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        activeGoalsCount: true,
        plansCreatedThisWeek: true,
        tasksCreatedToday: true,
        weeklyPlanResetAt: true,
        dailyTaskResetAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const limits = TIER_LIMITS[userTier];

    return {
      goals: {
        current: user.activeGoalsCount,
        limit: limits.maxActiveGoals,
        remaining: limits.maxActiveGoals === -1 ? -1 : Math.max(0, limits.maxActiveGoals - user.activeGoalsCount),
      },
      plans: {
        current: user.plansCreatedThisWeek,
        limit: limits.maxPlansPerWeek,
        remaining: limits.maxPlansPerWeek === -1 ? -1 : Math.max(0, limits.maxPlansPerWeek - user.plansCreatedThisWeek),
        resetAt: user.weeklyPlanResetAt,
      },
      tasks: {
        current: user.tasksCreatedToday,
        limit: limits.maxTasksPerDay,
        remaining: limits.maxTasksPerDay === -1 ? -1 : Math.max(0, limits.maxTasksPerDay - user.tasksCreatedToday),
        resetAt: user.dailyTaskResetAt,
      },
    };
  }
}
