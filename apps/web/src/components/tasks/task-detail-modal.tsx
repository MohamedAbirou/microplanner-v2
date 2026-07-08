'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Target,
  Flag,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  X,
  Timer,
  Play,
  StopCircle,
  Loader2,
} from 'lucide-react';
import { getBlockingTasks, getBlockedTasks } from '@/lib/dependencies';
import { useLogTime } from '@/hooks/use-graphql';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskDependenciesPanel } from '@/components/dependencies/task-dependencies-panel';
import { TaskSubtasksPanel } from '@/components/tasks/task-subtasks-panel';
import { TaskTimeHistory } from '@/components/tasks/task-time-history';
import { TaskDependency, DependencyType } from '@/lib/dependencies';

interface Goal {
  id: string;
  emoji: string;
  title: string;
  color: string;
}

interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
}

interface Task {
  id: string;
  title: string;
  notes?: string | null;
  goal: Goal;
  goalId?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: number;
  subtasks?: Subtask[];
  timeSpentMinutes?: number;
  isTimerRunning?: boolean;
}

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals?: Goal[];
  allTasks?: Task[];
  dependencies?: TaskDependency[];
  onUpdate?: (taskId: string, updates: Partial<Task>) => void | Promise<void>;
  onDelete?: (taskId: string) => void | Promise<void>;
  onToggleComplete?: (taskId: string) => void | Promise<void>;
  onAddDependency?: (fromTaskId: string, toTaskId: string, type: DependencyType) => Promise<void>;
  onRemoveDependency?: (dependencyId: string) => Promise<void>;
  onAddSubtask?: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask?: (subtaskId: string) => Promise<void>;
  onDeleteSubtask?: (subtaskId: string) => Promise<void>;
  onStartTimer?: (taskId: string) => void | Promise<void>;
  onStopTimer?: (taskId: string) => void | Promise<void>;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

