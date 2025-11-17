/**
 * Data export utilities for MicroPlanner
 * Supports CSV and JSON export formats
 */

import { format } from 'date-fns';

// Type definitions
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
}

export interface Goal {
  id: string;
  title: string;
  emoji?: string;
  color?: string;
  description?: string | null;
  targetDate?: string | null;
  progress?: number;
  createdAt?: string;
}

export interface Plan {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt?: string;
  completedAt?: string | null;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle objects (convert to JSON string)
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      // Handle strings with commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });

    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks to CSV
 */
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = [
    'id',
    'title',
    'notes',
    'scheduledDate',
    'startTime',
    'endTime',
    'durationMinutes',
    'isCompleted',
    'priority',
    'goalTitle',
    'createdAt',
    'completedAt',
  ];

  const data = tasks.map(task => ({
    id: task.id,
    title: task.title,
    notes: task.notes || '',
    scheduledDate: task.scheduledDate || '',
    startTime: task.startTime || '',
    endTime: task.endTime || '',
    durationMinutes: task.durationMinutes || '',
    isCompleted: task.isCompleted ? 'Yes' : 'No',
    priority: task.priority || '',
    goalTitle: task.goal?.title || '',
    createdAt: task.createdAt || '',
    completedAt: task.completedAt || '',
  }));

  const csv = convertToCSV(data, headers);
  const filename = `microplanner-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export goals to CSV
 */
export function exportGoalsToCSV(goals: Goal[]): void {
  const headers = [
    'id',
    'title',
    'emoji',
    'description',
    'targetDate',
    'progress',
    'createdAt',
  ];

  const data = goals.map(goal => ({
    id: goal.id,
    title: goal.title,
    emoji: goal.emoji || '',
    description: goal.description || '',
    targetDate: goal.targetDate || '',
    progress: goal.progress !== undefined ? `${goal.progress}%` : '',
    createdAt: goal.createdAt || '',
  }));

  const csv = convertToCSV(data, headers);
  const filename = `microplanner-goals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export plans to CSV
 */
export function exportPlansToCSV(plans: Plan[]): void {
  const headers = [
    'id',
    'title',
    'description',
    'status',
    'createdAt',
    'completedAt',
  ];

  const data = plans.map(plan => ({
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    status: plan.status,
    createdAt: plan.createdAt || '',
    completedAt: plan.completedAt || '',
  }));

  const csv = convertToCSV(data, headers);
  const filename = `microplanner-plans-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export all data to JSON
 */
export function exportAllDataToJSON(data: {
  tasks: Task[];
  goals: Goal[];
  plans: Plan[];
  user?: any;
}): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      tasks: data.tasks,
      goals: data.goals,
      plans: data.plans,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      } : undefined,
    },
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `microplanner-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export tasks to JSON
 */
export function exportTasksToJSON(tasks: Task[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    type: 'tasks',
    data: tasks,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `microplanner-tasks-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export goals to JSON
 */
export function exportGoalsToJSON(goals: Goal[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    type: 'goals',
    data: goals,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `microplanner-goals-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * Export plans to JSON
 */
export function exportPlansToJSON(plans: Plan[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    type: 'plans',
    data: plans,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `microplanner-plans-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}
