'use client';

import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface WeekDay {
  date: string;
  dayOfWeek: number;
  tasksScheduled: number;
  tasksCompleted: number;
  totalDuration: number;
  productivity: number;
}

interface WeekOverviewProps {
  weekData: WeekDay[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.getDate().toString();
}

function getProductivityColor(productivity: number): string {
  if (productivity >= 80) return 'bg-success';
  if (productivity >= 60) return 'bg-primary-500';
  if (productivity >= 40) return 'bg-warning';
  if (productivity > 0) return 'bg-error';
  return 'bg-dark-bg-tertiary';
}

export function WeekOverview({ weekData }: WeekOverviewProps) {
  if (!weekData || weekData.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Week Overview</h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-dark-text-tertiary mx-auto mb-3" />
          <p className="text-dark-text-secondary">No data available</p>
        </div>
      </div>
    );
  }

  const maxTasks = Math.max(...weekData.map((d) => d.tasksScheduled), 1);

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Week Overview</h2>

      {/* Week visualization */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekData.map((day) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          const isToday = dayDate.getTime() === today.getTime();
          const isPast = dayDate.getTime() < today.getTime();

          const barHeight = day.tasksScheduled > 0
            ? Math.max((day.tasksScheduled / maxTasks) * 100, 10)
            : 10;

          return (
            <div key={day.date} className="flex flex-col items-center">
              {/* Day name */}
              <div className={cn(
                'text-xs font-medium mb-2',
                isToday ? 'text-primary-500' : 'text-dark-text-tertiary'
              )}>
                {dayNames[day.dayOfWeek]}
              </div>

              {/* Date */}
              <div className={cn(
                'text-sm font-semibold mb-2',
                isToday ? 'text-primary-500' : 'text-dark-text-secondary'
              )}>
                {formatDayDate(day.date)}
              </div>

              {/* Bar chart */}
              <div className="w-full h-24 flex items-end justify-center">
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all duration-250 relative group',
                    getProductivityColor(day.productivity)
                  )}
                  style={{ height: `${barHeight}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-dark-bg-primary border border-dark-border-primary rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 pointer-events-none">
                    <div className="text-xs text-dark-text-secondary">
                      <div className="font-semibold text-dark-text-primary mb-1">
                        {day.tasksCompleted}/{day.tasksScheduled} completed
                      </div>
                      <div>{day.totalDuration}m total</div>
                      <div>{day.productivity.toFixed(0)}% productivity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task count */}
              <div className="text-xs text-dark-text-tertiary mt-2">
                {day.tasksScheduled > 0 ? (
                  <span>
                    {day.tasksCompleted}/{day.tasksScheduled}
                  </span>
                ) : (
                  <span className="text-dark-text-tertiary/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-dark-text-tertiary pt-4 border-t border-dark-border-primary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success"></div>
          <span>Excellent (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-500"></div>
          <span>Good (60%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning"></div>
          <span>Fair (40%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-error"></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}
