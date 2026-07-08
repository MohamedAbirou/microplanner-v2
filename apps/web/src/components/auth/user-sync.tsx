'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { REDEEM_REFERRAL } from '@/graphql/operations-extended';

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
const REF_CODE_KEY = 'mp_ref_code';

/**
 * Ensures the Clerk user exists in our database once per browser session.
 * Intentionally does NOT retry on failure — JWT auth + webhooks create users
 * on the first successful API call anyway; hammering syncUser caused 429s.
 */
export function UserSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [syncUser] = useMutation(SYNC_USER);
  const [redeemReferral] = useMutation(REDEEM_REFERRAL);
  const attemptedRef = useRef(false);

  // Capture a `?ref=` code as early as possible (before Clerk's redirect can
  // drop it), so it survives sign-up and can be redeemed once the user exists.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code) {
      try {
        localStorage.setItem(REF_CODE_KEY, code);
      } catch {
        /* ignore */
      }
    }
  }, []);

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

        // Redeem a captured referral code now that the user record exists.
        // Backend is idempotent + self-referral-safe, so a best-effort call is
        // fine; clear the code either way so it isn't retried forever.
        try {
          const code =
            typeof window !== 'undefined' ? localStorage.getItem(REF_CODE_KEY) : null;
          if (code) {
            await redeemReferral({ variables: { code } });
            localStorage.removeItem(REF_CODE_KEY);
          }
        } catch {
          /* referral redemption is non-critical */
        }
      } catch (error) {
        // One attempt per session — avoid retry storms when DB is out of sync.
        console.warn('[UserSync] Could not sync user (will retry next session):', error);
      }
    })();
  }, [isLoaded, isSignedIn, user?.id, syncUser, redeemReferral]);

  return null;
}
