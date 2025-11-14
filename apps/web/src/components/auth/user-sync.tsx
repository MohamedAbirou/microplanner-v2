'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * UserSync Component
 *
 * Automatically syncs the authenticated Clerk user to the backend database.
 * This ensures users are created via JIT (Just-In-Time) creation when they
 * first authenticate, without relying on webhooks (which don't work on localhost).
 *
 * How it works:
 * 1. When user authenticates, this component detects it
 * 2. Makes a request to /api/auth/me endpoint
 * 3. Backend's ClerkAuthGuard validates the token
 * 4. AuthService checks if user exists in DB
 * 5. If not, creates user from Clerk data (JIT creation)
 *
 * This component should be placed in the root layout.
 */
export function UserSync() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    async function syncUser() {
      // Only sync if user is signed in
      if (!isSignedIn || !user) {
        return;
      }

      try {
        // Get the auth token
        const token = await getToken();

        if (!token) {
          console.warn('[UserSync] No auth token available');
          return;
        }

        // Call the backend /api/auth/me endpoint
        // This triggers the ClerkAuthGuard which validates the token
        // and calls AuthService.validateClerkUser which does JIT creation
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[UserSync] User synced to database:', data.email);
        } else {
          console.error('[UserSync] Failed to sync user:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[UserSync] Error syncing user:', error);
      }
    }

    // Sync user when component mounts and user is signed in
    syncUser();
  }, [isSignedIn, user, getToken]);

  // This component doesn't render anything
  return null;
}
