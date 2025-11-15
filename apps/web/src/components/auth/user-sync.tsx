'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * UserSync Component - Debug Version
 *
 * Temporarily logs the token to help debug authentication issues.
 */
export function UserSync() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    async function syncUser() {
      if (!isSignedIn || !user) {
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          console.warn('[UserSync] No auth token available');
          return;
        }

        // DEBUG: Decode JWT to see what's inside
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('[UserSync] Token payload:', {
            iss: payload.iss,
            aud: payload.aud,
            sub: payload.sub,
            exp: payload.exp,
          });
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
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
          const errorData = await response.json().catch(() => ({}));
          console.error('[UserSync] Failed to sync user:', response.status, response.statusText, errorData);
        }
      } catch (error) {
        console.error('[UserSync] Error syncing user:', error);
      }
    }

    syncUser();
  }, [isSignedIn, user, getToken]);

  return null;
}
