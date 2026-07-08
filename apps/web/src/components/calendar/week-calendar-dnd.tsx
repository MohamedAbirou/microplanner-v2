'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarTaskBlock } from '@/components/calendar/calendar-task-block';
import {
  CALENDAR_HOURS,
  CALENDAR_SLOT_HEIGHT_PX,
  CalendarEventLike,
  CalendarTaskLike,
  formatHourLabel,
  getEventLayoutPx,
  getTaskDurationMinutes,
  getTaskHeightPx,
  organizeCalendarTasks,
  timeToMinutes,
} from '@/lib/calendar-utils';

interface WeekCalendarDndProps {
  tasks: CalendarTaskLike[];
  events?: CalendarEventLike[];
  calendarConnected?: boolean;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: CalendarTaskLike) => void;
  onTaskReschedule?: (taskId: string, newDate: string, newStartTime: string) => Promise<void>;
}

function getTaskTopWithinSlot(startTime: string, slotHour: number): number {
  const offsetMinutes = timeToMinutes(startTime) - slotHour * 60;
  return Math.max(2, (offsetMinutes / 60) * CALENDAR_SLOT_HEIGHT_PX);
}

function taskStartsInHour(startTime: string, hour: number): boolean {
  return parseInt(startTime.split(':')[0], 10) === hour;
}

