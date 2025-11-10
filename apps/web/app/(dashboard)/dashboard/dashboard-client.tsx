'use client';

/**
 * Dashboard Client Component
 * Main calendar view with task scheduling
 */

import { useState } from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { Card } from '@microplanner/ui';
import { Target, Clock, CheckCircle2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  goal?: {
    id: string;
    title: string;
    emoji?: string;
    color?: string;
  };
  project?: {
    id: string;
    name: string;
    color?: string;
  };
}

interface DashboardStats {
  activeGoalsCount: number;
  tasksTodayCount: number;
  tasksCompletedToday: number;
  completionRate: number;
}

interface DashboardClientProps {
  initialTasks: Task[];
  stats: DashboardStats;
}

export function DashboardClient({ initialTasks, stats }: DashboardClientProps) {
  const [tasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    // TODO: Open task details modal
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // TODO: Open create task modal with selected date
  };

  const handleCreateTask = () => {
    // TODO: Open create task modal
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Calendar 📅</h1>
          <p className="text-sm text-dark-text-secondary mt-1">
            Schedule and manage your time effectively
          </p>
        </div>

        {/* Mini Stats */}
        <div className="flex items-center gap-3">
          <Card className="glass-card px-4 py-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-text-tertiary">Active Goals</p>
                <p className="text-sm font-semibold text-dark-text-primary">
                  {stats.activeGoalsCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <div>
                <p className="text-xs text-dark-text-tertiary">Today's Tasks</p>
                <p className="text-sm font-semibold text-dark-text-primary">
                  {stats.tasksTodayCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card px-4 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <div>
                <p className="text-xs text-dark-text-tertiary">Completion Rate</p>
                <p className="text-sm font-semibold text-dark-text-primary">
                  {Math.round(stats.completionRate)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Calendar View */}
      <CalendarView
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onDateClick={handleDateClick}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
