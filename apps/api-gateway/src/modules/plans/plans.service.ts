import type { Goal, User, WeeklyPlan } from '@microplanner/database';
import { PlanStatus, SubscriptionTier } from '@microplanner/database';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { EmailService } from '../email/email.service';
import { UsageLimitService } from '../../common/middleware/usage-limit.middleware';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';
import { ClaudeSonnetPlannerService } from './strategies/claude-sonnet-planner.service';
import { GPT4oMiniPlannerService } from './strategies/gpt-4o-mini-planner.service';
import { RuleBasedPlannerService } from './strategies/rule-based-planner.service';

// Cost per 1000 tokens (in USD cents)
const TOKEN_COSTS: Record<string, number> = {
  'rule-based': 0, // Free
  'gpt-4o-mini': 0.015, // $0.15 per 1M tokens (avg input+output)
  'claude-sonnet-5': 0.09, // approx avg input+output blend
  'claude-sonnet-3.5': 0.09, // legacy label kept for stored plans
  'gpt-4o': 0.25, // $2.50 per 1M tokens
};

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);
  private readonly planningServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private ruleBasedPlanner: RuleBasedPlannerService,
    private gpt4oMiniPlanner: GPT4oMiniPlannerService,
    private claudeSonnetPlanner: ClaudeSonnetPlannerService,
    private emailService: EmailService,
    private calendarService: CalendarService,
    private usageLimitService: UsageLimitService,
  ) {
    this.planningServiceUrl =
      this.configService.get('PLANNING_SERVICE_URL') || 'http://localhost:8000';
  }

  /**
   * Generate a new AI weekly plan
   * Full orchestration: validate, fetch data, call AI, calculate quality, save
   */
  async generate(userId: string, generatePlanDto: GeneratePlanDto, user: User): Promise<WeeklyPlan> {
    const startTime = Date.now();

    // 1. Check tier limits using centralized UsageLimitService
    await this.usageLimitService.checkPlanLimit(userId, user.tier);

    // 2. Calculate week boundaries
    const { weekStartDate, weekEndDate } = this.calculateWeekBoundaries(
      generatePlanDto.weekStartDate
    );

    // 3. Fetch active goals
    const goals = await this.fetchActiveGoals(userId, generatePlanDto.goalIds);

    if (goals.length === 0) {
      throw new BadRequestException('No active goals found. Please create goals first.');
    }

    // 4. Fetch user preferences
    const _preferences = {
      wakeTime: user.wakeTime,
      sleepTime: user.sleepTime,
      workStartTime: user.workStartTime,
      workEndTime: user.workEndTime,
      productivityPeaks: user.productivityPeaks,
      energyPattern: user.energyPattern,
      blockedTimes: user.blockedTimes,
      timezone: user.timezone,
    };

    // 5. Fetch existing calendar events for conflict detection
    const calendarEvents = await this.calendarService.getEventsForPlanning(
      userId,
      weekStartDate,
      weekEndDate,
    );

    this.logger.debug(`Fetched ${calendarEvents.length} calendar events for conflict detection`);

    // 6. Select planning strategy based on tier
    let planJson: any;
    let reasoning: string | null = null;
    let aiModel: string;
    let tokenUsage = 0;
    const complexity = 'simple';
    let qualityScore = 0;
    let generationCost = 0;

    if (user.tier === SubscriptionTier.FREE) {
      // Use rule-based planner for FREE tier (no LLM costs)
      this.logger.log(`Using rule-based planner for FREE tier user ${userId}`);

      const result = await this.ruleBasedPlanner.generatePlan(
        user,
        goals,
        weekStartDate,
        calendarEvents,
      );

      planJson = { tasks: result.tasks };
      reasoning = null; // No AI reasoning for rule-based
      aiModel = 'rule-based';
      qualityScore = result.qualityScore;
      generationCost = 0; // Free!
    } else if (user.tier === SubscriptionTier.STARTER) {
      // GPT-4o-mini for STARTER; if the LLM call fails (missing/expired key,
      // outage, malformed response), fall back to the rule-based planner so
      // paying users always get a plan.
      this.logger.log(`Using GPT-4o-mini planner for STARTER tier user ${userId}`);

      try {
        const result = await this.gpt4oMiniPlanner.generatePlan(
          user,
          goals,
          weekStartDate,
          calendarEvents,
        );

        planJson = { tasks: result.tasks };
        reasoning = result.reasoning || null;
        aiModel = 'gpt-4o-mini';
        qualityScore = result.qualityScore;
        // Estimate token usage (roughly 2000 input + 2000 output per plan)
        tokenUsage = 4000;
        generationCost = this.calculateCost(aiModel, tokenUsage);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `GPT-4o-mini planner failed (${message}) — falling back to rule-based planner`
        );

        const result = await this.ruleBasedPlanner.generatePlan(
          user,
          goals,
          weekStartDate,
          calendarEvents,
        );

        planJson = { tasks: result.tasks };
        reasoning = null;
        aiModel = 'rule-based (gpt-4o-mini unavailable)';
        qualityScore = result.qualityScore;
        tokenUsage = 0;
        generationCost = 0;
      }
    } else {
      // Claude Sonnet for PRO/PREMIUM; degrade Claude → GPT-4o-mini →
      // rule-based so a provider outage never blocks plan generation.
      this.logger.log(`Using Claude Sonnet 3.5 planner for ${user.tier} tier user ${userId}`);

      try {
        const result = await this.claudeSonnetPlanner.generatePlan(
          user,
          goals,
          weekStartDate,
          calendarEvents,
        );

        planJson = { tasks: result.tasks };
        reasoning = result.reasoning || null;
        aiModel = process.env.ANTHROPIC_PLANNER_MODEL || 'claude-sonnet-5';
        qualityScore = result.qualityScore;
        // Estimate token usage (roughly 3000 input + 5000 output per plan)
        tokenUsage = 8000;
        generationCost = this.calculateCost(aiModel, tokenUsage);
      } catch (claudeError) {
        const claudeMessage =
          claudeError instanceof Error ? claudeError.message : 'Unknown error';
        this.logger.warn(
          `Claude planner failed (${claudeMessage}) — falling back to GPT-4o-mini`
        );

        try {
          const result = await this.gpt4oMiniPlanner.generatePlan(
            user,
            goals,
            weekStartDate,
            calendarEvents,
          );

          planJson = { tasks: result.tasks };
          reasoning = result.reasoning || null;
          aiModel = 'gpt-4o-mini (claude unavailable)';
          qualityScore = result.qualityScore;
          tokenUsage = 4000;
          generationCost = this.calculateCost('gpt-4o-mini', tokenUsage);
        } catch (gptError) {
          const gptMessage = gptError instanceof Error ? gptError.message : 'Unknown error';
          this.logger.warn(
            `GPT-4o-mini fallback also failed (${gptMessage}) — using rule-based planner`
          );

          const result = await this.ruleBasedPlanner.generatePlan(
            user,
            goals,
            weekStartDate,
            calendarEvents,
          );

          planJson = { tasks: result.tasks };
          reasoning = null;
          aiModel = 'rule-based (llm unavailable)';
          qualityScore = result.qualityScore;
          tokenUsage = 0;
          generationCost = 0;
        }
      }
    }

    // 7. Calculate generation metrics
    const generationTime = (Date.now() - startTime) / 1000; // seconds

    // 8. Save plan to database
    const planTitle =
      generatePlanDto.title?.trim() ||
      `Week of ${weekStartDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })}`;

    const plan = await this.prisma.weeklyPlan.create({
      data: {
        userId,
        weekStartDate,
        weekEndDate,
        planJson: {
          ...planJson,
          title: planTitle,
        },
        reasoning,
        aiModel,
        complexity,
        generationTime,
        generationCost,
        tokenUsage,
        qualityScore,
        totalTasks: planJson.tasks?.length || 0,
        status: PlanStatus.DRAFT,
      },
    });

    // Increment plan counter after successful creation
    await this.usageLimitService.incrementPlanCount(userId);

    this.logger.log(
      `Plan generated successfully: ${plan.id} (${generationTime.toFixed(2)}s, $${(generationCost / 100).toFixed(4)})`
    );

    // 9. Send email notification (async, non-blocking, honors preferences)
    this.sendPlanReadyIfEnabled(user, plan);

    return plan as any;
  }

  /**
   * Send the plan-ready email if the user has email notifications enabled
   * (NotificationPreferences.emailEnabled; users without a preferences row
   * default to enabled). Fire-and-forget: email failures never break plans.
   */
  private sendPlanReadyIfEnabled(user: User, plan: WeeklyPlan): void {
    (async () => {
      const prefs = await this.prisma.notificationPreferences.findUnique({
        where: { userId: user.id },
      });
      if (prefs && !prefs.emailEnabled) return;
      await this.emailService.sendPlanReady(user, plan);
    })().catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to send plan ready email: ${errorMessage}`);
    });
  }

  /**
   * Generate plan from template
   * Creates a WeeklyPlan with tasks from template
   */
  async generateFromTemplate(
    userId: string,
    weekStartDate: string,
    tasks: Array<{
      title: string;
      notes: string | null;
      scheduledDate: Date;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      goalId: string | null;
    }>,
    user: User,
  ): Promise<WeeklyPlan> {
    const startTime = Date.now();

    // Calculate week boundaries
    const { weekStartDate: weekStart, weekEndDate: weekEnd } = this.calculateWeekBoundaries(weekStartDate);

    // Create plan
    const plan = await this.prisma.weeklyPlan.create({
      data: {
        userId,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        planJson: {
          tasks,
          title: `Week of ${weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })}`,
        },
        reasoning: 'Generated from user template',
        aiModel: 'template',
        complexity: 'simple',
        generationTime: (Date.now() - startTime) / 1000,
        generationCost: 0, // Templates are free
        tokenUsage: 0,
        qualityScore: 85, // Default quality for templates
        totalTasks: tasks.length,
        status: PlanStatus.DRAFT,
      },
    });

    // Create individual task entries
    await Promise.all(
      tasks.map((task) =>
        this.prisma.task.create({
          data: {
            userId,
            goalId: task.goalId,
            planId: plan.id,
            title: task.title,
            notes: task.notes,
            scheduledDate: task.scheduledDate,
            startTime: task.startTime,
            endTime: task.endTime,
            durationMinutes: task.durationMinutes,
            aiGenerated: false, // Template-based, not AI-generated
            manuallyAdded: false,
            syncStatus: 'PENDING',
          },
        }),
      ),
    );

    this.logger.log(`Plan generated from template: ${plan.id} with ${tasks.length} tasks`);

    // Send email notification (async, non-blocking, honors preferences)
    this.sendPlanReadyIfEnabled(user, plan as any);

    return plan as any;
  }

  /**
   * Get current week's plan (most recent draft or accepted plan)
   */
  async getCurrentWeekPlan(userId: string): Promise<WeeklyPlan | null> {
    const { weekStartDate, weekEndDate } = this.calculateWeekBoundaries();

    const plan = await this.prisma.weeklyPlan.findFirst({
      where: {
        userId,
        weekStartDate: { gte: weekStartDate },
        weekEndDate: { lte: weekEndDate },
        status: { in: [PlanStatus.DRAFT, PlanStatus.ACCEPTED, PlanStatus.APPLIED] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plan as any;
  }

  /**
   * Get a single plan by ID
   */
  async findOne(planId: string, userId: string): Promise<WeeklyPlan> {
    const plan = await this.prisma.weeklyPlan.findFirst({
      where: { id: planId, userId },
      include: {
        tasks: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan as any;
  }

  /**
   * Get plan history with pagination
   */
  async findAll(userId: string, query: QueryPlansDto): Promise<{ plans: WeeklyPlan[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status ? { status } : {}),
    };

    const [plans, total] = await Promise.all([
      this.prisma.weeklyPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.weeklyPlan.count({ where }),
    ]);

    return {
      plans: plans as any,
      total,
      page,
      limit,
    };
  }

  /**
   * Accept a plan (user approved it)
   */
  async accept(planId: string, userId: string): Promise<WeeklyPlan> {
    // Verify ownership
    const plan = await this.findOne(planId, userId);

    // Materialize the plan's scheduled tasks into real Task rows so they show
    // up on the calendar/task views. Idempotent: skip if rows already exist
    // (e.g. plan re-accepted, or created from a template that made tasks).
    const existingTaskCount = await this.prisma.task.count({ where: { planId } });
    const scheduledTasks: any[] = (plan.planJson as any)?.tasks || [];

    if (existingTaskCount === 0 && scheduledTasks.length > 0) {
      await this.prisma.task.createMany({
        data: scheduledTasks
          .filter(t => t && t.title && t.scheduledDate && t.startTime)
          .map(t => ({
            userId,
            planId,
            goalId: t.goalId || null,
            title: t.title,
            notes: t.notes || null,
            scheduledDate: new Date(t.scheduledDate),
            startTime: t.startTime,
            endTime: t.endTime,
            durationMinutes: t.durationMinutes || 30,
            aiGenerated: t.aiGenerated ?? true,
            aiReasoning: t.aiReasoning || null,
            manuallyAdded: false,
          })),
      });
      this.logger.log(
        `Materialized ${scheduledTasks.length} tasks for accepted plan ${planId}`
      );
    }

    this.logger.log(`Plan ${planId} accepted by user ${userId}`);

    return this.prisma.weeklyPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.ACCEPTED,
        acceptedAt: new Date(),
        appliedAt: new Date(),
        userSatisfaction: 'accepted',
      },
    });
  }

  /**
   * Create a plan manually (empty draft, no AI generation).
   * title/description live inside planJson — the WeeklyPlan model has no such columns.
   */
  async createManual(
    userId: string,
    input: { title: string; description?: string; weekStartDate: string; goalIds?: string[] }
  ): Promise<WeeklyPlan> {
    const { weekStartDate, weekEndDate } = this.calculateWeekBoundaries(input.weekStartDate);

    return this.prisma.weeklyPlan.create({
      data: {
        userId,
        weekStartDate,
        weekEndDate,
        status: PlanStatus.DRAFT,
        aiModel: 'manual',
        planJson: {
          title: input.title,
          description: input.description || null,
          goalIds: input.goalIds || [],
          days: [],
        },
      },
    });
  }

  /**
   * Update plan metadata (title/description in planJson) and/or status.
   */
  async update(
    planId: string,
    userId: string,
    input: { title?: string; description?: string; status?: PlanStatus }
  ): Promise<WeeklyPlan> {
    const plan = await this.findOne(planId, userId);

    const planJson: any =
      plan.planJson && typeof plan.planJson === 'object' ? { ...(plan.planJson as any) } : {};
    if (input.title !== undefined) planJson.title = input.title;
    if (input.description !== undefined) planJson.description = input.description;

    return this.prisma.weeklyPlan.update({
      where: { id: planId },
      data: {
        planJson,
        ...(input.status
          ? {
              status: input.status,
              ...(input.status === PlanStatus.ACCEPTED ? { acceptedAt: new Date() } : {}),
              ...(input.status === PlanStatus.APPLIED ? { appliedAt: new Date() } : {}),
              ...(input.status === PlanStatus.ARCHIVED ? { archivedAt: new Date() } : {}),
            }
          : {}),
        editCount: { increment: 1 },
      },
    });
  }

  /**
   * Regenerate a plan (create new version based on same week)
   */
  async regenerate(planId: string, userId: string, user: User): Promise<WeeklyPlan> {
    // Get original plan
    const originalPlan = await this.findOne(planId, userId);

    // Increment regenerate count on original
    await this.prisma.weeklyPlan.update({
      where: { id: planId },
      data: {
        regenerateCount: { increment: 1 },
        userSatisfaction: 'regenerated',
      },
    });

    // Generate new plan for same week
    const newPlan = await this.generate(
      userId,
      {
        weekStartDate: originalPlan.weekStartDate.toISOString().split('T')[0],
      },
      user
    );

    this.logger.log(`Plan ${planId} regenerated as ${newPlan.id}`);

    return newPlan;
  }

  /**
   * Archive a plan (soft delete)
   */
  async archive(planId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(planId, userId);

    this.logger.log(`Archiving plan ${planId}`);

    await this.prisma.weeklyPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Calculate week boundaries (Monday 00:00 to Sunday 23:59)
   */
  private calculateWeekBoundaries(weekStartInput?: string): { weekStartDate: Date; weekEndDate: Date } {
    let weekStartDate: Date;

    if (weekStartInput) {
      weekStartDate = new Date(weekStartInput);
    } else {
      // Get current date
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
      weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() + diff);
    }

    // Set to midnight
    weekStartDate.setHours(0, 0, 0, 0);

    // Calculate week end (Sunday 23:59)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

    return { weekStartDate, weekEndDate };
  }

  /**
   * Fetch active goals for plan generation
   */
  private async fetchActiveGoals(userId: string, goalIds?: string[]): Promise<Goal[]> {
    const where: any = {
      userId,
      isActive: true,
      isPaused: false,
    };

    if (goalIds && goalIds.length > 0) {
      where.id = { in: goalIds };
    }

    return this.prisma.goal.findMany({ where });
  }

  /**
   * Call Python FastAPI Planning Service
   */
  private async callPlanningService(request: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.planningServiceUrl}/api/v1/plans/generate`, request)
      );

      return response.data;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Planning Service error: ${err.message}`);
      throw new BadRequestException('AI planning service unavailable. Please try again later.');
    }
  }

  /**
   * Calculate LLM cost based on token usage
   */
  private calculateCost(model: string, tokenUsage: number): number {
    const costPer1000 = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] || 0;
    return (tokenUsage / 1000) * costPer1000;
  }

  /**
   * Calculate quality score for a plan (0-100)
   * Based on: task distribution, goal coverage, time utilization, etc.
   */
  private calculateQualityScore(plan: any, goals: Goal[]): number {
    let score = 0;

    // 1. Goal coverage (30 points): Are all goals included?
    const coveredGoals = new Set(plan.tasks?.map((t: any) => t.goalId) || []);
    const goalCoverage = (coveredGoals.size / goals.length) * 30;
    score += goalCoverage;

    // 2. Task distribution (25 points): Even distribution across week
    const tasksByDay: Record<number, number> = {};
    plan.tasks?.forEach((task: any) => {
      const day = new Date(task.scheduledDate).getDay();
      tasksByDay[day] = (tasksByDay[day] || 0) + 1;
    });
    const avgTasksPerDay = (plan.tasks?.length || 0) / 7;
    const variance = Object.values(tasksByDay).reduce((sum, count) => {
      return sum + Math.abs(count - avgTasksPerDay);
    }, 0) / 7;
    const distributionScore = Math.max(0, 25 - variance * 3);
    score += distributionScore;

    // 3. Time utilization (25 points): Reasonable daily workload
    const dailyMinutes: number[] = Object.values(tasksByDay).map(count => count * 60);
    const avgDailyMinutes = dailyMinutes.reduce((a, b) => a + b, 0) / dailyMinutes.length;
    const reasonableLoad = avgDailyMinutes >= 30 && avgDailyMinutes <= 240; // 0.5-4 hours
    const utilizationScore = reasonableLoad ? 25 : Math.max(0, 25 - Math.abs(avgDailyMinutes - 120) / 10);
    score += utilizationScore;

    // 4. Completeness (20 points): Has reasoning and all required fields
    const hasReasoning = !!plan.reasoning;
    const hasAllFields = plan.tasks?.every((t: any) => t.title && t.scheduledDate && t.goalId);
    score += (hasReasoning ? 10 : 0) + (hasAllFields ? 10 : 0);

    return Math.round(Math.min(100, score));
  }
}
