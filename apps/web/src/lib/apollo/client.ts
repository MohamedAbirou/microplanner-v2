import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  from,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import { config } from '@microplanner/config';

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
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
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
        from([errorLink, authLink, httpLink])
      )
    : from([errorLink, authLink, httpLink]);

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
          keyArgs: ['filter', 'sort'],
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
        fetchPolicy: 'cache-and-network',
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
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
}
