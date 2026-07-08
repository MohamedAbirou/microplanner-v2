import DataLoader from 'dataloader';
import { TasksAPI, GoalsAPI, ProjectsAPI, UserAPI } from './rest-api';

/** GraphQL TaskDependency rows grouped per parent task. */
export interface TaskDependencyBundle {
  dependencies: Array<{
    id: string;
    dependentTaskId: string;
    blockingTaskId: string;
    type: string;
    createdAt: string;
  }>;
  blockedBy: Array<{
    id: string;
    dependentTaskId: string;
    blockingTaskId: string;
    type: string;
    createdAt: string;
  }>;
}

const EMPTY_BUNDLE: TaskDependencyBundle = { dependencies: [], blockedBy: [] };

/**
 * DataLoader for batching task queries by goal
 */
export function createTaskByGoalLoader(tasksAPI: TasksAPI) {
  return new DataLoader(async (goalIds: readonly string[]) => {
    const tasks = await tasksAPI.getTasksByGoalIds(Array.from(goalIds));

    // Group tasks by goalId
    const tasksByGoalId = new Map<string, any[]>();
    for (const task of tasks) {
      const goalId = task.goalId;
      if (!tasksByGoalId.has(goalId)) {
        tasksByGoalId.set(goalId, []);
      }
      tasksByGoalId.get(goalId)!.push(task);
    }

    // Return tasks in the same order as goalIds
    return goalIds.map((id) => tasksByGoalId.get(id) || []);
  });
}

/**
 * DataLoader for batching individual task queries
 */
export function createTaskLoader(tasksAPI: TasksAPI, userId: string) {
  return new DataLoader(async (taskIds: readonly string[]) => {
    try {
      const tasks = await Promise.all(
        taskIds.map((id) => tasksAPI.getTask(id as string, userId).catch(() => null))
      );
      return tasks;
    } catch {
      return taskIds.map(() => null);
    }
  });
}

/**
 * Batch dependency edges for many tasks in a single REST call.
 * Both `dependencies` and `blockedBy` field resolvers share this loader.
 */
export function createTaskDependencyLoader(tasksAPI: TasksAPI, userId: string) {
  return new DataLoader<string, TaskDependencyBundle>(async (taskIds) => {
    try {
      const { edges } = await tasksAPI.getDependenciesBatch(userId, [...taskIds]);
      const bundles = new Map<string, TaskDependencyBundle>();
      for (const id of taskIds) {
        bundles.set(id, { dependencies: [], blockedBy: [] });
      }

      for (const edge of edges) {
        const createdAt =
          typeof edge.createdAt === 'string'
            ? edge.createdAt
            : new Date(edge.createdAt).toISOString();

        if (bundles.has(edge.blockingTaskId)) {
          bundles.get(edge.blockingTaskId)!.dependencies.push({
            id: edge.id,
            dependentTaskId: edge.dependentTaskId,
            blockingTaskId: edge.blockingTaskId,
            type: edge.type || 'BLOCKS',
            createdAt,
          });
        }

        if (bundles.has(edge.dependentTaskId)) {
          bundles.get(edge.dependentTaskId)!.blockedBy.push({
            id: edge.id,
            dependentTaskId: edge.dependentTaskId,
            blockingTaskId: edge.blockingTaskId,
            type: 'BLOCKED_BY',
            createdAt,
          });
        }
      }

      return taskIds.map((id) => bundles.get(id) ?? EMPTY_BUNDLE);
    } catch {
      return taskIds.map(() => EMPTY_BUNDLE);
    }
  });
}

/**
 * Batch subtasks for many parent tasks in a single REST call.
 */
export function createSubtaskLoader(tasksAPI: TasksAPI, userId: string) {
  return new DataLoader<string, unknown[]>(async (parentIds) => {
    try {
      const { byParentId } = await tasksAPI.getSubtasksBatch(userId, [...parentIds]);
      return parentIds.map((id) => byParentId[id] || []);
    } catch {
      return parentIds.map(() => []);
    }
  });
}

/**
 * DataLoader for batching individual goal queries
 */
export function createGoalLoader(goalsAPI: GoalsAPI, userId: string) {
  return new DataLoader(async (goalIds: readonly string[]) => {
    try {
      const goals = await Promise.all(
        goalIds.map((id) => goalsAPI.getGoal(id as string, userId).catch(() => null))
      );
      return goals;
    } catch {
      return goalIds.map(() => null);
    }
  });
}

/**
 * DataLoader for batching individual project queries
 */
export function createProjectLoader(projectsAPI: ProjectsAPI, userId: string) {
  return new DataLoader(async (projectIds: readonly string[]) => {
    try {
      const projects = await Promise.all(
        projectIds.map((id) => projectsAPI.getProject(id as string, userId).catch(() => null))
      );
      return projects;
    } catch {
      return projectIds.map(() => null);
    }
  });
}

/**
 * DataLoader for batching task queries by plan
 */
export function createTaskByPlanLoader(tasksAPI: TasksAPI) {
  return new DataLoader(async (planIds: readonly string[]) => {
    const results = await Promise.all(
      planIds.map((planId) =>
        tasksAPI.getTasksByPlanId(planId as string).catch(() => [])
      )
    );
    return results;
  });
}

/**
 * DataLoader for batching individual user queries
 * Used in Team.owner, TeamMember.user, TeamInvitation.inviter, etc.
 */
export function createUserLoader(userAPI: UserAPI) {
  return new DataLoader(async (userIds: readonly string[]) => {
    try {
      const users = await Promise.all(
        userIds.map((id) => userAPI.getUser(id as string).catch(() => null))
      );
      return users;
    } catch {
      return userIds.map(() => null);
    }
  });
}
