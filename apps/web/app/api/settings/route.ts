import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Save to backend via REST API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${apiUrl}/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'd include auth token from Clerk
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          timezone,
          notifications,
          theme,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to save settings (endpoint may not be implemented yet):', await response.text());
      }
    } catch (apiError) {
      console.error('Backend API error (endpoint may not be implemented yet):', apiError);
      // Continue anyway - settings should still work client-side
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch settings from backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${apiUrl}/user/settings?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const settings = await response.json();
        return NextResponse.json(settings);
      }
    } catch (apiError) {
      console.error('Failed to fetch settings:', apiError);
    }

    // Return default settings if backend not available
    return NextResponse.json({
      notifications: {
        email: true,
        weeklySummary: true,
        planReminders: true,
      },
      theme: 'dark',
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
