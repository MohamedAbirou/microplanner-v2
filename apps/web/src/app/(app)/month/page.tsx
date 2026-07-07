'use client';

import { MonthCalendar } from '@/components/calendar/month-calendar';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useTasks, useGoals } from '@/hooks/use-graphql';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { Skeleton } from '@/components/ui/skeleton';
import { endOfMonth, startOfMonth } from 'date-fns';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function MonthPage() {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Fetch tasks for the current month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Fetch all tasks and filter client-side (GraphQL doesn't support dateRange)
  const { tasks: allTasks, loading, refetch } = useTasks();

  // Filter for current month
  const tasks = React.useMemo(() => {
    return allTasks.filter((task: any) => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
  }, [allTasks, monthStart, monthEnd]);

  const { goals } = useGoals();
  const taskActions = useTaskDetailActions(allTasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(allTasks), [allTasks]);
  const selectedTask = React.useMemo(
    () => allTasks.find((t: any) => t.id === selectedTaskId) || null,
    [allTasks, selectedTaskId]
  );

  const handleDateClick = (date: Date) => {
    // Navigate to day view for clicked date
    router.push(`/day?date=${date.toISOString()}`);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] p-6 space-y-3">
        <Skeleton className="h-8 w-48 rounded-[10px]" />
        <Skeleton className="h-[calc(100%-2.75rem)] w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6 mp-fade-in">
      <MonthCalendar
        tasks={tasks}
        onDateClick={handleDateClick}
        onTaskClick={handleTaskClick}
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
