'use client';

/**
 * SLEEK Edit Goal Dialog
 * - Pre-populated form with existing goal data
 * - Compact design with Zod validation
 * - GraphQL mutation integration
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@microplanner/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@microplanner/ui';
import { Input } from '@microplanner/ui';
import { Textarea } from '@microplanner/ui';
import { Button } from '@microplanner/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@microplanner/ui';
import { goalSchema, type GoalInput } from '@microplanner/utils';
import { UPDATE_GOAL } from '@/lib/graphql/mutations';
import { GET_GOALS, GET_DASHBOARD_STATS } from '@/lib/graphql/queries';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  preferredTimes?: string[];
  flexibilityScore?: number;
  priority?: number;
}

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMOJI_PRESETS = ['🎯', '💪', '📚', '🏃', '🧘', '🎨', '💼', '🌱', '🔥', '⭐'];
const COLOR_PRESETS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#059669', // Green
  '#D97706', // Orange
  '#EC4899', // Pink
];

export function EditGoalDialog({ goal, open, onOpenChange }: EditGoalDialogProps) {
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#2563EB');

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      emoji: '🎯',
      color: '#2563EB',
      frequencyPerWeek: 3,
      durationMinutes: 60,
      preferredTimes: [],
      flexibilityScore: 5,
      priority: 5,
    },
  });

  // Update form when goal changes
  useEffect(() => {
    if (goal) {
      form.reset({
        title: goal.title,
        description: goal.description || '',
        emoji: goal.emoji || '🎯',
        color: goal.color || '#2563EB',
        frequencyPerWeek: goal.frequencyPerWeek,
        durationMinutes: goal.durationMinutes,
        preferredTimes: goal.preferredTimes || [],
        flexibilityScore: goal.flexibilityScore || 5,
        priority: goal.priority || 5,
      });
      setSelectedEmoji(goal.emoji || '🎯');
      setSelectedColor(goal.color || '#2563EB');
    }
  }, [goal, form]);

  const [updateGoal, { loading }] = useMutation(UPDATE_GOAL, {
    refetchQueries: [{ query: GET_GOALS }, { query: GET_DASHBOARD_STATS }],
    onCompleted: () => {
      toast({
        title: 'Goal Updated',
        description: 'Your goal has been updated successfully.',
        variant: 'success',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const onSubmit = (data: GoalInput) => {
    if (!goal) return;

    updateGoal({
      variables: {
        id: goal.id,
        input: {
          ...data,
          emoji: selectedEmoji,
          color: selectedColor,
        },
      },
    });
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Goal</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Emoji and Color Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-text-primary">
                  Emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-primary-500/20 ring-2 ring-primary-500'
                          : 'bg-dark-bg-tertiary hover:bg-dark-bg-secondary'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-dark-text-primary">
                  Color
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-md transition-all ${
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-offset-dark-bg-primary'
                          : ''
                      }`}
                      style={{
                        backgroundColor: color,
                        ringColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Daily Exercise"
                      className="h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you want to achieve?"
                      className="resize-none text-sm"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Frequency and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequencyPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Times per Week</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x per week
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Duration (minutes)</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[15, 30, 45, 60, 90, 120, 180, 240].map((mins) => (
                          <SelectItem key={mins} value={mins.toString()}>
                            {mins} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority and Flexibility */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Priority (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flexibilityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Flexibility (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        className="h-9"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                Update Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
