import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';

interface CreateUserFromClerkDto {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
    });
  }

  /**
   * Find user by internal ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create user from Clerk data
   */
  async createFromClerk(data: CreateUserFromClerkDto): Promise<User> {
    this.logger.log(`Creating user from Clerk: ${data.email}`);

    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        tier: SubscriptionTier.FREE,
        onboardingCompleted: false,
      },
    });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  /**
   * Update user from Clerk webhook
   */
  async updateFromClerk(clerkId: string, data: Partial<CreateUserFromClerkDto>): Promise<User> {
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
      },
    });
  }

  /**
   * Delete user (GDPR compliance)
   */
  async deleteByClerkId(clerkId: string): Promise<void> {
    this.logger.warn(`Deleting user: ${clerkId}`);

    await this.prisma.user.delete({
      where: { clerkId },
    });
  }
}
