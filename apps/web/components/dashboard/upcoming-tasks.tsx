'use client';

/**
 * SLEEK Upcoming Tasks Component
 * - Compact list view
 * - Small, readable text
 * - Professional hover states
 */

import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@microplanner/ui';
import { formatRelativeDate, formatTime } from '@microplanner/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: number;
  goalId?: string;
  goalTitle?: string;
  goalEmoji?: string;
  estimatedDuration?: number;
  isCompleted: boolean;
}

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-dark-text-tertiary mx-auto mb-2" />
            <p className="text-sm text-dark-text-secondary">No upcoming tasks</p>
            <p className="text-xs text-dark-text-tertiary mt-1">
              Create a goal to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Tasks</CardTitle>
          <Link
            href="/tasks"
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Link
                href={`/tasks/${task.id}`}
                className="block p-3 rounded-lg border border-dark-border-primary hover:border-dark-border-secondary hover:bg-dark-bg-hover transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {task.goalEmoji && (
                        <span className="text-sm">{task.goalEmoji}</span>
                      )}
                      <h4 className="text-sm font-medium text-dark-text-primary truncate">
                        {task.title}
                      </h4>
                    </div>
                    {task.goalTitle && (
                      <p className="text-xs text-dark-text-tertiary truncate">
                        {task.goalTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-dark-text-secondary">
                    <span className="whitespace-nowrap">
                      {formatRelativeDate(task.dueDate)}
                    </span>
                    {task.estimatedDuration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedDuration}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
