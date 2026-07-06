'use client';

import * as React from 'react';
import { WeekCalendarDnd } from '@/components/calendar/week-calendar-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTasks, useGoals, useUpdateTask } from '@/hooks/use-graphql';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { startOfWeek, endOfWeek } from 'date-fns';
import { organizeCalendarTasks } from '@/lib/calendar-utils';

export default function WeekPage() {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Get current week's start and end dates
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Fetch tasks for the current week
  // Note: GraphQL schema doesn't support dateRange, so we fetch all tasks and filter client-side
  // Alternative: We could filter by scheduledDate on server, but that only works for single day
  const { tasks: allTasks, loading, refetch } = useTasks();

  // Filter tasks for current week on client side
  const tasks = React.useMemo(() => {
    const weekTasks = allTasks.filter((task: any) => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
    return organizeCalendarTasks(weekTasks);
  }, [allTasks, weekStart, weekEnd]);

  const { goals } = useGoals();
  const { updateTask } = useUpdateTask();

  // Fully-wired modal actions + dependency data.
  const taskActions = useTaskDetailActions(allTasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(allTasks), [allTasks]);

  // Derive the open task from the live list so it reflects refetches.
  const selectedTask = React.useMemo(
    () => allTasks.find((t: any) => t.id === selectedTaskId) || null,
    [allTasks, selectedTaskId]
  );

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id);
  };

  const handleTaskReschedule = async (taskId: string, newDate: string, newStartTime: string) => {
    try {
      await updateTask({
        variables: {
          id: taskId,
          input: {
            scheduledDate: newDate,
            startTime: newStartTime,
          },
        },
      });
    } catch (error) {
      console.error('Failed to reschedule task:', error);
      // Re-throw so the calendar's optimistic update rolls back + shows the error toast.
      throw error;
    } finally {
      // Always resync with the server even if the mutation false-errored but
      // the REST write persisted.
      await refetch();
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading week view...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <WeekCalendarDnd
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTaskReschedule={handleTaskReschedule}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        goals={goals}
        allTasks={allTasks}
        dependencies={taskDependencies}
        {...taskActions}
      />
    </div>
  );
}
