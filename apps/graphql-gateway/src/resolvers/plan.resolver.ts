import { GraphQLError } from 'graphql';

export const planResolvers = {
  Query: {
    plans: async (_: any, { filter }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.getPlans(user.userId, filter);
    },

    plan: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.getPlan(id, user.userId);
    },

    currentPlan: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.getCurrentPlan(user.userId);
    },

    planTemplates: async (_: any, args: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.getPlanTemplates(args);
    },

    planTemplate: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.getPlanTemplate(id);
    },
  },

  Mutation: {
    generatePlan: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.generatePlan(user.userId, input);
    },

    createPlan: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.createPlan(user.userId, input);
    },

    updatePlan: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.updatePlan(id, user.userId, input);
    },

    acceptPlan: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.acceptPlan(id, user.userId);
    },

    deletePlan: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.plansAPI.deletePlan(id, user.userId);
      return true;
    },

    createPlanTemplate: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.createPlanTemplate(user.userId, input);
    },
  },

  Subscription: {
    planGenerated: {
      subscribe: (_: any, { userId }: any, { pubsub }: any) => {
        return pubsub.asyncIterator([`PLAN_GENERATED_${userId}`]);
      },
    },

    planUpdated: {
      subscribe: (_: any, { planId }: any, { pubsub }: any) => {
        return pubsub.asyncIterator([`PLAN_UPDATED_${planId}`]);
      },
    },
  },

  Plan: {
    // Field resolvers with DataLoader (batching)
    tasks: async (plan: any, _: any, { taskByPlanLoader }: any) => {
      if (!taskByPlanLoader) {
        // Fallback if loader not available
        return plan.tasks || [];
      }
      return taskByPlanLoader.load(plan.id);
    },

    goals: async (plan: any, _: any, { goalByPlanLoader }: any) => {
      if (!goalByPlanLoader) {
        // Fallback if loader not available
        return plan.goals || [];
      }
      return goalByPlanLoader.load(plan.id);
    },

    user: async (plan: any, _: any, { userLoader }: any) => {
      if (!userLoader) {
        return plan.user || null;
      }
      return userLoader.load(plan.userId);
    },

    totalTasks: async (plan: any) => {
      // If already computed
      if (plan.totalTasks !== undefined) return plan.totalTasks;

      // Compute from tasks array
      return plan.tasks?.length || 0;
    },

    completedTasks: async (plan: any) => {
      // If already computed
      if (plan.completedTasks !== undefined) return plan.completedTasks;

      // Compute from tasks array
      return plan.tasks?.filter((t: any) => t.isCompleted).length || 0;
    },

    completionRate: async (plan: any) => {
      // If already computed
      if (plan.completionRate !== undefined) return plan.completionRate;

      // Compute from tasks
      const total = plan.tasks?.length || 0;
      if (total === 0) return 0;

      const completed = plan.tasks?.filter((t: any) => t.isCompleted).length || 0;
      return (completed / total) * 100;
    },
  },

  PlanTemplate: {
    creator: async (template: any, _: any, { userLoader }: any) => {
      if (!userLoader) {
        return template.creator || null;
      }
      return userLoader.load(template.userId);
    },
  },
};
