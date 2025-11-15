import { GraphQLError } from 'graphql';

/**
 * Onboarding Resolvers
 * Proxies requests to NestJS GraphQL backend
 */
export const onboardingResolvers = {
  Query: {
    // ==================== SLEEP RECOMMENDATION ====================
    calculateSleepRecommendation: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.onboardingAPI.calculateSleepRecommendation(input);
    },

    // ==================== GOAL SUGGESTIONS ====================
    getGoalSuggestions: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.onboardingAPI.getGoalSuggestions(input);
    },
  },

  Mutation: {
    // ==================== UPDATE PROGRESS ====================
    updateOnboardingProgress: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.onboardingAPI.updateOnboardingProgress(input);
    },

    // ==================== COMPLETE ONBOARDING ====================
    completeOnboarding: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const success = await dataSources.onboardingAPI.completeOnboarding(input);

      return {
        success,
        user: null, // User data is managed by NestJS
        message: success ? 'Onboarding completed successfully' : 'Failed to complete onboarding',
      };
    },
  },
};
