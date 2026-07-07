'use client';

import { WeekCalendar } from '@/components/calendar/week-calendar';
import { PlanQualityScore } from '@/components/plans/plan-quality-score';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcceptPlan, usePlan, usePlans } from '@/hooks/use-graphql';
import { addDays, format, parseISO } from 'date-fns';
import { Check, ChevronLeft, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

export default function PlanReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const [isAccepting, setIsAccepting] = React.useState(false);

  const { plan: planById, loading: planByIdLoading } = usePlan(planId);
  const { plans: draftPlans, loading: draftsLoading } = usePlans({ status: 'DRAFT' });
  const { acceptPlan } = useAcceptPlan();

  // Prefer explicit id from generate flow; fall back to latest DRAFT plan.
  const reviewPlan =
    planById ??
    draftPlans.find((p: any) => p.status === 'DRAFT') ??
    draftPlans[0] ??
    null;

  const loading = (planId ? planByIdLoading : false) || draftsLoading;

  const weekStart = reviewPlan?.weekStartDate
    ? parseISO(reviewPlan.weekStartDate)
    : new Date();
  const weekEnd = reviewPlan?.weekEndDate
    ? parseISO(reviewPlan.weekEndDate)
    : addDays(weekStart, 6);

  // DRAFT plans store proposed tasks in planJson — exposed via plan.tasks in GraphQL.
  const planTasks = reviewPlan?.tasks ?? [];

  const scorePercentage = reviewPlan?.qualityScore || 85;

  const qualityMetrics = React.useMemo(() => {
    if (!reviewPlan) return [];

    const baseScore = reviewPlan.qualityScore || 85;

    return [
      {
        name: 'Goal Balance',
        score: Math.round((baseScore / 100) * 25),
        maxScore: 25,
        description: 'Even distribution of tasks across your goals',
        issues: baseScore < 90 ? ['Some goals may need more tasks'] : [],
        suggestions: baseScore < 90 ? ['Consider balancing task distribution across goals'] : [],
      },
      {
        name: 'Peak Hours Optimization',
        score: Math.round((baseScore / 100) * 25),
        maxScore: 25,
        description: 'Tasks scheduled during your optimal productivity hours',
        issues: [],
        suggestions: [],
      },
      {
        name: 'Buffer Time',
        score: Math.round((baseScore / 100) * 20),
        maxScore: 20,
        description: 'Adequate spacing between tasks for transitions',
        issues: baseScore < 85 ? ['Some tasks might be back-to-back'] : [],
        suggestions: baseScore < 85 ? ['Consider adding buffer time between tasks'] : [],
      },
      {
        name: 'Focus Block Duration',
        score: Math.round((baseScore / 100) * 20),
        maxScore: 20,
        description: 'Deep work sessions align with your preferences',
        issues: [],
        suggestions: [],
      },
      {
        name: 'Weekend Balance',
        score: Math.round((baseScore / 100) * 10),
        maxScore: 10,
        description: 'Respects your weekend work preferences',
        issues: [],
        suggestions: [],
      },
    ];
  }, [reviewPlan]);

  const handleAcceptPlan = async () => {
    if (!reviewPlan) {
      toast.error('No draft plan to accept');
      return;
    }

    if (reviewPlan.status !== 'DRAFT') {
      toast.error('This plan has already been accepted');
      return;
    }

    setIsAccepting(true);

    try {
      await acceptPlan({ variables: { id: reviewPlan.id } });
      router.push('/week');
    } catch (error) {
      console.error('Failed to accept plan:', error);
      setIsAccepting(false);
    }
  };

  const handleRegenerate = () => {
    toast.info('Regenerating your plan', {
      description: 'Creating a new optimized schedule based on your preferences',
    });
    router.push('/plans/generate');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">
          Loading plan review...
        </div>
      </div>
    );
  }

  if (!reviewPlan) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">No draft plan found to review.</p>
          <Button onClick={() => router.push('/plans/generate')}>Generate a Plan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto mp-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Review Your Plan</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{reviewPlan.status}</Badge>
          <Button variant="outline" className="h-9" onClick={handleRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button className="h-9" onClick={handleAcceptPlan} disabled={isAccepting || reviewPlan.status !== 'DRAFT'}>
            <Check className="mr-2 h-4 w-4" />
            {isAccepting ? 'Accepting...' : 'Accept Plan'}
          </Button>
        </div>
      </div>

      {/* Quality Score */}
      <PlanQualityScore
        metrics={qualityMetrics}
        overallScore={scorePercentage}
      />

      {/* Plan Preview Tabs */}
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Weekly Schedule</CardTitle>
              <CardDescription className="text-[13px]">
                {planTasks.length} tasks scheduled across{' '}
                {new Set(planTasks.map((t: any) => t.scheduledDate)).size} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <WeekCalendar
                  tasks={planTasks}
                  currentDate={weekStart}
                  onTaskClick={(task) => console.log('Task clicked:', task)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {planTasks.length === 0 ? (
              <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No tasks in this plan yet.
                </CardContent>
              </Card>
            ) : (
              Object.entries(
                planTasks.reduce((acc: any, task: any) => {
                  const day = format(new Date(task.scheduledDate), 'EEEE, MMM d');
                  if (!acc[day]) acc[day] = [];
                  acc[day].push(task);
                  return acc;
                }, {} as Record<string, any[]>) as Record<string, any[]>
              ).map(([day, dayTasks]) => (
                <Card key={day} className="rounded-[14px] shadow-[var(--sh-sm)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[15px]">{day}</CardTitle>
                      <Badge variant="secondary">
                        {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dayTasks
                        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
                        .map((task: any) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-[10px] border border-border hover:bg-accent/50 transition-colors"
                          >
                            <div
                              className="w-1 h-12 rounded-full flex-shrink-0"
                              style={{ backgroundColor: task.goal?.color ?? '#94a3b8' }}
                            />
                            <span className="text-2xl">{task.goal?.emoji ?? '📌'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {task.startTime} - {task.endTime} ({task.durationMinutes}m)
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: task.goal?.color ?? '#94a3b8',
                                color: task.goal?.color ?? '#94a3b8',
                              }}
                            >
                              {task.goal?.title ?? 'No goal'}
                            </Badge>
                            {task.priority === 1 && (
                              <Badge variant="destructive">High Priority</Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
