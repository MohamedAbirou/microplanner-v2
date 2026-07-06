'use client';

import * as React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateCompletionPercentage } from '@/lib/utils';

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

interface DayCalendarProps {
  tasks: Task[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (hour: number, minute: number) => void;
}

// Time slots from 6 AM to 11 PM
const HOUR_START = 6;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => i + HOUR_START);

export function DayCalendar({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTimeSlotClick,
}: DayCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);

  const dayTasks = React.useMemo(() => {
    return tasks.filter(task =>
      isSameDay(new Date(task.scheduledDate), selectedDate)
    );
  }, [tasks, selectedDate]);

  const completedTasks = dayTasks.filter(t => t.isCompleted).length;
  const totalTasks = dayTasks.length;
  const completionPercentage = calculateCompletionPercentage(completedTasks, totalTasks);

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange?.(today);
  };

  // Convert time string to position percentage
  const timeToPosition = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = (hours - HOUR_START) * 60 + minutes;
    const totalSlotMinutes = (HOUR_END - HOUR_START + 1) * 60;
    return (totalMinutes / totalSlotMinutes) * 100;
  };

  // Convert duration to height percentage
  const durationToHeight = (minutes: number) => {
    const totalSlotMinutes = (HOUR_END - HOUR_START + 1) * 60;
    return (minutes / totalSlotMinutes) * 100;
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation and stats */}
      <div className="mb-4 pb-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            {!isToday && (
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day stats */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0)}m total</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="flex">
          {/* Time column */}
          <div className="w-20 border-r bg-muted/50 sticky left-0 z-10">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-20 px-2 py-2 text-sm text-muted-foreground border-b text-right"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="flex-1 relative min-w-[400px]">
            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="h-20 border-b">
                <div
                  className="h-1/2 border-b border-dashed border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick?.(hour, 0)}
                />
                <div
                  className="h-1/2 hover:bg-accent/30 cursor-pointer transition-colors"
                  onClick={() => onTimeSlotClick?.(hour, 30)}
                />
              </div>
            ))}

            {/* Tasks overlay */}
            <div className="absolute inset-0 pointer-events-none px-2">
              <div className="relative h-full">
                {dayTasks.map((task) => {
                  const top = timeToPosition(task.startTime);
                  const height = durationToHeight(task.durationMinutes);

                  return (
                    <div
                      key={task.id}
                      className="absolute left-2 right-2 pointer-events-auto cursor-pointer"
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                      }}
                      onClick={() => onTaskClick?.(task)}
                    >
                      <Card
                        className={cn(
                          'h-full p-3 border-l-4 hover:shadow-lg transition-all',
                          task.isCompleted && 'opacity-60 bg-muted/50'
                        )}
                        style={{
                          borderLeftColor: task.goal?.color ?? '#94a3b8',
                        }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-lg">{task.goal?.emoji ?? '📌'}</span>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              'font-semibold mb-1',
                              task.isCompleted && 'line-through'
                            )}>
                              {task.title}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {task.startTime} - {task.endTime} ({task.durationMinutes}m)
                            </div>
                            {task.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            style={{ borderColor: task.goal?.color ?? '#94a3b8', color: task.goal?.color ?? '#94a3b8' }}
                          >
                            {task.goal?.title ?? 'No goal'}
                          </Badge>
                          {task.priority === 1 && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current time indicator */}
            {isToday && (() => {
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();

              if (currentHour >= HOUR_START && currentHour <= HOUR_END) {
                const position = timeToPosition(`${currentHour}:${currentMinute}`);

                return (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                    style={{ top: `${position}%` }}
                  >
                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full" />
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {totalTasks === 0 && (
        <div className="flex items-center justify-center py-20 text-center">
          <div>
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks scheduled</h3>
            <p className="text-muted-foreground">
              Click on a time slot to create a new task
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
