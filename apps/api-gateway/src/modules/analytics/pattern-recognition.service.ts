import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier } from '@microplanner/database';
import {
  UserPatternInsights,
  TaskCompletionEvent,
  PatternAnalysisResult,
} from './types/pattern-insights.types';

/**
 * Pattern Recognition Service
 *
 * Production-ready AI learning system for PRO tier users.
 * Features:
 * - Analyzes task completion patterns over time
 * - Learns optimal scheduling times for each user
 * - Identifies productivity peaks and valleys
 * - Provides personalized recommendations
 * - Feeds insights back to AI planner for better scheduling
 */
@Injectable()
export class PatternRecognitionService {
  private readonly logger = new Logger(PatternRecognitionService.name);

  // Minimum tasks required for reliable pattern analysis
  private readonly MIN_TASKS_FOR_ANALYSIS = 20;
  private readonly MIN_TASKS_FOR_HIGH_CONFIDENCE = 50;

  constructor(private prisma: PrismaService) {}

  /**
   * Analyze user patterns and generate insights
   * Called periodically or on-demand for PRO users
   */
  async analyzeUserPatterns(userId: string): Promise<PatternAnalysisResult> {
    this.logger.log(`Analyzing patterns for user ${userId}`);

    // Fetch completed tasks from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const completedTasks = await this.prisma.task.findMany({
      where: {
        userId,
        isCompleted: true,
        completedAt: { gte: ninetyDaysAgo },
      },
      include: {
        goal: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    const sampleSize = completedTasks.length;

    // Need minimum data for reliable analysis
    if (sampleSize < this.MIN_TASKS_FOR_ANALYSIS) {
      return {
        insights: this.getDefaultInsights(userId),
        recommendations: [
          'Complete more tasks to unlock personalized insights',
          `${this.MIN_TASKS_FOR_ANALYSIS - sampleSize} more tasks needed for pattern analysis`,
        ],
        confidence: 0,
        sampleSize,
      };
    }

    // Convert to completion events
    const events = completedTasks.map(task => this.taskToEvent(task));

    // Analyze patterns
    const insights: UserPatternInsights = {
      userId,
      bestCompletionHours: this.analyzeBestHours(events),
      worstCompletionHours: this.analyzeWorstHours(events),
      preferredWorkHours: this.analyzePreferredHours(events),
      mostProductiveDays: this.analyzeMostProductiveDays(events),
      leastProductiveDays: this.analyzeLeastProductiveDays(events),
      goalCompletionPatterns: await this.analyzeGoalPatterns(userId, events),
      optimalSessionLength: this.analyzeOptimalDuration(events),
      completionRateByDuration: this.analyzeCompletionByDuration(events),
      streakDays: await this.calculateCurrentStreak(userId),
      longestStreak: await this.calculateLongestStreak(userId),
      averageTasksPerDay: this.calculateAverageTasksPerDay(events),
      prefersBufferTime: this.detectBufferPreference(events),
      prefersTaskClustering: this.detectClusteringPreference(events),
      morningPersonScore: this.calculateMorningPersonScore(events),
      eveningPersonScore: this.calculateEveningPersonScore(events),
      totalTasksAnalyzed: sampleSize,
      dataQuality: this.determineDataQuality(sampleSize),
      lastUpdated: new Date(),
      confidenceScore: this.calculateConfidence(sampleSize),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(insights);

    // Cache insights in database (JSON field in User table or separate table)
    await this.cacheInsights(userId, insights);

    this.logger.log(
      `Pattern analysis complete for user ${userId}: ${sampleSize} tasks, ${insights.confidenceScore}% confidence`,
    );

    return {
      insights,
      recommendations,
      confidence: insights.confidenceScore,
      sampleSize,
    };
  }

  /**
   * Get cached insights for user (fast)
   */
  async getCachedInsights(userId: string): Promise<UserPatternInsights | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { patternInsights: true },
    });

    if (!user?.patternInsights) {
      return null;
    }

