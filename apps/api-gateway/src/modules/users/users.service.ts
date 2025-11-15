import type { EnergyPatternType, User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
    this.logger.log(`Updating profile for user: ${userId}`);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatar: data.avatar,
        timezone: data.timezone,
        language: data.language,
      },
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, data: UpdatePreferencesDto): Promise<User> {
    this.logger.log(`Updating preferences for user: ${userId}`);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        wakeTime: data.wakeTime,
        sleepTime: data.sleepTime,
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        productivityPeaks: data.productivityPeaks,
        energyPattern: data.energyPattern,
        blockedTimes: data.blockedTimes,
      },
    });
  }

  /**
   * Update onboarding data (progress and completion)
   */
  async updateOnboarding(
    userId: string,
    data: {
      onboardingStep?: number;
      context?: string;
      focusAreas?: string[];
      timezone?: string;
      wakeTime?: string;
      sleepTime?: string;
      energyPattern?: EnergyPatternType;
      productivityPeaks?: string[];
      onboardingCompleted?: boolean;
    }
  ): Promise<User> {
    this.logger.log(`Updating onboarding for user: ${userId}`);

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Delete user account (GDPR compliance)
   */
  async deleteAccount(userId: string): Promise<void> {
    this.logger.warn(`User requested account deletion: ${userId}`);

    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user - Prisma will cascade delete related records
    await this.prisma.user.delete({
      where: { id: userId },
    });

    this.logger.log(`User account deleted: ${userId}`);
  }

  /**
   * Export all user data (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<any> {
    this.logger.log(`Exporting data for user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: true,
        plans: {
          include: {
            tasks: true,
          },
        },
        tasks: true,
        calendarTokens: true,
        aiMemory: true,
        referrals: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { clerkId, ...userData } = user;

    return {
      exportDate: new Date().toISOString(),
      user: userData,
      metadata: {
        totalGoals: user.goals.length,
        totalPlans: user.plans.length,
        totalTasks: user.tasks.length,
        accountCreated: user.createdAt,
      },
    };
  }
}
