import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  from,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import { toast } from 'sonner';
import { config } from '@microplanner/config';
import { enqueueMutation } from '@/lib/offline-queue';

/**
 * Create Apollo Client with:
 * - HTTP link for queries/mutations
 * - WebSocket link for subscriptions
 * - Auth link for JWT token injection
 * - Error link for error handling
 * - Optimistic caching
 */

const httpLink = new HttpLink({
  uri: config.graphqlUrl,
  credentials: 'include',
});

// Slow list/analytics queries — never batch these with anything else. A batch
// response only returns once every operation in it has resolved, so grouping
// a 3s GetTasksList with fast layout queries (GetMyTier, OnboardingStatus...)
// would make the fast ones wait 3s too. Keep them on their own connection.
const HEAVY_QUERY_NAMES = new Set([
  'GetTasks',
  'GetTasksList',
  'GetTasksAnalytics',
  'GetDashboardStats',
  'GetPlansSummary',
  'GetPlans',
  'SearchTasks',
]);

// Combines several small operations fired in the same tick (layout queries on
// every navigation: OnboardingStatus, GetMyTier, GetGoalsList, GetNotifications)
// into a single HTTP request instead of one each.
const batchHttpLink = new BatchHttpLink({
  uri: config.graphqlUrl,
  credentials: 'include',
  batchInterval: 20,
  batchMax: 10,
});

const batchableHttpLink = split((operation) => {
  const definition = getMainDefinition(operation.query);
  const isQuery = definition.kind === 'OperationDefinition' && definition.operation === 'query';
  return isQuery && !HEAVY_QUERY_NAMES.has(operation.operationName || '');
}, batchHttpLink, httpLink);

// WebSocket link for subscriptions
const wsLink =
  typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
          url: config.graphqlWsUrl,
          connectionParams: async () => {
            // Get auth token from Clerk
            const token = await getAuthToken();
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
          retryAttempts: 5,
          shouldRetry: () => true,
        })
      )
    : null;

// Auth link to inject JWT token
const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error link for global error handling
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  let serverErrored = false;

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Auth redirects are handled by Clerk middleware — do not hard-navigate here
      // (redirecting from /sign-in on UNAUTHENTICATED causes an infinite reload loop)
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('[GraphQL] Unauthenticated request:', operation.operationName);
      }

      // Handle authorization errors
      if (extensions?.code === 'FORBIDDEN') {
        console.error('Authorization error:', message);
      }

      // Surface true server errors (5xx) to the user.
      const status = Number(extensions?.statusCode);
      if (extensions?.code === 'INTERNAL_SERVER_ERROR' || (status >= 500 && status < 600)) {
        serverErrored = true;
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    const status = Number((networkError as any)?.statusCode);
    if (status >= 500 && status < 600) serverErrored = true;

    // Offline mutation capture: if the device is offline and this is a
    // mutation, queue it for replay on reconnect instead of losing the action.
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (isOffline) {
      try {
        const def = getMainDefinition(operation.query);
        const isMutation =
          def.kind === 'OperationDefinition' && def.operation === 'mutation';
        const body = operation.query.loc?.source.body;
        if (isMutation && body) {
          void enqueueMutation({
            operationName: operation.operationName,
            query: body,
            variables: operation.variables || {},
          });
        }
      } catch {
        /* best-effort; never throw from the error link */
      }
    }
  }

  // One toast per failed operation for genuine server errors (not offline/auth).
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  if (serverErrored && !offline) {
    toast.error('Something went wrong on our end. Please try again in a moment.');
  }
});

// Split link: use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink =
  typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        from([errorLink, authLink, batchableHttpLink])
      )
    : from([errorLink, authLink, batchableHttpLink]);

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Merge goals list
        goals: {
          keyArgs: ['filter', 'sort'],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        // Merge tasks list
        tasks: {
          keyArgs: ['filter', 'sort', 'take', 'skip'],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Goal: {
      fields: {
        // Cache goal analytics separately
        analytics: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Task: {
      fields: {
        // Optimistic updates for task completion
        isCompleted: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

/**
 * Token getter function - will be set by ClerkApolloProvider
 * This allows us to inject the token from useAuth() hook
 */
let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Set the token getter function
 * Called by ClerkApolloProvider to inject Clerk's getToken function
 */
export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

/**
 * Get authentication token from Clerk
 * Note: This is a client-side only function
 */
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (!tokenGetter) {
    return null;
  }

  try {
    const token = await tokenGetter();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Create Apollo Client instance
 */
export function createApolloClient() {
  return new ApolloClient({
    link: splitLink,
    cache,
    defaultOptions: {
      watchQuery: {
        // cache-first avoids refetching every query on each page navigation
        // (cache-and-network was causing API rate-limit storms in production).
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
    },
  });
}
