'use client';

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { toast } from 'sonner';
import * as ops from '@/graphql/operations-extended';

/**
 * Extended GraphQL Hooks for Enterprise Features
 *
 * This file contains hooks for:
 * - Analytics & Insights
 * - Productivity Features (Work Hours, Focus Time, Kanban, Smart 1:1s, Notifications)
 * - Calendar Integrations
 * - Teams & API Keys
 * - Scheduling Links
 * - Third-party Integrations & Webhooks
 * - Billing & Subscriptions
 */

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

export function useDashboardStats() {
  const { data, loading, error, refetch } = useQuery(ops.GET_DASHBOARD_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.dashboardStats,
    loading,
    error,
    refetch,
  };
}

export function useWeeklyStats(weekStart?: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_WEEKLY_STATS, {
    variables: { weekStart },
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.weeklyStats,
    loading,
    error,
    refetch,
  };
}

export function useProductivityScores(startDate: string, endDate: string) {
  const { data, loading, error } = useQuery(ops.GET_PRODUCTIVITY_SCORES, {
    variables: { startDate, endDate },
  });

  return {
    scores: data?.productivityScores || [],
    loading,
    error,
  };
}

export function useInsights(type?: string, limit?: number) {
  const { data, loading, error, refetch } = useQuery(ops.GET_INSIGHTS, {
    variables: { type, limit },
  });

  return {
    insights: data?.insights || [],
    loading,
    error,
    refetch,
  };
}

