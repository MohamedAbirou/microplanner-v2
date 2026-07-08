/**
 * Advanced Task Management Types (Phase 17)
 *
 * Handles:
 * - Task dependencies
 * - Subtasks
 * - Time tracking
 * - Projects
 */

// ==================== TASK DEPENDENCIES ====================

/**
 * Dependency types
 */
export enum DependencyType {
  BLOCKS = 'BLOCKS',           // This task blocks another task
  BLOCKED_BY = 'BLOCKED_BY',   // This task is blocked by another task
  RELATED_TO = 'RELATED_TO',   // This task is related to another task
}

/**
 * Task dependency
 */
export interface TaskDependency {
  id: string;
  dependentTaskId: string; // Task that is blocked
  blockingTaskId: string;  // Task that must complete first
  type: DependencyType;
  createdAt: Date;
}

/**
 * Create dependency DTO
 */
export interface CreateTaskDependencyDto {
  dependentTaskId: string;
  blockingTaskId: string;
  type?: DependencyType;
}

/** Batch-fetch dependency edges for many tasks in one query. */
export interface BatchTaskIdsDto {
  taskIds: string[];
}

export interface TaskDependencyEdge {
  id: string;
  blockingTaskId: string;
  dependentTaskId: string;
  type: string;
  createdAt: Date;
}

export interface BatchDependenciesResult {
  edges: TaskDependencyEdge[];
}

export interface BatchSubtasksResult {
  byParentId: Record<string, Subtask[]>;
}

// ==================== SUBTASKS ====================

/**
 * Subtask (just a Task with parentTaskId)
 */
export interface Subtask {
  id: string;
  parentTaskId: string;
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
  durationMinutes: number;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create subtask DTO
 */
export interface CreateSubtaskDto {
  parentTaskId: string;
  title: string;
  durationMinutes?: number;
  scheduledDate?: Date;
}

// ==================== TIME TRACKING ====================

/**
 * Time tracking entry
 */
export interface TimeEntry {
  taskId: string;
  actualStartTime?: Date;
  actualEndTime?: Date;
  timeSpentMinutes: number;
  isTimerRunning: boolean;
  timerStartedAt?: Date;
}

/**
 * Start timer DTO
 */
export interface StartTimerDto {
  taskId: string;
}

/**
 * Stop timer DTO
 */
export interface StopTimerDto {
  taskId: string;
}

/**
 * Log time DTO
 */
export interface LogTimeDto {
  taskId: string;
  minutes: number;
  date?: Date;
  note?: string;
}

export interface UpdateTimeEntryDto {
  minutes?: number;
  note?: string | null;
  startedAt?: Date;
}

/**
 * Time tracking stats
 */
export interface TimeTrackingStats {
  totalTrackedMinutes: number;
  totalEstimatedMinutes: number;
  estimateAccuracy: number; // Percentage
  averageActualDuration: number;
  mostProductiveHours: number[];
  tasksWithTracking: number;
  tasksWithoutTracking: number;
}

// ==================== PROJECTS ====================

/**
 * Project
 */
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isArchived: boolean;
  archivedAt?: Date;
  startDate?: Date;
  targetDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create project DTO
 */
export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  startDate?: Date;
  targetDate?: Date;
}

/**
 * Update project DTO
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
  startDate?: Date;
  targetDate?: Date;
  completedAt?: Date;
}

/**
 * Project with stats
 */
export interface ProjectWithStats extends Project {
  taskCount: number;
  completedTaskCount: number;
  totalEstimatedMinutes: number;
  totalTrackedMinutes: number;
  progressPercentage: number;
  goalCount: number;
}

// ==================== ADVANCED TASK QUERIES ====================

/**
 * Task filter options
 */
export interface TaskFilterOptions {
  projectId?: string;
  goalId?: string;
  priority?: number;
  tags?: string[];
  isCompleted?: boolean;
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
  isBlocked?: boolean; // Has incomplete blocking tasks
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/**
 * Task sort options
 */
export enum TaskSortBy {
  SCHEDULED_DATE = 'scheduledDate',
  PRIORITY = 'priority',
  CREATED_DATE = 'createdAt',
  DURATION = 'durationMinutes',
  COMPLETION_STATUS = 'isCompleted',
}

/**
 * Task with dependencies info
 */
export interface TaskWithDependencies {
  id: string;
  title: string;
  isCompleted: boolean;
  scheduledDate: Date;
  blockingTasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
  dependentTasks: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
  isBlocked: boolean; // Has incomplete blocking tasks
  canStart: boolean; // All blocking tasks completed
}

/**
 * Gantt chart data
 */
export interface GanttChartData {
  tasks: Array<{
    id: string;
    title: string;
    projectId?: string;
    projectName?: string;
    startDate: Date;
    endDate: Date;
    completionPercentage: number;
    dependencies: string[]; // Task IDs
    assignee?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}
