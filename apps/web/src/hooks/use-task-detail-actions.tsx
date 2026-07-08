'use client';

import * as React from 'react';
import {
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useUncompleteTask,
  useCreateSubtask,
  useCreateTaskDependency,
  useDeleteTaskDependency,
  useStartTimer,
  useStopTimer,
} from '@/hooks/use-graphql';
import type { DependencyType } from '@/lib/dependencies';

/**
 * Shared wiring for the TaskDetailModal so every page (tasks/day/week/month/
 * today) gets fully-functional edit / complete / delete / subtask / dependency
 * actions instead of decorative no-op callbacks.
 *
 * All underlying mutation hooks `refetchQueries: ['GetTasks']`, so the calendar
 * / list the modal was opened from refreshes automatically after each action.
 *
 * @param tasks the current page's task list — used to resolve a subtask's
 *   current completion state (subtasks are Tasks) so a single `toggleSubtask`
 *   can pick complete vs uncomplete.
 * @param refetch optional extra refetch for the calling page (belt-and-braces).
 */
export function useTaskDetailActions(tasks: any[] = [], refetch?: () => any) {
  // Modal + subtask/dependency panels own user-facing toasts; hooks stay silent here.
  const silent = { notify: false as const };
  const { updateTask } = useUpdateTask(silent);
  const { deleteTask } = useDeleteTask(silent);
  const { completeTask } = useCompleteTask(silent);
  const { uncompleteTask } = useUncompleteTask(silent);
  const { createSubtask } = useCreateSubtask(silent);
  const { createTaskDependency } = useCreateTaskDependency(silent);
  const { deleteTaskDependency } = useDeleteTaskDependency(silent);
  // Timer mutations own their own toasts (start/stop), so no silent flag.
  const { startTimer } = useStartTimer();
  const { stopTimer } = useStopTimer();

  // Build a flat id→task index (top-level tasks + their subtasks) so we can
  // look up completion state by id for the subtask toggle.
  const taskById = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const t of tasks) {
      map.set(t.id, t);
      for (const s of t.subtasks || []) map.set(s.id, s);
    }
    return map;
  }, [tasks]);

  const afterMutation = React.useCallback(async () => {
    if (refetch) await refetch();
  }, [refetch]);

  const onUpdate = React.useCallback(
    async (taskId: string, updates: any) => {
      // Only forward fields the modal actually edits; the modal builds
      // `editedTask` from title/notes/goalId/scheduledDate/startTime/
      // durationMinutes/priority — all valid on UpdateTaskInput.
      const input: any = {};
      for (const key of [
        'title',
        'notes',
        'goalId',
        'scheduledDate',
        'startTime',
        'durationMinutes',
        'priority',
      ]) {
        if (updates[key] !== undefined) input[key] = updates[key];
      }
      await updateTask({ variables: { id: taskId, input } });
      await afterMutation();
    },
    [updateTask, afterMutation]
  );

  const onDelete = React.useCallback(
    async (taskId: string) => {
      await deleteTask({ variables: { id: taskId } });
      await afterMutation();
    },
    [deleteTask, afterMutation]
  );

  const onToggleComplete = React.useCallback(
    async (taskId: string) => {
      const current = taskById.get(taskId);
      if (current?.isCompleted) {
        await uncompleteTask({ variables: { id: taskId } });
      } else {
        await completeTask({ variables: { id: taskId } });
      }
      await afterMutation();
    },
    [taskById, completeTask, uncompleteTask, afterMutation]
  );

  const onAddSubtask = React.useCallback(
    async (taskId: string, title: string) => {
      await createSubtask({ variables: { input: { parentTaskId: taskId, title } } });
      await afterMutation();
    },
    [createSubtask, afterMutation]
  );

  const onToggleSubtask = React.useCallback(
    async (subtaskId: string) => {
      const current = taskById.get(subtaskId);
      if (current?.isCompleted) {
        await uncompleteTask({ variables: { id: subtaskId } });
      } else {
        await completeTask({ variables: { id: subtaskId } });
      }
      await afterMutation();
    },
    [taskById, completeTask, uncompleteTask, afterMutation]
  );

  const onDeleteSubtask = React.useCallback(
    async (subtaskId: string) => {
      await deleteTask({ variables: { id: subtaskId } });
      await afterMutation();
    },
    [deleteTask, afterMutation]
  );

  const onAddDependency = React.useCallback(
    async (dependentTaskId: string, blockingTaskId: string, type: DependencyType) => {
      await createTaskDependency({
        variables: { input: { dependentTaskId, blockingTaskId, type } },
      });
      await afterMutation();
    },
    [createTaskDependency, afterMutation]
  );

  const onRemoveDependency = React.useCallback(
    async (dependencyId: string) => {
      await deleteTaskDependency({ variables: { id: dependencyId } });
      await afterMutation();
    },
    [deleteTaskDependency, afterMutation]
  );

  const onStartTimer = React.useCallback(
    async (taskId: string) => {
      await startTimer({ variables: { taskId } });
      await afterMutation();
    },
    [startTimer, afterMutation]
  );

  const onStopTimer = React.useCallback(
    async (taskId: string) => {
      await stopTimer({ variables: { taskId } });
      await afterMutation();
    },
    [stopTimer, afterMutation]
  );

  return {
    onUpdate,
    onDelete,
    onToggleComplete,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onAddDependency,
    onRemoveDependency,
    onStartTimer,
    onStopTimer,
  };
}
