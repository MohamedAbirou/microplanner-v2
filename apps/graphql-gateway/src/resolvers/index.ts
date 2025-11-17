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
import { analyticsResolvers } from './analytics.resolver';
import { productivityFeaturesResolvers } from './productivity-features.resolver';
import { calendarResolvers } from './calendar.resolver';
import { teamsResolvers } from './teams.resolver';
import { schedulingResolvers } from './scheduling.resolver';
import { integrationsResolvers } from './integrations.resolver';
import { billingResolvers } from './billing.resolver';

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
    ...analyticsResolvers.Query,
    ...productivityFeaturesResolvers.Query,
    ...calendarResolvers.Query,
    ...teamsResolvers.Query,
    ...schedulingResolvers.Query,
    ...integrationsResolvers.Query,
    ...billingResolvers.Query,
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
    ...analyticsResolvers.Mutation,
    ...productivityFeaturesResolvers.Mutation,
    ...calendarResolvers.Mutation,
    ...teamsResolvers.Mutation,
    ...schedulingResolvers.Mutation,
    ...integrationsResolvers.Mutation,
    ...billingResolvers.Mutation,
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
  KanbanBoard: productivityFeaturesResolvers.KanbanBoard,
  KanbanColumn: productivityFeaturesResolvers.KanbanColumn,
  CalendarConnection: calendarResolvers.CalendarConnection,
  Team: teamsResolvers.Team,
  TeamMember: teamsResolvers.TeamMember,
  TeamInvitation: teamsResolvers.TeamInvitation,
  SchedulingLink: schedulingResolvers.SchedulingLink,
  Booking: schedulingResolvers.Booking,
  Webhook: integrationsResolvers.Webhook,
};
