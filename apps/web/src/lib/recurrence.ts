/**
 * Recurring task utilities for MicroPlanner
 * Supports various recurrence patterns
 */

import { addDays, addWeeks, addMonths, addYears, format, startOfDay, isAfter } from 'date-fns';

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday (for WEEKLY)
  dayOfMonth?: number; // Day of month (for MONTHLY)
  monthOfYear?: number; // Month of year (for YEARLY)
  endDate?: Date; // When to stop recurring
  occurrences?: number; // Or stop after X occurrences
}

export interface RecurringTaskInstance {
  instanceDate: string; // ISO date string
  originalTaskId: string;
  sequenceNumber: number;
}

/**
 * Generate recurring task instances based on recurrence rule
 */
export function generateRecurringInstances(
  startDate: Date,
  rule: RecurrenceRule,
  maxInstances: number = 365 // Safety limit
): RecurringTaskInstance[] {
  const instances: RecurringTaskInstance[] = [];
  let currentDate = startOfDay(startDate);
  let sequenceNumber = 1;

  // Determine end condition
  const maxDate = rule.endDate ? startOfDay(rule.endDate) : addYears(startDate, 2);
  const maxOccurrencesCount = rule.occurrences || maxInstances;

  while (
    instances.length < maxOccurrencesCount &&
    instances.length < maxInstances &&
    !isAfter(currentDate, maxDate)
  ) {
    // Add current instance
    instances.push({
      instanceDate: format(currentDate, 'yyyy-MM-dd'),
      originalTaskId: '', // Will be set when creating tasks
      sequenceNumber,
    });

    sequenceNumber++;

    // Calculate next occurrence
    currentDate = getNextOccurrence(currentDate, rule);

    // Safety check
    if (instances.length >= maxInstances) {
      console.warn('Reached maximum instances limit for recurring task');
      break;
    }
  }

  return instances;
}

/**
 * Calculate the next occurrence date based on recurrence rule
 */
function getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
  switch (rule.frequency) {
    case 'DAILY':
      return addDays(currentDate, rule.interval);

    case 'WEEKLY':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        // Find next matching day of week
        return getNextWeekdayOccurrence(currentDate, rule.daysOfWeek, rule.interval);
      }
      return addWeeks(currentDate, rule.interval);

    case 'MONTHLY':
      if (rule.dayOfMonth) {
        return getNextMonthDayOccurrence(currentDate, rule.dayOfMonth, rule.interval);
      }
      return addMonths(currentDate, rule.interval);

    case 'YEARLY':
      return addYears(currentDate, rule.interval);

    default:
      return addDays(currentDate, 1);
  }
}

/**
 * Get next occurrence for weekly recurring tasks with specific days of week
 */
function getNextWeekdayOccurrence(
  currentDate: Date,
  daysOfWeek: number[],
  interval: number
): Date {
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const currentDayOfWeek = currentDate.getDay();

  // Find next matching day in current week
  const nextDayInWeek = sortedDays.find(day => day > currentDayOfWeek);

  if (nextDayInWeek !== undefined) {
    // Found next day in current week
    const daysToAdd = nextDayInWeek - currentDayOfWeek;
    return addDays(currentDate, daysToAdd);
  } else {
    // Move to first day of next week cycle
    const daysUntilNextWeek = (7 - currentDayOfWeek) + sortedDays[0];
    const weeksToAdd = interval - 1; // -1 because we're already moving to next week
    return addDays(addWeeks(currentDate, weeksToAdd), daysUntilNextWeek);
  }
}

/**
 * Get next occurrence for monthly recurring tasks with specific day of month
 */
function getNextMonthDayOccurrence(
  currentDate: Date,
  dayOfMonth: number,
  interval: number
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
  const nextMonth = addMonths(currentDate, interval);
  nextMonth.setDate(1); // Start of month

  // Set to target day (will adjust if day doesn't exist in month)
  nextMonth.setDate(Math.min(dayOfMonth, getDaysInMonth(nextMonth)));

  return nextMonth;
}

/**
 * Get number of days in a month
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Check if a task should recur on a given date
 */
export function shouldRecurOnDate(
  startDate: Date,
  checkDate: Date,
  rule: RecurrenceRule
): boolean {
  const instances = generateRecurringInstances(startDate, rule, 1000);
  const checkDateStr = format(startOfDay(checkDate), 'yyyy-MM-dd');
  return instances.some(instance => instance.instanceDate === checkDateStr);
}

/**
 * Get human-readable description of recurrence rule
 */
export function getRecurrenceDescription(rule: RecurrenceRule): string {
  const { frequency, interval, daysOfWeek, dayOfMonth, endDate, occurrences } = rule;

  let description = '';

  // Frequency and interval
  if (frequency === 'DAILY') {
    description = interval === 1 ? 'Daily' : `Every ${interval} days`;
  } else if (frequency === 'WEEKLY') {
    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = daysOfWeek.map(day => getDayName(day)).join(', ');
      description = interval === 1
        ? `Weekly on ${dayNames}`
        : `Every ${interval} weeks on ${dayNames}`;
    } else {
      description = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    }
  } else if (frequency === 'MONTHLY') {
    if (dayOfMonth) {
      description = interval === 1
        ? `Monthly on day ${dayOfMonth}`
        : `Every ${interval} months on day ${dayOfMonth}`;
    } else {
      description = interval === 1 ? 'Monthly' : `Every ${interval} months`;
    }
  } else if (frequency === 'YEARLY') {
    description = interval === 1 ? 'Yearly' : `Every ${interval} years`;
  }

  // End condition
  if (endDate) {
    description += ` until ${format(endDate, 'MMM d, yyyy')}`;
  } else if (occurrences) {
    description += ` for ${occurrences} occurrence${occurrences > 1 ? 's' : ''}`;
  }

  return description;
}

/**
 * Get day name from day number (0=Sunday, 6=Saturday)
 */
function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

/**
 * Common recurrence patterns
 */
export const RECURRENCE_PRESETS = {
  DAILY: {
    label: 'Every day',
    rule: { frequency: 'DAILY' as RecurrenceFrequency, interval: 1 },
  },
  WEEKDAYS: {
    label: 'Every weekday (Mon-Fri)',
    rule: { frequency: 'WEEKLY' as RecurrenceFrequency, interval: 1, daysOfWeek: [1, 2, 3, 4, 5] },
  },
  WEEKLY: {
    label: 'Every week',
    rule: { frequency: 'WEEKLY' as RecurrenceFrequency, interval: 1 },
  },
  BIWEEKLY: {
    label: 'Every 2 weeks',
    rule: { frequency: 'WEEKLY' as RecurrenceFrequency, interval: 2 },
  },
  MONTHLY: {
    label: 'Every month',
    rule: { frequency: 'MONTHLY' as RecurrenceFrequency, interval: 1 },
  },
  YEARLY: {
    label: 'Every year',
    rule: { frequency: 'YEARLY' as RecurrenceFrequency, interval: 1 },
  },
} as const;
