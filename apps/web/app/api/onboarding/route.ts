import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // TODO: Save onboarding data to database via GraphQL or REST API
    // For now, we'll just log it and return success
    console.log('Onboarding data:', {
      userId,
      ...body,
    });

    // In production, you would:
    // 1. Call the backend API to save user preferences
    // 2. Create initial goals via GraphQL mutation
    // 3. Update user profile with timezone, work hours, etc.
    /*
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken({ template: 'default' })}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to save onboarding data');
    }
    */

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
