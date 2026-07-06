'use client';

import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Time slots from 6 AM to 11 PM
const HOUR_START = 6;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => i + HOUR_START);

interface Task {
  id: string;
  title: string;
  notes?: string | null;
  startTime: string;
  endTime: string;
  scheduledDate: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: number;
  goal: {
    id: string;
    emoji: string;
    title: string;
    color: string;
  };
}

interface WeekCalendarDndProps {
  tasks: Task[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
  onTaskReschedule?: (taskId: string, newDate: string, newStartTime: string) => Promise<void>;
}

export function WeekCalendarDnd({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTaskReschedule,
}: WeekCalendarDndProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const [optimisticTasks, setOptimisticTasks] = React.useState<Task[]>(tasks);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

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
    const grouped: Record<string, Task[]> = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = optimisticTasks.filter(task =>
        isSameDay(new Date(task.scheduledDate), day)
      );
    });
    return grouped;
  }, [optimisticTasks, weekDays]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);

    const { draggableId, destination } = result;

    if (!destination) return;

    const task = optimisticTasks.find(t => t.id === draggableId);
    if (!task) return;

    // Parse droppable ID: "slot-YYYY-MM-DD-HH"
    const parts = destination.droppableId.split('-');
    if (parts[0] !== 'slot' || parts.length < 5) return;

    const newDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
    const newHour = parseInt(parts[4]);
    const newStartTime = `${newHour.toString().padStart(2, '0')}:00`;

    // Calculate end time
    const endHour = newHour + Math.floor(task.durationMinutes / 60);
    const endMinutes = task.durationMinutes % 60;
    const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Optimistic update
    const updatedTasks = optimisticTasks.map(t =>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-10">
              <div className="p-2 border-r" />
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const dayTasks = tasksByDay[format(day, 'yyyy-MM-dd')] || [];
                const completedCount = dayTasks.filter(t => t.isCompleted).length;

                return (
                  <div
                    key={day.toISOString()}
                    className={cn('p-2 text-center border-r', isToday && 'bg-primary/10')}
                  >
                    <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
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

            {/* Time grid */}
            <div className="grid grid-cols-8">
              {/* Hours column */}
              <div className="border-r">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 px-2 py-1 text-xs text-muted-foreground border-b text-right"
                  >
                    {format(new Date().setHours(hour, 0, 0, 0), 'ha')}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDay[dayKey] || [];
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={cn('border-r', isToday && 'bg-primary/5')}
                  >
                    {HOURS.map((hour) => {
                      const slotId = `slot-${dayKey}-${hour}`;

                      return (
                        <Droppable key={slotId} droppableId={slotId}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn(
                                'h-20 border-b transition-colors relative',
                                snapshot.isDraggingOver && 'bg-primary/10 ring-2 ring-primary ring-inset',
                                !snapshot.isDraggingOver && 'hover:bg-accent/30'
                              )}
                            >
                              {/* Hidden placeholder */}
                              <div className="hidden">{provided.placeholder}</div>

                              {/* Tasks in this slot */}
                              {dayTasks
                                .filter(task => {
                                  const taskHour = parseInt(task.startTime.split(':')[0]);
                                  return taskHour === hour;
                                })
                                .map((task, index) => (
                                  <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          'absolute left-1 right-1 z-10',
                                          snapshot.isDragging && 'cursor-grabbing opacity-80 rotate-2 scale-105'
                                        )}
                                        style={{
                                          ...provided.draggableProps.style,
                                          top: '4px',
                                        }}
                                        onClick={() => !snapshot.isDragging && onTaskClick?.(task)}
                                      >
                                        <Card
                                          className={cn(
                                            'p-2 border-l-4 overflow-hidden hover:shadow-md transition-all cursor-grab active:cursor-grabbing',
                                            task.isCompleted && 'opacity-60',
                                            snapshot.isDragging && 'shadow-xl'
                                          )}
                                          style={{
                                            borderLeftColor: task.goal?.color ?? '#94a3b8',
                                          }}
                                        >
                                          <div className="flex items-start gap-1 mb-1">
                                            <span className="text-sm">{task.goal?.emoji ?? '📌'}</span>
                                            <div className="flex-1 min-w-0">
                                              <div className={cn(
                                                'text-xs font-medium truncate',
                                                task.isCompleted && 'line-through'
                                              )}>
                                                {task.title}
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {task.startTime} - {task.endTime}
                                              </div>
                                            </div>
                                          </div>
                                          {task.priority === 1 && (
                                            <Badge variant="destructive" className="text-[10px] h-4 px-1">
                                              High
                                            </Badge>
                                          )}
                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
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
