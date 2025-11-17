'use client';

import * as React from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Time slots from 6 AM to 11 PM (configurable later)
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

interface WeekCalendarProps {
  tasks: Task[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

// Memoized task card component for better performance
const TaskCard = React.memo<{
  task: Task;
  top: number;
  height: number;
  onClick?: (task: Task) => void;
}>(({ task, top, height, onClick }) => {
  return (
    <div
      className="absolute left-1 right-1 pointer-events-auto cursor-pointer"
      style={{
        top: `${top}%`,
        height: `${height}%`,
      }}
      onClick={() => onClick?.(task)}
    >
      <Card
        className={cn(
          'h-full p-2 border-l-4 overflow-hidden hover:shadow-md transition-shadow',
          task.isCompleted && 'opacity-60'
        )}
        style={{
          borderLeftColor: task.goal.color,
        }}
      >
        <div className="flex items-start gap-1 mb-1">
          <span className="text-sm">{task.goal.emoji}</span>
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
  );
});

TaskCard.displayName = 'TaskCard';

export function WeekCalendar({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTimeSlotClick,
}: WeekCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);

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

  // Convert time string (HH:mm) to position percentage
  const timeToPosition = React.useCallback((timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = (hours - HOUR_START) * 60 + minutes;
    const totalSlotMinutes = (HOUR_END - HOUR_START + 1) * 60;
    return (totalMinutes / totalSlotMinutes) * 100;
  }, []);

  // Convert duration to height percentage
  const durationToHeight = React.useCallback((minutes: number) => {
    const totalSlotMinutes = (HOUR_END - HOUR_START + 1) * 60;
    return (minutes / totalSlotMinutes) * 100;
  }, []);

  // Group tasks by day
  const tasksByDay = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = tasks.filter(task =>
        isSameDay(new Date(task.scheduledDate), day)
      );
    });
    return grouped;
  }, [tasks, weekDays]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
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
            <div className="p-2 border-r" /> {/* Time column */}
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const dayTasks = tasksByDay[format(day, 'yyyy-MM-dd')] || [];
              const completedCount = dayTasks.filter(t => t.isCompleted).length;

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-2 text-center border-r',
                    isToday && 'bg-primary/10'
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    'text-lg font-semibold',
                    isToday && 'text-primary'
                  )}>
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
                  className="h-16 px-2 py-1 text-xs text-muted-foreground border-b text-right"
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
                  className={cn(
                    'border-r relative',
                    isToday && 'bg-primary/5'
                  )}
                >
                  {/* Time slots */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-b hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onTimeSlotClick?.(day, hour)}
                    />
                  ))}

                  {/* Tasks overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative h-full">
                      {dayTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          top={timeToPosition(task.startTime)}
                          height={durationToHeight(task.durationMinutes)}
                          onClick={onTaskClick}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
