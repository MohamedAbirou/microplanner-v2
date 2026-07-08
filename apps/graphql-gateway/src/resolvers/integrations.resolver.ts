import { GraphQLError } from 'graphql';

export const integrationsResolvers = {
  Query: {
    /**
     * Integrations (Slack, Zoom, Notion, etc.)
     */
    integrations: async (_: any, { type }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getIntegrations(user.userId, type);
    },

    integration: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getIntegration(id, user.userId);
    },

    integrationResources: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getIntegrationResources(id, user.userId);
    },

    pmInboxTasks: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getPmInbox(user.userId);
    },

    /**
     * Webhooks
     */
    webhooks: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getWebhooks(user.userId);
    },

    webhook: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getWebhook(id, user.userId);
    },

    webhookDeliveries: async (_: any, { webhookId, limit }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.getWebhookDeliveries(webhookId, user.userId, limit);
    },
  },

  Mutation: {
    /**
     * Integration Management
     */
    /**
     * Begin an OAuth handshake — returns the provider authorize URL for the
     * client to redirect to. Nothing is marked "connected" until the callback
     * completes and a real token is stored.
     */
    initiateIntegrationOAuth: async (_: any, { type }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.initiateOAuth(user.userId, type);
    },

    importPmTasks: async (_: any, { items }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.importPmTasks(user.userId, items);
    },

    connectIntegration: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.connectIntegration(user.userId, input);
    },

    updateIntegration: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.updateIntegration(id, user.userId, input);
    },

    disconnectIntegration: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.integrationsAPI.disconnectIntegration(id, user.userId);
      return true;
    },

    syncIntegration: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.syncIntegration(id, user.userId);
    },

    /**
     * Webhook Management
     */
    createWebhook: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.createWebhook(user.userId, input);
    },

    updateWebhook: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.updateWebhook(id, user.userId, input);
    },

    deleteWebhook: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.integrationsAPI.deleteWebhook(id, user.userId);
      return true;
    },

    toggleWebhook: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.toggleWebhook(id, user.userId);
    },

    retryWebhookDelivery: async (_: any, { deliveryId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.integrationsAPI.retryWebhookDelivery(deliveryId, user.userId);
    },
  },

  Webhook: {
    deliveries: async (webhook: any, _: any, { dataSources }: any) => {
      return dataSources.integrationsAPI.getWebhookDeliveries(webhook.id);
    },
  },
};
