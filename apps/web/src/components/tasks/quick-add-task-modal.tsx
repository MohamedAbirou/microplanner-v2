'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Target, Flag } from 'lucide-react';
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

interface Goal {
  id: string;
  emoji: string;
  title: string;
  color: string;
}

interface QuickAddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals?: Goal[];
  defaultDate?: Date;
  defaultTime?: string;
  onSubmit?: (data: TaskFormData) => void | Promise<void>;
}

export interface TaskFormData {
  title: string;
  notes?: string;
  goalId: string;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  priority: number;
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

export function QuickAddTaskModal({
  open,
  onOpenChange,
  goals = [],
  defaultDate,
  defaultTime,
  onSubmit,
}: QuickAddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: '',
    notes: '',
    goalId: goals[0]?.id || '',
    scheduledDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: defaultTime || '09:00',
    durationMinutes: 60,
    priority: 2,
  });

  // Reset form when opened
  React.useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        notes: '',
        goalId: goals[0]?.id || '',
        scheduledDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        startTime: defaultTime || '09:00',
        durationMinutes: 60,
        priority: 2,
      });
    }
  }, [open, defaultDate, defaultTime, goals]);

  // Auto-focus title input when opened
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (open) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGoal = goals.find(g => g.id === formData.goalId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>
            Create a new task and schedule it on your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                ref={titleInputRef}
                id="title"
                placeholder="e.g., Morning workout, Team meeting..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Goal Selection */}
            <div className="space-y-2">
              <Label htmlFor="goal">Goal *</Label>
              <Select
                value={formData.goalId}
                onValueChange={(value) => setFormData({ ...formData, goalId: value })}
              >
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Select a goal">
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

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  <Calendar className="inline h-3.5 w-3.5 mr-1" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  <Clock className="inline h-3.5 w-3.5 mr-1" />
                  Start Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.durationMinutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, durationMinutes: parseInt(value) })}
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
            </div>

            {/* Priority */}
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
                    variant={formData.priority === option.value ? option.color : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className="flex-1"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
