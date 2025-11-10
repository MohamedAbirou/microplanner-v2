import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, useCase } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual waitlist logic
    // Options:
    // 1. Store in database (PostgreSQL via Prisma)
    // 2. Send to email service (Resend, SendGrid)
    // 3. Add to mailing list (Mailchimp, ConvertKit)
    // 4. Send Slack notification to founders

    console.log('New waitlist signup:', { email, name, useCase });

    // Simulate success
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined waitlist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
