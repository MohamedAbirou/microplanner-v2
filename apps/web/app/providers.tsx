'use client';

/**
 * Client-side Providers
 *
 * Wraps the app with necessary context providers:
 * - Apollo Client (GraphQL + Subscriptions)
 * - Theme Provider (Dark/Light mode)
 * - Toast notifications
 */

import { ApolloProvider } from '@/lib/apollo/provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <ApolloProvider>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#171717',
              color: '#FAFAFA',
              border: '1px solid #262626',
            },
          }}
        />
      </ApolloProvider>
    </ThemeProvider>
  );
}
