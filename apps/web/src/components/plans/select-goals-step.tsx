'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useTier } from '@/contexts/tier-context';
import { useGoalsList } from '@/hooks/use-graphql';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/page-loader';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SelectGoalsStepProps {
  selectedGoals: string[];
  onNext: (goalIds: string[]) => void;
}

export function SelectGoalsStep({ selectedGoals: initialSelectedGoals, onNext }: SelectGoalsStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSelectedGoals);
  const { tier, limits } = useTier();
  const { goals, loading } = useGoalsList();

  const maxGoalsPerPlan = limits.maxGoalsPerPlan;

  // Filter for active goals only
  const activeGoals = goals?.filter((goal: any) => goal.isActive) || [];

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  if (loading) {
    return <PageLoader label="goals" variant="section" skeletonRows={2} />;
  }

  if (!activeGoals || activeGoals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">No goals found</h1>
          <p className="text-muted-foreground">
            You need to create some goals first before generating a plan.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/goals/new'}>
          Create Your First Goal
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Which goals would you like to work on?</h1>
        <p className="text-muted-foreground">
          Select the goals you want to include in this week's plan. Our AI will optimize your
          schedule around them.
        </p>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeGoals.map((goal: any) => (
          <Card
            key={goal.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedGoals.includes(goal.id) && 'ring-2 ring-primary'
            )}
            onClick={() => toggleGoalSelection(goal.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{goal.emoji}</div>
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {goal.frequencyPerWeek}x/week • {goal.durationMinutes}min
                    </CardDescription>
                  </div>
                </div>
                <Checkbox
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => toggleGoalSelection(goal.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </CardHeader>
            {goal.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Tier Limit Warning */}
      {selectedGoals.length > maxGoalsPerPlan && maxGoalsPerPlan !== -1 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Goal Limit Reached</AlertTitle>
          <AlertDescription>
            Your {tier} plan allows up to {maxGoalsPerPlan} goals per plan. Please deselect{' '}
            {selectedGoals.length - maxGoalsPerPlan} goal(s).
            {tier === 'FREE' && (
              <Button
                variant="link"
                className="px-1 h-auto py-0 text-destructive"
                onClick={() => (window.location.href = '/billing')}
              >
                Upgrade to Starter
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={() => onNext(selectedGoals)}
          disabled={
            selectedGoals.length === 0 ||
            (maxGoalsPerPlan !== -1 && selectedGoals.length > maxGoalsPerPlan)
          }
          size="lg"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
