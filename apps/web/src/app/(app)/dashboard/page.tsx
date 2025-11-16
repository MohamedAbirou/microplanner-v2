'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { format, startOfDay, endOfDay } from 'date-fns';
import {
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { calculateCompletionPercentage } from '@/lib/utils';
import { useTasks, useGoals } from '@/hooks/use-graphql';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function getMotivationalMessage(): string {
  const messages = [
    "Ready to crush today's goals!",
    "Let's make today productive!",
    "You've got this!",
    "Time to get things done!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function DashboardPage() {
  const { user } = useUser();
  const timeOfDay = getTimeOfDay();

  // Fetch today's tasks from GraphQL
  const today = new Date();
  const { tasks: todayTasks, loading: tasksLoading } = useTasks({
    dateRange: { start: startOfDay(today), end: endOfDay(today) },
  });

  // Fetch active goals from GraphQL
  const { goals: activeGoals, loading: goalsLoading } = useGoals({ isActive: true });

  const loading = tasksLoading || goalsLoading;

  // Calculate stats from real data
  const completedTasks = todayTasks.filter((t: any) => t.isCompleted).length;
  const totalTasks = todayTasks.length;
  const completionPercentage = calculateCompletionPercentage(completedTasks, totalTasks);

  // Calculate streak from active goals (use max current streak)
  const currentStreak = activeGoals.length > 0
    ? Math.max(...activeGoals.map((g: any) => g.currentStreak || 0))
    : 0;
  const longestStreak = activeGoals.length > 0
    ? Math.max(...activeGoals.map((g: any) => g.longestStreak || 0))
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Good {timeOfDay}, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">{getMotivationalMessage()}</p>
        </div>
        <Link href="/app/plans/generate">
          <Button size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Plan
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <p className="text-xs text-muted-foreground">{completionPercentage}% complete</p>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeGoals.length}/5
            </div>
            <p className="text-xs text-muted-foreground">Goals active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Plans</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1/7</div>
            <p className="text-xs text-muted-foreground">Plans used</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>{format(today, 'EEEE, MMMM d, yyyy')}</CardDescription>
            </div>
            <Link href="/app/today">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayTasks.slice(0, 5).map((task: any) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </div>
                    {task.startTime && task.endTime && (
                      <div className="text-xs text-muted-foreground">
                        {task.startTime} - {task.endTime}
                      </div>
                    )}
                  </div>
                </div>
                {task.goal && (
                  <Badge variant="outline" style={{ borderColor: task.goal.color }}>
                    <span className="mr-1">{task.goal.emoji}</span>
                    {task.goal.title}
                  </Badge>
                )}
              </div>
            ))}

            {todayTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks scheduled for today</p>
                <Link href="/app/today">
                  <Button variant="link" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add a task
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Track your progress across all goals</CardDescription>
            </div>
            <Link href="/app/goals">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.slice(0, 3).map((goal: any) => (
              <div
                key={goal.id}
                className="p-4 rounded-lg border"
                style={{ borderLeftWidth: '4px', borderLeftColor: goal.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div className="font-semibold">{goal.title}</div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{goal.currentStreak || 0} day streak</span>
                  </div>
                  <div className="font-medium">{goal.completionRate || 0}%</div>
                </div>
                <Progress value={goal.completionRate || 0} className="mt-2" />
              </div>
            ))}

            {activeGoals.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No active goals</p>
                <Link href="/app/goals/new">
                  <Button variant="link" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a goal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/app/today">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Today's Schedule</div>
                  <p className="text-sm text-muted-foreground">View daily tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/week">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Week View</div>
                  <p className="text-sm text-muted-foreground">Plan your week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/plans/generate">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Generate Plan</div>
                  <p className="text-sm text-muted-foreground">AI-powered scheduling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
