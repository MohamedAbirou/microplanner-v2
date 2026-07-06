import { Injectable, Logger } from '@nestjs/common';
import { Goal, User } from '@microplanner/database';
import {
  IPlanningStrategy,
  PlanGenerationResult,
  ScheduledTask,
  CalendarEvent,
  PlanMetadata,
} from './planning-strategy.interface';

/**
 * Rule-Based Planning Strategy
 *
 * A sophisticated time-blocking algorithm for FREE tier users.
 * Generates weekly plans without using AI/LLM, saving costs while
 * still providing intelligent scheduling.
 *
 * Algorithm:
 * 1. Calculate available time slots based on user preferences
 * 2. Sort goals by priority (high to low)
 * 3. For each goal, calculate how many sessions needed per week
 * 4. Distribute sessions evenly across the week
 * 5. Place sessions in optimal time slots (avoid conflicts)
 * 6. Respect user's work hours, blocked times, and preferences
 * 7. Calculate quality score based on constraints satisfied
 */
@Injectable()
export class RuleBasedPlannerService implements IPlanningStrategy {
  private readonly logger = new Logger(RuleBasedPlannerService.name);

  /**
   * Generate a weekly plan using rule-based scheduling
   */
  async generatePlan(
    user: User,
    goals: Goal[],
    weekStart: Date,
    existingEvents: CalendarEvent[] = [],
  ): Promise<PlanGenerationResult> {
    const startTime = Date.now();

    this.logger.log(
      `Generating rule-based plan for user ${user.id}, ${goals.length} goals, week starting ${weekStart.toISOString()}`,
    );

    try {
      // Validate inputs
      this.validateInputs(user, goals, weekStart);

      // Calculate available time slots for the week
      const availableSlots = this.calculateAvailableSlots(user, weekStart, existingEvents);

      // Sort goals by priority (high to low)
      const sortedGoals = this.sortGoalsByPriority(goals);

      // Schedule tasks for each goal
      const scheduledTasks: ScheduledTask[] = [];
      const warnings: string[] = [];
      const conflictsDetected = 0;
      let constraintsViolated = 0;

      for (const goal of sortedGoals) {
        try {
          const tasks = this.scheduleGoalTasks(
            goal,
            availableSlots,
            weekStart,
            user,
          );

          scheduledTasks.push(...tasks);

          // Mark slots as occupied
          this.markSlotsAsOccupied(availableSlots, tasks);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorMsg = `Failed to schedule goal "${goal.title}": ${errorMessage}`;
          this.logger.warn(errorMsg);
          warnings.push(errorMsg);
          constraintsViolated++;
        }
      }

      // Calculate metadata
      const generationTime = Date.now() - startTime;
      const metadata = this.calculateMetadata(
        availableSlots,
        scheduledTasks,
        conflictsDetected,
        constraintsViolated,
        generationTime,
      );

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(
        goals,
        scheduledTasks,
        warnings,
        metadata,
      );

      // Calculate confidence (rule-based is deterministic, so high confidence)
      const confidence = warnings.length === 0 ? 95 : Math.max(60, 95 - warnings.length * 10);

      this.logger.log(
        `Generated plan: ${scheduledTasks.length} tasks, quality ${qualityScore}, confidence ${confidence}%, ${generationTime}ms`,
      );

      return {
        tasks: scheduledTasks,
        reasoning: undefined, // No AI reasoning for rule-based
        qualityScore,
        confidence,
        warnings,
        metadata,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to generate plan: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Validate inputs before planning
   */
  private validateInputs(user: User, goals: Goal[], weekStart: Date): void {
    if (!user) {
      throw new Error('User is required');
    }

    if (!goals || goals.length === 0) {
      throw new Error('At least one goal is required');
    }

    if (!weekStart || isNaN(weekStart.getTime())) {
      throw new Error('Valid week start date is required');
    }

    // Ensure weekStart is Monday 00:00
    const day = weekStart.getDay();
    if (day !== 1) { // 1 = Monday
      throw new Error('Week start must be a Monday');
    }
  }

  /**
   * Calculate available time slots for the entire week
   */
  private calculateAvailableSlots(
    user: User,
    weekStart: Date,
    existingEvents: CalendarEvent[],
  ): TimeSlot[][] {
    const slots: TimeSlot[][] = [];

    // Generate slots for each day of the week (Monday to Sunday)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);

      const daySlots = this.calculateDaySlots(user, date, existingEvents);
      slots.push(daySlots);
    }

    return slots;
  }

  /**
   * Calculate available time slots for a single day
   */
  private calculateDaySlots(
    user: User,
    date: Date,
    existingEvents: CalendarEvent[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    // Parse user's work hours
    const workStart = this.parseTime(user.workStartTime); // e.g., "09:00"
    const workEnd = this.parseTime(user.workEndTime); // e.g., "18:00"

    // Generate 30-minute slots during work hours
    for (let hour = workStart.hours; hour < workEnd.hours; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip if before workStart
        if (hour === workStart.hours && minute < workStart.minutes) {
          continue;
        }

        // Skip if after workEnd
        if (hour === workEnd.hours - 1 && minute >= workEnd.minutes) {
          break;
        }
        if (hour >= workEnd.hours) {
          break;
        }

        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Check if slot conflicts with existing events
        const hasConflict = this.hasSlotConflict(slotStart, slotEnd, existingEvents);

        // Check if slot is in user's blocked times
        const isBlocked = this.isSlotBlocked(slotStart, user.blockedTimes);

        slots.push({
          start: slotStart,
          end: slotEnd,
          isAvailable: !hasConflict && !isBlocked,
          isOccupied: false,
        });
      }
    }

    return slots;
  }

  /**
   * Check if a time slot conflicts with existing calendar events
   */
  private hasSlotConflict(
    slotStart: Date,
    slotEnd: Date,
    events: CalendarEvent[],
  ): boolean {
    return events.some((event) => {
      // All-day events block the entire day
      if (event.isAllDay) {
        return (
          slotStart.toDateString() === event.start.toDateString()
        );
      }

      // Check for time overlap
      return (
        (slotStart >= event.start && slotStart < event.end) ||
        (slotEnd > event.start && slotEnd <= event.end) ||
        (slotStart <= event.start && slotEnd >= event.end)
      );
    });
  }

  /**
   * Check if a time slot is in user's blocked times
   */
  private isSlotBlocked(slotStart: Date, blockedTimes: any): boolean {
    if (!blockedTimes || typeof blockedTimes !== 'object') {
      return false;
    }

    // blockedTimes format: { "monday": ["12:00-13:00"], "wednesday": ["14:00-15:00"] }
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
      slotStart.getDay()
    ];

    const blockedRanges = blockedTimes[dayName] || [];

    return blockedRanges.some((range: string) => {
      const [startStr, endStr] = range.split('-');
      const rangeStart = this.parseTime(startStr);
      const rangeEnd = this.parseTime(endStr);

      const slotTime = slotStart.getHours() * 60 + slotStart.getMinutes();
      const blockStart = rangeStart.hours * 60 + rangeStart.minutes;
      const blockEnd = rangeEnd.hours * 60 + rangeEnd.minutes;

      return slotTime >= blockStart && slotTime < blockEnd;
    });
  }

  /**
   * Sort goals by priority (high to low)
   */
  private sortGoalsByPriority(goals: Goal[]): Goal[] {
    return [...goals].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Schedule tasks for a single goal
   */
  private scheduleGoalTasks(
    goal: Goal,
    availableSlots: TimeSlot[][],
    weekStart: Date,
    user: User,
  ): ScheduledTask[] {
    const tasks: ScheduledTask[] = [];

    // Calculate how many sessions needed this week
    const sessionsNeeded = goal.frequencyPerWeek;
    const sessionDuration = goal.durationMinutes;

    // Calculate how many 30-min slots needed per session
    const slotsPerSession = Math.ceil(sessionDuration / 30);

    // Find preferred days (distribute evenly if not specified)
    const preferredDays = this.getPreferredDays(goal, sessionsNeeded);

    // Try to schedule each session
    for (let sessionIndex = 0; sessionIndex < sessionsNeeded; sessionIndex++) {
      const preferredDay = preferredDays[sessionIndex];

      // Find available slot on preferred day (or nearby day if not available)
      const slot = this.findBestSlot(
        availableSlots,
        preferredDay,
        slotsPerSession,
        goal,
        user,
      );

      if (!slot) {
        throw new Error(`No available time slots for ${slotsPerSession * 30} minutes`);
      }

      // Create scheduled task
      const task: ScheduledTask = {
        goalId: goal.id,
        title: `${goal.title} - Session ${sessionIndex + 1}`,
        notes: goal.description,
        scheduledDate: slot.start,
        startTime: this.formatTime(slot.start),
        endTime: this.formatTime(slot.end),
        durationMinutes: sessionDuration,
        aiGenerated: false, // Rule-based, not AI
        aiReasoning: null,
      };

      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Get preferred days for scheduling (evenly distributed)
   */
  private getPreferredDays(goal: Goal, sessionsNeeded: number): number[] {
    if (goal.preferredTimes && goal.preferredTimes.length > 0) {
      // Use user's preferred days
      // preferredTimes format: ["monday-morning", "wednesday-afternoon"]
      const dayMap: { [key: string]: number } = {
        monday: 0,
        tuesday: 1,
        wednesday: 2,
        thursday: 3,
        friday: 4,
        saturday: 5,
        sunday: 6,
      };

      const preferredDays = goal.preferredTimes.map((pref) => {
        const day = pref.split('-')[0].toLowerCase();
        return dayMap[day] || 0;
      });

      // Repeat if not enough preferences
      while (preferredDays.length < sessionsNeeded) {
        preferredDays.push(...preferredDays);
      }

      return preferredDays.slice(0, sessionsNeeded);
    }

    // Distribute evenly across weekdays (Mon–Fri), maximising spacing
    // e.g. 3 sessions → Mon, Wed, Fri — not Mon, Tue, Wed
    const weekdays = [0, 1, 2, 3, 4]; // Mon–Fri indices in availableSlots
    const days: number[] = [];

    if (sessionsNeeded >= weekdays.length) {
      return weekdays.slice(0, sessionsNeeded);
    }

    const step = weekdays.length / sessionsNeeded;
    for (let i = 0; i < sessionsNeeded; i++) {
      days.push(weekdays[Math.min(weekdays.length - 1, Math.round(i * step))]);
    }

    return days;
  }

  /**
   * Find the best available time slot for a task
   */
  private findBestSlot(
    availableSlots: TimeSlot[][],
    preferredDay: number,
    slotsNeeded: number,
    _goal: Goal,
    _user: User,
  ): TimeSlot | null {
    // Try preferred day first
    let slot = this.findSlotOnDay(availableSlots[preferredDay], slotsNeeded);
    if (slot) return slot;

    // Try adjacent days
    for (let offset = 1; offset <= 3; offset++) {
      // Try day after
      const dayAfter = (preferredDay + offset) % 7;
      slot = this.findSlotOnDay(availableSlots[dayAfter], slotsNeeded);
      if (slot) return slot;

      // Try day before
      const dayBefore = (preferredDay - offset + 7) % 7;
      slot = this.findSlotOnDay(availableSlots[dayBefore], slotsNeeded);
      if (slot) return slot;
    }

    // Last resort: try any day
    for (const daySlots of availableSlots) {
      slot = this.findSlotOnDay(daySlots, slotsNeeded);
      if (slot) return slot;
    }

    return null;
  }

  /**
   * Find contiguous available slots on a specific day
   */
  private findSlotOnDay(daySlots: TimeSlot[], slotsNeeded: number): TimeSlot | null {
    for (let i = 0; i <= daySlots.length - slotsNeeded; i++) {
      // Check if we have enough contiguous available slots
      const contiguousSlots = daySlots.slice(i, i + slotsNeeded);

      if (contiguousSlots.every((s) => s.isAvailable && !s.isOccupied)) {
        // Return a combined slot
        return {
          start: contiguousSlots[0].start,
          end: contiguousSlots[contiguousSlots.length - 1].end,
          isAvailable: true,
          isOccupied: false,
        };
      }
    }

    return null;
  }

  /**
   * Mark time slots as occupied after scheduling a task
   */
  private markSlotsAsOccupied(availableSlots: TimeSlot[][], tasks: ScheduledTask[]): void {
    for (const task of tasks) {
      const taskStart = new Date(task.scheduledDate);
      const [hours, minutes] = task.startTime.split(':').map(Number);
      taskStart.setHours(hours, minutes, 0, 0);

      const taskEnd = new Date(taskStart);
      taskEnd.setMinutes(taskEnd.getMinutes() + task.durationMinutes);

      // Find the day
      const dayOfWeek = taskStart.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6

      if (availableSlots[dayIndex]) {
        for (const slot of availableSlots[dayIndex]) {
          if (slot.start >= taskStart && slot.end <= taskEnd) {
            slot.isOccupied = true;
          }
        }
      }
    }
  }

  /**
   * Calculate metadata about the generated plan
   */
  private calculateMetadata(
    availableSlots: TimeSlot[][],
    scheduledTasks: ScheduledTask[],
    conflictsDetected: number,
    constraintsViolated: number,
    generationTime: number,
  ): PlanMetadata {
    // Calculate total available hours
    const totalAvailableSlots = availableSlots.flat().filter((s) => s.isAvailable).length;
    const availableHours = (totalAvailableSlots * 30) / 60; // 30-min slots

    // Calculate total scheduled hours
    const scheduledMinutes = scheduledTasks.reduce((sum, task) => sum + task.durationMinutes, 0);
    const scheduledHours = scheduledMinutes / 60;

    // Calculate utilization
    const utilization = availableHours > 0 ? (scheduledHours / availableHours) * 100 : 0;

    return {
      strategy: 'rule-based',
      generationTime,
      conflictsDetected,
      constraintsViolated,
      availableHours: Math.round(availableHours * 10) / 10,
      scheduledHours: Math.round(scheduledHours * 10) / 10,
      utilization: Math.round(utilization),
    };
  }

  /**
   * Calculate quality score (0-100) based on constraints satisfied
   */
  private calculateQualityScore(
    goals: Goal[],
    scheduledTasks: ScheduledTask[],
    warnings: string[],
    metadata: PlanMetadata,
  ): number {
    let score = 100;

    // Penalty for unscheduled goals
    const scheduledGoalIds = new Set(scheduledTasks.map((t) => t.goalId));
    const unscheduledGoals = goals.filter((g) => !scheduledGoalIds.has(g.id)).length;
    score -= unscheduledGoals * 20;

    // Penalty for warnings
    score -= warnings.length * 10;

    // Penalty for constraints violated
    score -= metadata.constraintsViolated * 15;

    // Penalty for low utilization (< 50%) or over-utilization (> 90%)
    if (metadata.utilization < 50) {
      score -= (50 - metadata.utilization) * 0.5;
    } else if (metadata.utilization > 90) {
      score -= (metadata.utilization - 90) * 2;
    }

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Parse time string (HH:mm) to hours and minutes
   */
  private parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Format Date to time string (HH:mm)
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

/**
 * Time slot representation
 */
interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  isOccupied: boolean;
}
