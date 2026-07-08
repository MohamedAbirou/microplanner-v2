import { GraphQLError } from 'graphql';

export const userResolvers = {
  Query: {
    /**
     * Get current authenticated user
     */
    me: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getUser(user.userId);
    },

    dailyRitual: async (_: any, { date }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getDailyRitual(user.userId, date);
    },

    userSettings: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getUserSettings(user.userId);
    },

    onboardingStatus: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getOnboardingStatus(user.userId);
    },

    exportMyData: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.exportData(user.userId);
    },

    aiMemories: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.aiMemoryAPI.getMemories(user.userId);
    },

    myReferralStats: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.referralsAPI.getStats(user.userId);
    },
  },

  User: {
    clerkId: (parent: any, _: any, { user }: any) => {
      return parent.clerkId || user?.sub || '';
    },

    /**
     * Resolve fullName from name field (compatible with frontend)
     */
    fullName: (parent: any) => {
      return parent.fullName || parent.name || '';
    },

    /**
     * Resolve settings field (compatible with frontend)
     */
    settings: async (parent: any, _: any, { dataSources }: any) => {
      try {
        // Return a settings object compatible with frontend queries
        return {
          theme: parent.theme ?? 'SYSTEM',
          workingHours: {
            start: parent.workStartTime || '09:00',
            end: parent.workEndTime || '17:00',
          },
          defaultTaskDuration: 30,
          notifications: {
            email: true,
            push: true,
            reminders: true,
          },
          calendarIntegrations: [],
        };
      } catch (error) {
        return null;
      }
    },
  },

  Mutation: {
    /**
     * Sync/create user from Clerk authentication
     * This ensures the user exists in our database with proper metadata
     */
    syncUser: async (_: any, { input }: any, { dataSources }: any) => {
      try {
        return await dataSources.userAPI.syncUser(input);
      } catch (error) {
        console.error('Failed to sync user:', error);
        throw new GraphQLError('Failed to sync user to database', {
          extensions: { code: 'USER_SYNC_FAILED' },
        });
      }
    },

    updateUserProfile: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.updateUserProfile(user.userId, input);
    },

    updateUserSettings: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.updateUserSettings(user.userId, input);
    },

    registerPushToken: async (_: any, { subscription }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.registerPushToken(user.userId, subscription);
    },

    unregisterPushToken: async (_: any, { endpoint }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.unregisterPushToken(user.userId, endpoint);
    },

    sendTestPush: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.sendTestPush(user.userId);
    },

    updateDailyRitual: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.updateDailyRitual(user.userId, input);
    },

    deleteMyAccount: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.deleteAccount(user.userId);
    },

    createAiMemory: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.aiMemoryAPI.createMemory(user.userId, input);
    },

    deleteAiMemory: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.aiMemoryAPI.deleteMemory(user.userId, id);
    },

    redeemReferral: async (_: any, { code }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.referralsAPI.redeem(user.userId, code);
    },

    completeOnboarding: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      // Create work hours first
      if (input.workDays && input.workStartTime && input.workEndTime) {
        const schedule = input.workDays.reduce((acc: any, day: number) => {
          acc[day] = {
            start: input.workStartTime,
            end: input.workEndTime,
          };
          return acc;
        }, {});

        await dataSources.productivityAPI.updateWorkHours(user.userId, {
          timezone: input.timezone,
          schedule,
          maxMeetingsPerDay: input.maxMeetingsPerDay,
        });
      }

      // Create goals if provided
      let createdGoals: any[] = [];
      if (input.goals && input.goals.length > 0) {
        createdGoals = await Promise.all(
          input.goals.map((goalInput: any) =>
            dataSources.goalsAPI.createGoal(user.userId, goalInput)
          )
        );
      }

      // Update user settings with energy pattern
      const settings = await dataSources.userAPI.updateUserSettings(user.userId, {
        firstName: input.firstName,
        lastName: input.lastName,
        energyPattern: input.energyPattern,
      });

      // Mark onboarding as complete
      await dataSources.userAPI.completeOnboarding(user.userId, {
        completedAt: new Date().toISOString(),
      });

      // Get updated user
      const updatedUser = await dataSources.userAPI.getUser(user.userId);

      return {
        success: true,
        user: updatedUser,
        settings,
        goals: createdGoals,
      };
    },
  },
};
