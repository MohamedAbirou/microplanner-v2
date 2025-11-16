/**
 * Task dependency management utilities for MicroPlanner
 * Supports dependency types, validation, and scheduling
 */

import { parseISO, isBefore, isAfter, addDays, format } from 'date-fns';

export type DependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATED_TO';

export interface TaskDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  scheduledDate?: string | null;
  startTime?: string | null;
  durationMinutes?: number | null;
  isCompleted: boolean;
  dependencies?: TaskDependency[];
}

/**
 * Check if adding a dependency would create a circular dependency
 */
export function wouldCreateCircularDependency(
  tasks: Task[],
  fromTaskId: string,
  toTaskId: string,
  existingDependencies: TaskDependency[]
): boolean {
  // Build adjacency list for dependency graph
  const graph = new Map<string, Set<string>>();

  // Add existing dependencies
  existingDependencies.forEach(dep => {
    if (dep.type === 'BLOCKS' || dep.type === 'BLOCKED_BY') {
      const from = dep.type === 'BLOCKS' ? dep.fromTaskId : dep.toTaskId;
      const to = dep.type === 'BLOCKS' ? dep.toTaskId : dep.fromTaskId;

      if (!graph.has(from)) graph.set(from, new Set());
      graph.get(from)!.add(to);
    }
  });

  // Add the new dependency
  if (!graph.has(fromTaskId)) graph.set(fromTaskId, new Set());
  graph.get(fromTaskId)!.add(toTaskId);

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(node);
    return false;
  }

  // Check all nodes for cycles
  for (const taskId of graph.keys()) {
    if (!visited.has(taskId)) {
      if (hasCycle(taskId)) return true;
    }
  }

  return false;
}

/**
 * Get all tasks that a given task depends on (blocking tasks)
 */
export function getBlockingTasks(
  taskId: string,
  dependencies: TaskDependency[]
): string[] {
  return dependencies
    .filter(dep =>
      (dep.type === 'BLOCKED_BY' && dep.fromTaskId === taskId) ||
      (dep.type === 'BLOCKS' && dep.toTaskId === taskId)
    )
    .map(dep => (dep.type === 'BLOCKED_BY' ? dep.toTaskId : dep.fromTaskId));
}

/**
 * Get all tasks that depend on a given task (blocked tasks)
 */
export function getBlockedTasks(
  taskId: string,
  dependencies: TaskDependency[]
): string[] {
  return dependencies
    .filter(dep =>
      (dep.type === 'BLOCKS' && dep.fromTaskId === taskId) ||
      (dep.type === 'BLOCKED_BY' && dep.toTaskId === taskId)
    )
    .map(dep => (dep.type === 'BLOCKS' ? dep.toTaskId : dep.fromTaskId));
}

/**
 * Get all related tasks
 */
export function getRelatedTasks(
  taskId: string,
  dependencies: TaskDependency[]
): string[] {
  return dependencies
    .filter(dep =>
      dep.type === 'RELATED_TO' &&
      (dep.fromTaskId === taskId || dep.toTaskId === taskId)
    )
    .map(dep => (dep.fromTaskId === taskId ? dep.toTaskId : dep.fromTaskId));
}

/**
 * Check if a task can be started (all blocking tasks are completed)
 */
export function canStartTask(
  task: Task,
  allTasks: Task[],
  dependencies: TaskDependency[]
): boolean {
  if (task.isCompleted) return true;

  const blockingTaskIds = getBlockingTasks(task.id, dependencies);
  const blockingTasks = allTasks.filter(t => blockingTaskIds.includes(t.id));

  // All blocking tasks must be completed
  return blockingTasks.every(t => t.isCompleted);
}

/**
 * Get the earliest date a task can be scheduled based on dependencies
 */
export function getEarliestSchedulableDate(
  task: Task,
  allTasks: Task[],
  dependencies: TaskDependency[]
): Date | null {
  const blockingTaskIds = getBlockingTasks(task.id, dependencies);
  const blockingTasks = allTasks.filter(t => blockingTaskIds.includes(t.id));

  if (blockingTasks.length === 0) {
    // No blocking tasks, can be scheduled anytime
    return new Date();
  }

  // Find the latest scheduled date among blocking tasks
  let latestDate: Date | null = null;

  blockingTasks.forEach(blockingTask => {
    if (blockingTask.scheduledDate) {
      const taskDate = parseISO(blockingTask.scheduledDate);

      // Add duration to get the end date
      let endDate = taskDate;
      if (blockingTask.durationMinutes) {
        endDate = addDays(taskDate, Math.ceil(blockingTask.durationMinutes / (60 * 24)));
      }

      if (!latestDate || isAfter(endDate, latestDate)) {
        latestDate = endDate;
      }
    }
  });

  // Add 1 day buffer after the latest blocking task
  return latestDate ? addDays(latestDate, 1) : new Date();
}

/**
 * Validate a dependency before creation
 */
