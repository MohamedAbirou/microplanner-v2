'use client';

import * as React from 'react';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useTasks } from '@/hooks/use-graphql';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useRouter } from 'next/navigation';

export default function MonthPage() {
  const router = useRouter();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Fetch tasks for the current month
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const { tasks, loading, refetch } = useTasks({
    dateRange: { start: monthStart, end: monthEnd },
  });

  const handleDateClick = (date: Date) => {
    // Navigate to day view for clicked date
    router.push(`/app/day?date=${date.toISOString()}`);
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
