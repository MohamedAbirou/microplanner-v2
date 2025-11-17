// All active resolvers
import { userResolvers } from './user.resolver';
import { waitlistResolvers } from './waitlist.resolver';
import { onboardingResolvers } from './onboarding.resolver';
import { goalResolvers } from './goal.resolver';
import { taskResolvers } from './task.resolver';
import { projectResolvers } from './project.resolver';
import { productivityResolvers } from './productivity.resolver';
import { dashboardResolvers } from './dashboard.resolver';
import { planResolvers } from './plan.resolver';

/**
 * Merge all resolvers
 */
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...waitlistResolvers.Query,
    ...onboardingResolvers.Query,
    ...goalResolvers.Query,
    ...taskResolvers.Query,
    ...projectResolvers.Query,
    ...productivityResolvers.Query,
    ...dashboardResolvers.Query,
    ...planResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...waitlistResolvers.Mutation,
    ...onboardingResolvers.Mutation,
    ...goalResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...productivityResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    ...planResolvers.Mutation,
  },

  Subscription: {
    ...taskResolvers.Subscription,
    ...goalResolvers.Subscription,
    ...projectResolvers.Subscription,
    ...productivityResolvers.Subscription,
    ...planResolvers.Subscription,
  },

  // Type resolvers
  Goal: goalResolvers.Goal,
  Task: taskResolvers.Task,
  TaskDependency: taskResolvers.TaskDependency,
  Plan: planResolvers.Plan,
  PlanTemplate: planResolvers.PlanTemplate,
  Project: projectResolvers.Project,
};
