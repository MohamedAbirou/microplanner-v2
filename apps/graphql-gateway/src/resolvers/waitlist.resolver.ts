import { GraphQLError } from 'graphql';

/**
 * Admin gate for waitlist management operations.
 * Admins are declared via the ADMIN_EMAILS env var (comma-separated list);
 * the caller's email comes from their verified DB user record, not the JWT.
 */
async function requireAdmin(dataSources: any, user: any): Promise<void> {
  if (!user) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    throw new GraphQLError('Waitlist administration is not configured on this server', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  const dbUser = await dataSources.userAPI.getUser(user.userId);
  if (!dbUser?.email || !adminEmails.includes(dbUser.email.toLowerCase())) {
    throw new GraphQLError('Admin access required', { extensions: { code: 'FORBIDDEN' } });
  }
}

export const waitlistResolvers = {
  Query: {
    // Public: Get waitlist statistics
    waitlistStats: async (_: any, __: any, { dataSources }: any) => {
      try {
        return await dataSources.waitlistAPI.getWaitlistStats();
      } catch (error) {
        // Backend unavailable — return honest zeros, never fabricated numbers
        return {
          total: 0,
          pending: 0,
          approved: 0,
          invited: 0,
          converted: 0,
          averageWaitDays: null,
        };
      }
    },

    // Admin only: Get waitlist entry by email
    waitlistEntry: async (_: any, { email }: { email: string }, { dataSources, user }: any) => {
      await requireAdmin(dataSources, user);
      return dataSources.waitlistAPI.getWaitlistEntry(email, user.userId);
    },

    // Admin only: Get all waitlist entries
    waitlistEntries: async (_: any, args: any, { dataSources, user }: any) => {
      await requireAdmin(dataSources, user);
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

        return {
          success: false,
          message: 'Could not join the waitlist right now. Please try again shortly.',
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
      await requireAdmin(dataSources, user);
      return dataSources.waitlistAPI.updateWaitlistStatus(id, user.userId, status);
    },

    // Admin only: Send invitation
    sendWaitlistInvitation: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      await requireAdmin(dataSources, user);
      await dataSources.waitlistAPI.sendWaitlistInvitation(id, user.userId);
      return true;
    },
  },
};
