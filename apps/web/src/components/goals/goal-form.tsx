'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  emoji: z.string().default('🎯'),
  color: z.string().default('#3B82F6'),
  frequencyPerWeek: z.number().min(1).max(7),
  durationMinutes: z.number().min(15).max(300),
  priority: z.number().min(1).max(10),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  initialData?: Partial<GoalFormValues>;
  onSubmit: (data: GoalFormValues) => Promise<void>;
  submitLabel?: string;
}

const EMOJI_OPTIONS = [
  '🎯', '💼', '💪', '📚', '❤️', '🎨', '🎵', '✈️', '💡', '🌟',
  '🏃', '🧘', '🍎', '💻', '📱', '🎮', '📷', '🎬', '🏋️', '🧑‍💼'
];

const COLOR_OPTIONS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

export function GoalForm({ initialData, onSubmit, submitLabel = 'Create Goal' }: GoalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<GoalFormValues>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    emoji: initialData?.emoji || '🎯',
    color: initialData?.color || '#3B82F6',
    frequencyPerWeek: initialData?.frequencyPerWeek || 3,
    durationMinutes: initialData?.durationMinutes || 60,
    priority: initialData?.priority || 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      router.push('/app/goals');
    } catch (error) {
      console.error('Failed to submit goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
          <CardDescription>Define what you want to achieve</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Learn Spanish, Exercise regularly"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Add more details about this goal"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center hover:bg-accent transition-colors ${
                    formData.emoji === emoji ? 'bg-accent ring-2 ring-primary' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
          <CardDescription>How often and how long</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Frequency per Week</Label>
              <span className="text-sm font-medium">{formData.frequencyPerWeek}x/week</span>
            </div>
            <Slider
              value={[formData.frequencyPerWeek]}
              onValueChange={([value]) => setFormData({ ...formData, frequencyPerWeek: value })}
              min={1}
              max={7}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              How many times per week do you want to work on this goal?
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Duration per Session</Label>
              <span className="text-sm font-medium">{formData.durationMinutes} minutes</span>
            </div>
            <Slider
              value={[formData.durationMinutes]}
              onValueChange={([value]) => setFormData({ ...formData, durationMinutes: value })}
              min={15}
              max={180}
              step={15}
            />
            <p className="text-xs text-muted-foreground">
              How long should each session be?
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Priority</Label>
              <span className="text-sm font-medium">{formData.priority}/10</span>
            </div>
            <Slider
              value={[formData.priority]}
              onValueChange={([value]) => setFormData({ ...formData, priority: value })}
              min={1}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Higher priority goals will be scheduled first
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
