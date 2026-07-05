import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Goal, User } from '@microplanner/database';
import {
  IPlanningStrategy,
  PlanGenerationResult,
  ScheduledTask,
  CalendarEvent,
  PlanMetadata,
} from './planning-strategy.interface';

/**
 * GPT-4o-mini AI Planner Service
 *
 * Production-ready AI planner for STARTER tier users using OpenAI's GPT-4o-mini.
 * Features:
 * - Intelligent time-blocking with context awareness
 * - Natural language reasoning for task scheduling
 * - Conflict detection and resolution
 * - Quality scoring and confidence metrics
 * - Cost-optimized prompts ($0.15/1M input, $0.60/1M output tokens)
 * - Comprehensive error handling with fallback to rule-based
 */
@Injectable()
export class GPT4oMiniPlannerService implements IPlanningStrategy {
  private readonly logger = new Logger(GPT4oMiniPlannerService.name);
  private readonly openai: OpenAI | null;
  private readonly serviceEnabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. GPT-4o-mini planner disabled.');
      this.serviceEnabled = false;
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey });
      this.serviceEnabled = true;
      this.logger.log('✓ GPT-4o-mini planner initialized');
    }
  }

  /**
   * Generate weekly plan using GPT-4o-mini
   */
  async generatePlan(
    user: User,
    goals: Goal[],
    weekStart: Date,
    existingEvents: CalendarEvent[] = [],
  ): Promise<PlanGenerationResult> {
    const startTime = Date.now();

    if (!this.serviceEnabled || !this.openai) {
      throw new Error('GPT-4o-mini planner not configured');
    }

    try {
      // Validate inputs
      this.validateInputs(user, goals, weekStart);

      // Build prompt
      const prompt = this.buildPrompt(user, goals, weekStart, existingEvents);

      // Call OpenAI API
      this.logger.debug('Calling GPT-4o-mini for plan generation...');
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('Empty response from GPT-4o-mini');
      }

      // Parse AI response
      const aiResult = JSON.parse(response);
      const tasks = this.parseAITasks(aiResult.tasks, weekStart);
      const reasoning = aiResult.reasoning || 'AI-generated plan';

      // Calculate metadata
      const generationTime = Date.now() - startTime;
      const metadata = this.calculateMetadata(
        user,
        goals,
        tasks,
        existingEvents,
        generationTime,
      );

      // Calculate quality score
      const warnings: string[] = [];
      const qualityScore = this.calculateQualityScore(
        goals,
        tasks,
        warnings,
        metadata,
      );

      // Calculate confidence
      const confidence = Math.min(
        100,
        Math.max(60, qualityScore - warnings.length * 5),
      );

      this.logger.log(
        `GPT-4o-mini plan generated: ${tasks.length} tasks, quality ${qualityScore}/100, ${generationTime}ms`,
      );

      return {
        tasks,
        reasoning,
        qualityScore,
        confidence,
        warnings,
        metadata,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`GPT-4o-mini plan generation failed: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Build AI prompt with user context and goals
   */
  private buildPrompt(
    user: User,
    goals: Goal[],
    weekStart: Date,
    existingEvents: CalendarEvent[],
  ): string {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const workHours = { start: user.workStartTime || '09:00', end: user.workEndTime || '17:00' };
    // Work days default to Mon-Fri; a per-user workDays field is a Phase 7 enhancement.
    const workDays = [1, 2, 3, 4, 5]; // Default: Mon-Fri
    const timezone = user.timezone || 'UTC';

    // Format goals
    const goalsText = goals
      .map((goal, i) => {
        const priority = goal.priority || 1;
        const freq = goal.frequencyPerWeek || 3;
        const duration = goal.durationMinutes || 60;
        return `${i + 1}. "${goal.title}" (Priority: ${priority}, ${freq}x/week, ${duration} min/session)`;
      })
      .join('\n');

    // Format existing events
    const eventsText =
      existingEvents.length > 0
        ? existingEvents
            .map((e) => {
              const start = e.start.toISOString();
              const end = e.end.toISOString();
              return `- "${e.title}" (${start} to ${end})`;
            })
            .join('\n')
        : 'None';

    return `Generate a weekly plan for the following user:

**User Context:**
- Week: ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}
- Work Hours: ${workHours.start} - ${workHours.end}
- Work Days: ${this.formatWorkDays(workDays)}
- Timezone: ${timezone}

**Goals to Schedule:**
${goalsText}

**Existing Calendar Events:**
${eventsText}

**Requirements:**
1. Schedule each goal ${goals.map((g) => g.frequencyPerWeek || 3).join(', ')}x during the week
2. Respect work hours and avoid scheduling outside ${workHours.start}-${workHours.end}
3. Avoid conflicts with existing calendar events
4. Distribute tasks evenly across available days
5. Use 30-minute time slots for precision
6. Prefer morning hours for high-priority tasks
7. Leave buffer time between tasks (15-30 minutes)

**Output Format (JSON):**
{
  "reasoning": "Brief explanation of scheduling strategy (2-3 sentences)",
  "tasks": [
    {
      "goalId": "goal-id",
      "title": "Task title",
      "notes": "Optional notes about this session",
      "scheduledDate": "2025-01-13T00:00:00Z",
      "startTime": "09:00",
      "endTime": "10:30",
      "durationMinutes": 90,
      "aiReasoning": "Why this time slot was chosen"
    }
  ]
}

Generate an optimal weekly plan that maximizes productivity while respecting constraints.`;
  }

  /**
   * Get system prompt for GPT-4o-mini
   */
  private getSystemPrompt(): string {
    return `You are an expert AI productivity planner specializing in time-blocking and task scheduling.

Your role is to create optimal weekly plans that:
- Maximize productivity by scheduling high-priority tasks during peak hours
- Respect user constraints (work hours, work days, existing events)
- Distribute tasks evenly to prevent burnout
- Use intelligent time-blocking strategies
- Provide clear reasoning for scheduling decisions

Always output valid JSON matching the requested format. Be concise but insightful in your reasoning.`;
  }

  /**
   * Parse AI-generated tasks into ScheduledTask format
   */
  private parseAITasks(aiTasks: any[], _weekStart: Date): ScheduledTask[] {
    if (!Array.isArray(aiTasks)) {
      throw new Error('Invalid AI response: tasks must be an array');
    }

    return aiTasks.map((task) => {
      // Validate required fields
      if (!task.goalId || !task.title || !task.scheduledDate) {
        throw new Error('Invalid task: missing required fields');
      }

      // Parse scheduled date
      const scheduledDate = new Date(task.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error(`Invalid date: ${task.scheduledDate}`);
      }

      return {
        goalId: task.goalId,
        title: task.title,
        notes: task.notes || null,
        scheduledDate,
        startTime: task.startTime,
        endTime: task.endTime,
        durationMinutes: task.durationMinutes,
        aiGenerated: true,
        aiReasoning: task.aiReasoning || null,
      };
    });
  }

  /**
   * Calculate plan metadata
   */
  private calculateMetadata(
    user: User,
    goals: Goal[],
    tasks: ScheduledTask[],
    existingEvents: CalendarEvent[],
    generationTime: number,
  ): PlanMetadata {
    // Count conflicts
    let conflictsDetected = 0;
    for (const task of tasks) {
      for (const event of existingEvents) {
        if (this.hasTimeConflict(task, event)) {
          conflictsDetected++;
        }
      }
    }

    // Calculate available hours
    const workHours = { start: user.workStartTime || '09:00', end: user.workEndTime || '17:00' };
    // Work days default to Mon-Fri; a per-user workDays field is a Phase 7 enhancement.
    const workDays = [1, 2, 3, 4, 5]; // Default: Mon-Fri

    const hoursPerDay =
      (this.timeToMinutes(workHours.end) - this.timeToMinutes(workHours.start)) / 60;
    const availableHours = hoursPerDay * workDays.length;

    // Calculate scheduled hours
    const scheduledMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const scheduledHours = scheduledMinutes / 60;

    // Calculate utilization
    const utilization = (scheduledHours / availableHours) * 100;

    // Count constraints violated
    const constraintsViolated = conflictsDetected;

    return {
      strategy: 'gpt-4o-mini',
      generationTime,
      conflictsDetected,
      constraintsViolated,
      availableHours: Math.round(availableHours * 10) / 10,
      scheduledHours: Math.round(scheduledHours * 10) / 10,
      utilization: Math.round(utilization),
    };
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(
    goals: Goal[],
    tasks: ScheduledTask[],
    warnings: string[],
    metadata: PlanMetadata,
  ): number {
    let score = 100;

    // Penalty for unscheduled goals
    const scheduledGoalIds = new Set(tasks.map((t) => t.goalId));
    const unscheduledGoals = goals.filter((g) => !scheduledGoalIds.has(g.id));
    score -= unscheduledGoals.length * 20;

    // Penalty for warnings
    score -= warnings.length * 10;

    // Penalty for conflicts
    score -= metadata.conflictsDetected * 15;

    // Penalty for constraints violated
    score -= metadata.constraintsViolated * 15;

    // Adjust for utilization (optimal: 50-90%)
    const utilization = metadata.utilization;
    if (utilization < 50) {
      score -= (50 - utilization) * 0.5; // Under-scheduled
    } else if (utilization > 90) {
      score -= (utilization - 90) * 1.0; // Over-scheduled
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Check if task conflicts with calendar event
   */
  private hasTimeConflict(task: ScheduledTask, event: CalendarEvent): boolean {
    const taskDate = new Date(task.scheduledDate);
    const taskStart = new Date(taskDate);
    const [startHour, startMin] = task.startTime.split(':').map(Number);
    taskStart.setHours(startHour, startMin, 0, 0);

    const taskEnd = new Date(taskDate);
    const [endHour, endMin] = task.endTime.split(':').map(Number);
    taskEnd.setHours(endHour, endMin, 0, 0);

    // Check overlap
    return taskStart < event.end && taskEnd > event.start;
  }

  /**
   * Convert HH:mm to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format work days for display
   */
  private formatWorkDays(workDays: number[]): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return workDays.map((d) => dayNames[d]).join(', ');
  }

  /**
   * Validate inputs
   */
  private validateInputs(user: User, goals: Goal[], weekStart: Date): void {
    if (!user?.id) {
      throw new Error('Invalid user');
    }

    if (!Array.isArray(goals) || goals.length === 0) {
      throw new Error('No goals provided');
    }

    if (!(weekStart instanceof Date) || isNaN(weekStart.getTime())) {
      throw new Error('Invalid week start date');
    }

    if (weekStart.getDay() !== 1) {
      throw new Error('Week start must be a Monday');
    }
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.serviceEnabled;
  }
}
