'use client';

import * as React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  scheduledDate: string;
  isCompleted: boolean;
  goal: {
    id: string;
    emoji: string;
    title: string;
    color: string;
  };
}

interface MonthCalendarProps {
  tasks: Task[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  onTaskClick?: (task: Task) => void;
}

export function MonthCalendar({
  tasks,
  currentDate = new Date(),
  onDateChange,
  onDateClick,
  onTaskClick,
}: MonthCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const [selectedDayTasks, setSelectedDayTasks] = React.useState<Task[] | null>(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate all days to display
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePreviousMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
    setSelectedDayTasks(null);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
    setSelectedDayTasks(null);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange?.(today);
    setSelectedDayTasks(null);
  };

  // Group tasks by day
  const tasksByDay = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const dayKey = format(new Date(task.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(task);
    });
    return grouped;
  }, [tasks]);

  const handleDayClick = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayTasks = tasksByDay[dayKey] || [];
    setSelectedDayTasks(dayTasks.length > 0 ? dayTasks : null);
    onDateClick?.(date);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 border rounded-lg overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-muted/50 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDay[dayKey] || [];
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const completedTasks = dayTasks.filter(t => t.isCompleted).length;
              const totalTasks = dayTasks.length;

              // Get unique goal colors for this day
              const goalColors = Array.from(
                new Set(dayTasks.map(t => t.goal?.color ?? '#94a3b8'))
              ).slice(0, 3); // Show max 3 dots

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[120px] p-2 border-r border-b cursor-pointer hover:bg-accent/50 transition-colors',
                    !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                    isToday && 'bg-primary/10 border-primary',
                    index % 7 === 6 && 'border-r-0'
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {totalTasks > 0 && (
                      <Badge
                        variant={completedTasks === totalTasks ? 'default' : 'secondary'}
                        className="text-[10px] h-5 px-1.5"
                      >
                        {completedTasks}/{totalTasks}
                      </Badge>
                    )}
                  </div>

                  {/* Task indicators (dots) */}
                  {goalColors.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {goalColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* First task preview */}
                  {dayTasks.length > 0 && isCurrentMonth && (
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'text-xs truncate px-1.5 py-0.5 rounded',
                            task.isCompleted && 'line-through opacity-60'
                          )}
                          style={{
                            backgroundColor: `${task.goal?.color ?? '#94a3b8'}15`,
                            color: task.goal?.color ?? '#94a3b8',
                          }}
                        >
                          {task.goal?.emoji ?? '📌'} {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[10px] text-muted-foreground px-1.5">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Details Sidebar */}
      {selectedDayTasks && selectedDayTasks.length > 0 && (
        <Card className="lg:w-80 p-4">
          <h3 className="font-semibold mb-4">
            Tasks for {format(new Date(selectedDayTasks[0].scheduledDate), 'MMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {selectedDayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 cursor-pointer hover:bg-accent/50 transition-colors',
                  task.isCompleted && 'opacity-60'
                )}
                style={{ borderLeftColor: task.goal?.color ?? '#94a3b8' }}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{task.goal?.emoji ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-medium text-sm mb-1',
                      task.isCompleted && 'line-through'
                    )}>
                      {task.title}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: task.goal?.color ?? '#94a3b8', color: task.goal?.color ?? '#94a3b8' }}
                    >
                      {task.goal?.title ?? 'No goal'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
