'use client';

import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GoalCard } from '@/components/goals/goal-card';

// Mock goals - will be replaced with GraphQL query
const mockActiveGoals = [
  {
    id: '1',
    emoji: '💼',
    title: 'Career Growth',
    description: 'Focus on professional development and skill building',
    color: '#3B82F6',
    frequencyPerWeek: 5,
    durationMinutes: 60,
    completionRate: 85,
    currentStreak: 7,
    longestStreak: 14,
    isPaused: false,
    isActive: true,
  },
  {
    id: '2',
    emoji: '💪',
    title: 'Fitness',
    description: 'Stay active and maintain a healthy lifestyle',
    color: '#10B981',
    frequencyPerWeek: 4,
    durationMinutes: 45,
    completionRate: 92,
    currentStreak: 12,
    longestStreak: 18,
    isPaused: false,
    isActive: true,
  },
  {
    id: '3',
    emoji: '📚',
    title: 'Learning',
    description: 'Read books and learn new skills',
    color: '#EC4899',
    frequencyPerWeek: 3,
    durationMinutes: 30,
    completionRate: 78,
    currentStreak: 4,
    longestStreak: 9,
    isPaused: false,
    isActive: true,
  },
  {
    id: '4',
    emoji: '🎨',
    title: 'Creative Projects',
    description: 'Work on personal creative projects',
    color: '#8B5CF6',
    frequencyPerWeek: 2,
    durationMinutes: 90,
    completionRate: 65,
    currentStreak: 2,
    longestStreak: 5,
    isPaused: false,
    isActive: true,
  },
];

export default function GoalsPage() {
  const handlePause = (goalId: string) => {
    console.log('Pause goal:', goalId);
    // TODO: GraphQL mutation
  };

  const handleResume = (goalId: string) => {
    console.log('Resume goal:', goalId);
    // TODO: GraphQL mutation
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and achievements
          </p>
        </div>
        <Link href="/app/goals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Active Goals */}
      {mockActiveGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {mockActiveGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPause={handlePause}
              onResume={handleResume}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create your first goal to start tracking your progress and building better habits.
          </p>
          <Link href="/app/goals/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Goal
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
