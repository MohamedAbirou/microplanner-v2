'use client';

import * as React from 'react';
import { CheckCircle2, Circle, ListTree } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CalendarTaskLike,
  getTaskDurationMinutes,
} from '@/lib/calendar-utils';

interface CalendarTaskBlockProps {
  task: CalendarTaskLike;
  heightPx: number;
  onClick?: (task: CalendarTaskLike) => void;
  isDragging?: boolean;
  className?: string;
}

export function CalendarTaskBlock({
  task,
  heightPx,
  onClick,
  isDragging,
  className,
}: CalendarTaskBlockProps) {
  const duration = getTaskDurationMinutes(task);
  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;
  const goalColor = task.goal?.color ?? '#94a3b8';

  const isCompact = heightPx < 56;
  const isMedium = heightPx >= 56 && heightPx < 96;
  const showSubtaskList = !isCompact && subtasks.length > 0;
  const maxVisibleSubtasks = isMedium ? 2 : 4;

  return (
    <Card
      className={cn(
        'h-full overflow-hidden border-l-4 transition-shadow flex flex-col',
        'hover:shadow-md cursor-pointer',
        task.isCompleted && 'opacity-60',
        isDragging && 'shadow-xl ring-2 ring-primary/40 cursor-grabbing',
        isCompact ? 'p-1.5' : 'p-2',
        className
      )}
      style={{ borderLeftColor: goalColor }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
    >
      <div className="flex items-start gap-1.5 min-h-0 shrink-0">
        <span className={cn(isCompact ? 'text-xs' : 'text-sm')}>
          {task.goal?.emoji ?? '📌'}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'font-medium leading-tight truncate',
              isCompact ? 'text-[11px]' : 'text-xs',
              task.isCompleted && 'line-through'
            )}
          >
            {task.title}
          </div>
          {!isCompact && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {task.startTime} – {task.endTime}
              <span className="mx-1">·</span>
              {duration}m
            </div>
          )}
        </div>
        {subtasks.length > 0 && isCompact && (
          <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">
            {completedSubtasks}/{subtasks.length}
          </Badge>
        )}
      </div>

      {showSubtaskList && (
        <div className="mt-1.5 pt-1.5 border-t border-border/60 space-y-1 flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ListTree className="h-3 w-3" />
            <span>
              {completedSubtasks}/{subtasks.length} steps
            </span>
          </div>
          {subtasks.slice(0, maxVisibleSubtasks).map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-1.5 text-[10px] leading-tight"
              onClick={(e) => e.stopPropagation()}
            >
              {sub.isCompleted ? (
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  'truncate',
                  sub.isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {sub.title}
              </span>
            </div>
          ))}
          {subtasks.length > maxVisibleSubtasks && (
            <div className="text-[10px] text-muted-foreground pl-4">
              +{subtasks.length - maxVisibleSubtasks} more
            </div>
          )}
        </div>
      )}

      {!isCompact && task.priority === 1 && (
        <Badge variant="destructive" className="text-[9px] h-4 px-1 mt-1 w-fit shrink-0">
          High
        </Badge>
      )}
    </Card>
  );
}
