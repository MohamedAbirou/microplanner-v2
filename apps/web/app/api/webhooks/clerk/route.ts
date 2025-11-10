import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with secret
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const userId = evt.data.id;

  console.log(`Webhook received: ${eventType} for user ${userId}`);

  try {
    switch (eventType) {
      case 'user.created': {
        // TODO: Create user in your database via GraphQL mutation or REST API
        const userData = {
          clerkUserId: evt.data.id,
          email: evt.data.email_addresses?.[0]?.email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data.image_url,
        };

        console.log('Creating user in database:', userData);

        /*
        // Example: Call your backend API to create user
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.INTERNAL_API_KEY,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to create user in database');
        }
        */

        break;
      }

      case 'user.updated': {
        // TODO: Update user in your database
        const userData = {
          clerkUserId: evt.data.id,
          email: evt.data.email_addresses?.[0]?.email_address,
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          imageUrl: evt.data.image_url,
        };

        console.log('Updating user in database:', userData);

        /*
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/users/sync', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.INTERNAL_API_KEY,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user in database');
        }
        */

        break;
      }

      case 'user.deleted': {
        // TODO: Delete or anonymize user in your database
        console.log('Deleting user from database:', userId);

        /*
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
          {
            method: 'DELETE',
            headers: {
              'X-API-Key': process.env.INTERNAL_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete user from database');
        }
        */

        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
