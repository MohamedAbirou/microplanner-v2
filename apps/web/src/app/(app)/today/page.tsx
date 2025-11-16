'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/tasks/task-list';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateCompletionPercentage } from '@/lib/utils';
import { TaskFiltersPanel } from '@/components/filters/task-filters-panel';
import { TaskSortMenu } from '@/components/filters/task-sort-menu';
import {
  TaskFilters,
  TaskSort,
  filterAndSortTasks,
  clearAllFilters,
  SORT_PRESETS,
  getTaskStatistics,
} from '@/lib/filters';

// Mock data - will be replaced with GraphQL query
const mockTodayTasks = [
  {
    id: '1',
    title: 'Review project proposal',
    notes: 'Review the Q4 proposal and provide feedback',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '10:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 60,
    isCompleted: true,
    priority: 1,
  },
  {
    id: '2',
    title: 'Morning workout',
    notes: 'Cardio + strength training',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 60,
    isCompleted: true,
    priority: 1,
  },
  {
    id: '3',
    title: 'Team standup meeting',
    notes: null,
    goal: { id: '1', emoji: '💼', title: 'Work', color: '#F59E0B' },
    startTime: '10:00',
    endTime: '10:30',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 30,
    isCompleted: true,
    priority: 2,
  },
  {
    id: '4',
    title: 'Deep work: Code review',
    notes: 'Review PRs from the team',
    goal: { id: '3', emoji: '⚡', title: 'Development', color: '#8B5CF6' },
    startTime: '14:00',
    endTime: '16:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 120,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '5',
    title: 'Read for 30 minutes',
    notes: 'Continue reading "Atomic Habits"',
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
    startTime: '20:00',
    endTime: '20:30',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 30,
    isCompleted: false,
    priority: 2,
  },
  {
    id: '6',
    title: 'Plan tomorrow',
    notes: 'Review schedule and priorities',
    goal: { id: '1', emoji: '📋', title: 'Productivity', color: '#6366F1' },
    startTime: '21:00',
    endTime: '21:15',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 15,
    isCompleted: false,
    priority: 3,
  },
];

// Mock goals for filters
const mockGoals = [
  { id: '1', emoji: '💼', title: 'Career Growth' },
  { id: '2', emoji: '💪', title: 'Fitness' },
  { id: '3', emoji: '⚡', title: 'Development' },
  { id: '4', emoji: '📚', title: 'Learning' },
];

export default function TodayPage() {
  const [filters, setFilters] = React.useState<TaskFilters>(clearAllFilters());
  const [sort, setSort] = React.useState<TaskSort>(SORT_PRESETS.DATE_ASC);

  // Apply filters and sorting
  const filteredAndSortedTasks = React.useMemo(() => {
    return filterAndSortTasks(mockTodayTasks, filters, sort);
  }, [filters, sort]);

  // Calculate statistics from filtered tasks
  const stats = React.useMemo(() => {
    return getTaskStatistics(filteredAndSortedTasks);
  }, [filteredAndSortedTasks]);

  const completionPercentage = stats.completionRate;

  const handleComplete = (taskId: string) => {
    console.log('Complete task:', taskId);
    // TODO: GraphQL mutation
  };

  const handleEdit = (taskId: string) => {
    console.log('Edit task:', taskId);
    // TODO: Open edit modal
  };

  const handleDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
    // TODO: GraphQL mutation with confirmation
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Today</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>
                {stats.completed} of {stats.total} tasks completed
              </CardDescription>
            </div>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {completionPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="h-3" />
          {completionPercentage === 100 && (
            <div className="flex items-center gap-2 mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Awesome! You've completed all tasks for today! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <TaskFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              goals={mockGoals}
            />
          </div>
          <TaskSortMenu sort={sort} onSortChange={setSort} />
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                {filteredAndSortedTasks.length === mockTodayTasks.length
                  ? 'All tasks scheduled for today'
                  : `${filteredAndSortedTasks.length} of ${mockTodayTasks.length} tasks`}
              </CardDescription>
            </div>
            {filteredAndSortedTasks.length !== mockTodayTasks.length && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(clearAllFilters())}>
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={filteredAndSortedTasks}
            groupBy="date"
            showFilters={false}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.incomplete}</div>
              <div className="text-sm text-muted-foreground mt-1">Remaining</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {filteredAndSortedTasks.reduce((acc, task) => acc + (task.durationMinutes || 0), 0)}m
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Time</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