const PRIORITY_OPTIONS = [
  { label: 'High', value: 1, color: 'destructive' },
  { label: 'Medium', value: 2, color: 'default' },
  { label: 'Low', value: 3, color: 'secondary' },
] as const;

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  goals = [],
  allTasks = [],
  dependencies = [],
  onUpdate,
  onDelete,
  onToggleComplete,
  onAddDependency,
  onRemoveDependency,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onStartTimer,
  onStopTimer,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTimerBusy, setIsTimerBusy] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editedTask, setEditedTask] = React.useState<Partial<Task>>({});
  const [manualMinutes, setManualMinutes] = React.useState('');
  const { logTime, loading: isLoggingTime } = useLogTime();

  React.useEffect(() => {
    if (task && open) {
      setEditedTask({
        title: task.title,
        notes: task.notes || '',
        goalId: task.goal?.id ?? undefined,
        scheduledDate: format(new Date(task.scheduledDate), 'yyyy-MM-dd'),
        startTime: task.startTime,
        durationMinutes: task.durationMinutes,
        priority: task.priority,
      } as any);
      setIsEditing(false);
    }
  }, [task, open]);

  if (!task) return null;

  const handleSave = async () => {
    if (!task.id) return;

    try {
      await onUpdate?.(task.id, editedTask);
      toast.success('Task updated successfully!', {
        description: 'Your changes have been saved',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task', {
        description: 'Please try again or contact support if the problem persists',
      });
    }
  };

  const handleDelete = async () => {
    if (!task.id) return;

    setIsDeleting(true);
    try {
      await onDelete?.(task.id);
      toast.success('Task deleted successfully', {
        description: `"${task.title}" has been removed from your calendar`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task', {
        description: 'Please try again or contact support if the problem persists',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task.id) return;

    try {
      await onToggleComplete?.(task.id);
      toast.success(
        task.isCompleted ? 'Task marked as incomplete' : 'Task completed!',
        {
          description: task.isCompleted
            ? `"${task.title}" has been reopened`
            : `Great job completing "${task.title}"!`,
        }
      );
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      toast.error('Failed to update task status', {
        description: 'Please try again or contact support if the problem persists',
      });
    }
  };

  const handleToggleTimer = async () => {
    if (!task.id) return;
    setIsTimerBusy(true);
    try {
      if (task.isTimerRunning) {
        await onStopTimer?.(task.id);
      } else {
        await onStartTimer?.(task.id);
      }
    } finally {
      setIsTimerBusy(false);
    }
  };

  const handleLogTime = async () => {
    const minutes = parseInt(manualMinutes, 10);
    if (!task.id || !minutes || minutes <= 0) return;
    try {
      await logTime({ variables: { taskId: task.id, minutes } });
      await onUpdate?.(task.id, { timeSpentMinutes: (task.timeSpentMinutes ?? 0) + minutes });
      setManualMinutes('');
    } catch {
      /* hook surfaces the error toast */
    }
  };

  const selectedGoal = goals.find((g) => g.id === (editedTask.goalId || task.goal?.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[14px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTask.title as string}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold mb-2"
                  placeholder="Task title..."
                />
              ) : (
                <DialogTitle className="text-xl flex items-center gap-2">
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={cn(task.isCompleted && 'line-through text-muted-foreground')}>
                    {task.title}
                  </span>
                </DialogTitle>
              )}

              {!isEditing && (
                <div className="flex items-center gap-2 mt-2">
                  {task.goal && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: task.goal.color, color: task.goal.color }}
                    >
                      <span className="mr-1">{task.goal.emoji}</span>
                      {task.goal.title}
                    </Badge>
                  )}
                  {task.priority === 1 && (
                    <Badge variant="destructive">High Priority</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">
              Subtasks
              {task.subtasks && task.subtasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dependencies">
              Dependencies
              {(getBlockingTasks(task.id, dependencies).length + getBlockedTasks(task.id, dependencies).length) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getBlockingTasks(task.id, dependencies).length + getBlockedTasks(task.id, dependencies).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Goal Selection (Edit Mode) */}
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="goal">
                  <Target className="inline h-3.5 w-3.5 mr-1" />
                  Goal
                </Label>
                <Select
                  value={editedTask.goalId as string}
                  onValueChange={(value) => setEditedTask({ ...editedTask, goalId: value } as any)}
                >
                  <SelectTrigger id="goal">
                    <SelectValue>
                      {selectedGoal && (
                        <div className="flex items-center gap-2">
                          <span>{selectedGoal.emoji}</span>
                          <span>{selectedGoal.title}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex items-center gap-2">
                          <span>{goal.emoji}</span>
                          <span>{goal.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />
                  Date
                </Label>
                {isEditing ? (
                  <Input
                    id="date"
                    type="date"
                    value={editedTask.scheduledDate as string}
                    onChange={(e) => setEditedTask({ ...editedTask, scheduledDate: e.target.value } as any)}
                  />
                ) : (
                  <div className="text-sm p-2 rounded-[10px] bg-muted">
                    {format(new Date(task.scheduledDate), 'EEEE, MMM d, yyyy')}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />
                  Start Time
                </Label>
                {isEditing ? (
                  <Input
                    id="time"
                    type="time"
                    value={editedTask.startTime as string}
                    onChange={(e) => setEditedTask({ ...editedTask, startTime: e.target.value } as any)}
                  />
                ) : (
                  <div className="text-sm p-2 rounded-[10px] bg-muted">
                    {task.startTime} - {task.endTime}
                  </div>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              {isEditing ? (
                <Select
                  value={(editedTask.durationMinutes || task.durationMinutes).toString()}
                  onValueChange={(value) =>
                    setEditedTask({ ...editedTask, durationMinutes: parseInt(value) } as any)
                  }
                >
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm p-2 rounded-[10px] bg-muted">
                  {task.durationMinutes} minutes
                </div>
              )}
            </div>

            {/* Priority (Edit Mode) */}
            {isEditing && (
              <div className="space-y-2">
                <Label>
                  <Flag className="inline h-3.5 w-3.5 mr-1" />
                  Priority
                </Label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        (editedTask.priority || task.priority) === option.value
                          ? option.color
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => setEditedTask({ ...editedTask, priority: option.value } as any)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            {!isEditing && (
              <div className="space-y-2">
                <Label>
                  <Timer className="inline h-3.5 w-3.5 mr-1" />
                  Time Tracking
                </Label>
                <div className="flex items-center justify-between p-3 rounded-[10px] bg-muted">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {task.timeSpentMinutes ?? 0} min tracked
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {task.isTimerRunning
                        ? 'Timer is running…'
                        : `Estimated ${task.durationMinutes} min`}
                    </span>
                  </div>
                  <Button
                    variant={task.isTimerRunning ? 'destructive' : 'default'}
                    size="sm"
                    className="h-9"
                    onClick={handleToggleTimer}
                    disabled={isTimerBusy}
                  >
                    {task.isTimerRunning ? (
                      <>
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop Timer
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>

                {/* Manual time entry */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Log minutes"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={isLoggingTime || !manualMinutes || parseInt(manualMinutes, 10) <= 0}
                    onClick={handleLogTime}
                  >
                    {isLoggingTime ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log'}
                  </Button>
                </div>

                {/* Entry history — view / edit / delete individual logs */}
                <TaskTimeHistory
                  taskId={task.id}
                  enabled={open}
                  onTotalChanged={(delta) =>
                    onUpdate?.(task.id, {
                      timeSpentMinutes: Math.max(0, (task.timeSpentMinutes ?? 0) + delta),
                    })
                  }
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  value={editedTask.notes as string}
                  onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value } as any)}
                  rows={4}
                  placeholder="Add any additional details..."
                />
              ) : task.notes ? (
                <div className="text-sm p-3 rounded-[10px] bg-muted whitespace-pre-wrap">
                  {task.notes}
                </div>
              ) : (
                <div className="text-sm p-3 rounded-[10px] bg-muted text-muted-foreground italic">
                  No notes
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="subtasks" className="mt-4">
            <TaskSubtasksPanel
              taskId={task.id}
              subtasks={task.subtasks || []}
              onAddSubtask={async (title) => {
                await onAddSubtask?.(task.id, title);
              }}
              onToggleSubtask={async (subtaskId) => {
                await onToggleSubtask?.(subtaskId);
              }}
              onDeleteSubtask={async (subtaskId) => {
                await onDeleteSubtask?.(subtaskId);
              }}
            />
          </TabsContent>

          <TabsContent value="dependencies" className="mt-4">
            <TaskDependenciesPanel
              task={task}
              allTasks={allTasks}
              dependencies={dependencies}
              onAddDependency={onAddDependency || (async () => {})}
              onRemoveDependency={onRemoveDependency || (async () => {})}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" className="h-9" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="h-9" onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="h-9" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                variant={task.isCompleted ? 'secondary' : 'default'}
                className="h-9"
                onClick={handleToggleComplete}
              >
                {task.isCompleted ? (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemName={task.title}
        itemType="task"
        onConfirm={handleDelete}
      />
    </Dialog>
  );
}
