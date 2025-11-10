import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  useCase: z.enum(['personal', 'team', 'business', 'other']).optional(),
  referralSource: z.string().optional(),
});

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

    // 1. Store in Database (via Prisma)
    // Note: Requires Prisma client to be generated and database connection
    // Uncomment when database is ready:
    /*
    const { PrismaClient } = await import('@microplanner/database');
    const prisma = new PrismaClient();

    try {
      // Check if email already exists
      const existing = await prisma.waitlist.findUnique({
        where: { email },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Email already registered on waitlist' },
          { status: 409 }
        );
      }

      // Get current waitlist count for position
      const position = await prisma.waitlist.count() + 1;

      // Create waitlist entry
      await prisma.waitlist.create({
        data: {
          email,
          name,
          useCase,
          referralSource,
          position,
          status: 'PENDING',
        },
      });
    } finally {
      await prisma.$disconnect();
    }
    */

    // 2. Send confirmation email (via Resend or SendGrid)
    // Uncomment when email service is configured:
    /*
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'MicroPlanner <hello@microplanner.ai>',
        to: email,
        subject: "You're on the MicroPlanner waitlist! 🎉",
        html: `
          <h1>Welcome to MicroPlanner!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>You're officially on our early access waitlist!</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>We'll notify you as soon as we have a spot for you</li>
            <li>As an early adopter, you'll get <strong>3 months of PRO free</strong></li>
            <li>You'll be among the first to experience our AI-powered weekly planner</li>
          </ul>
          <p>In the meantime, follow us on <a href="https://twitter.com/microplanner">Twitter</a> for updates!</p>
          <p>— The MicroPlanner Team</p>
        `,
      });
    }
    */

    // 3. Send Slack notification to founders (optional)
    // Uncomment when Slack webhook is configured:
    /*
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎉 New waitlist signup!\n\nEmail: ${email}\nName: ${name || 'N/A'}\nUse Case: ${useCase || 'N/A'}\nPosition: ${position || 'N/A'}`,
        }),
      });
    }
    */

    // Log for now (remove in production)
    console.log('✅ New waitlist signup:', {
      email,
      name,
      useCase,
      referralSource,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined waitlist',
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
    // Uncomment when database is ready:
    /*
    const { PrismaClient } = await import('@microplanner/database');
    const prisma = new PrismaClient();

    try {
      const count = await prisma.waitlist.count({
        where: { status: 'PENDING' },
      });

      return NextResponse.json({ count });
    } finally {
      await prisma.$disconnect();
    }
    */

    // Mock count for now
    return NextResponse.json({ count: 1234 });
  } catch (error) {
    console.error('❌ Waitlist count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
