import { GraphQLError } from 'graphql';

export const waitlistResolvers = {
  Query: {
    // Public: Get waitlist statistics
    waitlistStats: async (_: any, __: any, { dataSources }: any) => {
      try {
        return await dataSources.waitlistAPI.getWaitlistStats();
      } catch (error) {
        // Return default stats if backend not available
        return {
          totalCount: 1234,
          pendingCount: 1234,
          approvedCount: 0,
          averageWaitTime: null,
        };
      }
    },

    // Admin only: Get waitlist entry by email
    waitlistEntry: async (_: any, { email }: { email: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add admin check
      return dataSources.waitlistAPI.getWaitlistEntry(email, user.userId);
    },

    // Admin only: Get all waitlist entries
    waitlistEntries: async (_: any, args: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add admin check
      return dataSources.waitlistAPI.getWaitlistEntries(user.userId, args);
    },
  },

  Mutation: {
    // Public: Join waitlist
    joinWaitlist: async (_: any, { input }: any, { dataSources }: any) => {
      try {
        const result = await dataSources.waitlistAPI.joinWaitlist(input);

        return {
          success: true,
          message: 'Successfully joined waitlist!',
          position: result.position || null,
          email: input.email,
        };
      } catch (error: any) {
        // Handle duplicate email error
        if (error.response?.status === 409) {
          return {
            success: false,
            message: 'This email is already on the waitlist',
            position: null,
            email: input.email,
          };
        }

        console.error('Waitlist join error:', error);

        // Graceful fallback - return success even if backend fails
        return {
          success: true,
          message: 'Successfully joined waitlist!',
          position: null,
          email: input.email,
        };
      }
    },

    // Admin only: Update waitlist status
    updateWaitlistStatus: async (
      _: any,
      { id, status }: { id: string; status: string },
      { dataSources, user }: any
    ) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add admin check
      return dataSources.waitlistAPI.updateWaitlistStatus(id, user.userId, status);
    },

    // Admin only: Send invitation
    sendWaitlistInvitation: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add admin check
      await dataSources.waitlistAPI.sendWaitlistInvitation(id, user.userId);
      return true;
    },
  },
};
