import { GraphQLError } from 'graphql';

export const teamsResolvers = {
  Query: {
    /**
     * Team Management
     */
    teams: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeams(user.userId);
    },

    team: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeam(id, user.userId);
    },

    teamMembers: async (_: any, { teamId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeamMembers(teamId, user.userId);
    },

    teamInvitations: async (_: any, { teamId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeamInvitations(teamId, user.userId);
    },

    teamDashboard: async (_: any, { teamId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeamDashboard(teamId, user.userId);
    },

    teamGoals: async (_: any, { teamId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getTeamGoals(teamId, user.userId);
    },

    /**
     * API Keys (Premium feature)
     */
    apiKeys: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getApiKeys(user.userId);
    },

    apiKey: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.getApiKey(id, user.userId);
    },
  },

  Mutation: {
    /**
     * Team Management
     */
    createTeam: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.createTeam(user.userId, input);
    },

    updateTeam: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.updateTeam(id, user.userId, input);
    },

    deleteTeam: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.teamsAPI.deleteTeam(id, user.userId);
      return true;
    },

    /**
     * Team Members
     */
    inviteTeamMember: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.inviteTeamMember(user.userId, input);
    },

    acceptTeamInvitation: async (_: any, { token }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.acceptTeamInvitation(token, user.userId);
    },

    shareGoalWithTeam: async (_: any, { goalId, teamId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.shareGoalWithTeam(teamId, goalId, user.userId);
    },

    unshareGoalFromTeam: async (_: any, { goalId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.unshareGoalFromTeam(goalId, user.userId);
    },

    removeTeamMember: async (_: any, { teamId, userId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.teamsAPI.removeTeamMember(teamId, userId, user.userId);
      return true;
    },

    updateTeamMemberRole: async (_: any, { teamId, userId, role }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.updateTeamMemberRole(teamId, userId, role, user.userId);
    },

    /**
     * API Keys
     */
    createApiKey: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.createApiKey(user.userId, input);
    },

    deleteApiKey: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.teamsAPI.deleteApiKey(id, user.userId);
      return true;
    },

    toggleApiKey: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.teamsAPI.toggleApiKey(id, user.userId);
    },
  },

  Team: {
    owner: async (team: any, _: any, { dataSources, userLoader }: any) => {
      return userLoader.load(team.ownerId);
    },

    members: async (team: any, _: any, { dataSources }: any) => {
      return dataSources.teamsAPI.getTeamMembers(team.id);
    },

    invitations: async (team: any, _: any, { dataSources }: any) => {
      return dataSources.teamsAPI.getTeamInvitations(team.id);
    },
  },

  TeamMember: {
    user: (member: any) => member.user ?? null,
  },

  TeamInvitation: {
    team: async (invitation: any, _: any, { dataSources }: any) => {
      return dataSources.teamsAPI.getTeam(invitation.teamId);
    },

    inviter: async (invitation: any, _: any, { userLoader }: any) => {
      return userLoader.load(invitation.invitedBy);
    },
  },
};
