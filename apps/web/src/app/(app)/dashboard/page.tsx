'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
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

// Mock data - will be replaced with real GraphQL queries
const mockStats = {
  tasksToday: { completed: 3, total: 8 },
  streak: { current: 7, longest: 14 },
  activeGoals: { current: 3, max: 5 },
  plansThisWeek: { used: 2, max: 7 },
};

const mockTodayTasks = [
  {
    id: '1',
    title: 'Review project proposal',
    goal: { emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '10:00',
    isCompleted: true,
  },
  {
    id: '2',
    title: 'Morning workout',
    goal: { emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    isCompleted: true,
  },
  {
    id: '3',
    title: 'Team standup meeting',
    goal: { emoji: '💼', title: 'Work', color: '#F59E0B' },
    startTime: '10:00',
    endTime: '10:30',
    isCompleted: true,
  },
  {
    id: '4',
    title: 'Deep work: Code review',
    goal: { emoji: '⚡', title: 'Development', color: '#8B5CF6' },
    startTime: '14:00',
    endTime: '16:00',
    isCompleted: false,
  },
  {
    id: '5',
    title: 'Read for 30 minutes',
    goal: { emoji: '📚', title: 'Learning', color: '#EC4899' },
    startTime: '20:00',
    endTime: '20:30',
    isCompleted: false,
  },
];

const mockActiveGoals = [
  {
    id: '1',
    emoji: '💼',
    title: 'Career Growth',
    description: 'Focus on professional development',
    frequencyPerWeek: 5,
    durationMinutes: 60,
    completionRate: 85,
    currentStreak: 7,
  },
  {
    id: '2',
    emoji: '💪',
    title: 'Fitness',
    description: 'Stay active and healthy',
    frequencyPerWeek: 4,
    durationMinutes: 45,
    completionRate: 92,
    currentStreak: 12,
  },
  {
    id: '3',
    emoji: '📚',
    title: 'Learning',
    description: 'Read and learn new skills',
    frequencyPerWeek: 3,
    durationMinutes: 30,
    completionRate: 78,
    currentStreak: 4,
  },
];

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
  const completionPercentage = calculateCompletionPercentage(
    mockStats.tasksToday.completed,
    mockStats.tasksToday.total
  );

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
              {mockStats.tasksToday.completed}/{mockStats.tasksToday.total}
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
            <div className="text-2xl font-bold">{mockStats.streak.current} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {mockStats.streak.longest} days
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
              {mockStats.activeGoals.current}/{mockStats.activeGoals.max}
            </div>
            <p className="text-xs text-muted-foreground">Goals active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plans This Week</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.plansThisWeek.used}/{mockStats.plansThisWeek.max}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockStats.plansThisWeek.max - mockStats.plansThisWeek.used} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </div>
            <Link href="/app/today">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {mockTodayTasks.length > 0 ? (
            <div className="space-y-2">
              {mockTodayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${
                    task.isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-center h-5 w-5 rounded border-2 border-primary">
                    {task.isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium truncate ${
                          task.isCompleted ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge variant="outline" className="flex-shrink-0">
                        {task.goal.emoji} {task.goal.title}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {task.startTime} - {task.endTime}
                    </div>
                  </div>
                </div>
              ))}
              {mockTodayTasks.length > 5 && (
                <Link href="/app/today">
                  <Button variant="ghost" className="w-full mt-2">
                    +{mockTodayTasks.length - 5} more tasks
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-sm text-muted-foreground">
                No tasks scheduled for today. You're all set!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Track your progress and achievements</CardDescription>
            </div>
            <Link href="/app/goals">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {mockActiveGoals.length > 0 ? (
            <div className="space-y-4">
              {mockActiveGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{goal.emoji}</div>
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{goal.completionRate}%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.completionRate}%</span>
                    </div>
                    <Progress value={goal.completionRate} />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {goal.frequencyPerWeek}x/week • {goal.durationMinutes}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {goal.currentStreak} day streak
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No active goals yet. Create your first goal to get started!
              </p>
              <Link href="/app/goals/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
