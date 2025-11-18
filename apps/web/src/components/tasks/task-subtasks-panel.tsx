'use client';

import * as React from 'react';
import { Plus, X, CheckCircle2, Circle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
}

interface TaskSubtasksPanelProps {
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

export function TaskSubtasksPanel({
  taskId,
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskSubtasksPanelProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completedCount = subtasks.filter(s => s.isCompleted).length;
  const totalCount = subtasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) {
      toast.error('Please enter a subtask title');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSubtask(newSubtaskTitle.trim());
      toast.success('Subtask added successfully');
      setNewSubtaskTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add subtask:', error);
      toast.error('Failed to add subtask');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await onToggleSubtask(subtaskId);
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
      toast.error('Failed to update subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await onDeleteSubtask(subtaskId);
      toast.success('Subtask deleted');
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
    }
  };

  const SubtaskItem = ({ subtask }: { subtask: Subtask }) => {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors group">
        <Checkbox
          checked={subtask.isCompleted}
          onCheckedChange={() => handleToggleSubtask(subtask.id)}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm",
            subtask.isCompleted && "line-through text-muted-foreground"
          )}>
            {subtask.title}
          </p>
          {(subtask.scheduledDate || subtask.durationMinutes) && (
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {subtask.scheduledDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(subtask.scheduledDate), 'MMM d')}
                </span>
              )}
              {subtask.startTime && subtask.endTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {subtask.startTime} - {subtask.endTime}
                </span>
              )}
              {subtask.durationMinutes && (
                <span>{subtask.durationMinutes}min</span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleDeleteSubtask(subtask.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      {totalCount > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {completedCount} of {totalCount} subtasks completed
              </span>
              <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                {completionRate}%
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Subtasks ({totalCount})
          </Label>
          <div className="space-y-2">
            {subtasks.map(subtask => (
              <SubtaskItem key={subtask.id} subtask={subtask} />
            ))}
          </div>
        </div>
      )}

      {/* Add Subtask */}
      {subtasks.length > 0 && <Separator />}

      {!isAdding ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      ) : (
        <div className="space-y-3 p-3 border rounded-lg bg-accent/20">
          <div className="space-y-2">
            <Label htmlFor="subtask-title">Subtask Title</Label>
            <Input
              id="subtask-title"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Enter subtask title..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddSubtask();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewSubtaskTitle('');
                }
              }}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim() || isSubmitting}
              className="flex-1"
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewSubtaskTitle('');
              }}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {subtasks.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No subtasks yet</p>
          <p className="text-xs mt-1">Break down this task into smaller steps</p>
        </div>
      )}
    </div>
  );
}
