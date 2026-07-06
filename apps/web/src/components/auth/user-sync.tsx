'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

/**
 * Mutation to sync/create user in database
 */
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

/**
 * UserSync Component - GraphQL Version
 *
 * Syncs authenticated Clerk user to database via GraphQL
 * This ensures the user exists in our DB with proper metadata
 */
export function UserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [syncUser] = useMutation(SYNC_USER);

  useEffect(() => {
    async function syncUserToDatabase() {
      if (!isSignedIn || !user) {
        return;
      }

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

        console.log('[UserSync] User synced to database via GraphQL');
      } catch (error) {
        console.error('[UserSync] Failed to sync user:', error);
      }
    }

    syncUserToDatabase();
  }, [isSignedIn, user, syncUser]);

  return null;
}
