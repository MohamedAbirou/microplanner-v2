'use client';

import { useQuery, useMutation, useSubscription, ApolloError } from '@apollo/client';
import { toast } from 'sonner';
import * as operations from '@/graphql/operations';

/**
 * Custom GraphQL hooks for MicroPlanner
 * Wraps Apollo Client hooks with error handling and toast notifications
 */

export type MutationNotifyOptions = {
  /** When false, the hook skips toasts — use when the UI owns feedback (e.g. TaskDetailModal). Default true. */
  notify?: boolean;
};

function mutationToastHandlers(
  notify: boolean,
  successMessage: string,
  errorMessage: string,
) {
  if (!notify) return {};
  return {
    onCompleted: () => toast.success(successMessage),
    onError: (error: ApolloError) =>
      toast.error(errorMessage, { description: error.message }),
  };
}

// ============================================================================
// TASKS
// ============================================================================

export function useTasks(filter?: any, sort?: any) {
  const { data, loading, error, refetch } = useQuery(operations.GET_TASKS, {
    variables: { filter, sort },
    fetchPolicy: 'cache-and-network',
  });

  return {
    tasks: data?.tasks || [],
    loading,
    error,
    refetch,
  };
}

export function useTask(id: string) {
  const { data, loading, error, refetch } = useQuery(operations.GET_TASK, {
    variables: { id },
    skip: !id,
  });

  return {
    task: data?.task,
    loading,
    error,
    refetch,
  };
}

export function useCreateTask() {
  const [createTask, { loading, error }] = useMutation(operations.CREATE_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: error.message,
      });
    },
  });

  return { createTask, loading, error };
}

export function useUpdateTask(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [updateTask, { loading, error }] = useMutation(operations.UPDATE_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Task updated successfully', 'Failed to update task'),
  });

  return { updateTask, loading, error };
}

export function useDeleteTask(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [deleteTask, { loading, error }] = useMutation(operations.DELETE_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Task deleted successfully', 'Failed to delete task'),
  });

  return { deleteTask, loading, error };
}

export function useCompleteTask(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [completeTask, { loading, error }] = useMutation(operations.COMPLETE_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Task completed!', 'Failed to complete task'),
  });

  return { completeTask, loading, error };
}

export function useBulkUpdateTasks() {
  const [bulkUpdateTasks, { loading, error }] = useMutation(operations.BULK_UPDATE_TASKS, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      toast.success(`Updated ${data.bulkUpdateTasks.length} tasks`);
    },
    onError: (error) => {
      toast.error('Failed to update tasks', {
        description: error.message,
      });
    },
  });

  return { bulkUpdateTasks, loading, error };
}

export function useBulkDeleteTasks() {
  const [bulkDeleteTasks, { loading, error }] = useMutation(operations.BULK_DELETE_TASKS, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      toast.success(`Deleted ${data.bulkDeleteTasks.count} tasks`);
    },
    onError: (error) => {
      toast.error('Failed to delete tasks', {
        description: error.message,
      });
    },
  });

  return { bulkDeleteTasks, loading, error };
}

export function useSkipTask() {
  const [skipTask, { loading, error }] = useMutation(operations.SKIP_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('Task skipped');
    },
    onError: (error) => {
      toast.error('Failed to skip task', {
        description: error.message,
      });
    },
  });

  return { skipTask, loading, error };
}

export function useUncompleteTask(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [uncompleteTask, { loading, error }] = useMutation(operations.UNCOMPLETE_TASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Task marked as incomplete', 'Failed to uncomplete task'),
  });

  return { uncompleteTask, loading, error };
}

// ============================================================================
// SUBTASKS
// ============================================================================

export function useCreateSubtask(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [createSubtask, { loading, error }] = useMutation(operations.CREATE_SUBTASK, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Subtask created successfully', 'Failed to create subtask'),
  });

  return { createSubtask, loading, error };
}

