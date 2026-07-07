'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const SYNC_USER = gql`
  mutation SyncUser($input: SyncUserInput!) {
    syncUser(input: $input) {
      id
      email
      name
      tier
      onboardingCompleted
    }
  }
`;

const SYNC_SESSION_PREFIX = 'mp_user_synced:';

/**
 * Ensures the Clerk user exists in our database once per browser session.
 * Intentionally does NOT retry on failure — JWT auth + webhooks create users
 * on the first successful API call anyway; hammering syncUser caused 429s.
 */
export function UserSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [syncUser] = useMutation(SYNC_USER);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id || attemptedRef.current) {
      return;
    }

    const sessionKey = `${SYNC_SESSION_PREFIX}${user.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      attemptedRef.current = true;
      return;
    }

    attemptedRef.current = true;

    void (async () => {
      try {
        await syncUser({
          variables: {
            input: {
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              name: user.fullName || user.firstName || '',
              avatar: user.imageUrl || null,
            },
          },
        });
        sessionStorage.setItem(sessionKey, '1');
      } catch (error) {
        // One attempt per session — avoid retry storms when DB is out of sync.
        console.warn('[UserSync] Could not sync user (will retry next session):', error);
      }
    })();
  }, [isLoaded, isSignedIn, user?.id, syncUser]);

  return null;
}
