import { GraphQLError } from 'graphql';

export const billingResolvers = {
  Query: {
    /**
     * Get current user's subscription
     */
    subscription: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.getSubscription(user.userId);
    },

    /**
     * Get billing info (payment methods, invoices)
     */
    billingInfo: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.getBillingInfo(user.userId);
    },

    /**
     * Get usage statistics for current billing period
     */
    usageStats: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.getUsageStats(user.userId);
    },

    /**
     * Check if user can use a specific feature
     */
    canUseFeature: async (_: any, { feature }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.canUseFeature(user.userId, feature);
    },
  },

  Mutation: {
    /**
     * Create Stripe checkout session for new subscription
     */
    createCheckoutSession: async (_: any, { tier, interval }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.createCheckoutSession(user.userId, tier, interval);
    },

    /**
     * Upgrade existing subscription
     */
    upgradeSubscription: async (_: any, { tier }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.upgradeSubscription(user.userId, tier);
    },

    /**
     * Cancel subscription at period end
     */
    cancelSubscription: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.cancelSubscription(user.userId);
    },

    /**
     * Resume a canceled subscription
     */
    resumeSubscription: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.resumeSubscription(user.userId);
    },

    /**
     * Update payment method
     */
    updatePaymentMethod: async (_: any, { paymentMethodId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.updatePaymentMethod(user.userId, paymentMethodId);
    },

    /**
     * Create Stripe billing portal session
     */
    createBillingPortalSession: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.billingAPI.createBillingPortalSession(user.userId);
    },
  },
};
