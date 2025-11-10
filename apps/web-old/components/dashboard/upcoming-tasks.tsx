'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: number;
  goalId?: string | null;
  goalTitle?: string | null;
  goalEmoji?: string | null;
  estimatedDuration?: number | null;
  isCompleted: boolean;
}

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
}

const priorityColors: Record<number, string> = {
  1: 'text-error border-error/30 bg-error/10',
  2: 'text-warning border-warning/30 bg-warning/10',
  3: 'text-primary-400 border-primary-400/30 bg-primary-400/10',
  4: 'text-dark-text-secondary border-dark-border-primary bg-dark-bg-hover',
  5: 'text-dark-text-tertiary border-dark-border-primary bg-dark-bg-hover',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Upcoming Tasks</h2>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-dark-text-tertiary mx-auto mb-3" />
          <p className="text-dark-text-secondary">No upcoming tasks scheduled</p>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 mt-4 text-primary-500 hover:text-primary-400 transition-colors duration-150"
          >
            Add a task
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-dark-text-primary">Upcoming Tasks</h2>
        <Link
          href="/tasks"
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors duration-150"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="block p-4 rounded-lg border border-dark-border-primary bg-dark-bg-secondary hover:bg-dark-bg-hover transition-all duration-250"
          >
            <div className="flex items-start gap-3">
              {/* Goal emoji */}
              {task.goalEmoji && (
                <div className="text-2xl flex-shrink-0">{task.goalEmoji}</div>
              )}

              {/* Task details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-dark-text-primary truncate mb-1">
                  {task.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-dark-text-tertiary">
                  {/* Due date */}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>

                  {/* Duration */}
                  {task.estimatedDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.estimatedDuration}m</span>
                    </div>
                  )}

                  {/* Goal tag */}
                  {task.goalTitle && (
                    <div className="text-primary-400 text-xs">
                      {task.goalTitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority indicator */}
              <div className={cn(
                'flex-shrink-0 px-2 py-1 text-xs font-medium rounded border',
                priorityColors[task.priority] || priorityColors[3]
              )}>
                P{task.priority}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
