import { auth } from '@clerk/nextjs/server';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { Sparkles, Target, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { WeekOverview } from '@/components/dashboard/week-overview';

// GraphQL queries
const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    dashboardStats {
      activeGoalsCount
      tasksTodayCount
      tasksCompletedToday
      completionRate
      weeklyPlansCount
      currentStreak
    }
    upcomingTasks(limit: 5) {
      id
      title
      dueDate
      priority
      goalId
      goalTitle
      goalEmoji
      estimatedDuration
      isCompleted
    }
    weekOverview {
      date
      dayOfWeek
      tasksScheduled
      tasksCompleted
      totalDuration
      productivity
    }
    quickActions {
      id
      title
      description
      icon
      action
      variant
    }
  }
`;

// Create server-side Apollo Client
function createApolloClient(token: string | null) {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
      fetch,
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
}

export default async function DashboardPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dark-text-secondary">Please sign in to view your dashboard</p>
      </div>
    );
  }

  // Fetch dashboard data from GraphQL
  let dashboardData: any = null;

  try {
    const token = await getToken();
    const client = createApolloClient(token);

    const result = await client.query({
      query: GET_DASHBOARD_DATA,
    });

    dashboardData = result.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Use fallback data if GraphQL fails
    dashboardData = {
      dashboardStats: {
        activeGoalsCount: 0,
        tasksTodayCount: 0,
        tasksCompletedToday: 0,
        completionRate: 0,
        weeklyPlansCount: 0,
        currentStreak: 0,
      },
      upcomingTasks: [],
      weekOverview: [],
      quickActions: [],
    };
  }

  const stats = dashboardData?.dashboardStats || {};
  const upcomingTasks = dashboardData?.upcomingTasks || [];
  const weekOverview = dashboardData?.weekOverview || [];
  const quickActions = dashboardData?.quickActions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">
          Dashboard 👋
        </h1>
        <p className="text-dark-text-secondary mt-2">
          Here's what's happening with your productivity today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Active Goals</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeGoalsCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-400" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Tasks Today</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.tasksCompletedToday}/{stats.tasksTodayCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent-400" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Current Streak</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.currentStreak} days</p>
            </div>
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && <QuickActions actions={quickActions} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <UpcomingTasks tasks={upcomingTasks} />

        {/* Week Overview */}
        <WeekOverview weekData={weekOverview} />
      </div>

      {/* Empty State (only show if no data) */}
      {stats.activeGoalsCount === 0 && stats.tasksTodayCount === 0 && (
        <Card className="glass-card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-brand">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Let's Start Your Productivity Journey!
            </h2>
            <p className="text-dark-text-secondary mb-6">
              You're all set up! Start by creating your first goal, and we'll help you plan your week
              with AI-powered scheduling.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/goals"
                className="btn-primary px-6 py-3 rounded-lg transition-all duration-250"
              >
                Create Your First Goal
              </a>
              <a
                href="/plans"
                className="btn-secondary px-6 py-3 rounded-lg transition-all duration-250"
              >
                Generate a Plan
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
