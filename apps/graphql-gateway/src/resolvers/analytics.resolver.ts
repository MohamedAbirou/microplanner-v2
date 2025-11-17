import { GraphQLError } from 'graphql';

export const analyticsResolvers = {
  Query: {
    /**
     * Get dashboard statistics for current user
     */
    dashboardStats: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.analyticsAPI.getDashboardStats(user.userId);
    },

    weeklyStats: async (_: any, { weekStart }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.analyticsAPI.getWeeklyStats(user.userId, weekStart);
    },

    productivityScores: async (_: any, { startDate, endDate }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.analyticsAPI.getProductivityScores(user.userId, startDate, endDate);
    },

    goalAnalyticsReport: async (_: any, { goalId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.analyticsAPI.getGoalAnalyticsReport(goalId, user.userId);
    },

    // timeTracking: async (_: any, { startDate, endDate }: any, { dataSources, user }: any) => {
    //   if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    //   return dataSources.analyticsAPI.getTimeTracking(user.userId, startDate, endDate);
    // },

    insights: async (_: any, { type, limit }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.analyticsAPI.getInsights(user.userId, type, limit);
    },

    // commented out until implemented!    
    // streakHistory: async (_: any, { limit }: any, { dataSources, user }: any) => {
    //   if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    //   return dataSources.analyticsAPI.getStreakHistory(user.userId, limit);
    // },
  },

  Mutation: {
    /**
     * Generate AI insights for user's productivity patterns
     */
    // generateInsights: async (_: any, __: any, { dataSources, user }: any) => {
    //   if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    //   return dataSources.analyticsAPI.generateInsights(user.userId);
    // },

    // dismissInsight: async (_: any, { id }: any, { dataSources, user }: any) => {
    //   if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
    //   return dataSources.analyticsAPI.dismissInsight(id, user.userId);
    // },
  },
};
