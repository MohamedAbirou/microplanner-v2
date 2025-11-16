'use client';

import * as React from 'react';
import { GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskResize } from '@/hooks/use-task-resize';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  title: string;
  notes?: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: number;
  goal: {
    id: string;
    emoji: string;
    title: string;
    color: string;
  };
}

interface ResizableTaskCardProps {
  task: Task;
  onClick?: () => void;
  onResize?: (taskId: string, newDurationMinutes: number, newStartTime?: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  className?: string;
}

export function ResizableTaskCard({
  task,
  onClick,
  onResize,
  showCheckbox = false,
  isSelected = false,
  onToggleSelect,
  className,
}: ResizableTaskCardProps) {
  const [tempDuration, setTempDuration] = React.useState<number | null>(null);
  const [tempStartTime, setTempStartTime] = React.useState<string | null>(null);

  const handleResize = React.useCallback(
    (taskId: string, newDuration: number, newStartTime?: string) => {
      setTempDuration(null);
      setTempStartTime(null);
      onResize?.(taskId, newDuration, newStartTime);
    },
    [onResize]
  );

  const { isResizing, getResizeHandleProps } = useTaskResize({
    onResize: handleResize,
    minDurationMinutes: 15,
    snapToMinutes: 15,
  });

  const priorityColor = {
    1: 'border-l-red-500',
    2: 'border-l-yellow-500',
    3: 'border-l-blue-500',
  }[task.priority];

  return (
    <div
      className={cn(
        'relative group rounded-lg border-l-4 bg-card p-3 shadow-sm transition-all cursor-pointer',
        'hover:shadow-md hover:scale-[1.02]',
        priorityColor,
        task.isCompleted && 'opacity-60',
        isSelected && 'ring-2 ring-primary',
        isResizing(task.id) && 'ring-2 ring-blue-500 shadow-lg',
        className
      )}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.resize-handle') && !showCheckbox) {
          onClick?.();
        }
      }}
      style={{
        backgroundColor: `${task.goal.color}10`,
      }}
    >
      {/* Top Resize Handle */}
      {onResize && (
        <div
          {...getResizeHandleProps(task.id, 'top', task.durationMinutes, task.startTime)}
          className="resize-handle opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-3 w-3 mx-auto text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-2">
        {/* Selection Checkbox */}
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.goal.emoji && <span className="text-sm">{task.goal.emoji}</span>}
            <h3
              className={cn(
                'text-sm font-medium truncate',
                task.isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </h3>
            {task.isCompleted && (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {tempStartTime || task.startTime} - {task.endTime}
            </span>
            <Badge variant="outline" className="text-[10px] h-4 px-1">
              {tempDuration || task.durationMinutes}m
            </Badge>
          </div>

          {task.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.notes}</p>
          )}
        </div>
      </div>

      {/* Bottom Resize Handle */}
      {onResize && (
        <div
          {...getResizeHandleProps(task.id, 'bottom', task.durationMinutes, task.startTime)}
          className="resize-handle opacity-0 group-hover:opacity-100"
        >
          <GripVertical className="h-3 w-3 mx-auto text-muted-foreground" />
        </div>
      )}

      {/* Resizing Indicator */}
      {isResizing(task.id) && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="default" className="text-xs">
            Resizing...
          </Badge>
        </div>
      )}
    </div>
  );
}
