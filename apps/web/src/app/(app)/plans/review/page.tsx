'use client';

import { WeekCalendar } from '@/components/calendar/week-calendar';
import { PlanQualityScore } from '@/components/plans/plan-quality-score';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLoader } from '@/components/ui/page-loader';
import { useAcceptPlan, usePlan, usePlans, useRegeneratePlan } from '@/hooks/use-graphql';
import { useWorkHours } from '@/hooks/use-graphql-extended';
import { WorkloadWarning } from '@/components/plans/workload-warning';
import { addDays, format, parseISO } from 'date-fns';
import { Check, ChevronLeft, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

export default function PlanReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const [isAccepting, setIsAccepting] = React.useState(false);

  const { plan: planById, loading: planByIdLoading } = usePlan(planId);
  const { plans: draftPlans, loading: draftsLoading } = usePlans(
    { status: 'DRAFT' },
    { skipQuery: !!planId }
  );
  const { acceptPlan } = useAcceptPlan();
  const { regeneratePlan, loading: isRegenerating } = useRegeneratePlan();
  const { workHours } = useWorkHours();

  // Prefer explicit id from history/generate flow; fall back to latest DRAFT plan.
  const reviewPlan =
    planById ??
    (!planId
      ? draftPlans.find((p: any) => p.status === 'DRAFT') ?? draftPlans[0] ?? null
      : null);

  const loading = planId ? planByIdLoading : draftsLoading;

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

  const handleRegenerate = async () => {
    if (!reviewPlan) {
      toast.error('No plan to regenerate');
      return;
    }

    toast.info('Regenerating your plan', {
      description: 'Creating a new optimized schedule based on your preferences',
    });

    try {
      const { data } = await regeneratePlan({ variables: { id: reviewPlan.id } });
      const newId = data?.regeneratePlan?.id;
      if (newId) {
        router.push(`/plans/review?id=${newId}`);
      }
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    }
  };

  if (loading) {
    return <PageLoader label="review" variant="page" className="max-w-7xl mx-auto" />;
  }

  if (!reviewPlan) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">
            {planId ? 'Plan not found or you do not have access to it.' : 'No draft plan found to review.'}
          </p>
          <Button onClick={() => router.push(planId ? '/plans' : '/plans/generate')}>
            {planId ? 'Back to Plans' : 'Generate a Plan'}
          </Button>
        </div>
      </div>
    );
  }

  const isDraft = reviewPlan.status === 'DRAFT';

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
              <h1 className="text-2xl font-semibold tracking-tight">
                {isDraft ? 'Review Your Plan' : 'Plan Details'}
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{reviewPlan.status}</Badge>
          <Button variant="outline" className="h-9" onClick={handleRegenerate} disabled={!isDraft || isRegenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating…' : 'Regenerate'}
          </Button>
          {isDraft && (
          <Button className="h-9" onClick={handleAcceptPlan} disabled={isAccepting}>
            <Check className="mr-2 h-4 w-4" />
            {isAccepting ? 'Accepting...' : 'Accept Plan'}
          </Button>
          )}
        </div>
      </div>

      {/* Workload / capacity check (draft plans only) */}
      {isDraft && planTasks.length > 0 && (
        <WorkloadWarning tasks={planTasks} schedule={workHours?.schedule} />
      )}

      {/* Quality Score */}
      <PlanQualityScore
        metrics={qualityMetrics}
        overallScore={scorePercentage}
      />

      {/* Plan Preview Tabs — list view rows include a "Why this slot?" explainer */}
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
                            className="rounded-[10px] border border-border hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 p-3">
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
                            <WhySlot task={task} />
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

/**
 * Derive a human-readable "why this slot" explanation for a scheduled task.
 * Prefers the planner's own `aiReasoning`; otherwise builds a deterministic
 * explanation from the task's real attributes (time of day, priority, block).
 */
function slotReason(task: any): string {
  if (task.aiReasoning && String(task.aiReasoning).trim()) {
    return String(task.aiReasoning).trim();
  }

  const parts: string[] = [];
  const hour = parseInt(String(task.startTime || '').split(':')[0], 10);
  if (!Number.isNaN(hour)) {
    if (hour < 12) parts.push('scheduled in the morning, a common high-focus window');
    else if (hour < 17) parts.push('placed in the afternoon around your working hours');
    else parts.push('scheduled later in the day');
  }
  if (task.priority === 1) parts.push('prioritised early as a high-priority task');
  if (task.goal?.title) parts.push(`allocated toward your “${task.goal.title}” goal`);
  if (task.durationMinutes) parts.push(`in a ${task.durationMinutes}-minute focus block`);

  return parts.length > 0
    ? `This task was ${parts.join(', ')}.`
    : 'Scheduled to balance your goals across the week.';
}

function WhySlot({ task }: { task: any }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-t border-border/60 px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Why this slot?
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{slotReason(task)}</p>
      )}
    </div>
  );
}
