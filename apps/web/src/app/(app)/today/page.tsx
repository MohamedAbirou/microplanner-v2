'use client';

import * as React from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { CheckCircle2, Plus, Calendar as CalendarIcon, AlertTriangle, Loader2, Sunrise, Target } from 'lucide-react';
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
import { PageLoader } from '@/components/ui/page-loader';
import {
  TaskFilters,
  TaskSort,
  filterAndSortTasks,
  clearAllFilters,
  SORT_PRESETS,
  getTaskStatistics,
} from '@/lib/filters';
import {
  useTasksList,
  useGoalsList,
  useCompleteTask,
  useDeleteTask,
  useStartTimer,
  useStopTimer,
  useSkipTask,
  useSmartReschedule,
} from '@/hooks/use-graphql';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { getDailyIntention, dateKey } from '@/lib/daily-ritual';
import { AutopilotPanel } from '@/components/autopilot/autopilot-panel';
import { useDailyRitual } from '@/hooks/use-graphql-extended';

export default function TodayPage() {
  const [filters, setFilters] = React.useState<TaskFilters>(clearAllFilters());
  const [sort, setSort] = React.useState<TaskSort>(SORT_PRESETS.DATE_ASC);
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const todayKey = React.useMemo(() => dateKey(new Date()), []);
  const { ritual } = useDailyRitual(todayKey);
  // Backend intention is authoritative; fall back to any local draft.
  const intention = ritual?.intention || getDailyIntention();
  // Morning nudge: after 9am and the ritual isn't done yet.
  const showRitualBanner =
    new Date().getHours() >= 9 && ritual !== undefined && !ritual?.planCompleted;

  // Fetch today's tasks from GraphQL
  // Note: We filter by single date (not dateRange) in GraphQL, then do client-side filtering
  const today = new Date();
  const { tasks: allTasks, loading: tasksLoading, refetch } = useTasksList(
    {
      scheduledDate: startOfDay(today),
    },
    {
      field: 'SCHEDULED_DATE',
      direction: 'ASC',
    },
    { take: 80 }
  );

  // Fetch goals for filters
  const { goals, loading: goalsLoading } = useGoalsList();

  // GraphQL mutations
  const { completeTask } = useCompleteTask();
  const { deleteTask, loading: deleting } = useDeleteTask();
  const { startTimer } = useStartTimer();
  const { stopTimer } = useStopTimer();
  const { skipTask } = useSkipTask();
  const { reschedule, reschedulingId } = useSmartReschedule();

  // Fully-wired modal actions + dependency data.
  const taskActions = useTaskDetailActions(allTasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(allTasks), [allTasks]);

  // Apply filters and sorting
  const filteredAndSortedTasks = React.useMemo(() => {
    return filterAndSortTasks(allTasks, filters, sort);
  }, [allTasks, filters, sort]);

  // Calculate statistics from filtered tasks
  const stats = React.useMemo(() => {
    return getTaskStatistics(filteredAndSortedTasks);
  }, [filteredAndSortedTasks]);

  const completionPercentage = stats.completionRate;

  // Tasks whose scheduled start time has already passed today and aren't done.
  const overdueTasks = React.useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return allTasks.filter((t: any) => {
      if (t.isCompleted || !t.startTime) return false;
      const [h, m] = String(t.startTime).split(':').map(Number);
      return h * 60 + (m || 0) < nowMinutes;
    });
  }, [allTasks]);

  const handleReschedule = async (taskId: string) => {
    const ok = await reschedule(taskId);
    if (ok) refetch();
  };

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
    <div className="space-y-6 p-6 max-w-7xl mx-auto mp-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {format(new Date(), 'EEEE · MMM d')}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Today</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/plan-day">
            <Button variant="outline" className="h-9">
              <Sunrise className="mr-2 h-4 w-4" />
              Plan day
            </Button>
          </Link>
          <Button className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Morning ritual nudge */}
      {showRitualBanner && (
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-primary/30 bg-primary/[0.04] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Sunrise className="h-4 w-4 text-primary flex-none" />
            <div className="text-[13px]">
              <span className="font-medium">Start your daily ritual?</span>{' '}
              <span className="text-muted-foreground">Set today&apos;s intention and plan your tasks.</span>
            </div>
          </div>
          <Link href="/plan-day">
            <Button size="sm" className="h-8">Plan day</Button>
          </Link>
        </div>
      )}

      {/* Autopilot suggestions / log */}
      <AutopilotPanel />

      {/* Daily intention */}
      {intention && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-border bg-accent px-4 py-3">
          <Target className="h-4 w-4 mt-0.5 flex-none text-muted-foreground" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Today&apos;s intention
            </div>
            <p className="text-sm mt-0.5">{intention}</p>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px]">Today's Progress</CardTitle>
              <CardDescription className="text-[13px]">
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
            <div className="flex items-center gap-2 mt-4 p-4 bg-accent border border-border rounded-[10px]">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
              <p className="text-sm font-medium text-accent-foreground">
                Awesome! You've completed all tasks for today! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue / past-time tasks — offer smart reschedule */}
      {overdueTasks.length > 0 && (
        <Card className="rounded-[14px] border-amber-300 bg-amber-50 shadow-[var(--sh-sm)] dark:border-amber-900/50 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px] text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              {overdueTasks.length} task{overdueTasks.length === 1 ? '' : 's'} past their scheduled time
            </CardTitle>
            <CardDescription className="text-[13px] text-amber-800/80 dark:text-amber-300/70">
              Reschedule to the next open slot that fits your working hours and focus time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-amber-200 bg-background/60 p-3 dark:border-amber-900/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{task.title}</div>
                  <div className="text-[13px] text-muted-foreground">Was scheduled for {task.startTime}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reschedulingId === task.id}
                  onClick={() => handleReschedule(task.id)}
                >
                  {reschedulingId === task.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Reschedule
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
      <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px]">Your Tasks</CardTitle>
              <CardDescription className="text-[13px]">
                {filteredAndSortedTasks.length === allTasks.length
                  ? 'All tasks scheduled for today'
                  : `${filteredAndSortedTasks.length} of ${allTasks.length} tasks`}
              </CardDescription>
            </div>
            {filteredAndSortedTasks.length !== allTasks.length && (
              <Button variant="ghost" size="sm" className="h-9" onClick={() => setFilters(clearAllFilters())}>
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
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[hsl(var(--success))]">{stats.completed}</div>
              <div className="text-sm text-muted-foreground mt-1">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.incomplete}</div>
              <div className="text-sm text-muted-foreground mt-1">Remaining</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">
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
        goals={goals}
        allTasks={allTasks}
        dependencies={taskDependencies}
        {...taskActions}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <PageLoader label="dashboard" variant="section" skeletonRows={3} />
        </div>
      )}
    </div>
  );
}
