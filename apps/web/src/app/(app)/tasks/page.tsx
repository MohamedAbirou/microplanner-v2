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
import { useTasks, useGoals, useUpdateTask, useBulkUpdateTasks, useBulkDeleteTasks } from '@/hooks/use-graphql';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';

export default function TasksPage() {
  const [filters, setFilters] = React.useState<TaskFilters>(clearAllFilters());
  const [sort, setSort] = React.useState<TaskSort>(SORT_PRESETS.DATE_ASC);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  // Fetch data from GraphQL
  const { tasks: allTasks, loading: tasksLoading, refetch } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();
  const { updateTask } = useUpdateTask();
  const { bulkUpdateTasks } = useBulkUpdateTasks();
  const { bulkDeleteTasks } = useBulkDeleteTasks();

  const loading = tasksLoading || goalsLoading;

  // Filter and sort tasks
  const filteredAndSortedTasks = React.useMemo(() => {
    return filterAndSortTasks(allTasks, filters, sort);
  }, [allTasks, filters, sort]);

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
    async (taskId: string, newDuration: number, newStartTime?: string) => {
      try {
        await updateTask({
          variables: {
            id: taskId,
            input: {
              durationMinutes: newDuration,
              ...(newStartTime && { startTime: newStartTime }),
            },
          },
        });
        refetch();
      } catch (error) {
        console.error('Failed to resize task:', error);
      }
    },
    [updateTask, refetch]
  );

  const handleBulkComplete = React.useCallback(async () => {
    try {
      await bulkUpdateTasks({
        variables: {
          ids: taskSelection.selectedTaskIds,
          input: { isCompleted: true },
        },
      });
      taskSelection.deselectAll();
      refetch();
    } catch (error) {
      console.error('Failed to complete tasks:', error);
    }
  }, [taskSelection, bulkUpdateTasks, refetch]);

  const handleBulkDelete = React.useCallback(async () => {
    try {
      await bulkDeleteTasks({
        variables: {
          ids: taskSelection.selectedTaskIds,
        },
      });
      taskSelection.deselectAll();
      refetch();
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    }
  }, [taskSelection, bulkDeleteTasks, refetch]);

  const handleBulkPriority = React.useCallback(
    async (priority: number) => {
      try {
        await bulkUpdateTasks({
          variables: {
            ids: taskSelection.selectedTaskIds,
            input: { priority },
          },
        });
        refetch();
      } catch (error) {
        console.error('Failed to update priority:', error);
      }
    },
    [taskSelection, bulkUpdateTasks, refetch]
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
          <TaskFiltersPanel filters={filters} onFiltersChange={setFilters} goals={goals} />
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
                {filteredAndSortedTasks.length === allTasks.length
                  ? 'All tasks'
                  : `${filteredAndSortedTasks.length} of ${allTasks.length} tasks`}
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
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading tasks...
              </div>
            ) : (
              filteredAndSortedTasks.map((task) => (
                <ResizableTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTaskId(task.id)}
                  onResize={handleTaskResize}
                  showCheckbox={taskSelection.isAnySelected || undefined}
                  isSelected={taskSelection.isSelected(task.id)}
                  onToggleSelect={() => taskSelection.toggleTask(task.id)}
                />
              ))
            )}
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

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => refetch()}
        />
      )}
    </div>
  );
}
