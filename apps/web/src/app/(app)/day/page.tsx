'use client';

import * as React from 'react';
import { DayCalendar } from '@/components/calendar/day-calendar';
import { startOfDay, endOfDay } from 'date-fns';
import { useTasks } from '@/hooks/use-graphql';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { QuickAddTaskModal } from '@/components/tasks/quick-add-task-modal';

export default function DayPage() {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [quickAddTime, setQuickAddTime] = React.useState<{ hour: number; minute: number } | null>(null);

  // Fetch tasks for today
  const today = new Date();
  const { tasks, loading, refetch } = useTasks({
    dateRange: { start: startOfDay(today), end: endOfDay(today) },
  });

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id);
  };

  const handleTimeSlotClick = (hour: number, minute: number) => {
    setQuickAddTime({ hour, minute });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-3.5rem)] p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading day view...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6">
      <DayCalendar
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTimeSlotClick={handleTimeSlotClick}
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

      {/* Quick Add Task Modal */}
      {quickAddTime && (
        <QuickAddTaskModal
          open={!!quickAddTime}
          onClose={() => setQuickAddTime(null)}
          defaultTime={`${quickAddTime.hour.toString().padStart(2, '0')}:${quickAddTime.minute.toString().padStart(2, '0')}`}
          defaultDate={today.toISOString()}
          onSuccess={() => {
            setQuickAddTime(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
