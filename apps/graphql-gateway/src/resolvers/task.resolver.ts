import { GraphQLError } from 'graphql';

/**
 * Task Resolvers
 */
export const taskResolvers = {
  Query: {
    task: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.tasksAPI.getTask(id, user.userId);
    },

    tasks: async (_: any, args: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.tasksAPI.getTasks(user.userId, args);
    },

    tasksByProject: async (_: any, { projectId }: { projectId: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.tasksAPI.getTasksByProject(projectId, user.userId);
    },

    tasksByGoal: async (_: any, { goalId }: { goalId: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.tasksAPI.getTasksByGoal(goalId, user.userId);
    },

    searchTasks: async (_: any, { query }: { query: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.tasksAPI.searchTasks(query, user.userId);
    },
  },

  Mutation: {
    createTask: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const task = await dataSources.tasksAPI.createTask(user.userId, input);

      // Publish to subscription
      await pubsub.publish(`TASK_CREATED_${user.userId}`, { taskCreated: task });

      return task;
    },

    updateTask: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const task = await dataSources.tasksAPI.updateTask(id, user.userId, input);

      // Publish to subscription
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, { taskUpdated: task });

      return task;
    },

    deleteTask: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.tasksAPI.deleteTask(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`TASK_DELETED_${user.userId}`, { taskDeleted: { id } });

      return true;
    },

    completeTask: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const task = await dataSources.tasksAPI.completeTask(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, { taskUpdated: task });

      return task;
    },

    uncompleteTask: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const task = await dataSources.tasksAPI.uncompleteTask(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, { taskUpdated: task });

      return task;
    },

    // Task Dependencies
    createTaskDependency: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const dependency = await dataSources.tasksAPI.createTaskDependency(user.userId, input);

      // Publish task update to refresh dependency graph
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, {
        taskUpdated: await dataSources.tasksAPI.getTask(input.dependentTaskId, user.userId),
      });

      return dependency;
    },

    deleteTaskDependency: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.tasksAPI.deleteTaskDependency(id, user.userId);

      return true;
    },

    // Time Tracking
    startTimer: async (_: any, { taskId }: { taskId: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const timeEntry = await dataSources.tasksAPI.startTimer(taskId, user.userId);

      // Publish task update
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, {
        taskUpdated: await dataSources.tasksAPI.getTask(taskId, user.userId),
      });

      return timeEntry;
    },

    stopTimer: async (_: any, { taskId }: { taskId: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const timeEntry = await dataSources.tasksAPI.stopTimer(taskId, user.userId);

      // Publish task update
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, {
        taskUpdated: await dataSources.tasksAPI.getTask(taskId, user.userId),
      });

      return timeEntry;
    },

    // Subtasks
    createSubtask: async (_: any, { parentId, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const subtask = await dataSources.tasksAPI.createSubtask(parentId, user.userId, input);

      // Publish parent task update
      await pubsub.publish(`TASK_UPDATED_${user.userId}`, {
        taskUpdated: await dataSources.tasksAPI.getTask(parentId, user.userId),
      });

      return subtask;
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`TASK_CREATED_${user.userId}`);
      },
    },

    taskUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`TASK_UPDATED_${user.userId}`);
      },
    },

    taskDeleted: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`TASK_DELETED_${user.userId}`);
      },
    },
  },

  Task: {
    // DataLoader batching for related entities
    goal: async (task: any, _: any, { dataSources, goalLoader }: any) => {
      if (!task.goalId) return null;
      return goalLoader.load(task.goalId);
    },

    project: async (task: any, _: any, { dataSources, projectLoader }: any) => {
      if (!task.projectId) return null;
      return projectLoader.load(task.projectId);
    },

    dependencies: async (task: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getTaskDependencies(task.id);
    },

    blockedBy: async (task: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getTaskBlockers(task.id);
    },

    subtasks: async (task: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getSubtasks(task.id);
    },

    timeEntries: async (task: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getTimeEntries(task.id);
    },
  },

  TaskDependency: {
    dependentTask: async (dependency: any, _: any, { dataSources, taskLoader }: any) => {
      return taskLoader.load(dependency.dependentTaskId);
    },

    blockingTask: async (dependency: any, _: any, { dataSources, taskLoader }: any) => {
      return taskLoader.load(dependency.blockingTaskId);
    },
  },
};
