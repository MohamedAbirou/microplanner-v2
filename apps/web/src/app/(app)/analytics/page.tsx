'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Target, Clock, Zap, Award, Sparkles, Lightbulb, Loader2, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTasksAnalytics, useGoals } from '@/hooks/use-graphql';
import {
  useDashboardStats,
  useWeeklyReview,
  useGenerateInsights,
} from '@/hooks/use-graphql-extended';
import { useTier } from '@/contexts/tier-context';
import { endOfDay } from 'date-fns';

const GOAL_COLORS = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444', '#84CC16'];

const RANGE_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('30d');
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState<string[]>([]);

  const { tier } = useTier();
  const canUseAi = tier === 'PRO' || tier === 'PREMIUM';
  const { review } = useWeeklyReview();
  const { generateInsights, loading: generatingInsights } = useGenerateInsights();

  const handleGenerateInsights = async () => {
    try {
      const res = await generateInsights();
      const list = (res.data?.generateInsights as string[]) || [];
      setAiInsights(list);
    } catch {
      /* toast handled in hook */
    }
  };

  const rangeStart = React.useMemo(() => {
    const days = RANGE_DAYS[timeRange] ?? 30;
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - (days - 1));
    return start;
  }, [timeRange]);

  const { tasks: allTasks, loading: tasksLoading } = useTasksAnalytics(
    { dateRange: { start: rangeStart, end: endOfDay(new Date()) } },
    undefined,
    { take: 500 }
  );
  const { goals, loading: goalsLoading } = useGoals();
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();

  const loading = tasksLoading || goalsLoading || statsLoading;

  // Tasks inside the selected range (already filtered server-side)
  const tasks = allTasks || [];

  // Summary stats — all computed from real task data
  const summary = React.useMemo(() => {
    const completed = tasks.filter((t: any) => t.isCompleted);
    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;
    const totalMinutes = completed.reduce(
      (sum: number, t: any) => sum + (t.timeSpentMinutes || t.durationMinutes || 0),
      0
    );
    return {
      tasksCompleted: completed.length,
      totalTasks: tasks.length,
      completionRate,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    };
  }, [tasks]);

  // Weekly completion — group range into ISO weeks (Mon-Sun)
  const weeklyCompletionData = React.useMemo(() => {
    const weeks = new Map<number, { completed: number; planned: number }>();
    for (const t of tasks) {
      const d = new Date(t.scheduledDate);
      const monday = startOfDay(d);
      const day = monday.getDay();
      monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
      const key = monday.getTime();
      const bucket = weeks.get(key) || { completed: 0, planned: 0 };
      bucket.planned++;
      if (t.isCompleted) bucket.completed++;
      weeks.set(key, bucket);
    }
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a - b)
      .map(([key, bucket]) => ({
        week: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        completed: bucket.completed,
        planned: bucket.planned,
        rate: bucket.planned > 0 ? Math.round((bucket.completed / bucket.planned) * 100) : 0,
      }));
  }, [tasks]);

  // Weekly tracked vs estimated time (from real timer data)
  const weeklyTimeData = React.useMemo(() => {
    const weeks = new Map<number, { tracked: number; estimated: number }>();
    for (const t of tasks) {
      const tracked = t.timeSpentMinutes || 0;
      const estimated = t.durationMinutes || 0;
      if (tracked <= 0 && estimated <= 0) continue;
      const d = new Date(t.scheduledDate);
      const monday = startOfDay(d);
      const day = monday.getDay();
      monday.setDate(monday.getDate() + (day === 0 ? -6 : 1 - day));
      const key = monday.getTime();
      const bucket = weeks.get(key) || { tracked: 0, estimated: 0 };
      bucket.tracked += tracked;
      bucket.estimated += estimated;
      weeks.set(key, bucket);
    }
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a - b)
      .map(([key, bucket]) => ({
        week: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        tracked: Math.round((bucket.tracked / 60) * 10) / 10,
        estimated: Math.round((bucket.estimated / 60) * 10) / 10,
      }));
  }, [tasks]);

  const timeSummary = React.useMemo(() => {
    let tracked = 0;
    let estimated = 0;
    let tasksTracked = 0;
    for (const t of tasks) {
      const m = t.timeSpentMinutes || 0;
      if (m > 0) {
        tracked += m;
        estimated += t.durationMinutes || 0;
        tasksTracked++;
      }
    }
    return {
      trackedHours: Math.round((tracked / 60) * 10) / 10,
      tasksTracked,
      avgPerTask: tasksTracked > 0 ? Math.round(tracked / tasksTracked) : 0,
      // Actual vs estimated — >100% means tasks took longer than planned.
      estimateAccuracy: estimated > 0 ? Math.round((tracked / estimated) * 100) : 0,
    };
  }, [tasks]);

  // Time spent per goal
  const goalDistributionData = React.useMemo(() => {
    const byGoal = new Map<string, number>();
    for (const t of tasks) {
      if (!t.goalId) continue;
      const minutes = t.isCompleted ? t.timeSpentMinutes || t.durationMinutes || 0 : 0;
      if (minutes <= 0) continue;
      byGoal.set(t.goalId, (byGoal.get(t.goalId) || 0) + minutes);
    }
    const entries = Array.from(byGoal.entries())
      .map(([goalId, minutes], i) => {
        const goal = (goals || []).find((g: any) => g.id === goalId);
        return {
          name: goal ? `${goal.emoji || ''} ${goal.title}`.trim() : 'Other',
          value: Math.round((minutes / 60) * 10) / 10,
          color: goal?.color || GOAL_COLORS[i % GOAL_COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value);
    return entries;
  }, [tasks, goals]);

  // Goal completion rates
  const goalProgressData = React.useMemo(() => {
    const byGoal = new Map<string, { completed: number; total: number }>();
    for (const t of tasks) {
      if (!t.goalId) continue;
      const bucket = byGoal.get(t.goalId) || { completed: 0, total: 0 };
      bucket.total++;
      if (t.isCompleted) bucket.completed++;
      byGoal.set(t.goalId, bucket);
    }
    return Array.from(byGoal.entries())
      .map(([goalId, bucket], i) => {
        const goal = (goals || []).find((g: any) => g.id === goalId);
        return {
          name: goal ? `${goal.emoji || ''} ${goal.title}`.trim() : 'Other',
          value: bucket.total > 0 ? Math.round((bucket.completed / bucket.total) * 100) : 0,
          color: goal?.color || GOAL_COLORS[i % GOAL_COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [tasks, goals]);

  // Completed tasks by hour of day (from scheduled startTime)
  const productivityHoursData = React.useMemo(() => {
    const byHour = new Map<number, number>();
    for (const t of tasks) {
      if (!t.isCompleted || !t.startTime) continue;
      const hour = parseInt(t.startTime.split(':')[0], 10);
      if (Number.isNaN(hour)) continue;
      byHour.set(hour, (byHour.get(hour) || 0) + 1);
    }
    const hours: { hour: string; tasks: number }[] = [];
    for (let h = 5; h <= 22; h++) {
      hours.push({ hour: formatHourLabel(h), tasks: byHour.get(h) || 0 });
    }
    return hours;
  }, [tasks]);

  const peakHour = React.useMemo(() => {
    let best: { hour: string; tasks: number } | null = null;
    for (const row of productivityHoursData) {
      if (!best || row.tasks > best.tasks) best = row;
    }
    return best && best.tasks > 0 ? best.hour : null;
  }, [productivityHoursData]);

  // Daily completions over the last 14 days (consistency view)
  const dailyCompletionData = React.useMemo(() => {
    const days: { date: string; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(new Date());
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const completed = (allTasks || []).filter((t: any) => {
        if (!t.isCompleted || !t.completedAt) return false;
        const c = new Date(t.completedAt);
        return c >= day && c < next;
      }).length;
      days.push({
        date: day.toLocaleDateString(undefined, { weekday: 'short' }),
        completed,
      });
    }
    return days;
  }, [allTasks]);

  const consistency = React.useMemo(() => {
    const activeDays = dailyCompletionData.filter((d) => d.completed > 0).length;
    return Math.round((activeDays / dailyCompletionData.length) * 100);
  }, [dailyCompletionData]);

  const currentStreak = dashboardStats?.currentStreak ?? 0;
  const longestStreak = dashboardStats?.longestStreak ?? 0;

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded-[6px]" />
            <Skeleton className="h-4 w-64 rounded-[6px]" />
          </div>
          <Skeleton className="h-10 w-[180px] rounded-[10px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="h-[360px] rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto mp-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Track your productivity and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9" onClick={() => setReviewOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Weekly Review
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {summary.totalTasks} scheduled in range
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">across the selected range</p>
          </CardContent>
        </Card>

        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">Longest: {longestStreak} days</p>
          </CardContent>
        </Card>

        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">on completed tasks in range</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Weekly Completion</CardTitle>
              <CardDescription className="text-[13px]">Completed vs planned tasks per week</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyCompletionData.length === 0 ? (
                <div className="flex items-center justify-center text-center rounded-[10px] border border-border bg-accent py-12">
                  <p className="text-[13px] text-muted-foreground max-w-sm">
                    No tasks scheduled in this range yet. Generate a plan or add tasks to see trends.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyCompletionData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                    />
                    <Area
                      type="monotone"
                      dataKey="planned"
                      stroke="#94A3B8"
                      fillOpacity={0.3}
                      fill="#94A3B8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeSummary.trackedHours}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  across {timeSummary.tasksTracked} tracked tasks
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per Task</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeSummary.avgPerTask}m</div>
                <p className="text-xs text-muted-foreground mt-1">actual time per tracked task</p>
              </CardContent>
            </Card>
            <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimate Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeSummary.estimateAccuracy > 0 ? `${timeSummary.estimateAccuracy}%` : '—'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeSummary.estimateAccuracy === 0
                    ? 'no tracked tasks yet'
                    : timeSummary.estimateAccuracy > 110
                    ? 'tasks run longer than planned'
                    : timeSummary.estimateAccuracy < 90
                    ? 'tasks finish faster than planned'
                    : 'estimates are on target'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Tracked vs Estimated Time</CardTitle>
              <CardDescription className="text-[13px]">
                Hours tracked against planned duration per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyTimeData.length === 0 ? (
                <div className="flex items-center justify-center text-center rounded-[10px] border border-border bg-accent py-12">
                  <p className="text-[13px] text-muted-foreground max-w-sm">
                    Start a timer on a task to see your tracked time here. Track time from a task&apos;s
                    detail view or the timer button on any task.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="estimated" name="Estimated (h)" fill="#94A3B8" />
                    <Bar dataKey="tracked" name="Tracked (h)" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader>
                <CardTitle className="text-[15px]">Goal Distribution</CardTitle>
                <CardDescription className="text-[13px]">Hours spent per goal (completed tasks)</CardDescription>
              </CardHeader>
              <CardContent>
                {goalDistributionData.length === 0 ? (
                  <div className="flex items-center justify-center text-center rounded-[10px] border border-border bg-accent py-12">
                    <p className="text-[13px] text-muted-foreground max-w-xs">
                      Complete some goal tasks to see how your time is distributed.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={goalDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {goalDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
              <CardHeader>
                <CardTitle className="text-[15px]">Goal Progress</CardTitle>
                <CardDescription className="text-[13px]">Completion rate per goal (%)</CardDescription>
              </CardHeader>
              <CardContent>
                {goalProgressData.length === 0 ? (
                  <div className="flex items-center justify-center text-center rounded-[10px] border border-border bg-accent py-12">
                    <p className="text-[13px] text-muted-foreground max-w-xs">
                      Schedule tasks against your goals to see completion rates.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={goalProgressData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6">
                        {goalProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {/* AI Insights */}
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Insights
                </CardTitle>
                <CardDescription className="text-[13px]">
                  Personalized recommendations from your completion patterns
                </CardDescription>
              </div>
              {canUseAi && (
                <Button
                  size="sm"
                  className="h-9"
                  onClick={handleGenerateInsights}
                  disabled={generatingInsights}
                >
                  {generatingInsights ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Insights
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!canUseAi ? (
                <div className="flex flex-col items-center justify-center text-center rounded-[10px] border border-border bg-accent py-10 px-4">
                  <TrendingUp className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">AI pattern insights are a Pro feature</p>
                  <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">
                    Upgrade to Pro to unlock AI-learned recommendations about your best hours,
                    optimal session length, and productivity patterns.
                  </p>
                </div>
              ) : aiInsights.length === 0 ? (
                <div className="flex items-center justify-center text-center rounded-[10px] border border-border bg-accent py-10">
                  <p className="text-[13px] text-muted-foreground max-w-sm">
                    Click <strong>Generate Insights</strong> to analyze your recent completions and
                    surface personalized recommendations.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {aiInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-[10px] border border-border p-4"
                    >
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-none text-amber-500" />
                      <p className="text-[13px] leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Productivity by Hour</CardTitle>
              <CardDescription className="text-[13px]">Completed tasks by scheduled start hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productivityHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
              {peakHour && (
                <div className="mt-4 p-4 bg-accent border border-border rounded-[10px]">
                  <p className="text-[13px] text-accent-foreground">
                    <strong>Insight:</strong> Your peak completion hour is around {peakHour}.
                    Consider scheduling high-priority tasks near that time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4">
          <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Daily Completions</CardTitle>
              <CardDescription className="text-[13px]">Tasks completed per day over the last two weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-[10px] bg-muted/50">
                  <div className="text-2xl font-bold text-[hsl(var(--success))]">{currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="p-4 rounded-[10px] bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{longestStreak}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="p-4 rounded-[10px] bg-muted/50">
                  <div className="text-2xl font-bold text-accent-foreground">{consistency}%</div>
                  <div className="text-sm text-muted-foreground">Consistency (14d)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-[540px] rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Weekly Review
            </DialogTitle>
            <DialogDescription>
              {review
                ? `${new Date(review.weekStartDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })} – ${new Date(review.weekEndDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Your week at a glance'}
            </DialogDescription>
          </DialogHeader>

          {!review ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full rounded-[10px]" />
              <Skeleton className="h-20 w-full rounded-[10px]" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[10px] border border-border p-3 text-center">
                  <div className="text-xl font-bold">{Math.round(review.completionRate)}%</div>
                  <div className="text-xs text-muted-foreground">completion</div>
                </div>
                <div className="rounded-[10px] border border-border p-3 text-center">
                  <div className="text-xl font-bold">{review.tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground">tasks done</div>
                </div>
                <div className="rounded-[10px] border border-border p-3 text-center">
                  <div className="text-xl font-bold">{currentStreak}</div>
                  <div className="text-xs text-muted-foreground">day streak</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Top goals this week
                </div>
                {review.topGoals && review.topGoals.length > 0 ? (
                  <div className="space-y-1.5">
                    {review.topGoals.map((g: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-[8px] bg-muted/50 px-3 py-2"
                      >
                        <span className="text-sm truncate">{g.title}</span>
                        <span className="text-xs text-muted-foreground flex-none ml-2">
                          {g.completions} completions
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-foreground">
                    No goal completions logged this week yet.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 rounded-[10px] border border-primary/20 bg-primary/5 p-4">
                <Lightbulb className="h-4 w-4 mt-0.5 flex-none text-primary" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-0.5">
                    Recommendation
                  </div>
                  <p className="text-sm">{review.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
