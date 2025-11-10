'use client';

/**
 * SLEEK Goals Grid Component
 * - Responsive grid layout
 * - Empty state handling
 * - Animations for grid items
 */

import { GoalCard } from './goal-card';
import { Card } from '@microplanner/ui';
import { Target } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  isPaused: boolean;
  totalCompletions: number;
  totalScheduled: number;
}

interface GoalsGridProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onViewAnalytics: (id: string) => void;
}

export function GoalsGrid({ goals, onEdit, onDelete, onPause, onResume, onViewAnalytics }: GoalsGridProps) {
  if (goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="glass-card max-w-md">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-dark-text-tertiary" />
            </div>
            <h3 className="text-base font-semibold text-dark-text-primary mb-1">
              No Goals Yet
            </h3>
            <p className="text-sm text-dark-text-secondary">
              Create your first goal to start tracking your progress and building consistency.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
          onPause={onPause}
          onResume={onResume}
          onViewAnalytics={onViewAnalytics}
        />
      ))}
    </div>
  );
}
