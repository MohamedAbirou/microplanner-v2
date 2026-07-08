'use client';

import { useState } from 'react';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTier } from '@/contexts/tier-context';
import { WorkloadWarning } from '@/components/plans/workload-warning';
import { useTasks } from '@/hooks/use-graphql';
import { useWorkHours } from '@/hooks/use-graphql-extended';

interface CustomizePreferencesStepProps {
  preferences: {
    weekStartDate: Date;
    prioritizePeakHours: boolean;
    avoidWeekends: boolean;
    bufferTime: number;
    focusBlockDuration: number;
  };
  selectedGoals: string[];
  onNext: (preferences: any) => void;
  onBack: () => void;
}

export function CustomizePreferencesStep({
  preferences: initialPreferences,
  selectedGoals,
  onNext,
  onBack,
}: CustomizePreferencesStepProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const { tier, limits } = useTier();

  // Preview how busy the target week already is, so the user knows if there's
  // room before generating more tasks into it.
  const weekStart = startOfWeek(preferences.weekStartDate);
  const weekEnd = endOfWeek(preferences.weekStartDate);
  const { tasks: weekTasks } = useTasks(
    { dateRange: { start: weekStart, end: weekEnd } },
    undefined,
    { take: 200 },
  );
  const { workHours } = useWorkHours();

  const isThisWeek = (date: Date) => {
    const now = new Date();
    return (
      startOfWeek(date).getTime() === startOfWeek(now).getTime()
    );
  };

  const isNextWeek = (date: Date) => {
    const nextWeek = addWeeks(new Date(), 1);
    return (
      startOfWeek(date).getTime() === startOfWeek(nextWeek).getTime()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Customize Your Plan</h1>
        <p className="text-muted-foreground">
          Fine-tune how your week should be scheduled.
        </p>
      </div>

      {/* Existing workload for the target week */}
      {weekTasks && weekTasks.length > 0 && (
        <WorkloadWarning tasks={weekTasks as any} schedule={workHours?.schedule} />
      )}

      <div className="space-y-6">
        {/* Week Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Week Selection</CardTitle>
            <CardDescription>Choose which week to plan for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={isThisWeek(preferences.weekStartDate) ? 'default' : 'outline'}
                onClick={() =>
                  setPreferences({ ...preferences, weekStartDate: startOfWeek(new Date()) })
                }
              >
                This Week
              </Button>
              <Button
                variant={isNextWeek(preferences.weekStartDate) ? 'default' : 'outline'}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    weekStartDate: startOfWeek(addWeeks(new Date(), 1)),
                  })
                }
              >
                Next Week
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Selected: {format(preferences.weekStartDate, 'MMM d')} -{' '}
              {format(endOfWeek(preferences.weekStartDate), 'MMM d, yyyy')}
            </p>
          </CardContent>
        </Card>

        {/* Scheduling Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Preferences</CardTitle>
            <CardDescription>Based on your chronotype and work style</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prioritize Peak Hours */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prioritize Peak Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Schedule demanding tasks during your peak productivity hours
                </p>
              </div>
              <Switch
                checked={preferences.prioritizePeakHours}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, prioritizePeakHours: checked })
                }
              />
            </div>

            <Separator />

            {/* Avoid Weekends */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Avoid Weekends</Label>
                <p className="text-sm text-muted-foreground">Keep weekends free from scheduled tasks</p>
              </div>
              <Switch
                checked={preferences.avoidWeekends}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, avoidWeekends: checked })
                }
              />
            </div>

            <Separator />

            {/* Buffer Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Buffer Time Between Tasks</Label>
                <span className="text-sm font-medium">{preferences.bufferTime} min</span>
              </div>
              <Slider
                value={[preferences.bufferTime]}
                onValueChange={([value]) => setPreferences({ ...preferences, bufferTime: value })}
                min={0}
                max={30}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Add breathing room between tasks to avoid burnout
              </p>
            </div>

            <Separator />

            {/* Focus Block Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Focus Block Duration</Label>
                <span className="text-sm font-medium">{preferences.focusBlockDuration} min</span>
              </div>
              <Slider
                value={[preferences.focusBlockDuration]}
                onValueChange={([value]) =>
                  setPreferences({ ...preferences, focusBlockDuration: value })
                }
                min={30}
                max={180}
                step={15}
              />
              <p className="text-xs text-muted-foreground">Ideal length for deep work sessions</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Planning Model — the model is selected server-side by tier
            (PRO/PREMIUM use Claude, STARTER GPT-4o-mini, FREE rule-based),
            so we surface it as read-only info rather than a fake chooser. */}
        {(tier === 'PRO' || tier === 'PREMIUM') && (
          <Card>
            <CardHeader>
              <CardTitle>AI Planning Model</CardTitle>
              <CardDescription>Your tier uses our most advanced planning model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="font-medium">Claude Sonnet</span>
                <Badge>Included with {tier}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced reasoning &amp; context • Quality: 85–95/100
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => onNext(preferences)}>
          Generate Plan
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
