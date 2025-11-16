'use client';

import { useState } from 'react';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Mock goals - will be replaced with GraphQL query
const mockGoals = [
  {
    id: '1',
    emoji: '💼',
    title: 'Career Growth',
    description: 'Focus on professional development',
    frequencyPerWeek: 5,
    durationMinutes: 60,
  },
  {
    id: '2',
    emoji: '💪',
    title: 'Fitness',
    description: 'Stay active and healthy',
    frequencyPerWeek: 4,
    durationMinutes: 45,
  },
  {
    id: '3',
    emoji: '📚',
    title: 'Learning',
    description: 'Read and learn new skills',
    frequencyPerWeek: 3,
    durationMinutes: 30,
  },
  {
    id: '4',
    emoji: '🎨',
    title: 'Creative Projects',
    description: 'Work on side projects',
    frequencyPerWeek: 2,
    durationMinutes: 90,
  },
];

interface SelectGoalsStepProps {
  selectedGoals: string[];
  onNext: (goalIds: string[]) => void;
}

export function SelectGoalsStep({ selectedGoals: initialSelectedGoals, onNext }: SelectGoalsStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSelectedGoals);

  const maxGoalsPerPlan = 5; // From user tier - TODO: Get from user context
  const tier = 'FREE'; // TODO: Get from user context

  const toggleGoalSelection = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

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
        {mockGoals.map((goal) => (
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
      {selectedGoals.length > maxGoalsPerPlan && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Goal Limit Reached</AlertTitle>
          <AlertDescription>
            Your {tier} plan allows up to {maxGoalsPerPlan} goals per plan. Please deselect{' '}
            {selectedGoals.length - maxGoalsPerPlan} goal(s).
            {tier === 'FREE' && (
              <Button variant="link" className="px-1 h-auto py-0 text-destructive">
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
          disabled={selectedGoals.length === 0 || selectedGoals.length > maxGoalsPerPlan}
          size="lg"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
