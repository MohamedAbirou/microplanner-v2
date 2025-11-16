'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek } from 'date-fns';
import { Check, RefreshCw, ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlanQualityScore } from '@/components/plans/plan-quality-score';
import { WeekCalendar } from '@/components/calendar/week-calendar';

// Mock data - will be replaced with GraphQL query from generated plan
const mockQualityMetrics = [
  {
    name: 'Goal Balance',
    score: 22,
    maxScore: 25,
    description: 'Even distribution of tasks across your goals',
    issues: ['Fitness goal has 30% more tasks than Learning goal'],
    suggestions: ['Consider adding 1-2 more Learning tasks to balance your week'],
  },
  {
    name: 'Peak Hours Optimization',
    score: 24,
    maxScore: 25,
    description: 'Tasks scheduled during your optimal productivity hours',
    issues: [],
    suggestions: [],
  },
  {
    name: 'Buffer Time',
    score: 18,
    maxScore: 20,
    description: 'Adequate spacing between tasks for transitions',
    issues: ['3 back-to-back tasks on Tuesday'],
    suggestions: ['Add 15-minute buffer between 10am and 2pm tasks on Tuesday'],
  },
  {
    name: 'Focus Block Duration',
    score: 20,
    maxScore: 20,
    description: 'Deep work sessions align with your preferences',
    issues: [],
    suggestions: [],
  },
  {
    name: 'Weekend Balance',
    score: 10,
    maxScore: 10,
    description: 'Respects your weekend work preferences',
    issues: [],
    suggestions: [],
  },
];

const mockWeekTasks = [
  {
    id: '1',
    title: 'Morning workout',
    notes: 'Cardio + strength training',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0).toISOString(),
    durationMinutes: 60,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '2',
    title: 'Deep work: Project planning',
    notes: 'Plan Q4 roadmap',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '11:00',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0).toISOString(),
    durationMinutes: 120,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '3',
    title: 'Read for 30 minutes',
    notes: 'Continue "Atomic Habits"',
    goal: { id: '4', emoji: '📚', title: 'Learning', color: '#EC4899' },
    startTime: '20:00',
    endTime: '20:30',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0).toISOString(),
    durationMinutes: 30,
    isCompleted: false,
    priority: 2,
  },
  // Tuesday
  {
    id: '4',
    title: 'Yoga session',
    notes: 'Flexibility and mindfulness',
    goal: { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    startTime: '07:00',
    endTime: '08:00',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1).toISOString(),
    durationMinutes: 60,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '5',
    title: 'Client presentation prep',
    notes: 'Prepare slides and talking points',
    goal: { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    startTime: '09:00',
    endTime: '10:30',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1).toISOString(),
    durationMinutes: 90,
    isCompleted: false,
    priority: 1,
  },
  {
    id: '6',
    title: 'Team meeting',
    notes: null,
    goal: { id: '1', emoji: '💼', title: 'Work', color: '#F59E0B' },
    startTime: '10:30',
    endTime: '11:30',
    scheduledDate: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1).toISOString(),
    durationMinutes: 60,
    isCompleted: false,
    priority: 2,
  },
  // Add more days...
];

export default function PlanReviewPage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const overallScore = mockQualityMetrics.reduce((sum, m) => sum + m.score, 0);
  const maxScore = mockQualityMetrics.reduce((sum, m) => sum + m.maxScore, 0);
  const scorePercentage = Math.round((overallScore / maxScore) * 100);

  const handleAcceptPlan = async () => {
    setIsAccepting(true);
    console.log('Accepting plan...');
    // TODO: GraphQL mutation to accept and save plan
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push('/app/week');
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    console.log('Regenerating plan...');
    // TODO: Go back to customize step or regenerate with same settings
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/app/plans/generate');
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

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
          <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          <Button onClick={handleAcceptPlan} disabled={isAccepting}>
            <Check className="mr-2 h-4 w-4" />
            {isAccepting ? 'Accepting...' : 'Accept Plan'}
          </Button>
        </div>
      </div>

      {/* Quality Score */}
      <PlanQualityScore
        metrics={mockQualityMetrics}
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
                {mockWeekTasks.length} tasks scheduled across {new Set(mockWeekTasks.map(t => t.scheduledDate)).size} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <WeekCalendar
                  tasks={mockWeekTasks}
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
              mockWeekTasks.reduce((acc, task) => {
                const day = format(new Date(task.scheduledDate), 'EEEE, MMM d');
                if (!acc[day]) acc[day] = [];
                acc[day].push(task);
                return acc;
              }, {} as Record<string, typeof mockWeekTasks>)
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
