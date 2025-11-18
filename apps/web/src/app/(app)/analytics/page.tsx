'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  Zap,
  Award,
  Construction,
} from 'lucide-react';
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

// MVP MODE: Mock data shown for demonstration - real GraphQL integration coming soon
// TODO: Connect to actual analytics endpoints before production
const weeklyCompletionData = [
  { week: 'Week 1', completed: 42, planned: 50, rate: 84 },
  { week: 'Week 2', completed: 48, planned: 52, rate: 92 },
  { week: 'Week 3', completed: 45, planned: 50, rate: 90 },
  { week: 'Week 4', completed: 51, planned: 54, rate: 94 },
];

const goalDistributionData = [
  { name: 'Career Growth', value: 35, color: '#3B82F6' },
  { name: 'Fitness', value: 25, color: '#10B981' },
  { name: 'Learning', value: 20, color: '#EC4899' },
  { name: 'Creative', value: 15, color: '#8B5CF6' },
  { name: 'Personal', value: 5, color: '#F59E0B' },
];

const productivityHoursData = [
  { hour: '6am', tasks: 2 },
  { hour: '7am', tasks: 4 },
  { hour: '8am', tasks: 6 },
  { hour: '9am', tasks: 8 },
  { hour: '10am', tasks: 10 },
  { hour: '11am', tasks: 9 },
  { hour: '12pm', tasks: 7 },
  { hour: '1pm', tasks: 5 },
  { hour: '2pm', tasks: 8 },
  { hour: '3pm', tasks: 9 },
  { hour: '4pm', tasks: 7 },
  { hour: '5pm', tasks: 6 },
  { hour: '6pm', tasks: 4 },
  { hour: '7pm', tasks: 3 },
  { hour: '8pm', tasks: 2 },
];

const streakData = [
  { date: 'Mon', streak: 5 },
  { date: 'Tue', streak: 6 },
  { date: 'Wed', streak: 7 },
  { date: 'Thu', streak: 8 },
  { date: 'Fri', streak: 9 },
  { date: 'Sat', streak: 10 },
  { date: 'Sun', streak: 11 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('30d');

  // Calculate summary stats
  const totalTasks = weeklyCompletionData.reduce((sum, w) => sum + w.completed, 0);
  const avgCompletionRate = Math.round(
    weeklyCompletionData.reduce((sum, w) => sum + w.rate, 0) / weeklyCompletionData.length
  );
  const currentStreak = 11; // Mock
  const longestStreak = 14; // Mock

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* MVP Mode Warning */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertTitle>MVP Mode - Mock Data</AlertTitle>
        <AlertDescription>
          This analytics page currently displays demo data. Real-time analytics integration will be completed in the next phase.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your productivity and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Longest: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600">-3%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Completion Rate</CardTitle>
              <CardDescription>
                Track your task completion over the past 4 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goal Distribution</CardTitle>
                <CardDescription>
                  Time spent per goal category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={goalDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>
                  Completion rates by goal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={goalDistributionData}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6">
                      {goalDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity by Hour</CardTitle>
              <CardDescription>
                Identify your peak productivity hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productivityHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Insight:</strong> Your peak productivity is between 9am-11am.
                  Consider scheduling high-priority tasks during these hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Streak Progress</CardTitle>
              <CardDescription>
                Your consistency over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="streak"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">11</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">14</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <div className="text-sm text-muted-foreground">Consistency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
