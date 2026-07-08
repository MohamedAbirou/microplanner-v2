'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  endOfDay,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { DayCalendar } from '@/components/calendar/day-calendar';
import { WeekCalendarDnd } from '@/components/calendar/week-calendar-dnd';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import {
  CalendarViewSwitcher,
  type CalendarView,
} from '@/components/calendar/calendar-view-switcher';
import {
  QuickAddTaskModal,
  type TaskFormData,
} from '@/components/tasks/quick-add-task-modal';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { PageLoader } from '@/components/ui/page-loader';
import { useTasksList, useGoalsList, useUpdateTask, useCreateTask } from '@/hooks/use-graphql';
import { useCalendarConnections, useCalendarEvents } from '@/hooks/use-graphql-extended';
import { useTier } from '@/contexts/tier-context';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { organizeCalendarTasks } from '@/lib/calendar-utils';
import { getCalendarTaskQuery } from '@/lib/task-query';

function parseViewParam(value: string | null): CalendarView {
  if (value === 'day' || value === 'week' || value === 'month') return value;
  return 'week';
}

function parseDateParam(value: string | null): Date {
  if (!value) return new Date();
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : new Date();
}

export function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseViewParam(searchParams.get('view'));
  const focusDate = React.useMemo(
    () => parseDateParam(searchParams.get('date')),
    [searchParams]
  );

  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [quickAddTime, setQuickAddTime] = React.useState<{ hour: number; minute: number } | null>(
    null
  );

  const taskQuery = React.useMemo(
    () => getCalendarTaskQuery(view, focusDate),
    [view, focusDate]
  );

  const { tasks: allTasks, loading, refetch } = useTasksList(
    taskQuery.filter,
    undefined,
    { take: taskQuery.take }
  );
  const { goals } = useGoalsList();
  const { updateTask } = useUpdateTask();
  const { createTask } = useCreateTask();

  // External calendar sync — gated by tier + an active connection.
  const { limits } = useTier();
  const { connections } = useCalendarConnections();
  const calendarConnected =
    limits.hasCalendarIntegration &&
    connections.some((c: { isActive?: boolean | null }) => c.isActive);

  const eventRange = React.useMemo(
    () => ({
      start: startOfWeek(focusDate, { weekStartsOn: 1 }).toISOString(),
      end: endOfDay(endOfWeek(focusDate, { weekStartsOn: 1 })).toISOString(),
    }),
    [focusDate]
  );

  const { events: calendarEvents } = useCalendarEvents(
    eventRange.start,
    eventRange.end,
    undefined,
    { skip: !calendarConnected || view !== 'week' }
  );

  const taskActions = useTaskDetailActions(allTasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(allTasks), [allTasks]);
  const selectedTask = React.useMemo(
    () => allTasks.find((t: { id: string }) => t.id === selectedTaskId) || null,
    [allTasks, selectedTaskId]
  );

  const weekTasks = React.useMemo(() => {
    return organizeCalendarTasks(allTasks);
  }, [allTasks]);

  const monthTasks = React.useMemo(() => allTasks, [allTasks]);

  const dayTasks = React.useMemo(() => organizeCalendarTasks(allTasks), [allTasks]);

  const updateCalendarUrl = React.useCallback(
    (nextView: CalendarView, date?: Date) => {
      const params = new URLSearchParams();
      if (nextView !== 'week') params.set('view', nextView);
      if (date) params.set('date', format(date, 'yyyy-MM-dd'));
      const query = params.toString();
      router.replace(query ? `/week?${query}` : '/week');
    },
    [router]
  );

  const handleViewChange = (nextView: CalendarView) => {
    updateCalendarUrl(nextView, focusDate);
  };

  const handleTaskClick = (task: { id: string }) => {
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
      throw error;
    } finally {
      await refetch();
    }
  };

  const handleTimeSlotClick = (hour: number, minute: number) => {
    setQuickAddTime({ hour, minute });
  };

  const handleQuickAddSubmit = async (data: TaskFormData) => {
    const { isRecurring, ...taskInput } = data as TaskFormData & { isRecurring?: boolean };
    await createTask({ variables: { input: taskInput } });
    setQuickAddTime(null);
    refetch();
  };

  const handleMonthDateClick = (date: Date) => {
    updateCalendarUrl('day', date);
  };

  if (loading) {
    return <PageLoader label="calendar" variant="page" showSkeleton skeletonRows={2} className="h-[calc(100vh-3.5rem)]" />;
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] p-6 mp-fade-in flex flex-col">
      <div className="mb-4 flex items-center justify-end">
        <CalendarViewSwitcher value={view} onChange={handleViewChange} />
      </div>

      <div className="flex-1 min-h-0">
        {view === 'day' && (
          <DayCalendar
            tasks={dayTasks}
            currentDate={focusDate}
            onTaskClick={handleTaskClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
        {view === 'week' && (
          <WeekCalendarDnd
            tasks={weekTasks}
            events={calendarEvents}
            calendarConnected={calendarConnected}
            currentDate={focusDate}
            onTaskClick={handleTaskClick}
            onTaskReschedule={handleTaskReschedule}
          />
        )}
        {view === 'month' && (
          <MonthCalendar
            tasks={monthTasks}
            currentDate={focusDate}
            onDateClick={handleMonthDateClick}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

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

      {quickAddTime && (
        <QuickAddTaskModal
          open={!!quickAddTime}
          onOpenChange={(open) => {
            if (!open) setQuickAddTime(null);
          }}
          goals={goals}
          defaultTime={`${quickAddTime.hour.toString().padStart(2, '0')}:${quickAddTime.minute.toString().padStart(2, '0')}`}
          defaultDate={focusDate}
          onSubmit={handleQuickAddSubmit}
        />
      )}
    </div>
  );
}