export function validateDependency(
  fromTaskId: string,
  toTaskId: string,
  type: DependencyType,
  tasks: Task[],
  existingDependencies: TaskDependency[]
): { valid: boolean; error?: string } {
  // Check if tasks exist
  const fromTask = tasks.find(t => t.id === fromTaskId);
  const toTask = tasks.find(t => t.id === toTaskId);

  if (!fromTask || !toTask) {
    return { valid: false, error: 'One or both tasks not found' };
  }

  // Cannot depend on itself
  if (fromTaskId === toTaskId) {
    return { valid: false, error: 'A task cannot depend on itself' };
  }

  // Check for duplicate dependencies
  const duplicate = existingDependencies.find(
    dep =>
      (dep.fromTaskId === fromTaskId && dep.toTaskId === toTaskId && dep.type === type) ||
      (dep.fromTaskId === toTaskId && dep.toTaskId === fromTaskId && dep.type === type)
  );

  if (duplicate) {
    return { valid: false, error: 'This dependency already exists' };
  }

  // Check for circular dependencies (only for BLOCKS/BLOCKED_BY)
  if (type === 'BLOCKS' || type === 'BLOCKED_BY') {
    if (wouldCreateCircularDependency(tasks, fromTaskId, toTaskId, existingDependencies)) {
      return { valid: false, error: 'This would create a circular dependency' };
    }
  }

  // Check for conflicting dependency types
  const conflicting = existingDependencies.find(dep => {
    if (dep.type === 'RELATED_TO') return false;

    const isBlocksConflict =
      (dep.type === 'BLOCKS' && dep.fromTaskId === toTaskId && dep.toTaskId === fromTaskId) ||
      (dep.type === 'BLOCKED_BY' && dep.fromTaskId === fromTaskId && dep.toTaskId === toTaskId);

    return isBlocksConflict;
  });

  if (conflicting) {
    return { valid: false, error: 'Conflicting dependency already exists' };
  }

  return { valid: true };
}

/**
 * Get dependency chain for a task (all dependencies recursively)
 */
export function getDependencyChain(
  taskId: string,
  dependencies: TaskDependency[],
  maxDepth: number = 10
): { blockingChain: string[]; blockedChain: string[] } {
  const visited = new Set<string>();
  const blockingChain: string[] = [];
  const blockedChain: string[] = [];

  function traverseBlocking(id: string, depth: number) {
    if (depth >= maxDepth || visited.has(id)) return;
    visited.add(id);

    const blocking = getBlockingTasks(id, dependencies);
    blocking.forEach(blockingId => {
      if (!blockingChain.includes(blockingId)) {
        blockingChain.push(blockingId);
      }
      traverseBlocking(blockingId, depth + 1);
    });
  }

  function traverseBlocked(id: string, depth: number) {
    if (depth >= maxDepth || visited.has(id)) return;
    visited.add(id);

    const blocked = getBlockedTasks(id, dependencies);
    blocked.forEach(blockedId => {
      if (!blockedChain.includes(blockedId)) {
        blockedChain.push(blockedId);
      }
      traverseBlocked(blockedId, depth + 1);
    });
  }

  traverseBlocking(taskId, 0);
  visited.clear();
  traverseBlocked(taskId, 0);

  return { blockingChain, blockedChain };
}

/**
 * Get dependency statistics for a task
 */
export function getDependencyStats(
  task: Task,
  allTasks: Task[],
  dependencies: TaskDependency[]
): {
  totalBlocking: number;
  totalBlocked: number;
  completedBlocking: number;
  canStart: boolean;
  suggestedDate: Date | null;
} {
  const blockingTaskIds = getBlockingTasks(task.id, dependencies);
  const blockedTaskIds = getBlockedTasks(task.id, dependencies);

  const blockingTasks = allTasks.filter(t => blockingTaskIds.includes(t.id));
  const completedBlocking = blockingTasks.filter(t => t.isCompleted).length;

  return {
    totalBlocking: blockingTaskIds.length,
    totalBlocked: blockedTaskIds.length,
    completedBlocking,
    canStart: canStartTask(task, allTasks, dependencies),
    suggestedDate: getEarliestSchedulableDate(task, allTasks, dependencies),
  };
}

/**
 * Get human-readable dependency description
 */
export function getDependencyDescription(
  dependency: TaskDependency,
  tasks: Task[]
): string {
  const fromTask = tasks.find(t => t.id === dependency.fromTaskId);
  const toTask = tasks.find(t => t.id === dependency.toTaskId);

  if (!fromTask || !toTask) return 'Unknown dependency';

  switch (dependency.type) {
    case 'BLOCKS':
      return `"${fromTask.title}" blocks "${toTask.title}"`;
    case 'BLOCKED_BY':
      return `"${fromTask.title}" is blocked by "${toTask.title}"`;
    case 'RELATED_TO':
      return `"${fromTask.title}" is related to "${toTask.title}"`;
    default:
      return 'Unknown dependency type';
  }
}

/**
 * Sort tasks by dependency order (topological sort)
 */
export function sortTasksByDependencies(
  tasks: Task[],
  dependencies: TaskDependency[]
): Task[] {
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize
  tasks.forEach(task => {
    graph.set(task.id, new Set());
    inDegree.set(task.id, 0);
  });

  // Build graph
  dependencies.forEach(dep => {
    if (dep.type === 'BLOCKS' || dep.type === 'BLOCKED_BY') {
      const from = dep.type === 'BLOCKS' ? dep.fromTaskId : dep.toTaskId;
      const to = dep.type === 'BLOCKS' ? dep.toTaskId : dep.fromTaskId;

      if (graph.has(from) && graph.has(to)) {
        graph.get(from)!.add(to);
        inDegree.set(to, (inDegree.get(to) || 0) + 1);
      }
    }
  });

  // Topological sort using Kahn's algorithm
  const queue: string[] = [];
  const sorted: string[] = [];

  // Find all nodes with no incoming edges
  inDegree.forEach((degree, taskId) => {
    if (degree === 0) queue.push(taskId);
  });

  while (queue.length > 0) {
    const taskId = queue.shift()!;
    sorted.push(taskId);

    const neighbors = graph.get(taskId) || new Set();
    neighbors.forEach(neighborId => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);

      if (newDegree === 0) {
        queue.push(neighborId);
      }
    });
  }

  // Return tasks in dependency order
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  return sorted.map(id => taskMap.get(id)!).filter(Boolean);
}
