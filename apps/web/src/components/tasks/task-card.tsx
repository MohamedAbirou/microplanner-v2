'use client';

import { format, parseISO } from 'date-fns';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    scheduledDate: string;
    durationMinutes: number;
    isCompleted: boolean;
    goal?: {
      emoji: string;
      title: string;
      color: string;
    };
  };
  onClick?: (taskId: string) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={() => onClick?.(task.id)}
      className={cn(
        'relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
        task.isCompleted && 'opacity-60'
      )}
      style={{
        backgroundColor: task.goal?.color ? `${task.goal.color}15` : undefined,
        borderLeft: task.goal?.color ? `4px solid ${task.goal.color}` : undefined,
      }}
    >
      {/* Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className={cn(
            'font-semibold text-sm line-clamp-2',
            task.isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </h3>
        {task.isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
      </div>

      {/* Goal Badge */}
      {task.goal && (
        <Badge variant="outline" className="mb-2">
          {task.goal.emoji} {task.goal.title}
        </Badge>
      )}

      {/* Time & Duration */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {task.startTime} - {task.endTime}
          </span>
        </div>
        <span>•</span>
        <span>{task.durationMinutes}min</span>
      </div>
    </div>
  );
}
