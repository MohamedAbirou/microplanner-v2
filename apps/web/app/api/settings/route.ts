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

// GraphQL mutation for updating user settings
const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      userId
      firstName
      lastName
      theme
      energyPattern
      notifications {
        email
        weeklySummary
        planReminders
        taskReminders
        goalMilestones
        productivityInsights
      }
    }
  }
`;

// GraphQL mutation for updating user profile
const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      email
      timezone
    }
  }
`;

// GraphQL query for getting user settings
const GET_USER_SETTINGS = gql`
  query GetUserSettings {
    userSettings {
      id
      userId
      firstName
      lastName
      theme
      energyPattern
      notifications {
        email
        weeklySummary
        planReminders
        taskReminders
        goalMilestones
        productivityInsights
      }
      onboardingCompleted
    }
  }
`;

export async function PUT(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    const body = await req.json();
    const { firstName, lastName, timezone, notifications, theme } = body;

    console.log('Settings update received:', {
      userId,
      firstName,
      lastName,
      timezone,
      notifications,
      theme,
    });

    // Create Apollo Client with auth token
    const client = createApolloClient(token);

    // Update user settings via GraphQL
    const settingsUpdate = notifications || theme
      ? client.mutate({
          mutation: UPDATE_USER_SETTINGS,
          variables: {
            input: {
              theme: theme?.toUpperCase(), // Convert to enum format (LIGHT, DARK, SYSTEM)
              notifications: notifications ? {
                email: notifications.email,
                weeklySummary: notifications.weeklySummary,
                planReminders: notifications.planReminders,
                taskReminders: notifications.taskReminders,
                goalMilestones: notifications.goalMilestones,
                productivityInsights: notifications.productivityInsights,
              } : undefined,
            },
          },
        })
      : Promise.resolve(null);

    // Update user profile if name or timezone changed
    const profileUpdate = firstName || lastName || timezone
      ? client.mutate({
          mutation: UPDATE_USER_PROFILE,
          variables: {
            input: {
              firstName,
              lastName,
              name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
              timezone,
            },
          },
        })
      : Promise.resolve(null);

    // Execute both updates in parallel
    const [settingsResult, profileResult] = await Promise.all([
      settingsUpdate,
      profileUpdate,
    ]);

    // Check for errors
    if (settingsResult?.error) {
      console.error('Settings update error:', settingsResult.error);
    }

    if (profileResult?.error) {
      console.error('Profile update error:', profileResult.error);
    }

    const settingsData = settingsResult?.data as any;
    const profileData = profileResult?.data as any;

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: settingsData?.updateUserSettings,
        profile: profileData?.updateUserProfile,
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();

    // Create Apollo Client with auth token
    const client = createApolloClient(token);

    // Fetch settings from GraphQL
    const result = await client.query({
      query: GET_USER_SETTINGS,
    });

    if (result.error) {
      console.error('Failed to fetch settings:', result.error);
      // Return default settings if fetch fails
      return NextResponse.json({
        notifications: {
          email: true,
          weeklySummary: true,
          planReminders: true,
          taskReminders: true,
          goalMilestones: true,
          productivityInsights: true,
        },
        theme: 'DARK',
      });
    }

    const data = result.data as any;

    if (data?.userSettings) {
      return NextResponse.json(data.userSettings);
    }

    // Return default settings if no data
    return NextResponse.json({
      notifications: {
        email: true,
        weeklySummary: true,
        planReminders: true,
        taskReminders: true,
        goalMilestones: true,
        productivityInsights: true,
      },
      theme: 'DARK',
    });
  } catch (error) {
    console.error('Settings GET error:', error);

    // Return default settings on error
    return NextResponse.json({
      notifications: {
        email: true,
        weeklySummary: true,
        planReminders: true,
        taskReminders: true,
        goalMilestones: true,
        productivityInsights: true,
      },
      theme: 'DARK',
    });
  }
}
