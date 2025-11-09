import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';
import { ClerkWebhookEvent, ClerkWebhookEventType } from './dto/clerk-webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookSecret: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    this.webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET') || '';
  }

  /**
   * Verify Clerk webhook signature using Svix
   */
  verifyWebhook(payload: string, headers: Record<string, string>): ClerkWebhookEvent {
    try {
      const wh = new Webhook(this.webhookSecret);

      // Svix headers are prefixed with 'svix-'
      const svixId = headers['svix-id'];
      const svixTimestamp = headers['svix-timestamp'];
      const svixSignature = headers['svix-signature'];

      if (!svixId || !svixTimestamp || !svixSignature) {
        throw new BadRequestException('Missing Svix headers');
      }

      // Verify the webhook signature
      const evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;

      return evt;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Webhook verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Handle Clerk webhook event
   */
  async handleWebhookEvent(event: ClerkWebhookEvent): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case ClerkWebhookEventType.USER_CREATED:
          await this.handleUserCreated(event);
          break;

        case ClerkWebhookEventType.USER_UPDATED:
          await this.handleUserUpdated(event);
          break;

        case ClerkWebhookEventType.USER_DELETED:
          await this.handleUserDeleted(event);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process webhook event: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Handle user.created event
   */
  private async handleUserCreated(event: ClerkWebhookEvent): Promise<void> {
    const { id, email_addresses, first_name, last_name, profile_image_url } = event.data;

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email) => email.verification?.status === 'verified'
    ) || email_addresses[0];

    if (!primaryEmail) {
      throw new BadRequestException('No email address found for user');
    }

    // Build full name
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined;

    // Create user in our database
    await this.usersService.createFromClerk({
      clerkId: id,
      email: primaryEmail.email_address,
      name,
      avatar: profile_image_url || undefined,
    });

    this.logger.log(`User created from webhook: ${primaryEmail.email_address}`);
  }

  /**
   * Handle user.updated event
   */
  private async handleUserUpdated(event: ClerkWebhookEvent): Promise<void> {
    const { id, email_addresses, first_name, last_name, profile_image_url } = event.data;

    // Get primary email
    const primaryEmail = email_addresses.find(
      (email) => email.verification?.status === 'verified'
    ) || email_addresses[0];

    if (!primaryEmail) {
      throw new BadRequestException('No email address found for user');
    }

    // Build full name
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined;

    // Update user in our database
    await this.usersService.updateFromClerk(id, {
      email: primaryEmail.email_address,
      name,
      avatar: profile_image_url || undefined,
    });

    this.logger.log(`User updated from webhook: ${primaryEmail.email_address}`);
  }

  /**
   * Handle user.deleted event
   */
  private async handleUserDeleted(event: ClerkWebhookEvent): Promise<void> {
    const { id } = event.data;

    // Delete user from our database (GDPR compliance)
    await this.usersService.deleteByClerkId(id);

    this.logger.log(`User deleted from webhook: ${id}`);
  }
}
