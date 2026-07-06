'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { WeekCalendar } from './week-calendar';
import { CalendarTaskLike, getTaskDurationMinutes } from '@/lib/calendar-utils';

interface DraggableWeekCalendarProps {
  tasks: CalendarTaskLike[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: CalendarTaskLike) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onTaskReschedule?: (taskId: string, newDate: string, newStartTime: string) => Promise<void>;
}

export function DraggableWeekCalendar({
  tasks,
  currentDate,
  onDateChange,
  onTaskClick,
  onTimeSlotClick,
  onTaskReschedule,
}: DraggableWeekCalendarProps) {
  const [optimisticTasks, setOptimisticTasks] = React.useState<CalendarTaskLike[]>(tasks);
  const [isDragging, setIsDragging] = React.useState(false);

  // Update optimistic tasks when tasks prop changes
  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { source, destination, draggableId } = result;

    // No destination or dropped in same position
    if (!destination ||
        (source.droppableId === destination.droppableId &&
         source.index === destination.index)) {
      return;
    }

    // Find the task being moved
    const task = optimisticTasks.find(t => t.id === draggableId);
    if (!task) return;

    // Parse the droppable ID to get date and hour
    // Format: "day-YYYY-MM-DD-HH"
    const destParts = destination.droppableId.split('-');
    if (destParts.length < 5) return;

    const newDate = `${destParts[1]}-${destParts[2]}-${destParts[3]}`;
    const newHour = parseInt(destParts[4]);
    const newStartTime = `${newHour.toString().padStart(2, '0')}:00`;

    // Calculate new end time based on duration
    const duration = getTaskDurationMinutes(task);
    const endHour = newHour + Math.floor(duration / 60);
    const endMinutes = duration % 60;
    const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Optimistically update the task
    const updatedTasks = optimisticTasks.map(t =>
      t.id === task.id
        ? { ...t, scheduledDate: newDate, startTime: newStartTime, endTime: newEndTime }
        : t
    );
    setOptimisticTasks(updatedTasks);

    try {
      // Call the reschedule handler
      await onTaskReschedule?.(task.id, newDate, newStartTime);

      toast.success('Task rescheduled successfully!', {
        description: `"${task.title}" moved to ${format(new Date(newDate), 'MMM d')} at ${newStartTime}`,
      });
    } catch (error) {
      // Revert on error
      setOptimisticTasks(tasks);
      console.error('Failed to reschedule task:', error);
      toast.error('Failed to reschedule task', {
        description: 'Please try again or contact support if the problem persists',
      });
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={isDragging ? 'cursor-grabbing' : ''}>
        <WeekCalendar
          tasks={optimisticTasks}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onTaskClick={onTaskClick}
          onTimeSlotClick={onTimeSlotClick}
        />
      </div>
    </DragDropContext>
  );
}
