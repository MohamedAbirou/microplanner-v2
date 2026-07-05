import { Goal, User } from '@microplanner/database';

/**
 * Planning Strategy Interface
 *
 * Defines the contract for all planning implementations.
 * Allows for different planning strategies based on user tier:
 * - FREE: Rule-based planner (no AI)
 * - STARTER: AI planner with GPT-4o-mini
 * - PRO/PREMIUM: AI planner with Claude Sonnet 3.5
 */
export interface IPlanningStrategy {
  /**
   * Generate a weekly plan for the user
   *
   * @param user - The user for whom to generate the plan
   * @param goals - Active goals to schedule
   * @param weekStart - Start date of the week (Monday 00:00)
   * @param existingEvents - Existing calendar events for conflict detection
   * @returns Generated weekly plan with scheduled tasks
   */
  generatePlan(
    user: User,
    goals: Goal[],
    weekStart: Date,
    existingEvents?: CalendarEvent[],
  ): Promise<PlanGenerationResult>;
}

/**
 * Calendar event from external sources (Google Calendar, etc.)
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

/**
 * Result of plan generation
 */
export interface PlanGenerationResult {
  /**
   * Generated tasks scheduled throughout the week
   */
  tasks: ScheduledTask[];

  /**
   * AI reasoning for the plan (empty for rule-based)
   */
  reasoning?: string;

  /**
   * Quality score (0-100)
   */
  qualityScore: number;

  /**
   * Confidence level (0-100)
   */
  confidence: number;

  /**
   * Warnings or issues encountered during planning
   */
  warnings: string[];

  /**
   * Metadata about plan generation
   */
  metadata: PlanMetadata;
}

/**
 * Scheduled task with full details
 */
export interface ScheduledTask {
  goalId: string;
  title: string;
  notes: string | null;
  scheduledDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  durationMinutes: number;
  aiGenerated: boolean;
  aiReasoning: string | null;
}

/**
 * Metadata about plan generation
 */
export interface PlanMetadata {
  /**
   * Strategy used (rule-based, gpt-4o-mini, claude-sonnet-3.5)
   */
  strategy: string;

  /**
   * Time taken to generate plan (milliseconds)
   */
  generationTime: number;

  /**
   * Number of conflicts detected
   */
  conflictsDetected: number;

  /**
   * Number of constraints violated
   */
  constraintsViolated: number;

  /**
   * Total available hours in the week
   */
  availableHours: number;

  /**
   * Total scheduled hours
   */
  scheduledHours: number;

  /**
   * Utilization percentage (scheduled / available)
   */
  utilization: number;
}
