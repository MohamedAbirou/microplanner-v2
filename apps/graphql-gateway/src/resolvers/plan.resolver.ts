import { GraphQLError } from 'graphql';
import { resolvePlanDescription, resolvePlanTitle } from '../utils/plan-fields';

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

    regeneratePlan: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.regeneratePlan(id, user.userId);
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

    saveAsPlanTemplate: async (_: any, { planId, name, description }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.saveAsPlanTemplate(planId, user.userId, name, description);
    },

    generatePlanFromTemplate: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.generatePlanFromTemplate(user.userId, input);
    },

    setDefaultPlanTemplate: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.plansAPI.setDefaultPlanTemplate(id, user.userId);
    },

    deletePlanTemplate: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.plansAPI.deletePlanTemplate(id, user.userId);
      return true;
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
    title: (plan: any) => resolvePlanTitle(plan),
    description: (plan: any) => resolvePlanDescription(plan),

    // Field resolvers with DataLoader (batching)
    tasks: async (plan: any, _: any, { taskByPlanLoader }: any) => {
      if (!taskByPlanLoader) {
        // Fallback if loader not available
        return plan.tasks || [];
      }

      const materialized = await taskByPlanLoader.load(plan.id);
      if (materialized?.length) return materialized;

      // DRAFT plans have no Task rows yet — surface the proposed schedule
      // from planJson so the review page can render it before acceptance.
      const draft = (plan.planJson as any)?.tasks || [];
      const now = new Date().toISOString();
      return draft.map((t: any, i: number) => ({
        id: `${plan.id}:draft:${i}`,
        userId: plan.userId,
        planId: plan.id,
        goalId: t.goalId || null,
        title: t.title,
        notes: t.notes || null,
        priority: t.priority ?? 2,
        tags: [],
        scheduledDate: t.scheduledDate,
        startTime: t.startTime,
        endTime: t.endTime,
        durationMinutes: t.durationMinutes ?? 30,
        isCompleted: false,
        isSkipped: false,
        aiGenerated: t.aiGenerated ?? true,
        manuallyAdded: false,
        aiReasoning: t.aiReasoning || null,
        timeSpentMinutes: 0,
        isTimerRunning: false,
        syncStatus: 'PENDING',
        createdAt: now,
        updatedAt: now,
      }));
    },

    goals: async (plan: any, _: any, { taskByPlanLoader, goalLoader }: any) => {
      if (!taskByPlanLoader || !goalLoader) {
        return plan.goals || [];
      }

      // Derive the plan's goals from its tasks (materialized rows first,
      // falling back to the draft schedule stored in planJson)
      const tasks = await taskByPlanLoader.load(plan.id);
      const source = tasks?.length ? tasks : (plan.planJson as any)?.tasks || [];
      const goalIds: string[] = Array.from(
        new Set(source.map((t: any) => t.goalId).filter(Boolean))
      );

      const goals = await Promise.all(goalIds.map((id) => goalLoader.load(id)));
      return goals.filter(Boolean);
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
