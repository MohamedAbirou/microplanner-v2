import { Goal, User } from '@microplanner/database';

/**
 * Render the user's AIMemory (explicit overrides + learned preferences) as a
 * prompt section. Memories are attached to the user object by PlansService
 * (`user.aiMemories`) once per generation. Shared by every AI strategy so
 * learned preferences influence Claude AND GPT — not just Claude.
 */
export function renderUserMemories(user: unknown): string {
  const memories: { memoryType: string; content: unknown; confidence: number }[] =
    (user as any)?.aiMemories || [];
  if (!memories.length) return '';
  const lines = memories
    .slice(0, 15)
    .map((m) => {
      const desc = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `- [${m.memoryType}] ${desc} (confidence ${Math.round(m.confidence * 100)}%)`;
    })
    .join('\n');
  return `\n\n**User Overrides & Learned Preferences (honour these strongly):**\n${lines}`;
}

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
