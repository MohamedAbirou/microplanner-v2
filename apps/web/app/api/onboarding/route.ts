import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';

// Create a server-side Apollo Client
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
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

// GraphQL mutation for completing onboarding
const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      success
      user {
        id
        name
        email
      }
      settings {
        id
        onboardingCompleted
        energyPattern
      }
      goals {
        id
        title
        emoji
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Clerk token for GraphQL auth
    const token = await getToken();

    const body = await req.json();
    const {
      fullName,
      timezone,
      workDays,
      workStartTime,
      workEndTime,
      maxMeetingsPerDay,
      energyPattern,
      goals,
    } = body;

    console.log('Onboarding data received:', {
      userId,
      fullName,
      timezone,
      workDays,
      workStartTime,
      workEndTime,
      maxMeetingsPerDay,
      energyPattern,
      goals: goals?.length || 0,
    });

    // Create Apollo Client with auth token
    const client = createApolloClient(token);

    // Call GraphQL mutation for complete onboarding
    const result = await client.mutate({
      mutation: COMPLETE_ONBOARDING,
      variables: {
        input: {
          firstName: fullName?.split(' ')[0] || '',
          lastName: fullName?.split(' ').slice(1).join(' ') || '',
          timezone,
          workDays: workDays || [1, 2, 3, 4, 5], // Mon-Fri default
          workStartTime: workStartTime || '09:00',
          workEndTime: workEndTime || '17:00',
          maxMeetingsPerDay,
          energyPattern: energyPattern?.toUpperCase(), // Convert to enum format
          goals: goals?.map((goal: any) => ({
            title: goal.title,
            emoji: goal.emoji,
            color: goal.color || '#3B82F6',
            frequencyPerWeek: goal.frequencyPerWeek || 3,
            durationMinutes: goal.durationMinutes || 60,
            preferredTimes: goal.preferredTimes || [],
            flexibilityScore: goal.flexibilityScore || 5,
            priority: goal.priority || 5,
          })) || [],
        },
      },
    });

    if (result.error) {
      console.error('GraphQL error:', result.error);
      return NextResponse.json(
        {
          error: 'Failed to complete onboarding',
          details: result.error.message,
        },
        { status: 500 }
      );
    }

    const data = result.data as any;

    if (!data?.completeOnboarding?.success) {
      return NextResponse.json(
        { error: 'Onboarding completion failed' },
        { status: 500 }
      );
    }

    console.log('Onboarding completed successfully:', {
      userId,
      goalsCreated: data.completeOnboarding.goals?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: data.completeOnboarding,
    });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
