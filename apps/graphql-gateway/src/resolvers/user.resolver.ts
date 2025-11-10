import { GraphQLError } from 'graphql';

export const userResolvers = {
  Query: {
    userSettings: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getUserSettings(user.userId);
    },

    onboardingStatus: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.getOnboardingStatus(user.userId);
    },
  },

  Mutation: {
    updateUserProfile: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.updateUserProfile(user.userId, input);
    },

    updateUserSettings: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.userAPI.updateUserSettings(user.userId, input);
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
