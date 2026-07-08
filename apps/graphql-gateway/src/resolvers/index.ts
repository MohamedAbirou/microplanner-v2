// All active resolvers
import { analyticsResolvers } from './analytics.resolver';
import { autopilotResolvers } from './autopilot.resolver';
import { billingResolvers } from './billing.resolver';
import { calendarResolvers } from './calendar.resolver';
import { dashboardResolvers } from './dashboard.resolver';
import { goalResolvers } from './goal.resolver';
import { integrationsResolvers } from './integrations.resolver';
import { onboardingResolvers } from './onboarding.resolver';
import { planResolvers } from './plan.resolver';
import { productivityResolvers } from './productivity.resolver';
import { projectResolvers } from './project.resolver';
import { schedulingResolvers } from './scheduling.resolver';
import { taskResolvers } from './task.resolver';
import { teamsResolvers } from './teams.resolver';
import { userResolvers } from './user.resolver';

/**
 * Merge all resolvers
 */
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...onboardingResolvers.Query,
    ...goalResolvers.Query,
    ...taskResolvers.Query,
    ...projectResolvers.Query,
    ...productivityResolvers.Query,
    ...dashboardResolvers.Query,
    ...planResolvers.Query,
    ...analyticsResolvers.Query,
    ...calendarResolvers.Query,
    ...teamsResolvers.Query,
    ...schedulingResolvers.Query,
    ...integrationsResolvers.Query,
    ...billingResolvers.Query,
    ...autopilotResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...onboardingResolvers.Mutation,
    ...goalResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...productivityResolvers.Mutation,
    ...dashboardResolvers.Mutation,
    ...planResolvers.Mutation,
    ...analyticsResolvers.Mutation,
    ...calendarResolvers.Mutation,
    ...teamsResolvers.Mutation,
    ...schedulingResolvers.Mutation,
    ...integrationsResolvers.Mutation,
    ...billingResolvers.Mutation,
    ...autopilotResolvers.Mutation,
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
  KanbanBoard: productivityResolvers.KanbanBoard,
  KanbanColumn: productivityResolvers.KanbanColumn,
  Smart1on1: productivityResolvers.Smart1on1,
  WorkHours: productivityResolvers.WorkHours,
  DaySchedule: productivityResolvers.DaySchedule,
  CalendarConnection: calendarResolvers.CalendarConnection,
  Team: teamsResolvers.Team,
  TeamMember: teamsResolvers.TeamMember,
  TeamInvitation: teamsResolvers.TeamInvitation,
  SchedulingLink: schedulingResolvers.SchedulingLink,
  Booking: schedulingResolvers.Booking,
  Webhook: integrationsResolvers.Webhook,
};
