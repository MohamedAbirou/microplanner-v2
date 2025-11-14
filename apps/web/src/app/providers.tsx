'use client';

import * as React from 'react';
import { useAuth } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { createApolloClient, setTokenGetter } from '@/lib/apollo/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Inner provider that has access to Clerk's useAuth hook
 */
function ClerkApolloProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const apolloClientRef = React.useRef(createApolloClient());

  React.useEffect(() => {
    // Set up the token getter for Apollo client
    setTokenGetter(() => getToken());
  }, [getToken]);

  return (
    <ApolloProvider client={apolloClientRef.current}>
      {children}
    </ApolloProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkApolloProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="dark"
          />
        </QueryClientProvider>
      </ClerkApolloProvider>
    </ThemeProvider>
  );
}
