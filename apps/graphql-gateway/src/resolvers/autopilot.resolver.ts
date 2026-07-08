import { GraphQLError } from 'graphql';

function requireUser(user: any) {
  if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
}

export const autopilotResolvers = {
  Query: {
    autopilotStatus: async (_: any, __: any, { dataSources, user }: any) => {
      requireUser(user);
      return dataSources.autopilotAPI.getStatus(user.userId);
    },
  },

  Mutation: {
    updateAutopilotSettings: async (_: any, { enabled, mode }: any, { dataSources, user }: any) => {
      requireUser(user);
      return dataSources.autopilotAPI.updateSettings(user.userId, { enabled, mode });
    },

    runAutopilot: async (_: any, { date }: any, { dataSources, user }: any) => {
      requireUser(user);
      return dataSources.autopilotAPI.run(user.userId, date);
    },

    applyAutopilotProposal: async (_: any, { id }: any, { dataSources, user }: any) => {
      requireUser(user);
      return dataSources.autopilotAPI.applyProposal(user.userId, id);
    },

    dismissAutopilotProposal: async (_: any, { id }: any, { dataSources, user }: any) => {
      requireUser(user);
      return dataSources.autopilotAPI.dismissProposal(user.userId, id);
    },
  },
};
