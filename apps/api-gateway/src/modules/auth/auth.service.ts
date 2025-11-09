import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import type { User } from '@microplanner/database';

export interface ClerkPayload {
  sub: string; // Clerk user ID
  email: string;
  name?: string;
  avatar?: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {}

  /**
   * Validate Clerk JWT payload and sync user to database
   */
  async validateClerkUser(payload: ClerkPayload): Promise<User> {
    try {
      this.logger.debug(`Validating Clerk user: ${payload.sub}`);

      // Find or create user in our database
      let user = await this.usersService.findByClerkId(payload.sub);

      if (!user) {
        this.logger.log(`Creating new user from Clerk: ${payload.email}`);
        user = await this.usersService.createFromClerk({
          clerkId: payload.sub,
          email: payload.email,
          name: payload.name,
          avatar: payload.avatar,
        });
      } else {
        // Update last seen
        await this.usersService.updateLastSeen(user.id);
      }

      return user;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to validate Clerk user: ${err.message}`, err.stack);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  /**
   * Get Clerk publishable key for client
   */
  getClerkPublishableKey(): string {
    return this.configService.get<string>('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') || '';
  }
}