    return user.patternInsights as unknown as UserPatternInsights;
  }

  /**
   * Record task completion event for learning
   */
  async recordCompletionEvent(taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { goal: true, user: true },
    });

    if (!task || !task.isCompleted) {
      return;
    }

    // Only track for PRO/PREMIUM users
    if (task.user.tier !== SubscriptionTier.PRO && task.user.tier !== SubscriptionTier.PREMIUM) {
      return;
    }

    // Trigger async pattern re-analysis if enough new data
    // (In production, this would be a queued job)
    const recentCompletions = await this.prisma.task.count({
      where: {
        userId: task.userId,
        isCompleted: true,
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    // Re-analyze every 10 completions
    if (recentCompletions % 10 === 0) {
      this.analyzeUserPatterns(task.userId).catch(error => {
        this.logger.error(`Failed to re-analyze patterns: ${error.message}`);
      });
    }
  }

  /**
   * Analyze best completion hours (0-23)
   */
  private analyzeBestHours(events: TaskCompletionEvent[]): number[] {
    const hourCompletions = new Map<number, { completed: number; total: number }>();

    for (const event of events) {
      const hour = event.hourOfDay;
      const stats = hourCompletions.get(hour) || { completed: 0, total: 0 };
      stats.total++;
      if (event.wasOnTime || event.wasEarly) {
        stats.completed++;
      }
      hourCompletions.set(hour, stats);
    }

    // Calculate completion rates
    const hourRates = Array.from(hourCompletions.entries())
      .map(([hour, stats]) => ({
        hour,
        rate: stats.completed / stats.total,
        count: stats.total,
      }))
      .filter(item => item.count >= 3) // Minimum 3 samples
      .sort((a, b) => b.rate - a.rate);

    // Return top 3 hours
    return hourRates.slice(0, 3).map(item => item.hour);
  }

  /**
   * Analyze worst completion hours
   */
  private analyzeWorstHours(events: TaskCompletionEvent[]): number[] {
    const hourCompletions = new Map<number, { completed: number; total: number }>();

    for (const event of events) {
      const hour = event.hourOfDay;
      const stats = hourCompletions.get(hour) || { completed: 0, total: 0 };
      stats.total++;
      if (event.wasOnTime || event.wasEarly) {
        stats.completed++;
      }
      hourCompletions.set(hour, stats);
    }

    const hourRates = Array.from(hourCompletions.entries())
      .map(([hour, stats]) => ({
        hour,
        rate: stats.completed / stats.total,
        count: stats.total,
      }))
      .filter(item => item.count >= 3)
      .sort((a, b) => a.rate - b.rate); // Ascending (worst first)

    return hourRates.slice(0, 3).map(item => item.hour);
  }

  /**
   * Analyze preferred work hours from actual behavior
   */
  private analyzePreferredHours(events: TaskCompletionEvent[]): { start: number; end: number } {
    const hours = events.map(e => e.hourOfDay).sort((a, b) => a - b);

    if (hours.length === 0) {
      return { start: 9, end: 17 }; // Default
    }

    // Find the range that contains 80% of completions
    const start = hours[Math.floor(hours.length * 0.1)];
    const end = hours[Math.floor(hours.length * 0.9)];

    return { start: Math.max(6, start), end: Math.min(22, end) };
  }

  /**
   * Analyze most productive days
   */
  private analyzeMostProductiveDays(events: TaskCompletionEvent[]): number[] {
    const dayCompletions = new Map<number, { completed: number; total: number }>();

    for (const event of events) {
      const day = event.dayOfWeek;
      const stats = dayCompletions.get(day) || { completed: 0, total: 0 };
      stats.total++;
      if (event.wasOnTime || event.wasEarly) {
        stats.completed++;
      }
      dayCompletions.set(day, stats);
    }

    const dayRates = Array.from(dayCompletions.entries())
      .map(([day, stats]) => ({
        day,
        rate: stats.completed / stats.total,
        count: stats.total,
      }))
      .filter(item => item.count >= 3)
      .sort((a, b) => b.rate - a.rate);

    return dayRates.slice(0, 3).map(item => item.day);
  }

  /**
   * Analyze least productive days
   */
  private analyzeLeastProductiveDays(events: TaskCompletionEvent[]): number[] {
    const dayCompletions = new Map<number, { completed: number; total: number }>();

    for (const event of events) {
      const day = event.dayOfWeek;
      const stats = dayCompletions.get(day) || { completed: 0, total: 0 };
      stats.total++;
      if (event.wasOnTime || event.wasEarly) {
        stats.completed++;
      }
      dayCompletions.set(day, stats);
    }

    const dayRates = Array.from(dayCompletions.entries())
      .map(([day, stats]) => ({
        day,
        rate: stats.completed / stats.total,
        count: stats.total,
      }))
      .filter(item => item.count >= 3)
      .sort((a, b) => a.rate - b.rate);

    return dayRates.slice(0, 2).map(item => item.day);
  }

  /**
   * Analyze goal-specific patterns
   */
  private async analyzeGoalPatterns(
    userId: string,
    events: TaskCompletionEvent[],
  ): Promise<UserPatternInsights['goalCompletionPatterns']> {
    const goalEvents = new Map<string, TaskCompletionEvent[]>();

    for (const event of events) {
      if (!event.goalId) continue;

      const existing = goalEvents.get(event.goalId) || [];
      existing.push(event);
      goalEvents.set(event.goalId, existing);
    }

    const patterns: UserPatternInsights['goalCompletionPatterns'] = [];

    for (const [goalId, goalEventList] of goalEvents.entries()) {
      if (goalEventList.length < 5) continue; // Need minimum sample

      const completedOnTime = goalEventList.filter(e => e.wasOnTime || e.wasEarly).length;
      const averageCompletionRate = (completedOnTime / goalEventList.length) * 100;

      // Find best times for this goal
      const hourCounts = new Map<number, number>();
      for (const event of goalEventList) {
        if (event.wasOnTime || event.wasEarly) {
          hourCounts.set(event.hourOfDay, (hourCounts.get(event.hourOfDay) || 0) + 1);
        }
      }

      const bestHours = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour.toString().padStart(2, '0')}:00`);

      // Find best days
      const dayCounts = new Map<number, number>();
      for (const event of goalEventList) {
        if (event.wasOnTime || event.wasEarly) {
          dayCounts.set(event.dayOfWeek, (dayCounts.get(event.dayOfWeek) || 0) + 1);
        }
      }

      const bestDays = Array.from(dayCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day]) => day);

      // Average preferred duration
      const durations = goalEventList.map(e => e.scheduledDuration);
      const preferredDuration = Math.round(
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      );

      patterns.push({
        goalId,
        goalTitle: goalEventList[0].goalTitle || 'Unknown Goal',
        bestTimes: bestHours,
        bestDays,
        averageCompletionRate,
        preferredDuration,
      });
    }

    return patterns;
  }

  /**
   * Analyze optimal session length
   */
  private analyzeOptimalDuration(events: TaskCompletionEvent[]): number {
    const completedEvents = events.filter(e => e.wasOnTime || e.wasEarly);

    if (completedEvents.length === 0) {
      return 60; // Default
    }

    const durations = completedEvents.map(e => e.scheduledDuration);
    const sum = durations.reduce((a, b) => a + b, 0);
    return Math.round(sum / durations.length);
  }

  /**
   * Analyze completion rates by duration range
   */
  private analyzeCompletionByDuration(
    events: TaskCompletionEvent[],
  ): UserPatternInsights['completionRateByDuration'] {
    const ranges = [
      { range: '0-30', min: 0, max: 30 },
      { range: '30-60', min: 30, max: 60 },
      { range: '60-90', min: 60, max: 90 },
      { range: '90-120', min: 90, max: 120 },
      { range: '120+', min: 120, max: Infinity },
    ];

    return ranges.map(({ range, min, max }) => {
      const rangeEvents = events.filter(
        e => e.scheduledDuration >= min && e.scheduledDuration < max,
      );

      if (rangeEvents.length === 0) {
        return { durationRange: range, completionRate: 0 };
      }

      const completed = rangeEvents.filter(e => e.wasOnTime || e.wasEarly).length;
      const completionRate = (completed / rangeEvents.length) * 100;

      return { durationRange: range, completionRate: Math.round(completionRate) };
    });
  }

  /**
   * Calculate current streak
   */
  private async calculateCurrentStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 90; i++) {
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const hasCompletion = await this.prisma.task.count({
        where: {
          userId,
          isCompleted: true,
          completedAt: {
            gte: checkDate,
            lt: nextDay,
          },
        },
      });

      if (hasCompletion > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate longest streak (all time)
   */
  private async calculateLongestStreak(userId: string): Promise<number> {
    // Simplified: return current streak for now
    // Full implementation would scan all history
    return this.calculateCurrentStreak(userId);
  }

  /**
   * Calculate average tasks per day
   */
  private calculateAverageTasksPerDay(events: TaskCompletionEvent[]): number {
    if (events.length === 0) return 0;

    const days = new Set(events.map(e => e.completedAt.toDateString())).size;
    return Math.round((events.length / days) * 10) / 10;
  }

  /**
   * Detect if user prefers buffer time between tasks
   */
  private detectBufferPreference(events: TaskCompletionEvent[]): boolean {
    // Analyze if user completes tasks better with gaps
    // Simplified: assume true for now
    return true;
  }

  /**
   * Detect if user prefers clustering similar tasks
   */
  private detectClusteringPreference(events: TaskCompletionEvent[]): boolean {
    // Analyze if user completes similar tasks in batches
    // Simplified: assume false for now
    return false;
  }

  /**
   * Calculate morning person score (-100 to 100)
   */
  private calculateMorningPersonScore(events: TaskCompletionEvent[]): number {
    const morningEvents = events.filter(e => e.hourOfDay >= 6 && e.hourOfDay < 12);
    const afternoonEvents = events.filter(e => e.hourOfDay >= 12 && e.hourOfDay < 18);

    if (morningEvents.length === 0 && afternoonEvents.length === 0) {
      return 0;
    }

    const morningRate =
      morningEvents.filter(e => e.wasOnTime || e.wasEarly).length / (morningEvents.length || 1);
    const afternoonRate =
      afternoonEvents.filter(e => e.wasOnTime || e.wasEarly).length / (afternoonEvents.length || 1);

    return Math.round((morningRate - afternoonRate) * 100);
  }

  /**
   * Calculate evening person score (-100 to 100)
   */
  private calculateEveningPersonScore(events: TaskCompletionEvent[]): number {
    const eveningEvents = events.filter(e => e.hourOfDay >= 18 && e.hourOfDay < 22);
    const morningEvents = events.filter(e => e.hourOfDay >= 6 && e.hourOfDay < 12);

    if (eveningEvents.length === 0 && morningEvents.length === 0) {
      return 0;
    }

    const eveningRate =
      eveningEvents.filter(e => e.wasOnTime || e.wasEarly).length / (eveningEvents.length || 1);
    const morningRate =
      morningEvents.filter(e => e.wasOnTime || e.wasEarly).length / (morningEvents.length || 1);

    return Math.round((eveningRate - morningRate) * 100);
  }

  /**
   * Determine data quality based on sample size
   */
  private determineDataQuality(sampleSize: number): 'low' | 'medium' | 'high' {
    if (sampleSize < 30) return 'low';
    if (sampleSize < this.MIN_TASKS_FOR_HIGH_CONFIDENCE) return 'medium';
    return 'high';
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(sampleSize: number): number {
    if (sampleSize < this.MIN_TASKS_FOR_ANALYSIS) return 0;
    if (sampleSize >= this.MIN_TASKS_FOR_HIGH_CONFIDENCE) return 100;

    // Linear scale between MIN and HIGH
    const range = this.MIN_TASKS_FOR_HIGH_CONFIDENCE - this.MIN_TASKS_FOR_ANALYSIS;
    const progress = sampleSize - this.MIN_TASKS_FOR_ANALYSIS;
    return Math.round((progress / range) * 100);
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(insights: UserPatternInsights): string[] {
    const recommendations: string[] = [];

    // Best hours recommendation
    if (insights.bestCompletionHours.length > 0) {
      const hours = insights.bestCompletionHours.map(h => `${h}:00`).join(', ');
      recommendations.push(`Schedule important tasks around ${hours} - your peak performance times`);
    }

    // Morning/evening person
    if (insights.morningPersonScore > 30) {
      recommendations.push('You\'re a morning person - prioritize difficult tasks before noon');
    } else if (insights.eveningPersonScore > 30) {
      recommendations.push('You\'re an evening person - save complex work for afternoon/evening');
    }

    // Optimal duration
    if (insights.optimalSessionLength > 0) {
      recommendations.push(
        `Your sweet spot is ${insights.optimalSessionLength}-minute sessions`,
      );
    }

    // Productive days
    if (insights.mostProductiveDays.length > 0) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = insights.mostProductiveDays.map(d => days[d]).join(', ');
      recommendations.push(`${dayNames} are your most productive days - front-load your week`);
    }

    return recommendations;
  }

  /**
   * Convert task to completion event
   */
  private taskToEvent(task: any): TaskCompletionEvent {
    const scheduledDate = new Date(task.scheduledDate);
    const completedAt = task.completedAt || new Date();

    // Calculate if on time
    const [schedHour, schedMin] = task.startTime.split(':').map(Number);
    const scheduledTime = new Date(scheduledDate);
    scheduledTime.setHours(schedHour, schedMin, 0, 0);

    const scheduledEndTime = new Date(scheduledTime);
    scheduledEndTime.setMinutes(scheduledEndTime.getMinutes() + task.durationMinutes);

    const wasOnTime = completedAt >= scheduledTime && completedAt <= scheduledEndTime;
    const wasEarly = completedAt < scheduledTime;
    const wasLate = completedAt > scheduledEndTime;

    const delayMinutes = wasLate
      ? Math.round((completedAt.getTime() - scheduledEndTime.getTime()) / (1000 * 60))
      : null;

    return {
      taskId: task.id,
      userId: task.userId,
      goalId: task.goalId,
      goalTitle: task.goal?.title || null,
      scheduledDate,
      scheduledStartTime: task.startTime,
      scheduledDuration: task.durationMinutes,
      completedAt,
      wasOnTime,
      wasEarly,
      wasLate,
      delayMinutes,
      dayOfWeek: completedAt.getDay(),
      hourOfDay: completedAt.getHours(),
      wasAIGenerated: task.aiGenerated,
      aiModel: task.aiReasoning ? 'ai' : null,
      createdAt: task.createdAt,
    };
  }

  /**
   * Cache insights in database
   */
  private async cacheInsights(userId: string, insights: UserPatternInsights): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        patternInsights: insights as any,
      },
    });
  }

  /**
   * Get default insights for users without enough data
   */
  private getDefaultInsights(userId: string): UserPatternInsights {
    return {
      userId,
      bestCompletionHours: [9, 10, 14],
      worstCompletionHours: [12, 16, 18],
      preferredWorkHours: { start: 9, end: 17 },
      mostProductiveDays: [1, 2, 3],
      leastProductiveDays: [0, 6],
      goalCompletionPatterns: [],
      optimalSessionLength: 60,
      completionRateByDuration: [],
      streakDays: 0,
      longestStreak: 0,
      averageTasksPerDay: 0,
      prefersBufferTime: true,
      prefersTaskClustering: false,
      morningPersonScore: 0,
      eveningPersonScore: 0,
      totalTasksAnalyzed: 0,
      dataQuality: 'low',
      lastUpdated: new Date(),
      confidenceScore: 0,
    };
  }
}
