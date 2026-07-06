'use client';

import * as React from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarTaskBlock } from '@/components/calendar/calendar-task-block';
import {
  CALENDAR_HOURS,
  CALENDAR_SLOT_HEIGHT_PX,
  CalendarTaskLike,
  formatHourLabel,
  getTaskDurationMinutes,
  getTaskHeightPx,
  getTaskTopPx,
  organizeCalendarTasks,
} from '@/lib/calendar-utils';

interface WeekCalendarProps {
  tasks: CalendarTaskLike[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: CalendarTaskLike) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekCalendar({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTimeSlotClick,
}: WeekCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);

  const organizedTasks = React.useMemo(
    () => organizeCalendarTasks(tasks),
    [tasks]
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

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-10">
            <div className="p-2 border-r" />
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const dayTasks = tasksByDay[format(day, 'yyyy-MM-dd')] || [];
              const completedCount = dayTasks.filter((t) => t.isCompleted).length;

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

          <div className="grid grid-cols-8">
            <div className="border-r">
              {CALENDAR_HOURS.map((hour) => (
                <div
                  key={hour}
                  className="px-2 py-1 text-xs text-muted-foreground border-b text-right"
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

              return (
                <div
                  key={day.toISOString()}
                  className={cn('border-r relative', isToday && 'bg-primary/5')}
                  style={{ height: CALENDAR_HOURS.length * CALENDAR_SLOT_HEIGHT_PX }}
                >
                  {CALENDAR_HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-b hover:bg-accent/50 cursor-pointer transition-colors absolute w-full"
                      style={{
                        top: (hour - CALENDAR_HOURS[0]) * CALENDAR_SLOT_HEIGHT_PX,
                        height: CALENDAR_SLOT_HEIGHT_PX,
                      }}
                      onClick={() => onTimeSlotClick?.(day, hour)}
                    />
                  ))}

                  <div className="absolute inset-0 pointer-events-none z-10">
                    {dayTasks.map((task) => {
                      const heightPx = getTaskHeightPx(getTaskDurationMinutes(task));
                      const topPx = getTaskTopPx(task.startTime);

                      return (
                        <div
                          key={task.id}
                          className="absolute left-1 right-1 pointer-events-auto"
                          style={{ top: topPx, height: heightPx }}
                        >
                          <CalendarTaskBlock
                            task={task}
                            heightPx={heightPx}
                            onClick={onTaskClick}
                          />
                        </div>
                      );
                    })}
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
