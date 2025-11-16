'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Plus, Grid, List } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TaskFiltersPanel } from '@/components/filters/task-filters-panel';
import { TaskSortMenu } from '@/components/filters/task-sort-menu';
import { BulkTaskActions } from '@/components/tasks/bulk-task-actions';
import { ResizableTaskCard } from '@/components/tasks/resizable-task-card';
import { useTaskSelection } from '@/hooks/use-task-selection';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  TaskFilters,
  TaskSort,
  filterAndSortTasks,
  clearAllFilters,
  SORT_PRESETS,
  getTaskStatistics,
} from '@/lib/filters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with GraphQL
const mockTasks = [
  {
    id: '1',
    title: 'Review project proposal',
    notes: 'Review the Q4 proposal and provide feedback',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '10:00',
    scheduledDate: new Date().toISOString(),
    durationMinutes: 60,
    isCompleted: false,
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

const mockGoals = [
  { id: '1', emoji: '💼', title: 'Career Growth' },
  { id: '2', emoji: '💪', title: 'Fitness' },
  { id: '3', emoji: '⚡', title: 'Development' },
  { id: '4', emoji: '📚', title: 'Learning' },
];

export default function TasksPage() {
  const [filters, setFilters] = React.useState<TaskFilters>(clearAllFilters());
  const [sort, setSort] = React.useState<TaskSort>(SORT_PRESETS.DATE_ASC);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const isMobile = useIsMobile();

  // Filter and sort tasks
  const filteredAndSortedTasks = React.useMemo(() => {
    return filterAndSortTasks(mockTasks, filters, sort);
  }, [filters, sort]);

  // Set available task IDs for selection
  const taskSelection = useTaskSelection({
    onSelectionChange: (ids) => {
      console.log('Selected tasks:', ids);
    },
  });

  React.useEffect(() => {
    taskSelection.setAvailableTaskIds(filteredAndSortedTasks.map((t) => t.id));
  }, [filteredAndSortedTasks, taskSelection]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    return getTaskStatistics(filteredAndSortedTasks);
  }, [filteredAndSortedTasks]);

  const completionPercentage = stats.completionRate;

  // Handlers
  const handleTaskResize = React.useCallback(
    (taskId: string, newDuration: number, newStartTime?: string) => {
      console.log('Resize task:', taskId, 'to', newDuration, 'minutes', newStartTime || '');
      toast.success('Task duration updated', {
        description: `New duration: ${newDuration} minutes`,
      });
      // TODO: GraphQL mutation
    },
    []
  );

  const handleBulkComplete = React.useCallback(() => {
    const count = taskSelection.selectedCount;
    toast.success(`Marked ${count} task${count !== 1 ? 's' : ''} as complete`);
    taskSelection.deselectAll();
    // TODO: GraphQL mutation
  }, [taskSelection]);

  const handleBulkDelete = React.useCallback(() => {
    const count = taskSelection.selectedCount;
    toast.success(`Deleted ${count} task${count !== 1 ? 's' : ''}`);
    taskSelection.deselectAll();
    // TODO: GraphQL mutation
  }, [taskSelection]);

  const handleBulkPriority = React.useCallback(
    (priority: number) => {
      const count = taskSelection.selectedCount;
      const label = priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low';
      toast.success(`Changed ${count} task${count !== 1 ? 's' : ''} to ${label} priority`);
      // TODO: GraphQL mutation
    },
    [taskSelection]
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Tasks</h1>
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
              <CardTitle>Overall Progress</CardTitle>
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
        </CardContent>
      </Card>

      {/* Filters and View Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <TaskFiltersPanel filters={filters} onFiltersChange={setFilters} goals={mockGoals} />
        </div>
        <div className="flex items-center gap-2">
          <TaskSortMenu sort={sort} onSortChange={setSort} />

          {!isMobile && (
            <div className="flex items-center border rounded-lg">
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Grid/List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>
                {filteredAndSortedTasks.length === mockTasks.length
                  ? 'All tasks'
                  : `${filteredAndSortedTasks.length} of ${mockTasks.length} tasks`}
              </CardDescription>
            </div>
            {taskSelection.isAnySelected && (
              <Badge variant="secondary">
                {taskSelection.selectedCount} selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'gap-4',
              view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'
            )}
          >
            {filteredAndSortedTasks.map((task) => (
              <ResizableTaskCard
                key={task.id}
                task={task}
                onClick={() => console.log('Open task:', task.id)}
                onResize={handleTaskResize}
                showCheckbox={taskSelection.isAnySelected || undefined}
                isSelected={taskSelection.isSelected(task.id)}
                onToggleSelect={() => taskSelection.toggleTask(task.id)}
              />
            ))}
          </div>

          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No tasks found</p>
              <Button variant="link" onClick={() => setFilters(clearAllFilters())} className="mt-2">
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <BulkTaskActions
        selectedCount={taskSelection.selectedCount}
        onComplete={handleBulkComplete}
        onDelete={handleBulkDelete}
        onChangePriority={handleBulkPriority}
        onClearSelection={taskSelection.deselectAll}
      />
    </div>
  );
}
