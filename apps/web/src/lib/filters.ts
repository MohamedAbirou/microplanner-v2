/**
 * Advanced filtering and sorting utilities for tasks, goals, and plans
 */

import { startOfDay, endOfDay, isWithinInterval, isBefore, isAfter, parseISO } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  scheduledDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  isCompleted: boolean;
  priority?: number;
  goal?: {
    id: string;
    title: string;
    emoji?: string;
  } | null;
  createdAt?: string;
  completedAt?: string | null;
  tags?: string[];
  isRecurring?: boolean;
}

export interface TaskFilters {
  search?: string;
  goalIds?: string[];
  priorities?: number[];
  completed?: boolean | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  recurring?: boolean | 'all';
  hasDuration?: boolean | 'all';
  hasNotes?: boolean | 'all';
}

export type TaskSortField =
  | 'scheduledDate'
  | 'priority'
  | 'title'
  | 'durationMinutes'
  | 'createdAt'
  | 'completedAt';

export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: SortDirection;
}

/**
 * Filter tasks based on provided filters
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    // Search filter (title and notes)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const notesMatch = task.notes?.toLowerCase().includes(searchLower);
      if (!titleMatch && !notesMatch) return false;
    }

    // Goal filter
    if (filters.goalIds && filters.goalIds.length > 0) {
      if (!task.goal || !filters.goalIds.includes(task.goal.id)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      if (!task.priority || !filters.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Completed filter
    if (filters.completed !== undefined && filters.completed !== 'all') {
      if (task.isCompleted !== filters.completed) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange && task.scheduledDate) {
      const taskDate = parseISO(task.scheduledDate);
      const { start, end } = filters.dateRange;

      if (!isWithinInterval(taskDate, {
        start: startOfDay(start),
        end: endOfDay(end),
      })) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }
    }

    // Recurring filter
    if (filters.recurring !== undefined && filters.recurring !== 'all') {
      if (task.isRecurring !== filters.recurring) {
        return false;
      }
    }

    // Has duration filter
    if (filters.hasDuration !== undefined && filters.hasDuration !== 'all') {
      const hasDuration = task.durationMinutes !== undefined && task.durationMinutes !== null;
      if (hasDuration !== filters.hasDuration) {
        return false;
      }
    }

    // Has notes filter
    if (filters.hasNotes !== undefined && filters.hasNotes !== 'all') {
      const hasNotes = !!task.notes && task.notes.trim().length > 0;
      if (hasNotes !== filters.hasNotes) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort tasks based on provided sort configuration
 */
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  return [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sort.field) {
      case 'scheduledDate':
        aValue = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        bValue = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        break;

      case 'priority':
        // Lower number = higher priority
        aValue = a.priority || 999;
        bValue = b.priority || 999;
        break;

      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;

      case 'durationMinutes':
        aValue = a.durationMinutes || 0;
        bValue = b.durationMinutes || 0;
        break;

      case 'createdAt':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;

      case 'completedAt':
        aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        break;

      default:
        return 0;
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle numeric comparison
    if (sort.direction === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
}

/**
 * Apply filters and sorting to tasks
 */
export function filterAndSortTasks(
  tasks: Task[],
  filters: TaskFilters,
  sort: TaskSort
): Task[] {
  const filtered = filterTasks(tasks, filters);
  return sortTasks(filtered, sort);
}

/**
 * Get active filter count
 */
export function getActiveFilterCount(filters: TaskFilters): number {
  let count = 0;

  if (filters.search && filters.search.trim().length > 0) count++;
  if (filters.goalIds && filters.goalIds.length > 0) count++;
  if (filters.priorities && filters.priorities.length > 0) count++;
  if (filters.completed !== undefined && filters.completed !== 'all') count++;
  if (filters.dateRange) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.recurring !== undefined && filters.recurring !== 'all') count++;
  if (filters.hasDuration !== undefined && filters.hasDuration !== 'all') count++;
  if (filters.hasNotes !== undefined && filters.hasNotes !== 'all') count++;

  return count;
}

/**
 * Clear all filters
 */
export function clearAllFilters(): TaskFilters {
  return {
    completed: 'all',
    recurring: 'all',
    hasDuration: 'all',
    hasNotes: 'all',
  };
}

/**
 * Common filter presets
 */
export const FILTER_PRESETS = {
  TODAY: (date: Date): TaskFilters => ({
    dateRange: {
      start: startOfDay(date),
      end: endOfDay(date),
    },
    completed: 'all',
  }),

  INCOMPLETE: (): TaskFilters => ({
    completed: false,
  }),

  HIGH_PRIORITY: (): TaskFilters => ({
    priorities: [1],
    completed: false,
  }),

  RECURRING: (): TaskFilters => ({
    recurring: true,
  }),

  WITH_NOTES: (): TaskFilters => ({
    hasNotes: true,
  }),
} as const;

/**
 * Common sort presets
 */
export const SORT_PRESETS = {
  DATE_ASC: { field: 'scheduledDate' as TaskSortField, direction: 'asc' as SortDirection },
  DATE_DESC: { field: 'scheduledDate' as TaskSortField, direction: 'desc' as SortDirection },
  PRIORITY_HIGH_FIRST: { field: 'priority' as TaskSortField, direction: 'asc' as SortDirection },
  PRIORITY_LOW_FIRST: { field: 'priority' as TaskSortField, direction: 'desc' as SortDirection },
  TITLE_A_Z: { field: 'title' as TaskSortField, direction: 'asc' as SortDirection },
  TITLE_Z_A: { field: 'title' as TaskSortField, direction: 'desc' as SortDirection },
  DURATION_SHORTEST: { field: 'durationMinutes' as TaskSortField, direction: 'asc' as SortDirection },
  DURATION_LONGEST: { field: 'durationMinutes' as TaskSortField, direction: 'desc' as SortDirection },
  CREATED_OLDEST: { field: 'createdAt' as TaskSortField, direction: 'asc' as SortDirection },
  CREATED_NEWEST: { field: 'createdAt' as TaskSortField, direction: 'desc' as SortDirection },
} as const;

/**
 * Group tasks by a specific field
 */
export function groupTasksBy(tasks: Task[], groupBy: 'goal' | 'priority' | 'date'): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};

  tasks.forEach(task => {
    let key: string;

    switch (groupBy) {
      case 'goal':
        key = task.goal?.title || 'No Goal';
        break;
      case 'priority':
        key = task.priority ? `Priority ${task.priority}` : 'No Priority';
        break;
      case 'date':
        key = task.scheduledDate || 'No Date';
        break;
      default:
        key = 'Other';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
  });

  return groups;
}

/**
 * Get task statistics
 */
export function getTaskStatistics(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.isCompleted).length;
  const incomplete = total - completed;
  const highPriority = tasks.filter(t => t.priority === 1 && !t.isCompleted).length;
  const recurring = tasks.filter(t => t.isRecurring).length;
  const overdue = tasks.filter(t => {
    if (t.isCompleted || !t.scheduledDate) return false;
    return isBefore(parseISO(t.scheduledDate), startOfDay(new Date()));
  }).length;

  return {
    total,
    completed,
    incomplete,
    highPriority,
    recurring,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
