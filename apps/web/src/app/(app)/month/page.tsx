'use client';

import { MonthCalendar } from '@/components/calendar/month-calendar';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useTasks } from '@/hooks/use-graphql';
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
    return allTasks.filter((task) => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });
  }, [allTasks, monthStart, monthEnd]);

  const handleDateClick = (date: Date) => {
    // Navigate to day view for clicked date
    router.push(`/day?date=${date.toISOString()}`);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading month view...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <MonthCalendar
        tasks={tasks}
        onDateClick={handleDateClick}
        onTaskClick={handleTaskClick}
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
