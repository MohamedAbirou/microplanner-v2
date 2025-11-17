'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlans } from '@/hooks/use-graphql';
import { format } from 'date-fns';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    RefreshCw,
    Sparkles,
    Target,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  // Fetch plans from GraphQL
  const { plans, loading } = usePlans();

  // Separate active and completed plans
  const activePlan = plans.find((p: any) => p.status === 'active');
  const planHistory = plans.filter((p: any) => p.status === 'completed');

  const completionPercentage = activePlan
    ? Math.round((activePlan.completedTasks / activePlan.totalTasks) * 100)
    : 0;

  // Calculate stats
  const avgCompletion = planHistory.length > 0
    ? Math.round(
        planHistory.reduce((acc: number, p: any) => acc + p.completionRate, 0) /
          planHistory.length
      )
    : 0;

  const avgQuality = planHistory.length > 0
    ? Math.round(
        planHistory.reduce((acc: number, p: any) => acc + p.qualityScore, 0) /
          planHistory.length
      )
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">
          Loading plans...
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Weekly Plans</h1>
            <p className="text-muted-foreground mt-1">AI-generated weekly schedules</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Plan</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first AI-powered weekly plan
            </p>
            <Link href="/plans/generate">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Plans</h1>
          <p className="text-muted-foreground mt-1">AI-generated weekly schedules</p>
        </div>
        <Link href="/plans/generate">
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
                {format(new Date(activePlan.weekStart), 'MMM d')} -{' '}
                {format(new Date(activePlan.weekEnd), 'MMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/plans/review')}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/plans/generate')}
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
              {activePlan.completedTasks} of {activePlan.totalTasks} tasks completed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activePlan.qualityScore}</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activePlan.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activePlan.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold">{activePlan.aiModel}</div>
                <div className="text-xs text-muted-foreground">AI Model</div>
              </div>
            </div>
          </div>

          {/* Goal Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Goal Breakdown</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {activePlan.goals.map((goal) => (
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
                {planHistory.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/plans/${plan.id}`)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-muted">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {format(new Date(plan.weekStart), 'MMM d')} -{' '}
                          {format(new Date(plan.weekEnd), 'MMM d, yyyy')}
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
                <div className="text-3xl font-bold text-green-600">{avgCompletion}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {planHistory.length} plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{avgQuality}</div>
                <p className="text-xs text-muted-foreground mt-1">Quality score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {planHistory.length + 1}
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
