import { Injectable, Logger } from '@nestjs/common';
import { Task } from '@microplanner/database';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayOfMonth?: number; // 1-31
  monthOfYear?: number; // 1-12
  endDate?: Date;
  occurrences?: number;
}

export interface RecurrenceException {
  date: string; // ISO date string YYYY-MM-DD
  type: 'deleted' | 'modified';
  modifications?: Partial<Task>;
}

export interface TaskInstance extends Task {
  isRecurringInstance: boolean;
  recurringTaskId: string | null;
  instanceDate: string | null;
}

@Injectable()
export class RecurringTaskService {
  private readonly logger = new Logger(RecurringTaskService.name);

  /**
   * Expand a recurring task into instances for a given date range
   */
  expandRecurringTask(
    task: Task,
    startDate: Date,
    endDate: Date,
    maxInstances: number = 365,
  ): TaskInstance[] {
    if (!task.recurrenceRule) {
      // Not a recurring task, return as-is
      return [this.createRegularTaskInstance(task)];
    }

    const rule = task.recurrenceRule as unknown as RecurrenceRule;
    const exceptions = (task.recurrenceExceptions as unknown as RecurrenceException[]) || [];
    const instances: TaskInstance[] = [];

    // Start from the task's original scheduledDate
    let currentDate = this.startOfDay(new Date(task.scheduledDate));
    const rangeStart = this.startOfDay(startDate);
    const rangeEnd = this.startOfDay(endDate);
    let sequenceNumber = 0;

    // Determine end condition
    const maxDate = rule.endDate ? this.startOfDay(rule.endDate) : this.addYears(currentDate, 2);
    const maxOccurrencesCount = rule.occurrences || maxInstances;

    while (
      sequenceNumber < maxOccurrencesCount &&
      sequenceNumber < maxInstances &&
      currentDate.getTime() <= maxDate.getTime()
    ) {
      // Check if this instance falls within the requested range
      if (currentDate.getTime() >= rangeStart.getTime() && currentDate.getTime() <= rangeEnd.getTime()) {
        const instanceDateStr = this.formatDate(currentDate);

        // Check if this instance is in exceptions
        const exception = exceptions.find(ex => ex.date === instanceDateStr);

        if (exception?.type === 'deleted') {
          // Skip deleted instances
          this.logger.debug(`Skipping deleted instance: ${instanceDateStr}`);
        } else {
          // Create instance with modifications if any
          const instance = this.createRecurringInstance(
            task,
            currentDate,
            exception?.type === 'modified' ? exception.modifications : undefined,
          );
          instances.push(instance);
        }
      }

      // Move to next occurrence
      currentDate = this.getNextOccurrence(currentDate, rule);
      sequenceNumber++;

      // Safety check to prevent infinite loops
      if (sequenceNumber >= maxInstances) {
        this.logger.warn(`Reached maximum instances limit (${maxInstances}) for recurring task ${task.id}`);
        break;
      }
    }

    return instances;
  }

  /**
   * Create a regular (non-recurring) task instance
   */
  private createRegularTaskInstance(task: Task): TaskInstance {
    return {
      ...task,
      isRecurringInstance: false,
      recurringTaskId: null,
      instanceDate: null,
    };
  }

  /**
   * Create a recurring task instance for a specific date
   */
  private createRecurringInstance(
    masterTask: Task,
    instanceDate: Date,
    modifications?: Partial<Task>,
  ): TaskInstance {
    const instance: TaskInstance = {
      ...masterTask,
      // Override with instance-specific data
      id: `${masterTask.id}_${this.formatDate(instanceDate)}`, // Virtual ID
      scheduledDate: instanceDate,
      isRecurringInstance: true,
      recurringTaskId: masterTask.id,
      instanceDate: this.formatDate(instanceDate),
      // Apply modifications if any
      ...modifications,
    };

    return instance;
  }

  /**
   * Calculate the next occurrence date based on recurrence rule
   */
  private getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
    switch (rule.frequency) {
      case 'DAILY':
        return this.addDays(currentDate, rule.interval);

      case 'WEEKLY':
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          return this.getNextWeekdayOccurrence(currentDate, rule.daysOfWeek, rule.interval);
        }
        return this.addDays(currentDate, 7 * rule.interval);

      case 'MONTHLY':
        if (rule.dayOfMonth) {
          return this.getNextMonthDayOccurrence(currentDate, rule.dayOfMonth, rule.interval);
        }
        return this.addMonths(currentDate, rule.interval);

      case 'YEARLY':
        return this.addYears(currentDate, rule.interval);

      default:
        this.logger.warn(`Unknown recurrence frequency: ${rule.frequency}`);
        return this.addDays(currentDate, 1);
    }
  }

  /**
   * Get next occurrence for weekly recurring tasks with specific days of week
   */
  private getNextWeekdayOccurrence(
    currentDate: Date,
    daysOfWeek: number[],
    interval: number,
  ): Date {
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    const currentDayOfWeek = currentDate.getDay();

    // Find next matching day in current week
    const nextDayInWeek = sortedDays.find(day => day > currentDayOfWeek);

    if (nextDayInWeek !== undefined) {
      // Found next day in current week
      const daysToAdd = nextDayInWeek - currentDayOfWeek;
      return this.addDays(currentDate, daysToAdd);
    } else {
      // Move to first day of next week cycle
      const daysUntilNextWeek = (7 - currentDayOfWeek) + sortedDays[0];
      const weeksToAdd = interval - 1; // -1 because we're already moving to next week
      const nextWeekDate = this.addDays(currentDate, daysUntilNextWeek);
      return this.addDays(nextWeekDate, 7 * weeksToAdd);
    }
  }

  /**
   * Get next occurrence for monthly recurring tasks with specific day of month
   */
  private getNextMonthDayOccurrence(
    currentDate: Date,
    dayOfMonth: number,
    interval: number,
  ): Date {
    const currentDay = currentDate.getDate();

    // If we haven't reached the target day this month, go to it
    if (currentDay < dayOfMonth) {
      const targetDate = new Date(currentDate);
      targetDate.setDate(dayOfMonth);

      // Check if day exists in this month
      if (targetDate.getMonth() === currentDate.getMonth()) {
        return targetDate;
      }
    }

    // Move to next month cycle
    const nextMonth = this.addMonths(currentDate, interval);
    const daysInMonth = this.getDaysInMonth(nextMonth);
    const validDay = Math.min(dayOfMonth, daysInMonth);

    nextMonth.setDate(validDay);
    return nextMonth;
  }

  // ===== Date Utility Functions =====

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
