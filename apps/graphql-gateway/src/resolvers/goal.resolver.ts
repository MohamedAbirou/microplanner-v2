import { GraphQLError } from 'graphql';

export const goalResolvers = {
  Query: {
    goal: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.getGoal(id, user.userId);
    },

    goals: async (_: any, args: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.getGoals(user.userId, args);
    },

    goalAnalytics: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.getGoalAnalytics(id, user.userId);
    },
  },

  Mutation: {
    createGoal: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.createGoal(user.userId, input);
    },

    updateGoal: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.updateGoal(id, user.userId, input);
    },

    deleteGoal: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.goalsAPI.deleteGoal(id, user.userId);
      return true;
    },

    pauseGoal: async (_: any, { id, until }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.pauseGoal(id, user.userId, until);
    },

    resumeGoal: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.goalsAPI.resumeGoal(id, user.userId);
    },
  },

  Subscription: {
    goalUpdated: {
      subscribe: (_: any, { userId }: any, { pubsub }: any) => {
        return pubsub.asyncIterator([`GOAL_UPDATED_${userId}`]);
      },
    },

    goalCreated: {
      subscribe: (_: any, { userId }: any, { pubsub }: any) => {
        return pubsub.asyncIterator([`GOAL_CREATED_${userId}`]);
      },
    },

    goalDeleted: {
      subscribe: (_: any, { userId }: any, { pubsub }: any) => {
        return pubsub.asyncIterator([`GOAL_DELETED_${userId}`]);
      },
    },
  },

  Goal: {
    // Field resolver with DataLoader (batching)
    tasks: async (goal: any, _: any, { taskByGoalLoader }: any) => {
      return taskByGoalLoader.load(goal.id);
    },

    project: async (goal: any, _: any, { projectLoader }: any) => {
      if (!goal.projectId) return null;
      return projectLoader.load(goal.projectId);
    },

    taskCount: (goal: any) => goal.taskCount ?? null,

    // Compatibility fields for frontend
    targetMetric: (goal: any) => goal.targetMetric || null,
    currentProgress: (goal: any) => goal.currentProgress || goal.completionRate || 0,
    targetValue: (goal: any) => goal.targetValue || 100,
    deadline: (goal: any) => goal.deadline || null,
    isArchived: (goal: any) => goal.isArchived || !goal.isActive || false,

    // Ensure required fields have defaults
    frequencyPerWeek: (goal: any) => goal.frequencyPerWeek || 0,
    durationMinutes: (goal: any) => goal.durationMinutes || 0,
    preferredTimes: (goal: any) => goal.preferredTimes || [],
    flexibilityScore: (goal: any) => goal.flexibilityScore || 0,
    priority: (goal: any) => goal.priority || 0,
    isActive: (goal: any) => goal.isActive !== undefined ? goal.isActive : true,
    isPaused: (goal: any) => goal.isPaused || false,
    completionRate: (goal: any) => goal.completionRate || 0,
    totalCompletions: (goal: any) => goal.totalCompletions || 0,
    totalScheduled: (goal: any) => goal.totalScheduled || 0,
    currentStreak: (goal: any) => goal.currentStreak || 0,
    longestStreak: (goal: any) => goal.longestStreak || 0,
  },
};
