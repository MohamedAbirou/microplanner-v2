'use client';

import * as React from 'react';
import { DayCalendar } from '@/components/calendar/day-calendar';
import { startOfDay } from 'date-fns';
import { useTasks, useCreateTask, useGoals } from '@/hooks/use-graphql';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import {
  QuickAddTaskModal,
  type TaskFormData,
} from '@/components/tasks/quick-add-task-modal';

export default function DayPage() {
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [quickAddTime, setQuickAddTime] = React.useState<{ hour: number; minute: number } | null>(null);

  // Fetch tasks for today
  const today = new Date();
  // Use scheduledDate filter for single day (GraphQL supports this)
  const { tasks, loading, refetch } = useTasks({
    scheduledDate: startOfDay(today),
  });
  const { goals } = useGoals();
  const { createTask } = useCreateTask();

  const taskActions = useTaskDetailActions(tasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(tasks), [tasks]);
  const selectedTask = React.useMemo(
    () => tasks.find((t: any) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const handleTaskClick = (task: any) => {
    setSelectedTaskId(task.id);
  };

  const handleTimeSlotClick = (hour: number, minute: number) => {
    setQuickAddTime({ hour, minute });
  };

  const handleQuickAddSubmit = async (data: TaskFormData) => {
    const { isRecurring, ...taskInput } = data as any;
    await createTask({ variables: { input: taskInput } });
    setQuickAddTime(null);
    refetch();
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
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        goals={goals}
        allTasks={tasks}
        dependencies={taskDependencies}
        {...taskActions}
      />

      {/* Quick Add Task Modal */}
      {quickAddTime && (
        <QuickAddTaskModal
          open={!!quickAddTime}
          onOpenChange={(open) => {
            if (!open) setQuickAddTime(null);
          }}
          goals={goals}
          defaultTime={`${quickAddTime.hour.toString().padStart(2, '0')}:${quickAddTime.minute.toString().padStart(2, '0')}`}
          defaultDate={today}
          onSubmit={handleQuickAddSubmit}
        />
      )}
    </div>
  );
}
