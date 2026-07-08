'use client';

import { GoalCard } from '@/components/goals/goal-card';
import { Button } from '@/components/ui/button';
import { useGoalsList, useUpdateGoal } from '@/hooks/use-graphql';
import { Plus, Target } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';
import Link from 'next/link';

export default function GoalsPage() {
  // Fetch all goals from GraphQL
  const { goals: allGoals, loading, refetch } = useGoalsList();
  const { updateGoal } = useUpdateGoal();

  // Filter for active goals on the client side
  const goals = allGoals?.filter((goal: any) => goal.isActive !== false) || [];

  const handlePause = async (goalId: string) => {
    try {
      await updateGoal({
        variables: {
          id: goalId,
          input: { isPaused: true },
        },
      });
      refetch();
    } catch (error) {
      console.error('Failed to pause goal:', error);
    }
  };

  const handleResume = async (goalId: string) => {
    try {
      await updateGoal({
        variables: {
          id: goalId,
          input: { isPaused: false },
        },
      });
      refetch();
    } catch (error) {
      console.error('Failed to resume goal:', error);
    }
  };

  if (loading) {
    return <PageLoader label="goals" variant="page" className="max-w-7xl mx-auto" />;
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto mp-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Track your progress and achievements
          </p>
        </div>
        <Link href="/goals/new">
          <Button className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Active Goals */}
      {goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal: any) => (
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
          <Link href="/goals/new">
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
