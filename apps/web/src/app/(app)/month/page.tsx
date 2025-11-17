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

  const { tasks, loading, refetch } = useTasks({
    dateRange: { start: monthStart, end: monthEnd },
  });

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
