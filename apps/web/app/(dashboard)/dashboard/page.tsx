import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getApolloClient } from '@/lib/apollo/client';
import {
  GET_DASHBOARD_STATS,
  GET_UPCOMING_TASKS,
  GET_WEEK_OVERVIEW,
  GET_QUICK_ACTIONS,
} from '@/lib/graphql/queries';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks';
import { WeekOverview } from '@/components/dashboard/week-overview';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardEmpty } from '@/components/dashboard/dashboard-empty';

export const metadata = {
  title: 'Dashboard',
  description: 'Your productivity overview',
};

export default async function DashboardPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get Apollo Client with auth token
  const token = await getToken();
  const client = getApolloClient(token);

  // Fetch all dashboard data via GraphQL
  let dashboardData: any = null;
  let error: string | null = null;

  try {
    const [statsResult, tasksResult, weekResult, actionsResult] = await Promise.all([
      client.query({ query: GET_DASHBOARD_STATS }),
      client.query({ query: GET_UPCOMING_TASKS, variables: { limit: 5 } }),
      client.query({ query: GET_WEEK_OVERVIEW }),
      client.query({ query: GET_QUICK_ACTIONS }),
    ]);

    dashboardData = {
      stats: statsResult.data.dashboardStats,
      upcomingTasks: tasksResult.data.upcomingTasks,
      weekOverview: weekResult.data.weekOverview,
      quickActions: actionsResult.data.quickActions,
    };
  } catch (err: any) {
    console.error('Dashboard GraphQL Error:', err);
    error = err.message;
  }

  // Show empty state if no data
  const hasData =
    dashboardData?.stats?.activeGoalsCount > 0 || dashboardData?.stats?.tasksTodayCount > 0;

  if (!hasData && !error) {
    return <DashboardEmpty />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gradient">
          Dashboard 👋
        </h1>
        <p className="text-sm text-dark-text-secondary mt-1">
          Here's your productivity at a glance
        </p>
      </div>

      {/* Quick Actions */}
      {dashboardData?.quickActions?.length > 0 && (
        <QuickActions actions={dashboardData.quickActions} />
      )}

      {/* Stats Grid */}
      {dashboardData?.stats && <DashboardStats stats={dashboardData.stats} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Tasks */}
        {dashboardData?.upcomingTasks && (
          <UpcomingTasks tasks={dashboardData.upcomingTasks} />
        )}

        {/* Week Overview */}
        {dashboardData?.weekOverview && (
          <WeekOverview weekData={dashboardData.weekOverview} />
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-error">
            Failed to load dashboard data: {error}
          </p>
          <p className="text-xs text-dark-text-tertiary mt-2">
            Check your GraphQL server at port 4000
          </p>
        </div>
      )}
    </div>
  );
}
