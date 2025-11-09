import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier, EnergyPattern } from '@microplanner/database';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    clerkId: 'clerk-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://avatar.url',
    timezone: 'UTC',
    tier: SubscriptionTier.FREE,
    stripeCustomerId: null,
    subscriptionId: null,
    subscriptionStatus: 'INACTIVE' as any,
    wakeTime: '07:00',
    sleepTime: '23:00',
    workStartTime: '09:00',
    workEndTime: '17:00',
    workDays: [1, 2, 3, 4, 5],
    productivityPeaks: [],
    energyPattern: null,
    blockedTimes: null,
    emailNotifications: true,
    taskReminderOneDayBefore: true,
    taskReminderOneHourBefore: true,
    weeklySummaryEnabled: true,
    planReadyNotification: true,
    pushTokens: [],
    onboardingCompleted: false,
    onboardingStep: 0,
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByClerkId', () => {
    it('should find user by Clerk ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByClerkId('clerk-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk-123' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByClerkId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });

  describe('createFromClerk', () => {
    it('should create user from Clerk data', async () => {
      const clerkData = {
        clerkId: 'clerk-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://avatar.url',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createFromClerk(clerkData);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: clerkData.clerkId,
          email: clerkData.email,
          name: clerkData.name,
          avatar: clerkData.avatar,
          tier: SubscriptionTier.FREE,
          onboardingCompleted: false,
        },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        timezone: 'America/New_York',
      };

      const updatedUser = { ...mockUser, ...updateData };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', updateData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          name: updateData.name,
          avatar: undefined,
          timezone: updateData.timezone,
          language: undefined,
        },
      });
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferencesData = {
        wakeTime: '06:00',
        sleepTime: '22:00',
        energyPattern: EnergyPattern.MORNING_PERSON,
      };

      const updatedUser = { ...mockUser, ...preferencesData };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updatePreferences('user-123', preferencesData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          wakeTime: preferencesData.wakeTime,
          sleepTime: preferencesData.sleepTime,
          workStartTime: undefined,
          workEndTime: undefined,
          productivityPeaks: undefined,
          energyPattern: preferencesData.energyPattern,
          blockedTimes: undefined,
        },
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.deleteAccount('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('exportUserData', () => {
    it('should export all user data', async () => {
      const userWithRelations = {
        ...mockUser,
        goals: [],
        plans: [],
        tasks: [],
        calendarTokens: [],
        aiMemory: [],
        referrals: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithRelations);

      const result = await service.exportUserData('user-123');

      expect(result).toHaveProperty('exportDate');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('metadata');
      expect(result.user).not.toHaveProperty('clerkId'); // Sensitive data removed
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
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
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.exportUserData('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('updateLastSeen', () => {
    it('should update last seen timestamp', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.updateLastSeen('user-123');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { lastSeenAt: expect.any(Date) },
      });
    });
  });
});
