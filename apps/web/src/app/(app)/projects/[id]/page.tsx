'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Timer, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useCompleteTask,
  useUncompleteTask,
  useStartTimer,
  useStopTimer,
} from '@/hooks/use-graphql';
import { useProjectBoard } from '@/hooks/use-graphql-extended';

type ColumnId = 'todo' | 'inProgress' | 'done';

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

function columnOf(task: any): ColumnId {
  if (task.isCompleted) return 'done';
  if (task.isTimerRunning || (task.timeSpentMinutes ?? 0) > 0) return 'inProgress';
  return 'todo';
}

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = String(params.id);

  const { project, loading, refetch } = useProjectBoard(projectId);
  const { completeTask } = useCompleteTask({ notify: false });
  const { uncompleteTask } = useUncompleteTask({ notify: false });
  const { startTimer } = useStartTimer();
  const { stopTimer } = useStopTimer();

  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overCol, setOverCol] = React.useState<ColumnId | null>(null);

  const tasks = project?.tasks || [];

  const grouped = React.useMemo(() => {
    const g: Record<ColumnId, any[]> = { todo: [], inProgress: [], done: [] };
    for (const t of tasks) g[columnOf(t)].push(t);
    return g;
  }, [tasks]);

  const moveTask = async (task: any, target: ColumnId) => {
    const current = columnOf(task);
    if (current === target) return;
    try {
      if (target === 'done') {
        if (task.isTimerRunning) await stopTimer({ variables: { taskId: task.id } });
        await completeTask({ variables: { id: task.id } });
      } else if (target === 'todo') {
        if (task.isCompleted) await uncompleteTask({ variables: { id: task.id } });
        if (task.isTimerRunning) await stopTimer({ variables: { taskId: task.id } });
      } else if (target === 'inProgress') {
        if (task.isCompleted) await uncompleteTask({ variables: { id: task.id } });
        if (!task.isTimerRunning) await startTimer({ variables: { taskId: task.id } });
      }
      await refetch();
    } catch {
      /* toast handled in hooks */
    }
  };

  const handleDrop = async (target: ColumnId) => {
    const task = tasks.find((t: any) => t.id === dragId);
    setDragId(null);
    setOverCol(null);
    if (task) await moveTask(task, target);
  };

  if (loading && !project) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48 rounded-[6px]" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[14px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Project not found.</p>
        <Link href="/projects">
          <Button variant="outline" className="mt-4">
            Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 mp-fade-in">
      <div className="flex items-center gap-2">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div
          className="h-9 w-9 rounded-[10px] flex items-center justify-center text-lg flex-none"
          style={{ backgroundColor: `${project.color}20` }}
        >
          {project.icon || '📁'}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-[13px] text-muted-foreground">
            {project.completedTaskCount}/{project.taskCount} tasks ·{' '}
            {Math.round(project.progressPercentage || 0)}% complete
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => handleDrop(col.id)}
            className={cn(
              'rounded-[14px] border border-border bg-muted/30 p-3 min-h-[300px] transition-colors',
              overCol === col.id && 'border-primary bg-primary/5'
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold">{col.label}</span>
              <Badge variant="secondary" className="text-xs">
                {grouped[col.id].length}
              </Badge>
            </div>
            <div className="space-y-2">
              {grouped[col.id].length === 0 ? (
                <div className="rounded-[10px] border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </div>
              ) : (
                grouped[col.id].map((task: any) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={cn(
                      'rounded-[10px] border border-border bg-background p-3 cursor-grab active:cursor-grabbing shadow-[var(--sh-sm)]',
                      dragId === task.id && 'opacity-50'
                    )}
                    style={{ borderLeft: `3px solid ${task.goal?.color ?? '#94a3b8'}` }}
                  >
                    <div
                      className={cn(
                        'text-sm font-medium',
                        task.isCompleted && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {task.goal && (
                        <Badge variant="outline" className="text-[10px]">
                          {task.goal.emoji} {task.goal.title}
                        </Badge>
                      )}
                      {task.priority === 1 && (
                        <Badge variant="destructive" className="text-[10px]">
                          High
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.durationMinutes}m
                      </span>
                      {task.isTimerRunning && (
                        <span className="text-[11px] text-green-600 flex items-center gap-1">
                          <Timer className="h-3 w-3" /> running
                        </span>
                      )}
                    </div>

                    {/* Fallback move controls for touch / no-drag */}
                    <div className="flex gap-1 mt-2">
                      {COLUMNS.filter((c) => c.id !== col.id).map((c) => (
                        <Button
                          key={c.id}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px] text-muted-foreground"
                          onClick={() => moveTask(task, c.id)}
                        >
                          → {c.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