export function useSubtasks(parentTaskId: string) {
  const { data, loading, error, refetch } = useQuery(operations.GET_SUBTASKS, {
    variables: { parentTaskId },
    skip: !parentTaskId,
  });

  return {
    subtasks: data?.subtasks || [],
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// TASK DEPENDENCIES
// ============================================================================

export function useCreateTaskDependency(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [createTaskDependency, { loading, error }] = useMutation(operations.CREATE_TASK_DEPENDENCY, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Dependency added successfully', 'Failed to add dependency'),
  });

  return { createTaskDependency, loading, error };
}

export function useDeleteTaskDependency(options?: MutationNotifyOptions) {
  const notify = options?.notify !== false;
  const [deleteTaskDependency, { loading, error }] = useMutation(operations.DELETE_TASK_DEPENDENCY, {
    refetchQueries: ['GetTasks'], // by name → refreshes every active tasks view (day/week/month/tasks)
    awaitRefetchQueries: true,
    ...mutationToastHandlers(notify, 'Dependency removed successfully', 'Failed to remove dependency'),
  });

  return { deleteTaskDependency, loading, error };
}

export function useTaskWithDependencies(id: string) {
  const { data, loading, error, refetch } = useQuery(operations.GET_TASK_WITH_DEPENDENCIES, {
    variables: { id },
    skip: !id,
  });

  return {
    taskWithDependencies: data?.taskWithDependencies,
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// TIME TRACKING
// ============================================================================

export function useStartTimer() {
  const [startTimer, { loading, error }] = useMutation(operations.START_TIMER, {
    onCompleted: () => {
      toast.success('Timer started');
    },
    onError: (error) => {
      toast.error('Failed to start timer', {
        description: error.message,
      });
    },
  });

  return { startTimer, loading, error };
}

export function useStopTimer() {
  const [stopTimer, { loading, error }] = useMutation(operations.STOP_TIMER, {
    onCompleted: (data) => {
      const minutes = data.stopTimer.timeSpentMinutes;
      toast.success(`Timer stopped: ${minutes} minutes logged`);
    },
    onError: (error) => {
      toast.error('Failed to stop timer', {
        description: error.message,
      });
    },
  });

  return { stopTimer, loading, error };
}

export function useLogTime() {
  const [logTime, { loading, error }] = useMutation(operations.LOG_TIME, {
    onCompleted: (data) => {
      const minutes = data.logTime.timeSpentMinutes;
      toast.success(`${minutes} minutes logged`);
    },
    onError: (error) => {
      toast.error('Failed to log time', {
        description: error.message,
      });
    },
  });

  return { logTime, loading, error };
}

// ============================================================================
// GOALS
// ============================================================================

export function useGoals() {
  const { data, loading, error, refetch } = useQuery(operations.GET_GOALS);

  return {
    goals: data?.goals || [],
    loading,
    error,
    refetch,
  };
}

export function useGoal(id: string) {
  const { data, loading, error, refetch } = useQuery(operations.GET_GOAL, {
    variables: { id },
    skip: !id,
  });

  return {
    goal: data?.goal,
    loading,
    error,
    refetch,
  };
}

export function useCreateGoal() {
  const [createGoal, { loading, error }] = useMutation(operations.CREATE_GOAL, {
    refetchQueries: [{ query: operations.GET_GOALS }],
    onCompleted: () => {
      toast.success('Goal created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create goal', {
        description: error.message,
      });
    },
  });

  return { createGoal, loading, error };
}

export function useUpdateGoal() {
  const [updateGoal, { loading, error }] = useMutation(operations.UPDATE_GOAL, {
    refetchQueries: [{ query: operations.GET_GOALS }],
    onCompleted: () => {
      toast.success('Goal updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update goal', {
        description: error.message,
      });
    },
  });

  return { updateGoal, loading, error };
}

export function useDeleteGoal() {
  const [deleteGoal, { loading, error }] = useMutation(operations.DELETE_GOAL, {
    refetchQueries: [{ query: operations.GET_GOALS }],
    onCompleted: () => {
      toast.success('Goal deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete goal', {
        description: error.message,
      });
    },
  });

  return { deleteGoal, loading, error };
}

// ============================================================================
// PLANS
// ============================================================================

export function usePlans(filter?: any) {
  const { data, loading, error, refetch } = useQuery(operations.GET_PLANS, {
    variables: filter ? { filter } : undefined,
  });

  return {
    plans: data?.plans || [],
    loading,
    error,
    refetch,
  };
}

export function usePlan(id?: string | null) {
  const { data, loading, error, refetch } = useQuery(operations.GET_PLAN, {
    variables: { id },
    skip: !id,
  });

  return {
    plan: data?.plan ?? null,
    loading,
    error,
    refetch,
  };
}

export function useGeneratePlan() {
  const [generatePlan, { loading, error }] = useMutation(operations.GENERATE_PLAN, {
    refetchQueries: [{ query: operations.GET_PLANS }],
    onCompleted: () => {
      toast.success('Plan generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate plan', {
        description: error.message,
      });
    },
  });

  return { generatePlan, loading, error };
}

export function useUpdatePlan() {
  const [updatePlan, { loading, error }] = useMutation(operations.UPDATE_PLAN, {
    refetchQueries: [{ query: operations.GET_PLANS }],
    onCompleted: () => {
      toast.success('Plan updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update plan', {
        description: error.message,
      });
    },
  });

  return { updatePlan, loading, error };
}

export function useAcceptPlan() {
  const [acceptPlan, { loading, error }] = useMutation(operations.ACCEPT_PLAN, {
    refetchQueries: [{ query: operations.GET_PLANS }, { query: operations.GET_TASKS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('Plan accepted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to accept plan', {
        description: error.message,
      });
    },
  });

  return { acceptPlan, loading, error };
}

// ============================================================================
// DEPENDENCIES
// ============================================================================

export function useAddDependency() {
  const [addDependency, { loading, error }] = useMutation(operations.ADD_DEPENDENCY, {
    onCompleted: () => {
      toast.success('Dependency added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add dependency', {
        description: error.message,
      });
    },
  });

  return { addDependency, loading, error };
}

export function useRemoveDependency() {
  const [removeDependency, { loading, error }] = useMutation(operations.REMOVE_DEPENDENCY, {
    onCompleted: () => {
      toast.success('Dependency removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove dependency', {
        description: error.message,
      });
    },
  });

  return { removeDependency, loading, error };
}

// ============================================================================
// USER & SETTINGS
// ============================================================================

export function useUserSettings() {
  const { data, loading, error, refetch } = useQuery(operations.GET_USER_SETTINGS);

  return {
    user: data?.me,
    settings: data?.me?.settings,
    loading,
    error,
    refetch,
  };
}

export function useUpdateUserSettings() {
  const [updateSettings, { loading, error }] = useMutation(operations.UPDATE_USER_SETTINGS, {
    refetchQueries: [{ query: operations.GET_USER_SETTINGS }],
    onCompleted: () => {
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings', {
        description: error.message,
      });
    },
  });

  return { updateSettings, loading, error };
}

export function useUpdateUserProfile() {
  const [updateProfile, { loading, error }] = useMutation(operations.UPDATE_USER_PROFILE, {
    refetchQueries: [{ query: operations.GET_USER_SETTINGS }],
    onCompleted: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile', {
        description: error.message,
      });
    },
  });

  return { updateProfile, loading, error };
}

