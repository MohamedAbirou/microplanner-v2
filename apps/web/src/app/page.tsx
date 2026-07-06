'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Root page - Smart redirect based on authentication status
 *
 * - Logged in: middleware redirects to /dashboard before this renders
 * - Logged out: redirect to /home (full marketing site)
 */
export default function RootPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fallback if Clerk is slow — still send guests to marketing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        router.replace('/home');
      }
    }, 2500);
    return () => clearTimeout(timeout);
  }, [isLoaded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
