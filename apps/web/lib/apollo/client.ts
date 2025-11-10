import { ApolloClient, InMemoryCache, from, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import { cache } from './cache';

const isServer = typeof window === 'undefined';

// HTTP Link for queries and mutations
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // Send cookies
});

// WebSocket Link for subscriptions (client-side only)
const wsLink = !isServer
  ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
        connectionParams: async () => {
          // Get token from Clerk or localStorage
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

// Auth Link - Add JWT token to headers
const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error: any) => {
      const { message, locations, path, extensions } = error;
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login or refresh token
        if (!isServer) {
          window.location.href = '/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Split link - Use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = !isServer && wsLink
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

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
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
  ssrMode: isServer,
});

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  if (isServer) return null;

  try {
    // Check if Clerk is available
    if (window.Clerk) {
      const session = await window.Clerk.session;
      if (session) {
        return await session.getToken();
      }
    }

    // Fallback to localStorage (for development)
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Export singleton instance
export default apolloClient;
