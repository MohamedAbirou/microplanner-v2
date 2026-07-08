'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { TaskDetailModal } from '@/components/tasks/task-detail-modal';
import { useTasksList, useGoalsList, useCompleteTask, useUncompleteTask } from '@/hooks/use-graphql';
import { useTaskDetailActions } from '@/hooks/use-task-detail-actions';
import { mapTaskDependencies } from '@/lib/dependencies';
import { useUser } from '@clerk/nextjs';
import { endOfDay, format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/page-loader';
import Link from 'next/link';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default function DashboardPage() {
  const { user } = useUser();
  const timeOfDay = getTimeOfDay();
  const today = new Date();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  const { tasks: rawTasks, loading: tasksLoading, refetch } = useTasksList(
    {
      dateRange: { start: startOfDay(today), end: endOfDay(today) },
    },
    undefined,
    { take: 80 }
  );
  const { goals, loading: goalsLoading } = useGoalsList();
  const { completeTask } = useCompleteTask();
  const { uncompleteTask } = useUncompleteTask();

  const taskActions = useTaskDetailActions(rawTasks, refetch);
  const taskDependencies = React.useMemo(() => mapTaskDependencies(rawTasks), [rawTasks]);

  const loading = tasksLoading || goalsLoading;

  // Agenda: time-ordered, scheduled tasks first, then anything without a start time.
  const agenda = React.useMemo(() => {
    return [...rawTasks].sort((a: any, b: any) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      if (a.startTime) return -1;
      if (b.startTime) return 1;
      return 0;
    });
  }, [rawTasks]);

  const completedCount = rawTasks.filter((t: any) => t.isCompleted).length;
  const totalCount = rawTasks.length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const focusMinutesLeft = rawTasks
    .filter((t: any) => !t.isCompleted)
    .reduce((acc: number, t: any) => acc + (t.durationMinutes || 0), 0);
  const focusLabel =
    focusMinutesLeft >= 60
      ? `${Math.floor(focusMinutesLeft / 60)}h ${focusMinutesLeft % 60 ? `${focusMinutesLeft % 60}m` : ''}`.trim()
      : `${focusMinutesLeft}m`;

  const upNext = agenda.find((t: any) => !t.isCompleted);

  const handleToggle = async (task: any) => {
    if (task.isCompleted) {
      await uncompleteTask({ variables: { id: task.id } });
    } else {
      await completeTask({ variables: { id: task.id } });
    }
  };

  if (loading) {
    return <PageLoader label="dashboard" variant="page" className="max-w-[920px] mx-auto" />;
  }

  return (
    <div className="max-w-[920px] mx-auto px-7 pt-7 pb-14 mp-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {format(today, 'EEEE · MMM d')}
          </div>
          <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.6px]">
            Good {timeOfDay}, {user?.firstName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {completedCount} of {totalCount} done
            {totalCount > 0 && (
              <>
                {' · '}
                {focusMinutesLeft > 0 ? `${focusLabel} of focus left` : 'all clear'}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/plans/generate">
            <Button variant="outline" className="h-9">
              Plan tomorrow
            </Button>
          </Link>
          <Link href="/week">
            <Button variant="outline" className="h-9">
              Open week →
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress + Up next */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 mt-6">
        <div className="rounded-[14px] border border-border bg-card p-[18px] shadow-[var(--sh-sm)]">
          <div className="flex items-center gap-4">
            <div
              className="relative w-[74px] h-[74px] flex-none rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(hsl(var(--primary)) 0 ${progressPercent * 3.6}deg, hsl(var(--muted)) ${progressPercent * 3.6}deg 360deg)`,
              }}
            >
              <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-base font-semibold">
                {progressPercent}%
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Today's progress</div>
              <div className="text-[13px] text-muted-foreground mt-0.5">
                {remainingCount > 0 ? `${remainingCount} task${remainingCount === 1 ? '' : 's'} left.` : "You're all caught up."}
              </div>
              <div className="flex gap-4 mt-3">
                <div>
                  <div className="text-lg font-semibold text-[hsl(var(--success))]">{completedCount}</div>
                  <div className="text-[11px] text-muted-foreground">Done</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{remainingCount}</div>
                  <div className="text-[11px] text-muted-foreground">Left</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{focusMinutesLeft > 0 ? focusLabel : '—'}</div>
                  <div className="text-[11px] text-muted-foreground">Focus left</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-border bg-gradient-to-b from-accent to-card p-[18px] shadow-[var(--sh-sm)] flex flex-col">
          {upNext ? (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                Up next{upNext.startTime ? ` · ${upNext.startTime}` : ''}
              </div>
              <div className="text-[17px] font-semibold mt-2">{upNext.title}</div>
              <div className="text-[13px] text-muted-foreground mt-1">
                {[upNext.durationMinutes ? `${upNext.durationMinutes} min` : null, upNext.goal?.title]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              <div className="mt-auto flex gap-2 pt-3.5">
                <Button size="sm" className="h-[34px]" onClick={() => setSelectedTaskId(upNext.id)}>
                  Open
                </Button>
                <Button size="sm" variant="outline" className="h-[34px]" onClick={() => handleToggle(upNext)}>
                  Mark done
                </Button>
              </div>
            </>
          ) : (
            <div className="m-auto text-center text-sm text-muted-foreground py-4">
              Nothing left — enjoy the rest of your day.
            </div>
          )}
        </div>
      </div>

      {/* Agenda */}
      <div className="flex items-center justify-between mt-7">
        <h2 className="text-[15px] font-semibold">Your day</h2>
        <div className="text-xs text-muted-foreground">Agenda · time-ordered</div>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {agenda.map((task: any) => (
          <div
            key={task.id}
            onClick={() => setSelectedTaskId(task.id)}
            className={cn(
              'flex items-center gap-3 rounded-[10px] border border-border bg-card px-3 py-2.5 cursor-pointer transition-colors hover:bg-accent/40',
              task.isCompleted && 'opacity-60'
            )}
          >
            <div className="w-[52px] flex-none font-mono text-xs text-muted-foreground pt-0.5">
              {task.startTime || '—'}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(task);
              }}
              className={cn(
                'w-5 h-5 flex-none rounded-full border flex items-center justify-center text-[10px]',
                task.isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-transparent'
              )}
            >
              ✓
            </button>
            <div
              className="w-[3px] self-stretch rounded-full"
              style={{ background: task.goal?.color || 'hsl(var(--border))' }}
            />
            <div className="flex-1 min-w-0">
              <div className={cn('text-sm font-medium truncate', task.isCompleted && 'line-through text-muted-foreground')}>
                {task.goal?.emoji ? `${task.goal.emoji} ` : ''}
                {task.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {[task.durationMinutes ? `${task.durationMinutes} min` : null, task.goal?.title]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            {task.goal?.title && (
              <div className="text-xs text-muted-foreground flex-none">{task.goal.title}</div>
            )}
          </div>
        ))}

        {agenda.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No tasks scheduled for today.{' '}
            <Link href="/today" className="text-primary hover:underline">
              Add one
            </Link>
          </div>
        )}
      </div>

      <TaskDetailModal
        task={(rawTasks.find((t: any) => t.id === selectedTaskId) as any) || null}
        open={!!selectedTaskId}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        goals={goals}
        allTasks={rawTasks}
        dependencies={taskDependencies}
        {...taskActions}
      />
    </div>
  );
}
