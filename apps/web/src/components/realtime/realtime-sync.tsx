'use client';

import { useSubscription } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { TASK_UPDATED, GOAL_UPDATED } from '@/graphql/operations';

/**
 * Mounts the task/goal update subscriptions app-wide. Apollo normalizes each
 * subscription result into the cache by id, so an edit made on another device
 * updates any list/detail showing that entity live — no refetch needed.
 *
 * The gateway filters by the authenticated user, so the `userId` variable only
 * needs to be present to satisfy the schema (the value is not used to route).
 */
export function RealtimeSync() {
  const { user } = useUser();
  const userId = user?.id;

  useSubscription(TASK_UPDATED, {
    variables: { userId: userId || '' },
    skip: !userId,
    onData: ({ data }) => {
      const title = data.data?.taskUpdated?.title;
      // Subtle, non-blocking hint. Cache merge already refreshed the UI.
      if (title) toast('Task updated', { description: title, duration: 2000 });
    },
  });

  useSubscription(GOAL_UPDATED, {
    variables: { userId: userId || '' },
    skip: !userId,
  });

  return null;
}
