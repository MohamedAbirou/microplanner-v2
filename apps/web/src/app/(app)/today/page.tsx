'use client';

import * as React from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { CheckCircle2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/tasks/task-list';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateCompletionPercentage } from '@/lib/utils';
import { TaskFiltersPanel } from '@/components/filters/task-filters-panel';
import { TaskSortMenu } from '@/components/filters/task-sort-menu';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import {
  TaskFilters,
  TaskSort,
  filterAndSortTasks,
  clearAllFilters,
  SORT_PRESETS,
  getTaskStatistics,
} from '@/lib/filters';
import {
  useTasks,
  useGoals,
  useCompleteTask,
  useDeleteTask,
  useStartTimer,
  useStopTimer,
  useSkipTask,
} from '@/hooks/use-graphql';

export default function TodayPage() {
  const [filters, setFilters] = React.useState<TaskFilters>(clearAllFilters());
  const [sort, setSort] = React.useState<TaskSort>(SORT_PRESETS.DATE_ASC);
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // Fetch today's tasks from GraphQL
  // Note: We filter by single date (not dateRange) in GraphQL, then do client-side filtering
  const today = new Date();
  const { tasks: allTasks, loading: tasksLoading, refetch } = useTasks(
    {
      scheduledDate: startOfDay(today),
    },
    {
      field: 'SCHEDULED_DATE',
      direction: 'ASC',
    }
  );

  // Fetch goals for filters
  const { goals, loading: goalsLoading } = useGoals();

  // GraphQL mutations
  const { completeTask } = useCompleteTask();
  const { deleteTask, loading: deleting } = useDeleteTask();
  const { startTimer } = useStartTimer();
  const { stopTimer } = useStopTimer();
  const { skipTask } = useSkipTask();

  // Apply filters and sorting
  const filteredAndSortedTasks = React.useMemo(() => {
    return filterAndSortTasks(allTasks, filters, sort);
  }, [allTasks, filters, sort]);

  // Calculate statistics from filtered tasks
  const stats = React.useMemo(() => {
    return getTaskStatistics(filteredAndSortedTasks);
  }, [filteredAndSortedTasks]);

  const completionPercentage = stats.completionRate;

  const handleComplete = async (taskId: string) => {
    await completeTask({ variables: { id: taskId } });
    refetch();
  };

  const handleEdit = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleDelete = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const confirmDelete = async () => {
    if (deleteTaskId) {
      await deleteTask({ variables: { id: deleteTaskId } });
      setDeleteTaskId(null);
      refetch();
    }
  };

  const handleStartTimer = async (taskId: string) => {
    await startTimer({ variables: { taskId } });
    refetch();
  };

  const handleStopTimer = async (taskId: string) => {
    await stopTimer({ variables: { taskId } });
    refetch();
  };

  const handleSkipTask = async (taskId: string) => {
    await skipTask({ variables: { id: taskId, reason: 'Skipped from today view' } });
    refetch();
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
              goals={goals}
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
                {filteredAndSortedTasks.length === allTasks.length
                  ? 'All tasks scheduled for today'
                  : `${filteredAndSortedTasks.length} of ${allTasks.length} tasks`}
              </CardDescription>
            </div>
            {filteredAndSortedTasks.length !== allTasks.length && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(clearAllFilters())}>
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={filteredAndSortedTasks as any}
            groupBy="date"
            showFilters={false}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onSkip={handleSkipTask}
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={(allTasks.find((t: any) => t.id === selectedTaskId) as any) || null}
        open={!!selectedTaskId}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        onUpdate={async () => {
          await refetch();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTaskId(null);
        }}
        onConfirm={confirmDelete}
        itemName="this task"
        itemType="task"
      />

      {/* Loading State */}
      {(tasksLoading || goalsLoading) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      )}
    </div>
  );
}
