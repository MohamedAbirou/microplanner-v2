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
  ListTodo,
  Link as LinkIcon,
  StopCircle,
  XCircle,
  Pause,
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
    isSkipped?: boolean;
    priority: number;
    tags?: string[];
    project?: {
      id: string;
      name: string;
      color: string;
      icon?: string;
    };
    goal?: {
      id: string;
      emoji: string;
      title: string;
      color: string;
    };
    subtasks?: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
    }>;
    dependencies?: Array<{ id: string }>;
    blockedBy?: Array<{ id: string }>;
    isTimerRunning?: boolean;
    timeSpentMinutes?: number;
    timerStartedAt?: string;
  };
  compact?: boolean;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (taskId: string) => void;
  onStartTimer?: (taskId: string) => void;
  onStopTimer?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
}

export function TaskItem({
  task,
  compact = false,
  onComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onStartTimer,
  onStopTimer,
  onSkip,
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
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-medium',
              task.isCompleted && 'line-through text-muted-foreground',
              task.isSkipped && 'line-through text-muted-foreground opacity-50'
            )}
          >
            {task.title}
          </span>

          {/* Subtasks indicator */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListTodo className="h-3 w-3" />
              <span>{task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}</span>
            </div>
          )}

          {/* Dependency indicator */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600" title="Has dependencies">
              <LinkIcon className="h-3 w-3" />
            </div>
          )}

          {/* Blocked indicator */}
          {task.blockedBy && task.blockedBy.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-600" title="Blocked by other tasks">
              <LinkIcon className="h-3 w-3" />
            </div>
          )}

          {/* Timer running indicator */}
          {task.isTimerRunning && (
            <Badge variant="default" className="bg-green-600 text-xs">
              <Timer className="h-3 w-3 mr-1" />
              Running
            </Badge>
          )}

          {/* Skipped badge */}
          {task.isSkipped && (
            <Badge variant="secondary" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Skipped
            </Badge>
          )}
        </div>

        {!compact && task.notes && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.notes}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
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
          {task.timeSpentMinutes > 0 && (
            <span className="flex items-center gap-1 text-green-600">
              <Timer className="h-3 w-3" />
              {task.timeSpentMinutes}min tracked
            </span>
          )}
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {task.project && (
            <Badge variant="outline" style={{ borderColor: task.project.color }}>
              {task.project.icon && <span className="mr-1">{task.project.icon}</span>}
              {task.project.name}
            </Badge>
          )}
          {task.goal && (
            <Badge variant="outline" style={{ borderColor: task.goal.color }}>
              <span className="mr-1">{task.goal.emoji}</span>
              {task.goal.title}
            </Badge>
          )}
          {task.tags && task.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions (on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Timer Button */}
        {task.isTimerRunning ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600"
            onClick={() => onStopTimer?.(task.id)}
            title="Stop timer"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onStartTimer?.(task.id)}
            title="Start timer"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}

        {/* Edit Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit?.(task.id)}
          title="Edit task"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* More Options */}
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
            {!task.isCompleted && !task.isSkipped && (
              <DropdownMenuItem onClick={() => onSkip?.(task.id)}>
                <Pause className="mr-2 h-4 w-4" />
                Skip Task
              </DropdownMenuItem>
            )}
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
