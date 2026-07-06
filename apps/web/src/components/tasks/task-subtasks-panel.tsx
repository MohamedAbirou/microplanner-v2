'use client';

import * as React from 'react';
import { Plus, X, CheckCircle2, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface TaskSubtasksPanelProps {
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
}

export function TaskSubtasksPanel({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskSubtasksPanelProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSubtask(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
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
    } catch (error) {
      console.error('Failed to delete subtask:', error);
      toast.error('Failed to delete subtask');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Steps</Label>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount} done
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <Progress value={completionRate} className="h-1.5" />
      )}

      {subtasks.length > 0 ? (
        <div className="space-y-1.5">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2.5 py-2 px-2.5 rounded-md hover:bg-accent/50 transition-colors group"
            >
              <Checkbox
                checked={subtask.isCompleted}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
                className="flex-shrink-0"
              />
              <p
                className={cn(
                  'flex-1 text-sm min-w-0',
                  subtask.isCompleted && 'line-through text-muted-foreground'
                )}
              >
                {subtask.title}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Break this task into smaller steps</p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a step..."
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddSubtask();
          }}
        />
        <Button
          size="sm"
          className="shrink-0"
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim() || isSubmitting}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Steps live inside the parent task on your calendar — they won&apos;t appear as separate blocks.
      </p>
    </div>
  );
}