// ============================================================================
// CALENDAR INTEGRATIONS
// ============================================================================

export function useConnectCalendar() {
  const [connectCalendar, { loading, error }] = useMutation(operations.CONNECT_CALENDAR, {
    refetchQueries: [{ query: operations.GET_USER_SETTINGS }],
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

export function useDisconnectCalendar() {
  const [disconnectCalendar, { loading, error }] = useMutation(operations.DISCONNECT_CALENDAR, {
    refetchQueries: [{ query: operations.GET_USER_SETTINGS }],
    onCompleted: (data) => {
      toast.success(`Disconnected ${data.disconnectCalendar.provider} calendar`);
    },
    onError: (error) => {
      toast.error('Failed to disconnect calendar', {
        description: error.message,
      });
    },
  });

  return { disconnectCalendar, loading, error };
}

export function useSyncCalendar() {
  const [syncCalendar, { loading, error }] = useMutation(operations.SYNC_CALENDAR, {
    onCompleted: (data) => {
      toast.success(`Synced ${data.syncCalendar.syncedEventsCount} events`);
    },
    onError: (error) => {
      toast.error('Failed to sync calendar', {
        description: error.message,
      });
    },
  });

  return { syncCalendar, loading, error };
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function useTaskSubscriptions(userId: string) {
  const { data: updatedData } = useSubscription(operations.TASK_UPDATED, {
    variables: { userId },
    onData: ({ data }) => {
      toast.info('Task updated', {
        description: data.data?.taskUpdated.title,
      });
    },
  });

  const { data: createdData } = useSubscription(operations.TASK_CREATED, {
    variables: { userId },
    onData: ({ data }) => {
      toast.info('New task created', {
        description: data.data?.taskCreated.title,
      });
    },
  });

  const { data: deletedData } = useSubscription(operations.TASK_DELETED, {
    variables: { userId },
    onData: () => {
      toast.info('Task deleted');
    },
  });

  return {
    updatedTask: updatedData?.taskUpdated,
    createdTask: createdData?.taskCreated,
    deletedTaskId: deletedData?.taskDeleted?.id,
  };
}

export function useGoalSubscription(userId: string) {
  const { data } = useSubscription(operations.GOAL_UPDATED, {
    variables: { userId },
    onData: ({ data }) => {
      toast.info('Goal updated', {
        description: data.data?.goalUpdated.title,
      });
    },
  });

  return {
    updatedGoal: data?.goalUpdated,
  };
}

export function usePlanSubscription(userId: string) {
  const { data } = useSubscription(operations.PLAN_GENERATED, {
    variables: { userId },
    onData: ({ data }) => {
      toast.success('Plan generated!', {
        description: data.data?.planGenerated.title,
      });
    },
  });

  return {
    generatedPlan: data?.planGenerated,
  };
}
