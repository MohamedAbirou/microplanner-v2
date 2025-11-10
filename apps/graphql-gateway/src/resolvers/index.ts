import { goalResolvers } from './goal.resolver';
import { taskResolvers } from './task.resolver';
import { projectResolvers } from './project.resolver';
import { productivityResolvers } from './productivity.resolver';
import { userResolvers } from './user.resolver';
import { waitlistResolvers } from './waitlist.resolver';
import { dashboardResolvers } from './dashboard.resolver';

/**
 * Merge all resolvers
 */
export const resolvers = {
  Query: {
    ...goalResolvers.Query,
    ...taskResolvers.Query,
    ...projectResolvers.Query,
    ...productivityResolvers.Query,
    ...userResolvers.Query,
    ...waitlistResolvers.Query,
    ...dashboardResolvers.Query,
  },

  Mutation: {
    ...goalResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...productivityResolvers.Mutation,
    ...userResolvers.Mutation,
    ...waitlistResolvers.Mutation,
  },

  Subscription: {
    ...goalResolvers.Subscription,
    ...taskResolvers.Subscription,
    ...projectResolvers.Subscription,
    ...productivityResolvers.Subscription,
  },

  // Type resolvers
  Goal: goalResolvers.Goal,
  Task: taskResolvers.Task,
  TaskDependency: taskResolvers.TaskDependency,
  Project: projectResolvers.Project,
  KanbanBoard: productivityResolvers.KanbanBoard,
};
