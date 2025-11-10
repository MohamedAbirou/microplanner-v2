import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { GoalsPageClient } from './goals-client';
import { getApolloClient } from '@/lib/apollo/client';
import { GET_GOALS } from '@/lib/graphql/queries';

/**
 * Goals Page - Server Component
 * Fetches goals data server-side and passes to client component
 */

export default async function GoalsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const token = await getToken();
  const client = getApolloClient(token);

  // Fetch all active goals
  const { data } = await client.query({
    query: GET_GOALS,
    variables: {
      isActive: true,
      orderBy: 'COMPLETION_RATE',
    },
  });

  return <GoalsPageClient initialGoals={data.goals || []} />;
}
