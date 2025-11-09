/**
 * Clerk Webhook DTOs
 * Based on Clerk webhook event types
 */

export interface ClerkWebhookEvent {
  type: ClerkWebhookEventType;
  data: ClerkUserData;
  object: 'event';
  timestamp: number;
}

export enum ClerkWebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
}

export interface ClerkUserData {
  id: string; // Clerk user ID
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification: {
      status: string;
    };
  }>;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  created_at: number;
  updated_at: number;
}
