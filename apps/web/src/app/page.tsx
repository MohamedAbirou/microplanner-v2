'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Root page - Smart redirect based on authentication status
 *
 * - Logged out: Show marketing homepage
 * - Logged in: Redirect to /dashboard
 *
 * This provides a seamless UX similar to Linear, Notion, etc.
 */
export default function RootPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // User is authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else if (isLoaded && !isSignedIn) {
      // User is not authenticated, redirect to marketing homepage
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
