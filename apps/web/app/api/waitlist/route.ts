import { NextRequest, NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  useCase: z.enum(['PERSONAL', 'TEAM', 'BUSINESS', 'OTHER']).optional(),
  referralSource: z.string().optional(),
});

// Create a server-side Apollo Client (no auth required for waitlist)
function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
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

// GraphQL mutation for joining waitlist
const JOIN_WAITLIST = gql`
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      message
      position
      email
    }
  }
`;

// GraphQL query for waitlist stats
const WAITLIST_STATS = gql`
  query WaitlistStats {
    waitlistStats {
      totalCount
      pendingCount
      approvedCount
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = waitlistSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, name, useCase, referralSource } = validation.data;

    // Create Apollo Client
    const client = createApolloClient();

    // Call GraphQL mutation to join waitlist
    const result = await client.mutate({
      mutation: JOIN_WAITLIST,
      variables: {
        input: {
          email,
          name,
          useCase,
          referralSource,
        },
      },
    });

    if (result.error) {
      console.error('GraphQL error:', result.error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    const data = result.data as any;

    if (!data?.joinWaitlist?.success) {
      return NextResponse.json(
        { error: data?.joinWaitlist?.message || 'Failed to join waitlist' },
        { status: 400 }
      );
    }

    console.log('✅ New waitlist signup via GraphQL:', {
      email,
      name,
      useCase,
      position: data.joinWaitlist.position,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: data.joinWaitlist.message,
        position: data.joinWaitlist.position,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist count (for display)
export async function GET() {
  try {
    const client = createApolloClient();

    // Fetch waitlist stats from GraphQL
    const result = await client.query({
      query: WAITLIST_STATS,
    });

    if (result.error) {
      console.error('Failed to fetch waitlist stats:', result.error);
      return NextResponse.json({ count: 1234 });
    }

    const data = result.data as any;

    return NextResponse.json({
      count: data?.waitlistStats?.totalCount || 1234,
    });
  } catch (error) {
    console.error('❌ Waitlist stats error:', error);
    // Return default count on error
    return NextResponse.json({ count: 1234 });
  }
}
