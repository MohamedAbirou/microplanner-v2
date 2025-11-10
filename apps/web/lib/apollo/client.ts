/**
 * Apollo Client Configuration
 *
 * Features:
 * - GraphQL queries and mutations
 * - WebSocket subscriptions for real-time updates
 * - Automatic error handling
 * - Retry logic with exponential backoff
 * - Cache management
 * - Authentication with Clerk tokens
 */

import { ApolloClient, InMemoryCache, HttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createClient } from 'graphql-ws';

/**
 * Create HTTP link for queries and mutations
 */
const createHttpLink = (token?: string | null) => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
    credentials: 'include',
  });
};

/**
 * Create WebSocket link for subscriptions
 */
const createWsLink = (token?: string | null) => {
  if (typeof window === 'undefined') return null;

  return new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
      connectionParams: () => ({
        authorization: token ? `Bearer ${token}` : '',
      }),
      retryAttempts: 5,
      shouldRetry: () => true,
    })
  );
};

/**
 * Error handling link
 */
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to sign in
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }

  return forward(operation);
});

/**
 * Retry link for failed requests
 */
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 5000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error) => {
      // Retry on network errors but not on GraphQL errors
      return !!error && !error.result;
    },
  },
});

/**
 * Create Apollo Client instance
 */
export function createApolloClient(token?: string | null) {
  const httpLink = createHttpLink(token);
  const wsLink = createWsLink(token);

  // Split based on operation type
  const splitLink = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  return new ApolloClient({
    link: from([errorLink, retryLink, splitLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Cache policies for different queries
            tasks: {
              // Merge tasks based on filters
              keyArgs: ['goalId', 'projectId', 'scheduledDate', 'isCompleted'],
              merge(existing = [], incoming) {
                return [...incoming];
              },
            },
            goals: {
              keyArgs: ['isActive', 'isPaused', 'orderBy'],
              merge(existing = [], incoming) {
                return [...incoming];
              },
            },
            projects: {
              keyArgs: ['includeArchived', 'orderBy'],
              merge(existing = [], incoming) {
                return [...incoming];
              },
            },
          },
        },
        Task: {
          fields: {
            // Handle task timer state
            isTimerRunning: {
              read(existing) {
                return existing ?? false;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
}

/**
 * Get client-side Apollo Client
 */
let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient(token?: string | null) {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createApolloClient(token);
  }

  // Client-side: reuse existing client or create new one
  if (!apolloClient) {
    apolloClient = createApolloClient(token);
  }

  return apolloClient;
}

/**
 * Reset Apollo Client (useful after logout)
 */
export function resetApolloClient() {
  if (apolloClient) {
    apolloClient.clearStore();
    apolloClient = null;
  }
}
