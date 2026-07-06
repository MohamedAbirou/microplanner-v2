'use client';

import * as React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { calculateCompletionPercentage } from '@/lib/utils';
import { CalendarTaskBlock } from '@/components/calendar/calendar-task-block';
import {
  CALENDAR_HOURS,
  CALENDAR_HOUR_START,
  CALENDAR_HOUR_END,
  CALENDAR_SLOT_HEIGHT_PX,
  CALENDAR_GRID_HEIGHT_PX,
  CalendarTaskLike,
  formatHourLabel,
  getTaskDurationMinutes,
  getTaskHeightPx,
  getTaskTopPx,
  organizeCalendarTasks,
} from '@/lib/calendar-utils';

interface DayCalendarProps {
  tasks: CalendarTaskLike[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onTaskClick?: (task: CalendarTaskLike) => void;
  onTimeSlotClick?: (hour: number, minute: number) => void;
}

export function DayCalendar({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onTaskClick,
  onTimeSlotClick,
}: DayCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);

  const dayTasks = React.useMemo(() => {
    return organizeCalendarTasks(tasks).filter((task) =>
      isSameDay(new Date(task.scheduledDate), selectedDate)
    );
  }, [tasks, selectedDate]);

  const completedTasks = dayTasks.filter((t) => t.isCompleted).length;
  const totalTasks = dayTasks.length;
  const completionPercentage = calculateCompletionPercentage(completedTasks, totalTasks);
  const totalMinutes = dayTasks.reduce(
    (acc, t) => acc + getTaskDurationMinutes(t),
    0
  );

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

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="flex flex-col h-full">
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
              <span>{totalMinutes}m total</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="flex">
          <div className="w-20 border-r bg-muted/50 sticky left-0 z-10">
            {CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="px-2 py-2 text-sm text-muted-foreground border-b text-right"
                style={{ height: CALENDAR_SLOT_HEIGHT_PX }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          <div
            className="flex-1 relative min-w-[400px]"
            style={{ height: CALENDAR_GRID_HEIGHT_PX }}
          >
            {CALENDAR_HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b absolute w-full"
                style={{
                  top: (hour - CALENDAR_HOUR_START) * CALENDAR_SLOT_HEIGHT_PX,
                  height: CALENDAR_SLOT_HEIGHT_PX,
                }}
              >
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

            <div className="absolute inset-0 pointer-events-none px-2 z-10">
              {dayTasks.map((task) => {
                const heightPx = getTaskHeightPx(getTaskDurationMinutes(task));
                const topPx = getTaskTopPx(task.startTime);

                return (
                  <div
                    key={task.id}
                    className="absolute left-2 right-2 pointer-events-auto"
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

            {isToday &&
              (() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                if (currentHour >= CALENDAR_HOURS[0] && currentHour <= CALENDAR_HOUR_END) {
                  const topPx = getTaskTopPx(`${currentHour}:${currentMinute}`);

                  return (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                      style={{ top: topPx }}
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
