import type { Goal, SubscriptionTierType } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { QueryGoalsDto } from './dto/query-goals.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

// Tier limits for goals
const TIER_LIMITS = {
  [SubscriptionTier.FREE]: 2,
  [SubscriptionTier.STARTER]: 5,
  [SubscriptionTier.PRO]: Infinity,
};

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new goal with tier limit validation
   */
  async create(
    userId: string,
    createGoalDto: CreateGoalDto,
    userTier: SubscriptionTierType
  ): Promise<Goal> {
    // Check tier limits
    await this.checkTierLimit(userId, userTier);

    this.logger.log(`Creating goal for user ${userId}: ${createGoalDto.title}`);

    return this.prisma.goal.create({
      data: {
        userId,
        title: createGoalDto.title,
        description: createGoalDto.description,
        emoji: createGoalDto.emoji || '🎯',
        color: createGoalDto.color || '#3B82F6',
        frequencyPerWeek: createGoalDto.frequencyPerWeek,
        durationMinutes: createGoalDto.durationMinutes,
        preferredTimes: createGoalDto.preferredTimes || [],
        flexibilityScore: createGoalDto.flexibilityScore || 5,
        priority: createGoalDto.priority || 5,
      },
    });
  }

  /**
   * Find all goals for a user with filters and pagination
   */
  async findAll(
    userId: string,
    query: QueryGoalsDto
  ): Promise<{ goals: Goal[]; total: number; page: number; limit: number }> {
    const { isActive, isPaused, page = 1, limit = 20 } = query;

    const where: any = { userId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isPaused !== undefined) {
      where.isPaused = isPaused;
    }

    const skip = (page - 1) * limit;

    const [goals, total] = await Promise.all([
      this.prisma.goal.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.goal.count({ where }),
    ]);

    return {
      goals,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single goal by ID
   */
  async findOne(goalId: string, userId: string): Promise<Goal> {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  /**
   * Update a goal
   */
  async update(goalId: string, userId: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    // Verify ownership
    await this.findOne(goalId, userId);

    this.logger.log(`Updating goal ${goalId}`);

    return this.prisma.goal.update({
      where: { id: goalId },
      data: updateGoalDto,
    });
  }

  /**
   * Soft delete a goal (set isActive = false)
   */
  async remove(goalId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(goalId, userId);

    this.logger.log(`Soft deleting goal ${goalId}`);

    await this.prisma.goal.update({
      where: { id: goalId },
      data: { isActive: false },
    });
  }

  /**
   * Pause a goal
   */
  async pause(goalId: string, userId: string, pausedUntil?: Date): Promise<Goal> {
    // Verify ownership
    await this.findOne(goalId, userId);

    this.logger.log(`Pausing goal ${goalId}`);

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        isPaused: true,
        pausedUntil,
      },
    });
  }

  /**
   * Activate (unpause) a goal
   */
  async activate(goalId: string, userId: string): Promise<Goal> {
    // Verify ownership
    const goal = await this.findOne(goalId, userId);

    if (!goal.isPaused) {
      throw new ForbiddenException('Goal is not paused');
    }

    this.logger.log(`Activating goal ${goalId}`);

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        isPaused: false,
        pausedUntil: null,
      },
    });
  }

  /**
   * Calculate and update goal analytics
   * Called after task completion/skipping
   */
  async calculateAnalytics(goalId: string): Promise<Goal> {
    this.logger.log(`Calculating analytics for goal ${goalId}`);

    // Get all tasks for this goal
    const tasks = await this.prisma.task.findMany({
      where: { goalId },
      orderBy: { scheduledDate: 'desc' },
    });

    const totalScheduled = tasks.length;
    const totalCompletions = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalScheduled > 0 ? (totalCompletions / totalScheduled) * 100 : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const completedTasks = tasks
      .filter(t => t.isCompleted)
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

    for (let i = 0; i < completedTasks.length; i++) {
      if (i === 0) {
        tempStreak = 1;
        currentStreak = 1;
      } else {
        const prevDate = completedTasks[i - 1].scheduledDate;
        const currDate = completedTasks[i].scheduledDate;
        const daysDiff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= 7) {
          tempStreak++;
          if (i === 1) currentStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const lastCompletedTask = completedTasks[0];
    const lastCompletedAt = lastCompletedTask?.completedAt || null;

    // Update goal with analytics
    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        totalScheduled,
        totalCompletions,
        completionRate,
        currentStreak,
        longestStreak,
        lastCompletedAt,
      },
    });
  }

  /**
   * Check if user can create more goals based on tier limits
   */
  private async checkTierLimit(userId: string, userTier: SubscriptionTierType): Promise<void> {
    const limit = TIER_LIMITS[userTier];

    const activeGoalsCount = await this.prisma.goal.count({
      where: { userId, isActive: true },
    });

    if (activeGoalsCount >= limit) {
      throw new ForbiddenException(
        `Your ${userTier} plan allows maximum ${limit} active goals. Upgrade to create more.`
      );
    }
  }

  /**
   * Get active goals count for a user
   */
  async getActiveGoalsCount(userId: string): Promise<number> {
    return this.prisma.goal.count({
      where: { userId, isActive: true },
    });
  }
}
