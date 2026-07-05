'use client';

import * as React from 'react';
import { WeekCalendarDnd } from '@/components/calendar/week-calendar-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTasks, useUpdateTask } from '@/hooks/use-graphql';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { startOfWeek, endOfWeek } from 'date-fns';

export default function WeekPage() {
  const [selectedTask, setSelectedTask] = React.useState<any | null>(null);

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
    return allTasks.filter((task: any) => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  }, [allTasks, weekStart, weekEnd]);

  const { updateTask } = useUpdateTask();

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
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
      refetch();
    } catch (error) {
      console.error('Failed to reschedule task:', error);
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
          if (!open) setSelectedTask(null);
        }}
        onUpdate={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
