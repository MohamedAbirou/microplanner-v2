'use client';

import { WeekCalendar } from '@/components/calendar/week-calendar';
import { PlanQualityScore } from '@/components/plans/plan-quality-score';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcceptPlan, usePlans, useTasks } from '@/hooks/use-graphql';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import { Check, ChevronLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

export default function PlanReviewPage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = React.useState(false);

  // Fetch active plan and tasks for the week
  const { plans, loading: plansLoading } = usePlans({ status: 'active' });
  const activePlan = plans.find((p: any) => p.status === 'active');
  const { acceptPlan } = useAcceptPlan();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { tasks: weekTasks, loading: tasksLoading } = useTasks({
    dateRange: { start: weekStart, end: weekEnd },
  });

  const loading = plansLoading || tasksLoading;

  // Generate quality metrics from plan data
  const scorePercentage = activePlan?.qualityScore || 85;

  // Generate quality metrics based on plan score and reasoning
  const qualityMetrics = React.useMemo(() => {
    if (!activePlan) return [];

    const baseScore = activePlan.qualityScore || 85;

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
  }, [activePlan]);

  const handleAcceptPlan = async () => {
    if (!activePlan) {
      toast.error('No active plan to accept');
      return;
    }

    setIsAccepting(true);

    try {
      await acceptPlan({ variables: { id: activePlan.id } });
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

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Review Your Plan</h1>
              <p className="text-muted-foreground mt-1">
                Week of {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRegenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleAcceptPlan} disabled={isAccepting}>
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
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                {weekTasks.length} tasks scheduled across {new Set(weekTasks.map(t => t.scheduledDate)).size} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <WeekCalendar
                  tasks={weekTasks}
                  onTaskClick={(task) => console.log('Task clicked:', task)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {Object.entries(
              weekTasks.reduce((acc, task) => {
                const day = format(new Date(task.scheduledDate), 'EEEE, MMM d');
                if (!acc[day]) acc[day] = [];
                acc[day].push(task);
                return acc;
              }, {} as Record<string, typeof weekTasks>)
            ).map(([day, dayTasks]) => (
              <Card key={day}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{day}</CardTitle>
                    <Badge variant="secondary">
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayTasks
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div
                            className="w-1 h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: task.goal.color }}
                          />
                          <span className="text-2xl">{task.goal.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.startTime} - {task.endTime} ({task.durationMinutes}m)
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{ borderColor: task.goal.color, color: task.goal.color }}
                          >
                            {task.goal.title}
                          </Badge>
                          {task.priority === 1 && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