export function WeekCalendarDnd({
  tasks,
  events = [],
  calendarConnected = false,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTaskReschedule,
}: WeekCalendarDndProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const [optimisticTasks, setOptimisticTasks] = React.useState(tasks);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  const organizedTasks = React.useMemo(
    () => organizeCalendarTasks(optimisticTasks),
    [optimisticTasks]
  );

  const weekStart = React.useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );

  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const handlePreviousWeek = React.useCallback(() => {
    const newDate = subWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  }, [selectedDate, onDateChange]);

  const handleNextWeek = React.useCallback(() => {
    const newDate = addWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  }, [selectedDate, onDateChange]);

  const handleToday = React.useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  const tasksByDay = React.useMemo(() => {
    const grouped: Record<string, CalendarTaskLike[]> = {};
    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = organizedTasks.filter((task) =>
        isSameDay(new Date(task.scheduledDate), day)
      );
    });
    return grouped;
  }, [organizedTasks, weekDays]);

  const eventsByDay = React.useMemo(() => {
    const grouped: Record<string, CalendarEventLike[]> = {};
    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = events.filter(
        (event) => !event.isAllDay && isSameDay(new Date(event.start), day)
      );
    });
    return grouped;
  }, [events, weekDays]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { draggableId, destination } = result;
    if (!destination) return;

    const task = organizedTasks.find((t) => t.id === draggableId);
    if (!task) return;

    const parts = destination.droppableId.split('-');
    if (parts[0] !== 'slot' || parts.length < 5) return;

    const newDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
    const newHour = parseInt(parts[4], 10);
    const newStartTime = `${newHour.toString().padStart(2, '0')}:00`;

    const duration = getTaskDurationMinutes(task);
    const endMinutes = timeToMinutes(newStartTime) + duration;
    const newEndTime = `${Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    const updatedTasks = optimisticTasks.map((t) =>
      t.id === task.id
        ? { ...t, scheduledDate: newDate, startTime: newStartTime, endTime: newEndTime }
        : t
    );
    setOptimisticTasks(updatedTasks);

    try {
      await onTaskReschedule?.(task.id, newDate, newStartTime);
      toast.success('Task rescheduled!', {
        description: `Moved to ${format(new Date(newDate), 'MMM d')} at ${newStartTime}`,
      });
    } catch (error) {
      setOptimisticTasks(tasks);
      console.error('Failed to reschedule:', error);
      toast.error('Failed to reschedule task');
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn('flex flex-col h-full', isDragging && 'select-none')}>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" size="sm" className="h-9" onClick={handleToday}>
              Today
            </Button>
            {calendarConnected && (
              <Badge variant="secondary" className="gap-1">
                <CalendarCheck className="h-3.5 w-3.5" />
                Calendar synced
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mp-scroll flex-1 overflow-auto rounded-[14px] border border-border shadow-[var(--sh-sm)]">
          <div className="min-w-[800px] overflow-visible">
            <div className="grid grid-cols-8 border-b border-border bg-muted/50 sticky top-0 z-20">
              <div className="p-2 border-r border-border" />
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const dayTasks = tasksByDay[format(day, 'yyyy-MM-dd')] || [];
                const completedCount = dayTasks.filter((t) => t.isCompleted).length;

                return (
                  <div
                    key={day.toISOString()}
                    className={cn('p-2 text-center border-r border-border', isToday && 'bg-primary/10')}
                  >
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{format(day, 'EEE')}</div>
                    <div className={cn('text-lg font-semibold', isToday && 'text-primary')}>
                      {format(day, 'd')}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {completedCount}/{dayTasks.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-8 overflow-visible">
              <div className="border-r border-border">
                {CALENDAR_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="px-2 py-1 font-mono text-xs text-muted-foreground border-b border-border text-right"
                    style={{ height: CALENDAR_SLOT_HEIGHT_PX }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDay[dayKey] || [];
                const isToday = isSameDay(day, new Date());

                const dayEvents = eventsByDay[dayKey] || [];

                return (
                  <div
                    key={day.toISOString()}
                    className={cn('relative border-r border-border overflow-visible', isToday && 'bg-primary/5')}
                  >
                    {/* Read-only external calendar events, painted behind tasks (z-0). */}
                    {dayEvents.map((event) => {
                      const { topPx, heightPx } = getEventLayoutPx(event.start, event.end);
                      return (
                        <div
                          key={event.id}
                          className="pointer-events-none absolute left-1 right-1 z-0 overflow-hidden rounded-[6px] border-l-2 border-slate-400 bg-slate-200/70 px-1.5 py-0.5 text-[11px] text-slate-700 dark:border-slate-500 dark:bg-slate-700/50 dark:text-slate-200"
                          style={{ top: topPx, height: heightPx }}
                          title={`${event.title}${event.location ? ` · ${event.location}` : ''} (external calendar)`}
                        >
                          <div className="truncate font-medium">{event.title}</div>
                          <div className="truncate opacity-70">
                            {format(new Date(event.start), 'h:mm a')}
                          </div>
                        </div>
                      );
                    })}

                    {CALENDAR_HOURS.map((hour) => {
                      const slotId = `slot-${dayKey}-${hour}`;
                      const slotTasks = dayTasks.filter((task) =>
                        taskStartsInHour(task.startTime, hour)
                      );

                      return (
                        <Droppable key={slotId} droppableId={slotId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                'border-b border-border transition-colors relative overflow-visible',
                                snapshot.isDraggingOver && 'bg-primary/10 ring-2 ring-primary ring-inset',
                                !snapshot.isDraggingOver && 'hover:bg-accent/30'
                              )}
                              style={{ height: CALENDAR_SLOT_HEIGHT_PX }}
                            >
                              <div className="hidden">{provided.placeholder}</div>

                              {slotTasks.map((task, index) => {
                                const heightPx = getTaskHeightPx(
                                  getTaskDurationMinutes(task)
                                );
                                const topPx = getTaskTopWithinSlot(task.startTime, hour);

                                return (
                                  <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={index}
                                  >
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={cn(
                                          'z-10',
                                          !dragSnapshot.isDragging && 'absolute left-1 right-1',
                                          dragSnapshot.isDragging &&
                                            'cursor-grabbing opacity-90'
                                        )}
                                        style={
                                          dragSnapshot.isDragging
                                            ? {
                                                ...dragProvided.draggableProps.style,
                                                height: heightPx,
                                              }
                                            : {
                                                ...dragProvided.draggableProps.style,
                                                top: topPx,
                                                height: heightPx,
                                              }
                                        }
                                      >
                                        <CalendarTaskBlock
                                          task={task}
                                          heightPx={heightPx}
                                          isDragging={dragSnapshot.isDragging}
                                          onClick={onTaskClick}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
