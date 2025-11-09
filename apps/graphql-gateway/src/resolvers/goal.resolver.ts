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
  },
};
