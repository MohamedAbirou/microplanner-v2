'use client';

import * as React from 'react';
import { Link2, Plus, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  TaskDependency,
  DependencyType,
  validateDependency,
  getDependencyStats,
  getBlockingTasks,
  getBlockedTasks,
  getRelatedTasks,
  getDependencyDescription,
} from '@/lib/dependencies';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  scheduledDate?: string | null;
  isCompleted: boolean;
}

interface TaskDependenciesPanelProps {
  task: Task;
  allTasks: Task[];
  dependencies: TaskDependency[];
  onAddDependency: (fromTaskId: string, toTaskId: string, type: DependencyType) => Promise<void>;
  onRemoveDependency: (dependencyId: string) => Promise<void>;
}

export function TaskDependenciesPanel({
  task,
  allTasks,
  dependencies,
  onAddDependency,
  onRemoveDependency,
}: TaskDependenciesPanelProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>('');
  const [selectedType, setSelectedType] = React.useState<DependencyType>('BLOCKS');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const stats = React.useMemo(() => {
    return getDependencyStats(task, allTasks, dependencies);
  }, [task, allTasks, dependencies]);

  const blockingTaskIds = React.useMemo(() => {
    return getBlockingTasks(task.id, dependencies);
  }, [task.id, dependencies]);

  const blockedTaskIds = React.useMemo(() => {
    return getBlockedTasks(task.id, dependencies);
  }, [task.id, dependencies]);

  const relatedTaskIds = React.useMemo(() => {
    return getRelatedTasks(task.id, dependencies);
  }, [task.id, dependencies]);

  const availableTasks = React.useMemo(() => {
    return allTasks.filter(t => t.id !== task.id);
  }, [allTasks, task.id]);

  const handleAddDependency = async () => {
    if (!selectedTaskId) {
      toast.error('Please select a task');
      return;
    }

    const fromTaskId = selectedType === 'BLOCKED_BY' ? task.id : task.id;
    const toTaskId = selectedType === 'BLOCKED_BY' ? selectedTaskId : selectedTaskId;

    // Validate
    const validation = validateDependency(
      fromTaskId,
      toTaskId,
      selectedType,
      allTasks,
      dependencies
    );

    if (!validation.valid) {
      toast.error('Cannot add dependency', {
        description: validation.error,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddDependency(fromTaskId, toTaskId, selectedType);

      const selectedTask = allTasks.find(t => t.id === selectedTaskId);
      toast.success('Dependency added successfully', {
        description: `"${task.title}" is now ${selectedType.toLowerCase().replace('_', ' ')} "${selectedTask?.title}"`,
      });

      setIsAdding(false);
      setSelectedTaskId('');
    } catch (error) {
      console.error('Failed to add dependency:', error);
      toast.error('Failed to add dependency');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await onRemoveDependency(dependencyId);
      toast.success('Dependency removed');
    } catch (error) {
      console.error('Failed to remove dependency:', error);
      toast.error('Failed to remove dependency');
    }
  };

  const DependencyItem = ({ dependencyId, relatedTaskId, type, canRemove = true }: {
    dependencyId: string;
    relatedTaskId: string;
    type: DependencyType;
    canRemove?: boolean;
  }) => {
    const relatedTask = allTasks.find(t => t.id === relatedTaskId);
    if (!relatedTask) return null;

    const typeLabel = {
      BLOCKS: 'Blocks',
      BLOCKED_BY: 'Blocked by',
      RELATED_TO: 'Related to',
    }[type];

    const typeColor = {
      BLOCKS: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      BLOCKED_BY: 'bg-red-500/10 text-red-700 dark:text-red-400',
      RELATED_TO: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    }[type];

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge variant="outline" className={cn('text-xs', typeColor)}>
            {typeLabel}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{relatedTask.title}</p>
            <div className="flex items-center gap-2 mt-1">
              {relatedTask.scheduledDate && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(relatedTask.scheduledDate), 'MMM d')}
                </span>
              )}
              {relatedTask.isCompleted ? (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => handleRemoveDependency(dependencyId)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      {(stats.totalBlocking > 0 || stats.totalBlocked > 0) && (
        <Alert className={cn(
          !stats.canStart && 'border-yellow-500/50 bg-yellow-500/10'
        )}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stats.canStart ? (
              <span className="text-sm">
                This task can be started. {stats.totalBlocking > 0 && `${stats.completedBlocking}/${stats.totalBlocking} blocking tasks completed.`}
              </span>
            ) : (
              <span className="text-sm">
                This task is blocked. Complete {stats.totalBlocking - stats.completedBlocking} blocking task(s) first.
                {stats.suggestedDate && (
                  <> Suggested start date: {format(stats.suggestedDate, 'MMM d, yyyy')}</>
                )}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Blocking Tasks (tasks this task depends on) */}
      {blockingTaskIds.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Blocked By ({blockingTaskIds.length})
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            These tasks must be completed before this task can start
          </p>
          <div className="space-y-2">
            {blockingTaskIds.map(relatedId => {
              const dep = dependencies.find(d =>
                (d.type === 'BLOCKED_BY' && d.fromTaskId === task.id && d.toTaskId === relatedId) ||
                (d.type === 'BLOCKS' && d.toTaskId === task.id && d.fromTaskId === relatedId)
              );
              return dep ? (
                <DependencyItem
                  key={dep.id}
                  dependencyId={dep.id}
                  relatedTaskId={relatedId}
                  type="BLOCKED_BY"
                />
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Blocked Tasks (tasks that depend on this task) */}
      {blockedTaskIds.length > 0 && (
        <>
          {blockingTaskIds.length > 0 && <Separator />}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Blocks ({blockedTaskIds.length})
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              These tasks cannot start until this task is completed
            </p>
            <div className="space-y-2">
              {blockedTaskIds.map(relatedId => {
                const dep = dependencies.find(d =>
                  (d.type === 'BLOCKS' && d.fromTaskId === task.id && d.toTaskId === relatedId) ||
                  (d.type === 'BLOCKED_BY' && d.toTaskId === task.id && d.fromTaskId === relatedId)
                );
                return dep ? (
                  <DependencyItem
                    key={dep.id}
                    dependencyId={dep.id}
                    relatedTaskId={relatedId}
                    type="BLOCKS"
                  />
                ) : null;
              })}
            </div>
          </div>
        </>
      )}

      {/* Related Tasks */}
      {relatedTaskIds.length > 0 && (
        <>
          {(blockingTaskIds.length > 0 || blockedTaskIds.length > 0) && <Separator />}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-500" />
              Related Tasks ({relatedTaskIds.length})
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Tasks related to this one
            </p>
            <div className="space-y-2">
              {relatedTaskIds.map(relatedId => {
                const dep = dependencies.find(d =>
                  d.type === 'RELATED_TO' &&
                  ((d.fromTaskId === task.id && d.toTaskId === relatedId) ||
                   (d.toTaskId === task.id && d.fromTaskId === relatedId))
                );
                return dep ? (
                  <DependencyItem
                    key={dep.id}
                    dependencyId={dep.id}
                    relatedTaskId={relatedId}
                    type="RELATED_TO"
                  />
                ) : null;
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Dependency */}
      {(blockingTaskIds.length > 0 || blockedTaskIds.length > 0 || relatedTaskIds.length > 0) && <Separator />}

      {!isAdding ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Dependency
        </Button>
      ) : (
        <div className="space-y-3 p-3 border rounded-lg bg-accent/20">
          <div className="space-y-2">
            <Label htmlFor="dependency-type">Dependency Type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DependencyType)}>
              <SelectTrigger id="dependency-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BLOCKS">This task blocks...</SelectItem>
                <SelectItem value="BLOCKED_BY">This task is blocked by...</SelectItem>
                <SelectItem value="RELATED_TO">This task is related to...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="related-task">Task</Label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger id="related-task">
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                    {t.isCompleted && ' (Completed)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddDependency}
              disabled={!selectedTaskId || isSubmitting}
              className="flex-1"
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setSelectedTaskId('');
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
      {blockingTaskIds.length === 0 && blockedTaskIds.length === 0 && relatedTaskIds.length === 0 && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No dependencies yet</p>
          <p className="text-xs mt-1">Add dependencies to manage task relationships</p>
        </div>
      )}
    </div>
  );
}
