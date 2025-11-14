'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { ApolloProvider } from '@apollo/client';
import { Analytics } from '@vercel/analytics/next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { createApolloClient } from '@/lib/apollo/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const apolloClient = createApolloClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="dark"
          />
          <Analytics />
        </QueryClientProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
