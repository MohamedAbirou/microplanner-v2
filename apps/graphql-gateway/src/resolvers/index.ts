// Phase 0 & 1 resolvers only
import { userResolvers } from './user.resolver';
import { waitlistResolvers } from './waitlist.resolver';
import { onboardingResolvers } from './onboarding.resolver';

// Commented out until features are implemented in frontend
// import { goalResolvers } from './goal.resolver';
// import { taskResolvers } from './task.resolver';
// import { projectResolvers } from './project.resolver';
// import { productivityResolvers } from './productivity.resolver';
// import { dashboardResolvers } from './dashboard.resolver';

/**
 * Merge all resolvers (only active features)
 */
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...waitlistResolvers.Query,
    ...onboardingResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...waitlistResolvers.Mutation,
    ...onboardingResolvers.Mutation,
  },

  Subscription: {
    // No subscriptions yet in Phase 0 & 1
  },

  // Type resolvers - none needed yet
};
