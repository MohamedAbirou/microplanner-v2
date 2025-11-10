'use client';

/**
 * Apollo Provider Component
 * Wraps the app with Apollo Client for GraphQL operations
 */

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { getApolloClient, resetApolloClient } from './client';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    async function initApollo() {
      // Reset client when user signs out
      if (!isSignedIn) {
        resetApolloClient();
        setClient(getApolloClient());
        return;
      }

      // Get auth token and create client
      const token = await getToken();
      const apolloClient = getApolloClient(token);
      setClient(apolloClient);
    }

    initApollo();
  }, [getToken, isSignedIn]);

  // Show nothing while initializing
  if (!client) {
    return null;
  }

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
