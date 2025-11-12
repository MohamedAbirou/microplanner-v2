import { InMemoryCache } from '@apollo/client';

// Configure Apollo Client cache with type policies
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Goals pagination
        goals: {
          keyArgs: ['isActive', 'isPaused'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        // Tasks pagination
        tasks: {
          keyArgs: ['goalId', 'projectId', 'scheduledDate', 'isCompleted'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        // Projects
        projects: {
          keyArgs: ['includeArchived'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    // Goal type policy
    Goal: {
      keyFields: ['id'],
      fields: {
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    // Task type policy
    Task: {
      keyFields: ['id'],
      fields: {
        subtasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        dependencies: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    // Project type policy
    Project: {
      keyFields: ['id'],
      fields: {
        tasks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    // User type policy
    User: {
      keyFields: ['id'],
    },
  },
});

export default cache;
