import type { AnalyticsEvent, LLMUsage } from '@microplanner/database';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';

export interface UserMetrics {
  todayTasks: number;
  todayCompleted: number;
  todayCompletionRate: number;
  weekTasks: number;
  weekCompleted: number;
  weekCompletionRate: number;
  activeGoals: number;
  currentStreak: number;
  longestStreak: number;
  totalPlans: number;
  averagePlanQuality: number;
}

export interface WeeklyInsights {
  weekStartDate: Date;
  weekEndDate: Date;
  goalsCreated: number;
  plansGenerated: number;
  tasksCompleted: number;
  completionRate: number;
  topGoals: Array<{ title: string; completions: number }>;
  productivity: 'high' | 'medium' | 'low';
  recommendation: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track an analytics event
   */
  async trackEvent(userId: string | null, dto: TrackEventDto): Promise<AnalyticsEvent> {
    const userTier = userId
      ? (await this.prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }))?.tier
      : null;

    const event = await this.prisma.analyticsEvent.create({
      data: {
        userId,
        sessionId: dto.sessionId || null,
        event: dto.event,
        properties: dto.properties || null,
        platform: dto.platform || null,
        appVersion: dto.appVersion || null,
        userTier: userTier || null,
      },
    });

    this.logger.log(`Tracked event: ${dto.event} for user ${userId}`);
    return event;
  }

  /**
   * Get user metrics for dashboard
   */
  async getUserMetrics(userId: string): Promise<UserMetrics> {
    // Calculate current week boundaries (Monday-Sunday)
    const { weekStartDate, weekEndDate } = this.calculateCurrentWeekBoundaries();

    // Today boundaries (scheduledDate is stored at midnight, but use a full
    // day range to be robust against timezone offsets in stored values)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      todayTasks,
      todayCompleted,
      weekTasks,
      weekCompleted,
      activeGoals,
      totalPlans,
      avgAggregate,
    ] = await Promise.all([
      this.prisma.task.count({
        where: { userId, scheduledDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.task.count({
        where: { userId, scheduledDate: { gte: todayStart, lte: todayEnd }, isCompleted: true },
      }),
      this.prisma.task.count({
        where: {
          userId,
          scheduledDate: { gte: weekStartDate, lte: weekEndDate },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          isCompleted: true,
          completedAt: { gte: weekStartDate, lte: weekEndDate },
        },
      }),
      this.prisma.goal.count({
        where: { userId, isActive: true },
      }),
      this.prisma.weeklyPlan.count({
        where: { userId },
      }),
      this.prisma.weeklyPlan.aggregate({
        where: { userId },
        _avg: { qualityScore: true },
      }),
    ]);

    const averagePlanQuality = Number(avgAggregate?._avg?.qualityScore ?? 0);

    const todayCompletionRate = todayTasks > 0 ? (todayCompleted / todayTasks) * 100 : 0;
    const weekCompletionRate = weekTasks > 0 ? (weekCompleted / weekTasks) * 100 : 0;
    const streaksPromise = (async () => {
      // Fetch all completed task timestamps for the user
      const completed = await this.prisma.task.findMany({
        where: { userId, isCompleted: true, completedAt: { not: null } },
        select: { completedAt: true },
      });

      const DAY_MS = 24 * 60 * 60 * 1000;

      // Normalize to UTC-local midnight (date-only) and build a set of unique day timestamps
      const daysSet = new Set<number>();
      for (const row of completed) {
        const d = new Date(row.completedAt as Date);
        d.setHours(0, 0, 0, 0);
        daysSet.add(d.getTime());
      }

      // Compute longest streak by scanning sorted unique days
      const days = Array.from(daysSet).sort((a, b) => a - b);
      let longest = 0;
      let run = 0;
      let prev: number | null = null;
      for (const dayMs of days) {
        if (prev === null || dayMs - prev === DAY_MS) {
          run++;
        } else {
          run = 1;
        }
        if (run > longest) longest = run;
        prev = dayMs;
      }

      // Compute current streak by walking backwards from today
      let current = 0;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      while (daysSet.has(cursor.getTime())) {
        current++;
        cursor.setDate(cursor.getDate() - 1);
        cursor.setHours(0, 0, 0, 0);
      }

      return { current, longest };
    })();

    const { current: currentStreak, longest: longestStreak } = await streaksPromise;

    return {
      todayTasks,
      todayCompleted,
      todayCompletionRate,
      weekTasks,
      weekCompleted,
      weekCompletionRate,
      activeGoals,
      currentStreak,
      longestStreak,
      totalPlans,
      averagePlanQuality,
    };
  }

  /**
   * Get weekly insights for user
   */
  async getWeeklyInsights(userId: string): Promise<WeeklyInsights> {
    // Calculate current week boundaries (Monday-Sunday)
    const { weekStartDate, weekEndDate } = this.calculateCurrentWeekBoundaries();

    // Get this week's data
    const [goalsCreated, plansGenerated, tasksCompleted, allTasks, goalsWithCompletions] =
      await Promise.all([
        this.prisma.goal.count({
          where: {
            userId,
            createdAt: { gte: weekStartDate, lte: weekEndDate },
          },
        }),
        this.prisma.weeklyPlan.count({
          where: {
            userId,
            createdAt: { gte: weekStartDate, lte: weekEndDate },
          },
        }),
        this.prisma.task.count({
          where: {
            userId,
            isCompleted: true,
            completedAt: { gte: weekStartDate, lte: weekEndDate },
          },
        }),
        this.prisma.task.count({
          where: {
            userId,
            scheduledDate: { gte: weekStartDate, lte: weekEndDate },
          },
        }),
        this.prisma.goal.findMany({
          where: { userId, isActive: true },
          select: {
            title: true,
            totalCompletions: true,
          },
          orderBy: { totalCompletions: 'desc' },
          take: 5,
        }),
      ]);

    const completionRate = allTasks > 0 ? (tasksCompleted / allTasks) * 100 : 0;

    // Determine productivity level
    let productivity: 'high' | 'medium' | 'low';
    if (completionRate >= 80) {
      productivity = 'high';
    } else if (completionRate >= 50) {
      productivity = 'medium';
    } else {
      productivity = 'low';
    }

    // Generate recommendation
    let recommendation: string;
    if (productivity === 'high') {
      recommendation = "Excellent work! You're crushing your goals this week.";
    } else if (productivity === 'medium') {
      recommendation = 'Good progress! Try to complete a few more tasks to boost your week.';
    } else if (tasksCompleted === 0) {
      recommendation = 'No tasks completed yet this week. Start small and build momentum!';
    } else {
      recommendation =
        'You can do it! Focus on your top priority goals to improve completion rate.';
    }

    const topGoals = goalsWithCompletions.map(g => ({
      title: g.title,
      completions: g.totalCompletions,
    }));

    return {
      weekStartDate,
      weekEndDate,
      goalsCreated,
      plansGenerated,
      tasksCompleted,
      completionRate,
      topGoals,
      productivity,
      recommendation,
    };
  }

  /**
   * Get LLM usage statistics
   */
  async getLLMUsage(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const usageRecords = await this.prisma.lLMUsage.findMany({
      where: {
        userId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'desc' },
    });

    const totalCost = usageRecords.reduce((sum, r) => sum + r.cost, 0) / 100; // Convert cents to dollars
    const totalTokens = usageRecords.reduce((sum, r) => sum + r.totalTokens, 0);
    const avgLatency =
      usageRecords.length > 0
        ? usageRecords.reduce((sum, r) => sum + r.latency, 0) / usageRecords.length
        : 0;

    const byModel = usageRecords.reduce(
      (acc, r) => {
        if (!acc[r.model]) {
          acc[r.model] = { count: 0, cost: 0, tokens: 0 };
        }
        acc[r.model].count++;
        acc[r.model].cost += r.cost / 100;
        acc[r.model].tokens += r.totalTokens;
        return acc;
      },
      {} as Record<string, { count: number; cost: number; tokens: number }>
    );

    return {
      period: { days, since },
      totalRequests: usageRecords.length,
      totalCost,
      totalTokens,
      avgLatency,
      byModel,
    };
  }

  /**
   * Track LLM usage (called by PlansService after AI generation)
   */
  async trackLLMUsage(
    userId: string | null,
    planId: string | null,
    model: string,
    operation: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    latency: number,
    success: boolean = true,
    errorMessage: string | null = null
  ): Promise<LLMUsage> {
    const usage = await this.prisma.lLMUsage.create({
      data: {
        userId,
        planId,
        model,
        operation,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
        latency,
        success,
        errorMessage,
      },
    });

    this.logger.log(
      `Tracked LLM usage: ${model} - ${operation} - ${inputTokens + outputTokens} tokens - $${(cost / 100).toFixed(4)}`
    );

    return usage;
  }

  /**
   * Aggregate analytics data (background job)
   * Can be called daily to pre-compute metrics
   */
  async aggregateMetrics(): Promise<{ processed: number }> {
    this.logger.log('Running analytics aggregation job');

    // Get all users
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    let processed = 0;

    for (const user of users) {
      try {
        // Update goal analytics
        const goals = await this.prisma.goal.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        for (const goal of goals) {
          // Calculate and update goal analytics
          const tasks = await this.prisma.task.findMany({
            where: { goalId: goal.id },
          });

          const totalScheduled = tasks.length;
          const totalCompletions = tasks.filter(t => t.isCompleted).length;
          const completionRate = totalScheduled > 0 ? (totalCompletions / totalScheduled) * 100 : 0;

          await this.prisma.goal.update({
            where: { id: goal.id },
            data: {
              totalScheduled,
              totalCompletions,
              completionRate,
            },
          });
        }

        // Update plan completion rates
        const plans = await this.prisma.weeklyPlan.findMany({
          where: { userId: user.id },
          select: { id: true },
        });

        for (const plan of plans) {
          const tasks = await this.prisma.task.findMany({
            where: { planId: plan.id },
          });

          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(t => t.isCompleted).length;
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          await this.prisma.weeklyPlan.update({
            where: { id: plan.id },
            data: {
              totalTasks,
              completedTasks,
              completionRate,
            },
          });
        }

        processed++;
      } catch (error) {
        this.logger.error(`Failed to aggregate metrics for user ${user.id}`, error);
      }
    }

    this.logger.log(`Analytics aggregation complete: ${processed} users processed`);

    return { processed };
  }

  private calculateCurrentWeekBoundaries(weekStart?: string): {
    weekStartDate: Date;
    weekEndDate: Date;
  } {
    // Calculate current week boundaries (Monday-Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStartDate = weekStart ? new Date(weekStart) : new Date(now);
    weekStartDate.setDate(now.getDate() + diff);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    return { weekStartDate, weekEndDate };
  }
}
