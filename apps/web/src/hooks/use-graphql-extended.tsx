'use client';

import { useQuery, useLazyQuery, useMutation, useSubscription } from '@apollo/client';
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
// PLAN TEMPLATES
// ============================================================================

export function usePlanTemplates(variables?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) {
  const { data, loading, error, refetch } = useQuery(ops.GET_PLAN_TEMPLATES, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {
    templates: data?.planTemplates || [],
    loading,
    error,
    refetch,
  };
}

export function useSaveAsPlanTemplate() {
  const [saveAsTemplate, { loading, error }] = useMutation(ops.SAVE_AS_PLAN_TEMPLATE, {
    refetchQueries: [{ query: ops.GET_PLAN_TEMPLATES }],
    onCompleted: () => {
      toast.success('Saved as template');
    },
    onError: (error) => {
      toast.error('Failed to save template', { description: error.message });
    },
  });

  return { saveAsTemplate, loading, error };
}

export function useGeneratePlanFromTemplate() {
  const [generateFromTemplate, { loading, error }] = useMutation(ops.GENERATE_PLAN_FROM_TEMPLATE, {
    onError: (error) => {
      toast.error('Failed to generate plan from template', { description: error.message });
    },
  });

  return { generateFromTemplate, loading, error };
}

export function useSetDefaultPlanTemplate() {
  const [setDefaultTemplate, { loading, error }] = useMutation(ops.SET_DEFAULT_PLAN_TEMPLATE, {
    refetchQueries: [{ query: ops.GET_PLAN_TEMPLATES }],
    onCompleted: () => {
      toast.success('Default template updated');
    },
    onError: (error) => {
      toast.error('Failed to set default template', { description: error.message });
    },
  });

  return { setDefaultTemplate, loading, error };
}

export function useDeletePlanTemplate() {
  const [deleteTemplate, { loading, error }] = useMutation(ops.DELETE_PLAN_TEMPLATE, {
    refetchQueries: [{ query: ops.GET_PLAN_TEMPLATES }],
    onCompleted: () => {
      toast.success('Template deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete template', { description: error.message });
    },
  });

  return { deleteTemplate, loading, error };
}

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

export function useWeeklyReview() {
  const { data, loading, error, refetch } = useQuery(ops.GET_WEEKLY_REVIEW, {
    fetchPolicy: 'cache-and-network',
  });

  return {
    review: data?.weeklyReview || null,
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
// PRODUCTIVITY FEATURES - NO MEETING DAYS
// ============================================================================

export function useNoMeetingDays(isActive?: boolean) {
  const { data, loading, error, refetch } = useQuery(ops.GET_NO_MEETING_DAYS, {
    variables: { isActive },
  });

  return {
    noMeetingDays: data?.noMeetingDays || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateNoMeetingDay() {
  const [createNoMeetingDay, { loading, error }] = useMutation(ops.CREATE_NO_MEETING_DAY, {
    refetchQueries: [{ query: ops.GET_NO_MEETING_DAYS, variables: { isActive: undefined } }],
    onCompleted: () => {
      toast.success('No-meeting day added');
    },
    onError: (error) => {
      toast.error('Failed to add no-meeting day', { description: error.message });
    },
  });

  return { createNoMeetingDay, loading, error };
}

export function useDeleteNoMeetingDay() {
  const [deleteNoMeetingDay, { loading, error }] = useMutation(ops.DELETE_NO_MEETING_DAY, {
    refetchQueries: [{ query: ops.GET_NO_MEETING_DAYS, variables: { isActive: undefined } }],
    onCompleted: () => {
      toast.success('No-meeting day removed');
    },
    onError: (error) => {
      toast.error('Failed to remove no-meeting day', { description: error.message });
    },
  });

  return { deleteNoMeetingDay, loading, error };
}

// ============================================================================
// PRODUCTIVITY FEATURES - CALENDAR DEFENSE
// ============================================================================

export function useCalendarDefense() {
  const { data, loading, error, refetch } = useQuery(ops.GET_CALENDAR_DEFENSE);

  return {
    calendarDefense: data?.calendarDefense,
    loading,
    error,
    refetch,
  };
}

export function useUpdateCalendarDefense() {
  const [updateCalendarDefense, { loading, error }] = useMutation(ops.UPDATE_CALENDAR_DEFENSE, {
    onCompleted: () => {
      toast.success('Calendar defense updated');
    },
    onError: (error) => {
      toast.error('Failed to update calendar defense', { description: error.message });
    },
  });

  return { updateCalendarDefense, loading, error };
}

export function useHabits() {
  const { data, loading, refetch } = useQuery(ops.GET_HABITS, { fetchPolicy: 'cache-and-network' });
  return { habits: data?.habits || [], loading, refetch };
}

export function useCreateHabit() {
  const [createHabit, { loading }] = useMutation(ops.CREATE_HABIT, {
    refetchQueries: [{ query: ops.GET_HABITS }],
    onCompleted: () => toast.success('Habit added'),
    onError: (error) => toast.error('Failed to add habit', { description: error.message }),
  });
  return { createHabit, loading };
}

export function useUpdateHabit() {
  const [updateHabit, { loading }] = useMutation(ops.UPDATE_HABIT, {
    refetchQueries: [{ query: ops.GET_HABITS }],
    onError: (error) => toast.error('Failed to update habit', { description: error.message }),
  });
  return { updateHabit, loading };
}

export function useDeleteHabit() {
  const [deleteHabit, { loading }] = useMutation(ops.DELETE_HABIT, {
    refetchQueries: [{ query: ops.GET_HABITS }],
    onCompleted: () => toast.success('Habit removed'),
    onError: (error) => toast.error('Failed to remove habit', { description: error.message }),
  });
  return { deleteHabit, loading };
}

export function useCalendarDefenseLog(limit = 20) {
  const { data, loading, refetch } = useQuery(ops.GET_CALENDAR_DEFENSE_LOG, {
    variables: { limit },
    fetchPolicy: 'cache-and-network',
  });
  return { log: data?.calendarDefenseLog || [], loading, refetch };
}

export function useRunCalendarDefense() {
  const [runDefense, { loading }] = useMutation(ops.RUN_CALENDAR_DEFENSE, {
    refetchQueries: [{ query: ops.GET_CALENDAR_DEFENSE_LOG, variables: { limit: 20 } }],
    onCompleted: (data) => {
      const n = data?.runCalendarDefense?.actions ?? 0;
      toast.success(n > 0 ? `Defended ${n} meeting${n === 1 ? '' : 's'}` : 'No meetings needed defending');
    },
    onError: (error) => toast.error('Defense run failed', { description: error.message }),
  });
  return { runDefense, loading };
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

export function useScheduleSmart1on1() {
  const [scheduleSmart1on1, { loading }] = useMutation(ops.SCHEDULE_SMART_1ON1, {
    refetchQueries: [{ query: ops.GET_SMART_1ON1S }],
    onCompleted: (data) => {
      const when = data?.scheduleSmart1on1?.nextMeetingDate;
      toast.success(
        when
          ? `Scheduled for ${new Date(when).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
          : 'Next 1:1 scheduled',
      );
    },
    onError: (error) => toast.error('Could not schedule 1:1', { description: error.message }),
  });
  return { scheduleSmart1on1, loading };
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

export function useCalendarEvents(
  startDate: string,
  endDate: string,
  calendarIds?: string[],
  options?: { skip?: boolean }
) {
  const { data, loading, error, refetch } = useQuery(ops.GET_CALENDAR_EVENTS, {
    variables: { startDate, endDate, calendarIds },
    skip: options?.skip,
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

// ============================================================================
// REFERRALS
// ============================================================================

export function useReferralStats() {
  const { data, loading, error, refetch } = useQuery(ops.GET_MY_REFERRAL_STATS);
  return {
    stats: data?.myReferralStats || null,
    loading,
    error,
    refetch,
  };
}

export function useRedeemReferral() {
  const [redeemReferral, { loading, error }] = useMutation(ops.REDEEM_REFERRAL);
  return { redeemReferral, loading, error };
}

// ============================================================================
// AI MEMORY (scheduling overrides)
// ============================================================================

export function useAiMemories() {
  const { data, loading, error, refetch } = useQuery(ops.GET_AI_MEMORIES);
  return {
    memories: data?.aiMemories || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateAiMemory() {
  const [createAiMemory, { loading, error }] = useMutation(ops.CREATE_AI_MEMORY, {
    refetchQueries: [{ query: ops.GET_AI_MEMORIES }],
    onCompleted: () => {
      toast.success('Preference saved — the planner will honour it');
    },
    onError: (error) => {
      toast.error('Failed to save preference', { description: error.message });
    },
  });
  return { createAiMemory, loading, error };
}

export function useDeleteAiMemory() {
  const [deleteAiMemory, { loading, error }] = useMutation(ops.DELETE_AI_MEMORY, {
    refetchQueries: [{ query: ops.GET_AI_MEMORIES }],
    onCompleted: () => {
      toast.success('Preference removed');
    },
    onError: (error) => {
      toast.error('Failed to remove preference', { description: error.message });
    },
  });
  return { deleteAiMemory, loading, error };
}

// ============================================================================
// PROJECTS & KANBAN
// ============================================================================

export function useProjects(includeArchived = false) {
  const { data, loading, error, refetch } = useQuery(ops.GET_PROJECTS, {
    variables: { includeArchived, orderBy: 'CREATED_DESC' },
  });

  return {
    projects: data?.projects || [],
    loading,
    error,
    refetch,
  };
}

export function useProjectBoard(id?: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_PROJECT_BOARD, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    project: data?.project || null,
    loading,
    error,
    refetch,
  };
}

export function useCreateProject() {
  const [createProject, { loading, error }] = useMutation(ops.CREATE_PROJECT, {
    refetchQueries: [{ query: ops.GET_PROJECTS, variables: { includeArchived: false, orderBy: 'CREATED_DESC' } }],
    onCompleted: () => {
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Failed to create project', { description: error.message });
    },
  });

  return { createProject, loading, error };
}

export function useDeleteProject() {
  const [deleteProject, { loading, error }] = useMutation(ops.DELETE_PROJECT, {
    refetchQueries: [{ query: ops.GET_PROJECTS, variables: { includeArchived: false, orderBy: 'CREATED_DESC' } }],
    onCompleted: () => {
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project', { description: error.message });
    },
  });

  return { deleteProject, loading, error };
}

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

export function useAcceptTeamInvitation() {
  const [acceptInvitation, { loading, error }] = useMutation(ops.ACCEPT_TEAM_INVITATION);
  return { acceptInvitation, loading, error };
}

export function useTeamDashboard(teamId: string) {
  const { data, loading, error, refetch } = useQuery(ops.GET_TEAM_DASHBOARD, {
    variables: { teamId },
    skip: !teamId,
    fetchPolicy: 'cache-and-network',
  });
  return { dashboard: data?.teamDashboard || null, loading, error, refetch };
}

export function useDeleteTeam() {
  const [deleteTeam, { loading, error }] = useMutation(ops.DELETE_TEAM, {
    refetchQueries: [{ query: ops.GET_TEAMS }],
    onCompleted: () => {
      toast.success('Team deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete team', { description: error.message });
    },
  });

  return { deleteTeam, loading, error };
}

export function useRemoveTeamMember() {
  const [removeTeamMember, { loading, error }] = useMutation(ops.REMOVE_TEAM_MEMBER, {
    onCompleted: () => {
      toast.success('Member removed');
    },
    onError: (error) => {
      toast.error('Failed to remove member', { description: error.message });
    },
  });

  return { removeTeamMember, loading, error };
}

export function useUpdateTeamMemberRole() {
  const [updateTeamMemberRole, { loading, error }] = useMutation(ops.UPDATE_TEAM_MEMBER_ROLE, {
    onCompleted: () => {
      toast.success('Role updated');
    },
    onError: (error) => {
      toast.error('Failed to update role', { description: error.message });
    },
  });

  return { updateTeamMemberRole, loading, error };
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

export function useDeleteSchedulingLink() {
  const [deleteLink, { loading, error }] = useMutation(ops.DELETE_SCHEDULING_LINK, {
    refetchQueries: [{ query: ops.GET_SCHEDULING_LINKS }],
    onCompleted: () => {
      toast.success('Scheduling link deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete link', { description: error.message });
    },
  });

  return { deleteLink, loading, error };
}

export function useToggleSchedulingLink() {
  const [toggleLink, { loading, error }] = useMutation(ops.TOGGLE_SCHEDULING_LINK, {
    onError: (error) => {
      toast.error('Failed to update link', { description: error.message });
    },
  });

  return { toggleLink, loading, error };
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

/**
 * Kicks off a real OAuth handshake. Returns the provider authorize URL; the
 * caller is responsible for redirecting the browser to it. Nothing is marked
 * connected until the provider calls back and a token is stored.
 */
export function useDailyRitual(date: string) {
  const { data, loading, refetch } = useQuery(ops.GET_DAILY_RITUAL, {
    variables: { date },
    skip: !date,
    fetchPolicy: 'cache-and-network',
  });
  return { ritual: data?.dailyRitual || null, loading, refetch };
}

export function useUpdateDailyRitual() {
  const [updateDailyRitual, { loading }] = useMutation(ops.UPDATE_DAILY_RITUAL, {
    onError: (error) => toast.error('Failed to save', { description: error.message }),
  });
  return { updateDailyRitual, loading };
}

export function usePmInboxTasks() {
  const { data, loading, refetch } = useQuery(ops.PM_INBOX_TASKS, { fetchPolicy: 'cache-and-network' });
  return { inbox: (data?.pmInboxTasks || []) as any[], loading, refetch };
}

export function useImportPmTasks() {
  const [importPmTasks, { loading }] = useMutation(ops.IMPORT_PM_TASKS, {
    onError: (error) => toast.error('Import failed', { description: error.message }),
  });
  return { importPmTasks, loading };
}

export function useInitiateIntegrationOAuth() {
  const [initiateOAuth, { loading, error }] = useMutation(ops.INITIATE_INTEGRATION_OAUTH, {
    onError: (error) => {
      toast.error('Could not start connection', { description: error.message });
    },
  });

  return { initiateOAuth, loading, error };
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

export function useDisconnectIntegration() {
  const [disconnectIntegration, { loading, error }] = useMutation(ops.DISCONNECT_INTEGRATION, {
    refetchQueries: [{ query: ops.GET_INTEGRATIONS }],
    onCompleted: () => {
      toast.success('Integration disconnected');
    },
    onError: (error) => {
      toast.error('Failed to disconnect', { description: error.message });
    },
  });

  return { disconnectIntegration, loading, error };
}

export function useSyncIntegration() {
  const [syncIntegration, { loading, error }] = useMutation(ops.SYNC_INTEGRATION, {
    onCompleted: (data) => {
      const stats = data?.syncIntegration?.config?.lastSyncStats;
      if (stats && (stats.imported || stats.updated || stats.completed)) {
        toast.success(
          `Synced — ${stats.imported} imported, ${stats.updated} updated, ${stats.completed} completed`,
        );
      } else {
        toast.success('Sync complete — nothing new');
      }
    },
    onError: (error) => {
      toast.error('Sync failed', { description: error.message });
    },
  });

  return { syncIntegration, loading, error };
}

export function useUpdateIntegration() {
  const [updateIntegration, { loading, error }] = useMutation(ops.UPDATE_INTEGRATION, {
    refetchQueries: [{ query: ops.GET_INTEGRATIONS }],
    onCompleted: () => {
      toast.success('Integration settings saved');
    },
    onError: (error) => {
      toast.error('Failed to save settings', { description: error.message });
    },
  });

  return { updateIntegration, loading, error };
}

// ============================================================================
// AUTOPILOT
// ============================================================================

export function useAutopilotStatus() {
  const { data, loading, error, refetch } = useQuery(ops.AUTOPILOT_STATUS, {
    fetchPolicy: 'cache-and-network',
  });
  return {
    status: data?.autopilotStatus || null,
    loading,
    error,
    refetch,
  };
}

export function useUpdateAutopilotSettings() {
  const [updateSettings, { loading }] = useMutation(ops.UPDATE_AUTOPILOT_SETTINGS, {
    refetchQueries: [{ query: ops.AUTOPILOT_STATUS }],
    onError: (error) => toast.error('Failed to update autopilot', { description: error.message }),
  });
  return { updateSettings, loading };
}

export function useRunAutopilot() {
  const [runAutopilot, { loading }] = useMutation(ops.RUN_AUTOPILOT, {
    refetchQueries: [{ query: ops.AUTOPILOT_STATUS }],
    onCompleted: (data) => {
      const p = data?.runAutopilot;
      if (!p) {
        toast.success('Autopilot ran — nothing to move');
      } else if (p.status === 'AUTO_APPLIED') {
        toast.success(p.summary);
      } else {
        toast.success('Autopilot has a suggestion for you');
      }
    },
    onError: (error) => toast.error('Autopilot failed', { description: error.message }),
  });
  return { runAutopilot, loading };
}

export function useApplyAutopilotProposal() {
  const [applyProposal, { loading }] = useMutation(ops.APPLY_AUTOPILOT_PROPOSAL, {
    refetchQueries: [{ query: ops.AUTOPILOT_STATUS }],
    onCompleted: () => toast.success('Schedule updated'),
    onError: (error) => toast.error('Could not apply', { description: error.message }),
  });
  return { applyProposal, loading };
}

export function useDismissAutopilotProposal() {
  const [dismissProposal, { loading }] = useMutation(ops.DISMISS_AUTOPILOT_PROPOSAL, {
    refetchQueries: [{ query: ops.AUTOPILOT_STATUS }],
    onError: (error) => toast.error('Could not dismiss', { description: error.message }),
  });
  return { dismissProposal, loading };
}

export function useIntegrationResources() {
  const [fetchResources, { data, loading, error }] = useLazyQuery(ops.INTEGRATION_RESOURCES, {
    fetchPolicy: 'network-only',
  });

  return {
    fetchResources,
    resources: (data?.integrationResources || []) as { id: string; name: string }[],
    loading,
    error,
  };
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

export function useDeleteWebhook() {
  const [deleteWebhook, { loading, error }] = useMutation(ops.DELETE_WEBHOOK, {
    refetchQueries: [{ query: ops.GET_WEBHOOKS }],
    onCompleted: () => {
      toast.success('Webhook deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete webhook', { description: error.message });
    },
  });

  return { deleteWebhook, loading, error };
}

export function useToggleWebhook() {
  const [toggleWebhook, { loading, error }] = useMutation(ops.TOGGLE_WEBHOOK, {
    onError: (error) => {
      toast.error('Failed to update webhook', { description: error.message });
    },
  });

  return { toggleWebhook, loading, error };
}

export function useWebhookDeliveries(webhookId?: string, limit = 20) {
  const { data, loading, error, refetch } = useQuery(ops.GET_WEBHOOK_DELIVERIES, {
    variables: { webhookId, limit },
    skip: !webhookId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    deliveries: data?.webhookDeliveries || [],
    loading,
    error,
    refetch,
  };
}

export function useRetryWebhookDelivery() {
  const [retryDelivery, { loading, error }] = useMutation(ops.RETRY_WEBHOOK_DELIVERY, {
    onCompleted: () => {
      toast.success('Delivery retried');
    },
    onError: (error) => {
      toast.error('Failed to retry delivery', { description: error.message });
    },
  });

  return { retryDelivery, loading, error };
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

export function useBillingInfo() {
  const { data, loading, error, refetch } = useQuery(ops.GET_BILLING_INFO);

  return {
    billingInfo: data?.billingInfo,
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

export function useResumeSubscription() {
  const [resumeSubscription, { loading, error }] = useMutation(ops.RESUME_SUBSCRIPTION, {
    refetchQueries: [{ query: ops.GET_SUBSCRIPTION }],
    onCompleted: () => {
      toast.success('Subscription resumed');
    },
    onError: (error) => {
      toast.error('Failed to resume subscription', {
        description: error.message,
      });
    },
  });

  return { resumeSubscription, loading, error };
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
