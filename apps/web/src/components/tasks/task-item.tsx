'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  Timer,
  Play,
  Edit,
  MoreVertical,
  Copy,
  Trash,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    notes?: string;
    startTime: string;
    endTime: string;
    scheduledDate: string;
    durationMinutes: number;
    isCompleted: boolean;
    priority: number;
    goal?: {
      emoji: string;
      title: string;
      color: string;
    };
  };
  compact?: boolean;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
}

export function TaskItem({
  task,
  compact = false,
  onComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onStartTimer,
}: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      onComplete?.(task.id);

      // Confetti animation on completion
      if (!task.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
        });
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors',
        task.isCompleted && 'opacity-60',
        compact && 'p-2'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={handleComplete}
        disabled={isCompleting}
        className="flex-shrink-0"
      />

      {/* Priority Indicator */}
      <div className={cn('h-2 w-2 rounded-full flex-shrink-0', getPriorityColor(task.priority))} />

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium truncate',
              task.isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {task.goal && (
            <Badge variant="outline" className="flex-shrink-0">
              {task.goal.emoji} {task.goal.title}
            </Badge>
          )}
        </div>
        {!compact && task.notes && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.notes}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.startTime} - {task.endTime}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(parseISO(task.scheduledDate), 'MMM d')}
          </span>
          {task.durationMinutes && (
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {task.durationMinutes}min
            </span>
          )}
        </div>
      </div>

      {/* Actions (on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onStartTimer?.(task.id)}
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit?.(task.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate?.(task.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
              <Calendar className="mr-2 h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(task.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
