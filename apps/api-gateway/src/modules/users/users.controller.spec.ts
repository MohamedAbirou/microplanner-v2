import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SubscriptionTier, EnergyPattern } from '@microplanner/database';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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
    productivityPeaks: [],
    energyPattern: null,
    blockedTimes: null,
    pushTokens: [],
    onboardingCompleted: false,
    onboardingStep: 0,
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };

  const mockUsersService = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
    updatePreferences: jest.fn(),
    deleteAccount: jest.fn(),
    exportUserData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /me', () => {
    it('should return current user profile', async () => {
      const result = await controller.getMe(mockUser);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('name', mockUser.name);
      expect(result).toHaveProperty('tier', mockUser.tier);
      expect(result).toHaveProperty('wakeTime', mockUser.wakeTime);
      expect(result).not.toHaveProperty('clerkId'); // Should not expose internal IDs
    });

    it('should include all user preferences', async () => {
      const result = await controller.getMe(mockUser);

      expect(result).toHaveProperty('wakeTime');
      expect(result).toHaveProperty('sleepTime');
      expect(result).toHaveProperty('workStartTime');
      expect(result).toHaveProperty('workEndTime');
      expect(result).toHaveProperty('productivityPeaks');
      expect(result).toHaveProperty('energyPattern');
      expect(result).toHaveProperty('blockedTimes');
    });
  });

  describe('PUT /me', () => {
    it('should update user profile', async () => {
      const updateDto = {
        name: 'Updated Name',
        timezone: 'America/New_York',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toHaveProperty('message', 'Profile updated successfully');
      expect(result.user).toHaveProperty('name', updateDto.name);
      expect(result.user).toHaveProperty('timezone', updateDto.timezone);
      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, updateDto);
    });

    it('should only return updated fields', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: updateDto.name };
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('avatar');
      expect(result.user).toHaveProperty('timezone');
      expect(result.user).toHaveProperty('language');
      // Should not include all user fields, just profile fields
      expect(result.user).not.toHaveProperty('email');
      expect(result.user).not.toHaveProperty('tier');
    });
  });

  describe('PUT /me/preferences', () => {
    it('should update user preferences', async () => {
      const preferencesDto = {
        wakeTime: '06:00',
        sleepTime: '22:00',
        energyPattern: EnergyPattern.MORNING_PERSON,
      };

      const updatedUser = { ...mockUser, ...preferencesDto };
      mockUsersService.updatePreferences.mockResolvedValue(updatedUser);

      const result = await controller.updatePreferences(mockUser, preferencesDto);

      expect(result).toHaveProperty('message', 'Preferences updated successfully');
      expect(result.preferences).toHaveProperty('wakeTime', preferencesDto.wakeTime);
      expect(result.preferences).toHaveProperty('sleepTime', preferencesDto.sleepTime);
      expect(result.preferences).toHaveProperty('energyPattern', preferencesDto.energyPattern);
      expect(service.updatePreferences).toHaveBeenCalledWith(mockUser.id, preferencesDto);
    });

    it('should return all preference fields', async () => {
      const preferencesDto = {
        wakeTime: '06:00',
      };

      const updatedUser = { ...mockUser, wakeTime: preferencesDto.wakeTime };
      mockUsersService.updatePreferences.mockResolvedValue(updatedUser);

      const result = await controller.updatePreferences(mockUser, preferencesDto);

      expect(result.preferences).toHaveProperty('wakeTime');
      expect(result.preferences).toHaveProperty('sleepTime');
      expect(result.preferences).toHaveProperty('workStartTime');
      expect(result.preferences).toHaveProperty('workEndTime');
      expect(result.preferences).toHaveProperty('productivityPeaks');
      expect(result.preferences).toHaveProperty('energyPattern');
      expect(result.preferences).toHaveProperty('blockedTimes');
    });
  });

  describe('DELETE /me', () => {
    it('should delete user account', async () => {
      mockUsersService.deleteAccount.mockResolvedValue(undefined);

      const result = await controller.deleteAccount(mockUser);

      expect(result).toBeUndefined(); // No content response
      expect(service.deleteAccount).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle user not found', async () => {
      mockUsersService.deleteAccount.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.deleteAccount(mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('GET /me/export', () => {
    it('should export all user data', async () => {
      const exportData = {
        exportDate: new Date().toISOString(),
        user: mockUser,
        metadata: {
          totalGoals: 5,
          totalPlans: 10,
          totalTasks: 20,
          accountCreated: mockUser.createdAt,
        },
      };

      mockUsersService.exportUserData.mockResolvedValue(exportData);

      const result = await controller.exportData(mockUser);

      expect(result).toHaveProperty('message', 'User data export completed');
      expect(result.data).toHaveProperty('exportDate');
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('metadata');
      expect(result.data.metadata).toHaveProperty('totalGoals', 5);
      expect(service.exportUserData).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle user not found', async () => {
      mockUsersService.exportUserData.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(controller.exportData(mockUser)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should include all user relations in export', async () => {
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          ...mockUser,
          goals: [{ id: 'goal-1', title: 'Test Goal' }],
          plans: [{ id: 'plan-1', tasks: [] }],
          tasks: [{ id: 'task-1', title: 'Test Task' }],
          calendarTokens: [{ id: 'token-1' }],
          aiMemory: [],
          referrals: [],
        },
        metadata: {
          totalGoals: 1,
          totalPlans: 1,
          totalTasks: 1,
          accountCreated: mockUser.createdAt,
        },
      };

      mockUsersService.exportUserData.mockResolvedValue(exportData);

      const result = await controller.exportData(mockUser);

      expect(result.data.user).toHaveProperty('goals');
      expect(result.data.user).toHaveProperty('plans');
      expect(result.data.user).toHaveProperty('tasks');
      expect(result.data.user).toHaveProperty('calendarTokens');
      expect(result.data.user).toHaveProperty('aiMemory');
      expect(result.data.user).toHaveProperty('referrals');
    });
  });
});
