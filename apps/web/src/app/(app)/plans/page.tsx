'use client';

import * as React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data - will be replaced with GraphQL queries
const mockActivePlan = {
  id: '1',
  weekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
  weekEnd: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6),
  qualityScore: 92,
  totalTasks: 28,
  completedTasks: 18,
  aiModel: 'Claude Sonnet 3.5',
  goals: [
    { id: '1', emoji: '💼', title: 'Career Growth', taskCount: 10, color: '#3B82F6' },
    { id: '2', emoji: '💪', title: 'Fitness', taskCount: 8, color: '#10B981' },
    { id: '3', emoji: '📚', title: 'Learning', taskCount: 6, color: '#EC4899' },
    { id: '4', emoji: '🎨', title: 'Creative', taskCount: 4, color: '#8B5CF6' },
  ],
  createdAt: new Date().toISOString(),
  status: 'active' as const,
};

const mockPlanHistory = [
  {
    id: '2',
    weekStart: startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 }),
    weekEnd: addDays(startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 }), 6),
    qualityScore: 88,
    totalTasks: 26,
    completedTasks: 24,
    completionRate: 92,
    aiModel: 'Claude Sonnet 3.5',
    status: 'completed' as const,
  },
  {
    id: '3',
    weekStart: startOfWeek(addDays(new Date(), -14), { weekStartsOn: 1 }),
    weekEnd: addDays(startOfWeek(addDays(new Date(), -14), { weekStartsOn: 1 }), 6),
    qualityScore: 85,
    totalTasks: 25,
    completedTasks: 22,
    completionRate: 88,
    aiModel: 'GPT-4o',
    status: 'completed' as const,
  },
  {
    id: '4',
    weekStart: startOfWeek(addDays(new Date(), -21), { weekStartsOn: 1 }),
    weekEnd: addDays(startOfWeek(addDays(new Date(), -21), { weekStartsOn: 1 }), 6),
    qualityScore: 90,
    totalTasks: 27,
    completedTasks: 25,
    completionRate: 93,
    aiModel: 'Claude Sonnet 3.5',
    status: 'completed' as const,
  },
];

export default function PlansPage() {
  const router = useRouter();
  const completionPercentage = Math.round(
    (mockActivePlan.completedTasks / mockActivePlan.totalTasks) * 100
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Plans</h1>
          <p className="text-muted-foreground mt-1">AI-generated weekly schedules</p>
        </div>
        <Link href="/app/plans/generate">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Plan
          </Button>
        </Link>
      </div>

      {/* Active Plan Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>Active Plan</CardTitle>
                <Badge variant="default">Current Week</Badge>
              </div>
              <CardDescription>
                {format(mockActivePlan.weekStart, 'MMM d')} -{' '}
                {format(mockActivePlan.weekEnd, 'MMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/app/plans/review')}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/app/plans/generate')}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Week Progress</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {mockActivePlan.completedTasks} of {mockActivePlan.totalTasks} tasks completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockActivePlan.qualityScore}</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockActivePlan.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockActivePlan.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold">{mockActivePlan.aiModel}</div>
                <div className="text-xs text-muted-foreground">AI Model</div>
              </div>
            </div>
          </div>

          {/* Goal Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Goal Breakdown</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {mockActivePlan.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ borderLeftWidth: '4px', borderLeftColor: goal.color }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{goal.emoji}</span>
                    <span className="font-medium text-sm">{goal.title}</span>
                  </div>
                  <Badge variant="secondary">{goal.taskCount} tasks</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan History */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Plans</CardTitle>
              <CardDescription>
                Review your previous weekly plans and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPlanHistory.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/app/plans/${plan.id}`)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-muted">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {format(plan.weekStart, 'MMM d')} -{' '}
                          {format(plan.weekEnd, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {plan.completedTasks}/{plan.totalTasks} tasks
                          </span>
                          <span>•</span>
                          <span>{plan.completionRate}% completion</span>
                          <span>•</span>
                          <span>Quality: {plan.qualityScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={plan.completionRate >= 90 ? 'default' : 'secondary'}
                      >
                        {plan.completionRate}%
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">91%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {mockPlanHistory.length} plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">88</div>
                <p className="text-xs text-muted-foreground mt-1">Quality score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {mockPlanHistory.length + 1}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Plans generated</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
