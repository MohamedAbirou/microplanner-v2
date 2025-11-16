'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, Clock, Target, Flag, Repeat } from 'lucide-react';
import { RecurrenceRule, RECURRENCE_PRESETS, getRecurrenceDescription } from '@/lib/recurrence';
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
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: '',
    notes: '',
    goalId: goals[0]?.id || '',
    scheduledDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: defaultTime || '09:00',
    durationMinutes: 60,
    priority: 2,
    isRecurring: false,
    recurrenceRule: undefined,
  });
  const [selectedRecurrencePreset, setSelectedRecurrencePreset] = React.useState<string>('none');

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
        isRecurring: false,
        recurrenceRule: undefined,
      });
      setSelectedRecurrencePreset('none');
      setErrors({});
    }
  }, [open, defaultDate, defaultTime, goals]);

  // Auto-focus title input when opened
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (open) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Task title must be less than 200 characters';
    }

    // Validate goal
    if (!formData.goalId) {
      newErrors.goalId = 'Please select a goal';
    }

    // Validate date
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Allow past dates but warn if more than 1 year in past
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (selectedDate < oneYearAgo) {
        newErrors.scheduledDate = 'Date seems too far in the past';
      }

      // Warn if more than 1 year in future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate > oneYearFromNow) {
        newErrors.scheduledDate = 'Date seems too far in the future';
      }
    }

    // Validate time
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime)) {
        newErrors.startTime = 'Invalid time format (use HH:MM)';
      }
    }

    // Validate duration
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    } else if (formData.durationMinutes > 1440) {
      newErrors.durationMinutes = 'Duration cannot exceed 24 hours';
    }

    // Validate notes length
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecurrencePresetChange = (value: string) => {
    setSelectedRecurrencePreset(value);

    if (value === 'none') {
      setFormData({
        ...formData,
        isRecurring: false,
        recurrenceRule: undefined,
      });
    } else if (value === 'custom') {
      setFormData({
        ...formData,
        isRecurring: true,
        recurrenceRule: { frequency: 'DAILY', interval: 1 },
      });
    } else {
      // Use preset
      const preset = Object.values(RECURRENCE_PRESETS).find(p => p.label === value);
      if (preset) {
        setFormData({
          ...formData,
          isRecurring: true,
          recurrenceRule: { ...preset.rule },
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);

      const recurringText = formData.isRecurring && formData.recurrenceRule
        ? ` (${getRecurrenceDescription(formData.recurrenceRule)})`
        : '';

      toast.success('Task created successfully!', {
        description: `"${formData.title}" has been added to your calendar${recurringText}`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task', {
        description: 'Please try again or contact support if the problem persists',
      });
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
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                required
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Goal Selection */}
            <div className="space-y-2">
              <Label htmlFor="goal">Goal *</Label>
              <Select
                value={formData.goalId}
                onValueChange={(value) => {
                  setFormData({ ...formData, goalId: value });
                  if (errors.goalId) setErrors({ ...errors, goalId: '' });
                }}
              >
                <SelectTrigger id="goal" className={errors.goalId ? 'border-destructive' : ''}>
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
              {errors.goalId && (
                <p className="text-sm text-destructive">{errors.goalId}</p>
              )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, scheduledDate: e.target.value });
                    if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' });
                  }}
                  required
                  className={errors.scheduledDate ? 'border-destructive' : ''}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-destructive">{errors.scheduledDate}</p>
                )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, startTime: e.target.value });
                    if (errors.startTime) setErrors({ ...errors, startTime: '' });
                  }}
                  required
                  className={errors.startTime ? 'border-destructive' : ''}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.durationMinutes.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, durationMinutes: parseInt(value) });
                  if (errors.durationMinutes) setErrors({ ...errors, durationMinutes: '' });
                }}
              >
                <SelectTrigger id="duration" className={errors.durationMinutes ? 'border-destructive' : ''}>
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
              {errors.durationMinutes && (
                <p className="text-sm text-destructive">{errors.durationMinutes}</p>
              )}
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

            {/* Recurrence */}
            <div className="space-y-2">
              <Label htmlFor="recurrence">
                <Repeat className="inline h-3.5 w-3.5 mr-1" />
                Repeat
              </Label>
              <Select value={selectedRecurrencePreset} onValueChange={handleRecurrencePresetChange}>
                <SelectTrigger id="recurrence">
                  <SelectValue placeholder="Does not repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  {Object.entries(RECURRENCE_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={preset.label}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {formData.isRecurring && formData.recurrenceRule && (
                <p className="text-xs text-muted-foreground">
                  {getRecurrenceDescription(formData.recurrenceRule)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes (optional)
                {formData.notes && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formData.notes.length}/1000
                  </span>
                )}
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details..."
                value={formData.notes}
                onChange={(e) => {
                  setFormData({ ...formData, notes: e.target.value });
                  if (errors.notes) setErrors({ ...errors, notes: '' });
                }}
                rows={3}
                className={errors.notes ? 'border-destructive' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes}</p>
              )}
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