export function useGenerateInsights() {
  const [generateInsights, { loading, error }] = useMutation(ops.GENERATE_INSIGHTS, {
    refetchQueries: [{ query: ops.GET_INSIGHTS }],
    onCompleted: (data) => {
      toast.success(`Generated ${data.generateInsights.length} new insights`);
    },
    onError: (error) => {
      toast.error('Failed to generate insights', {
        description: error.message,
      });
    },
  });

  return { generateInsights, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - WORK HOURS
// ============================================================================

export function useWorkHours() {
  const { data, loading, error, refetch } = useQuery(ops.GET_WORK_HOURS);

  return {
    workHours: data?.workHours,
    loading,
    error,
    refetch,
  };
}

export function useUpdateWorkHours() {
  const [updateWorkHours, { loading, error }] = useMutation(ops.UPDATE_WORK_HOURS, {
    refetchQueries: [{ query: ops.GET_WORK_HOURS }],
    onCompleted: () => {
      toast.success('Work hours updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update work hours', {
        description: error.message,
      });
    },
  });

  return { updateWorkHours, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - FOCUS TIME
// ============================================================================

export function useFocusTimeBlocks(isActive?: boolean) {
  const { data, loading, error, refetch } = useQuery(ops.GET_FOCUS_TIME_BLOCKS, {
    variables: { isActive },
  });

  return {
    focusBlocks: data?.focusTimeBlocks || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateFocusBlock() {
  const [createFocusBlock, { loading, error }] = useMutation(ops.CREATE_FOCUS_BLOCK, {
    refetchQueries: [{ query: ops.GET_FOCUS_TIME_BLOCKS }],
    onCompleted: () => {
      toast.success('Focus block created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create focus block', {
        description: error.message,
      });
    },
  });

  return { createFocusBlock, loading, error };
}

export function useUpdateFocusBlock() {
  const [updateFocusBlock, { loading, error }] = useMutation(ops.UPDATE_FOCUS_BLOCK, {
    refetchQueries: [{ query: ops.GET_FOCUS_TIME_BLOCKS }],
    onCompleted: () => {
      toast.success('Focus block updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update focus block', {
        description: error.message,
      });
    },
  });

  return { updateFocusBlock, loading, error };
}

export function useDeleteFocusBlock() {
  const [deleteFocusBlock, { loading, error }] = useMutation(ops.DELETE_FOCUS_BLOCK, {
    refetchQueries: [{ query: ops.GET_FOCUS_TIME_BLOCKS }],
    onCompleted: () => {
      toast.success('Focus block deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete focus block', {
        description: error.message,
      });
    },
  });

  return { deleteFocusBlock, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - KANBAN BOARDS
// ============================================================================

export function useKanbanBoards(projectId?: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_KANBAN_BOARDS, {
    variables: { projectId },
  });

  return {
    boards: data?.kanbanBoards || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateKanbanBoard() {
  const [createKanbanBoard, { loading, error }] = useMutation(ops.CREATE_KANBAN_BOARD, {
    refetchQueries: [{ query: ops.GET_KANBAN_BOARDS }],
    onCompleted: () => {
      toast.success('Kanban board created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create kanban board', {
        description: error.message,
      });
    },
  });

  return { createKanbanBoard, loading, error };
}

export function useMoveTaskInKanban() {
  const [moveTaskInKanban, { loading, error }] = useMutation(ops.MOVE_TASK_IN_KANBAN, {
    onCompleted: () => {
      // Silent success, no toast for drag-drop
    },
    onError: (error) => {
      toast.error('Failed to move task', {
        description: error.message,
      });
    },
  });

  return { moveTaskInKanban, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - SMART 1:1 MEETINGS
// ============================================================================

export function useSmart1on1s() {
  const { data, loading, error, refetch } = useQuery(ops.GET_SMART_1ON1S);

  return {
    smart1on1s: data?.smart1on1s || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateSmart1on1() {
  const [createSmart1on1, { loading, error }] = useMutation(ops.CREATE_SMART_1ON1, {
    refetchQueries: [{ query: ops.GET_SMART_1ON1S }],
    onCompleted: () => {
      toast.success('Smart 1:1 created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create Smart 1:1', {
        description: error.message,
      });
    },
  });

  return { createSmart1on1, loading, error };
}

export function useUpdateSmart1on1() {
  const [updateSmart1on1, { loading, error }] = useMutation(ops.UPDATE_SMART_1ON1, {
    refetchQueries: [{ query: ops.GET_SMART_1ON1S }],
    onCompleted: () => {
      toast.success('Smart 1:1 updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update Smart 1:1', {
        description: error.message,
      });
    },
  });

  return { updateSmart1on1, loading, error };
}

export function useDeleteSmart1on1() {
  const [deleteSmart1on1, { loading, error }] = useMutation(ops.DELETE_SMART_1ON1, {
    refetchQueries: [{ query: ops.GET_SMART_1ON1S }],
    onCompleted: () => {
      toast.success('Smart 1:1 deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete Smart 1:1', {
        description: error.message,
      });
    },
  });

  return { deleteSmart1on1, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - NOTIFICATIONS
// ============================================================================

export function useNotifications(unreadOnly?: boolean) {
  const { data, loading, error, refetch } = useQuery(ops.GET_NOTIFICATIONS, {
    variables: { unreadOnly },
    pollInterval: unreadOnly ? 30000 : 0, // Poll every 30s for unread
  });

  return {
    notifications: data?.notifications || [],
    loading,
    error,
    refetch,
  };
}

export function useNotificationPreferences() {
  const { data, loading, error, refetch } = useQuery(ops.GET_NOTIFICATION_PREFERENCES);

  return {
    preferences: data?.notificationPreferences,
    loading,
    error,
    refetch,
  };
}

export function useMarkNotificationAsRead() {
  const [markAsRead, { loading, error }] = useMutation(ops.MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [{ query: ops.GET_NOTIFICATIONS }],
  });

  return { markAsRead, loading, error };
}

export function useUpdateNotificationPreferences() {
  const [updatePreferences, { loading, error }] = useMutation(ops.UPDATE_NOTIFICATION_PREFERENCES, {
    refetchQueries: [{ query: ops.GET_NOTIFICATION_PREFERENCES }],
    onCompleted: () => {
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      toast.error('Failed to update preferences', {
        description: error.message,
      });
    },
  });

  return { updatePreferences, loading, error };
}

// ============================================================================
// CALENDAR INTEGRATIONS
// ============================================================================

export function useCalendarConnections() {
  const { data, loading, error, refetch } = useQuery(ops.GET_CALENDAR_CONNECTIONS);

  return {
    connections: data?.calendarConnections || [],
    loading,
    error,
    refetch,
  };
}

export function useInitiateCalendarAuth() {
  const [initiateAuth, { loading, error }] = useMutation(ops.INITIATE_CALENDAR_AUTH);

  return { initiateAuth, loading, error };
}

export function useConnectCalendarWithCode() {
  const [connectCalendar, { loading, error }] = useMutation(ops.CONNECT_CALENDAR_WITH_CODE, {
    refetchQueries: [{ query: ops.GET_CALENDAR_CONNECTIONS }],
    onCompleted: (data) => {
      toast.success(`Connected to ${data.connectCalendar.provider} calendar`);
    },
    onError: (error) => {
      toast.error('Failed to connect calendar', {
        description: error.message,
      });
    },
  });

  return { connectCalendar, loading, error };
}

export function useDisconnectCalendarConnection() {
  const [disconnectCalendar, { loading, error }] = useMutation(ops.DISCONNECT_CALENDAR_CONNECTION, {
    refetchQueries: [{ query: ops.GET_CALENDAR_CONNECTIONS }],
    onCompleted: () => {
      toast.success('Calendar disconnected successfully');
    },
    onError: (error) => {
      toast.error('Failed to disconnect calendar', {
        description: error.message,
      });
    },
  });

  return { disconnectCalendar, loading, error };
}

export function useSyncCalendarConnection() {
  const [syncCalendar, { loading, error }] = useMutation(ops.SYNC_CALENDAR_CONNECTION, {
    onCompleted: () => {
      toast.success('Calendar synced successfully');
    },
    onError: (error) => {
      toast.error('Failed to sync calendar', {
        description: error.message,
      });
    },
  });

  return { syncCalendar, loading, error };
}

export function useCalendarEvents(startDate: string, endDate: string, calendarIds?: string[]) {
  const { data, loading, error, refetch } = useQuery(ops.GET_CALENDAR_EVENTS, {
    variables: { startDate, endDate, calendarIds },
  });

  return {
    events: data?.calendarEvents || [],
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// TEAMS & API KEYS
// ============================================================================

export function useTeams() {
  const { data, loading, error, refetch } = useQuery(ops.GET_TEAMS);

  return {
    teams: data?.teams || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateTeam() {
  const [createTeam, { loading, error }] = useMutation(ops.CREATE_TEAM, {
    refetchQueries: [{ query: ops.GET_TEAMS }],
    onCompleted: () => {
      toast.success('Team created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create team', {
        description: error.message,
      });
    },
  });

  return { createTeam, loading, error };
}

export function useTeamMembers(teamId: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_TEAM_MEMBERS, {
    variables: { teamId },
    skip: !teamId,
  });

  return {
    members: data?.teamMembers || [],
    loading,
    error,
    refetch,
  };
}

export function useInviteTeamMember() {
  const [inviteMember, { loading, error }] = useMutation(ops.INVITE_TEAM_MEMBER, {
    onCompleted: () => {
      toast.success('Team invitation sent');
    },
    onError: (error) => {
      toast.error('Failed to invite member', {
        description: error.message,
      });
    },
  });

  return { inviteMember, loading, error };
}

export function useApiKeys() {
  const { data, loading, error, refetch } = useQuery(ops.GET_API_KEYS);

  return {
    apiKeys: data?.apiKeys || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateApiKey() {
  const [createApiKey, { loading, error }] = useMutation(ops.CREATE_API_KEY, {
    refetchQueries: [{ query: ops.GET_API_KEYS }],
    onCompleted: (data) => {
      toast.success('API key created successfully', {
        description: `Key: ${data.createApiKey.key}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create API key', {
        description: error.message,
      });
    },
  });

  return { createApiKey, loading, error };
}

export function useDeleteApiKey() {
  const [deleteApiKey, { loading, error }] = useMutation(ops.DELETE_API_KEY, {
    refetchQueries: [{ query: ops.GET_API_KEYS }],
    onCompleted: () => {
      toast.success('API key deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete API key', {
        description: error.message,
      });
    },
  });

  return { deleteApiKey, loading, error };
}

// ============================================================================
// SCHEDULING LINKS (Calendly-like)
// ============================================================================

export function useSchedulingLinks() {
  const { data, loading, error, refetch } = useQuery(ops.GET_SCHEDULING_LINKS);

  return {
    links: data?.schedulingLinks || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateSchedulingLink() {
  const [createLink, { loading, error }] = useMutation(ops.CREATE_SCHEDULING_LINK, {
    refetchQueries: [{ query: ops.GET_SCHEDULING_LINKS }],
    onCompleted: () => {
      toast.success('Scheduling link created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create scheduling link', {
        description: error.message,
      });
    },
  });

  return { createLink, loading, error };
}

export function useBookings(linkId?: string, status?: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_BOOKINGS, {
    variables: { linkId, status },
  });

  return {
    bookings: data?.bookings || [],
    loading,
    error,
    refetch,
  };
}

export function useConfirmBooking() {
  const [confirmBooking, { loading, error }] = useMutation(ops.CONFIRM_BOOKING, {
    refetchQueries: [{ query: ops.GET_BOOKINGS }],
    onCompleted: () => {
      toast.success('Booking confirmed successfully');
    },
    onError: (error) => {
      toast.error('Failed to confirm booking', {
        description: error.message,
      });
    },
  });

  return { confirmBooking, loading, error };
}

export function useCancelBooking() {
  const [cancelBooking, { loading, error }] = useMutation(ops.CANCEL_BOOKING, {
    refetchQueries: [{ query: ops.GET_BOOKINGS }],
    onCompleted: () => {
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      toast.error('Failed to cancel booking', {
        description: error.message,
      });
    },
  });

  return { cancelBooking, loading, error };
}

// ============================================================================
// INTEGRATIONS & WEBHOOKS
// ============================================================================

export function useIntegrations(type?: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_INTEGRATIONS, {
    variables: { type },
  });

  return {
    integrations: data?.integrations || [],
    loading,
    error,
    refetch,
  };
}

export function useConnectIntegration() {
  const [connectIntegration, { loading, error }] = useMutation(ops.CONNECT_INTEGRATION, {
    refetchQueries: [{ query: ops.GET_INTEGRATIONS }],
    onCompleted: (data) => {
      toast.success(`Connected to ${data.connectIntegration.type} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to connect integration', {
        description: error.message,
      });
    },
  });

  return { connectIntegration, loading, error };
}

export function useWebhooks() {
  const { data, loading, error, refetch } = useQuery(ops.GET_WEBHOOKS);

  return {
    webhooks: data?.webhooks || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateWebhook() {
  const [createWebhook, { loading, error }] = useMutation(ops.CREATE_WEBHOOK, {
    refetchQueries: [{ query: ops.GET_WEBHOOKS }],
    onCompleted: () => {
      toast.success('Webhook created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create webhook', {
        description: error.message,
      });
    },
  });

  return { createWebhook, loading, error };
}

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export function useBillingSubscription() {
  const { data, loading, error, refetch } = useQuery(ops.GET_SUBSCRIPTION);

  return {
    subscription: data?.subscription,
    loading,
    error,
    refetch,
  };
}

export function useUsageStats() {
  const { data, loading, error, refetch } = useQuery(ops.GET_USAGE_STATS);

  return {
    usage: data?.usageStats,
    loading,
    error,
    refetch,
  };
}

export function useCreateCheckoutSession() {
  const [createCheckout, { loading, error }] = useMutation(ops.CREATE_CHECKOUT_SESSION, {
    onCompleted: (data) => {
      // Redirect to Stripe checkout
      if (data.createCheckoutSession.url) {
        window.location.href = data.createCheckoutSession.url;
      }
    },
    onError: (error) => {
      toast.error('Failed to create checkout session', {
        description: error.message,
      });
    },
  });

  return { createCheckout, loading, error };
}

export function useCancelSubscription() {
  const [cancelSubscription, { loading, error }] = useMutation(ops.CANCEL_SUBSCRIPTION, {
    refetchQueries: [{ query: ops.GET_SUBSCRIPTION }],
    onCompleted: () => {
      toast.success('Subscription will be cancelled at period end');
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription', {
        description: error.message,
      });
    },
  });

  return { cancelSubscription, loading, error };
}

export function useCreateBillingPortalSession() {
  const [createPortalSession, { loading, error }] = useMutation(ops.CREATE_BILLING_PORTAL_SESSION, {
    onCompleted: (data) => {
      // Redirect to Stripe billing portal
      if (data.createBillingPortalSession.url) {
        window.location.href = data.createBillingPortalSession.url;
      }
    },
    onError: (error) => {
      toast.error('Failed to open billing portal', {
        description: error.message,
      });
    },
  });

  return { createPortalSession, loading, error };
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function useNotificationSubscription() {
  const { data } = useSubscription(ops.NOTIFICATION_RECEIVED, {
    onData: ({ data }) => {
      const notification = data.data?.notificationReceived;
      if (notification) {
        toast.info(notification.title, {
          description: notification.message,
        });
      }
    },
  });

  return {
    notification: data?.notificationReceived,
  };
}

export function useKanbanBoardSubscription() {
  const { data } = useSubscription(ops.KANBAN_BOARD_UPDATED, {
    onData: () => {
      // Silent update, refetch will happen automatically
    },
  });

  return {
    board: data?.kanbanBoardUpdated,
  };
}

export function useFocusTimeSubscription() {
  const { data } = useSubscription(ops.FOCUS_TIME_CREATED, {
    onData: ({ data }) => {
      const focusTime = data.data?.focusTimeCreated;
      if (focusTime) {
        toast.info('Focus time scheduled', {
          description: `${focusTime.title} for ${focusTime.durationMinutes} minutes`,
        });
      }
    },
  });

  return {
    focusTime: data?.focusTimeCreated,
  };
}
