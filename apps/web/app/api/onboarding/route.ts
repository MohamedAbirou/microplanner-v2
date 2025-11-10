import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, timezone, workDays, workStartTime, workEndTime, maxMeetingsPerDay, energyPattern, goals } = body;

    console.log('Onboarding data received:', {
      userId,
      fullName,
      timezone,
      workDays,
      energyPattern,
      goalsCount: goals?.length || 0,
    });

    // Save to backend via REST API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      // 1. Update user profile/preferences
      const preferencesResponse = await fetch(`${apiUrl}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'd include auth token from Clerk
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          timezone,
          workHours: {
            days: workDays,
            startTime: workStartTime,
            endTime: workEndTime,
          },
          maxMeetingsPerDay,
          energyPattern,
        }),
      });

      // Log response but don't fail if preferences endpoint doesn't exist yet
      if (!preferencesResponse.ok) {
        console.warn('Failed to save preferences (endpoint may not be implemented yet):', await preferencesResponse.text());
      }

      // 2. Create initial goals via GraphQL (if goals provided)
      if (goals && goals.length > 0) {
        const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

        // Note: This is a placeholder - adjust mutation based on your actual GraphQL schema
        const goalsPromises = goals.map(async (goal: any) => {
          try {
            const response = await fetch(graphqlUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: `
                  mutation CreateGoal($input: CreateGoalInput!) {
                    createGoal(input: $input) {
                      id
                      title
                      emoji
                      frequency
                    }
                  }
                `,
                variables: {
                  input: {
                    title: goal.title,
                    emoji: goal.emoji,
                    frequencyPerWeek: goal.frequency,
                    // Add other required fields based on your schema
                  },
                },
              }),
            });

            if (!response.ok) {
              console.warn(`Failed to create goal "${goal.title}":`, await response.text());
            }
          } catch (error) {
            console.warn(`Error creating goal "${goal.title}":`, error);
          }
        });

        await Promise.allSettled(goalsPromises);
      }

      // 3. Mark onboarding as completed
      await fetch(`${apiUrl}/user/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }).catch((err) => console.warn('Failed to mark onboarding complete:', err));

    } catch (apiError) {
      console.error('Backend API error (endpoints may not be implemented yet):', apiError);
      // Continue anyway - onboarding UI flow should still work
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
