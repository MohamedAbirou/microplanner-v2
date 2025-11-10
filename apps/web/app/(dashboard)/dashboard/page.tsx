import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getApolloClient } from '@/lib/apollo/client';
import { GET_DASHBOARD_STATS, GET_TASKS } from '@/lib/graphql/queries';
import { DashboardClient } from './dashboard-client';
import { DashboardEmpty } from '@/components/dashboard/dashboard-empty';

/**
 * Dashboard Page - Calendar View (Main)
 * Shows FullCalendar with all scheduled tasks
 */

export const metadata = {
  title: 'Dashboard | Calendar',
  description: 'Your weekly calendar and task scheduling',
};

export default async function DashboardPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const token = await getToken();
  const client = getApolloClient(token);

  let data: any = null;
  let error: string | null = null;

  try {
    // Fetch calendar data (tasks + stats)
    const [statsResult, tasksResult] = await Promise.all([
      client.query({ query: GET_DASHBOARD_STATS }),
      client.query({
        query: GET_TASKS,
        variables: {
          // Get tasks for current month
          skip: 0,
          take: 500,
        },
      }),
    ]);

    data = {
      stats: statsResult.data.dashboardStats,
      tasks: tasksResult.data.tasks || [],
    };
  } catch (err: any) {
    console.error('Dashboard GraphQL Error:', err);
    error = err.message;
  }

  // Show empty state if no data
  const hasData = data?.stats?.activeGoalsCount > 0 || data?.stats?.tasksTodayCount > 0;

  if (!hasData && !error) {
    return <DashboardEmpty />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Calendar 📅</h1>
          <p className="text-sm text-dark-text-secondary mt-1">
            Schedule and manage your time effectively
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-error">Failed to load calendar data: {error}</p>
          <p className="text-xs text-dark-text-tertiary mt-2">
            Check your GraphQL server at port 4000
          </p>
        </div>
      </div>
    );
  }

  return <DashboardClient initialTasks={data.tasks} stats={data.stats} />;
}
