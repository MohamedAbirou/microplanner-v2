'use client';

import * as React from 'react';
import { WeekCalendarDnd } from '@/components/calendar/week-calendar-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTasks, useUpdateTask } from '@/hooks/use-graphql';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { startOfWeek, endOfWeek } from 'date-fns';

export default function WeekPage() {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Get current week's start and end dates
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Fetch tasks for the current week
  const { tasks, loading, refetch } = useTasks({
    dateRange: { start: weekStart, end: weekEnd },
  });

  const { updateTask } = useUpdateTask();

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
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => refetch()}
        />
      )}
    </div>
  );
}
