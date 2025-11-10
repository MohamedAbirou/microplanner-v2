'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from './client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}

export default ApolloProvider;
