import type { User } from '@microplanner/database';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getMe(@CurrentUser() user: User) {
    // Return full user object (password already excluded by Prisma)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      timezone: user.timezone,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,

      // Preferences
      wakeTime: user.wakeTime,
      sleepTime: user.sleepTime,
      workStartTime: user.workStartTime,
      workEndTime: user.workEndTime,
      productivityPeaks: user.productivityPeaks,
      energyPattern: user.energyPattern,
      blockedTimes: user.blockedTimes,

      // Metadata
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      language: user.language,
      pushTokens: user.pushTokens,

      // Timestamps
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSeenAt: user.lastSeenAt,
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync/create user from authentication provider' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  async syncUser(@CurrentUser() user: User) {
    const syncedUser = await this.usersService.syncUser({ clerkId: user.id, email: user.email });
    return {
      message: 'User synced successfully',
      user: syncedUser,
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);

    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        timezone: updatedUser.timezone,
        language: updatedUser.language,
      },
    };
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() updatePreferencesDto: UpdatePreferencesDto
  ) {
    const updatedUser = await this.usersService.updatePreferences(user.id, updatePreferencesDto);

    return {
      message: 'Preferences updated successfully',
      preferences: {
        wakeTime: updatedUser.wakeTime,
        sleepTime: updatedUser.sleepTime,
        workStartTime: updatedUser.workStartTime,
        workEndTime: updatedUser.workEndTime,
        productivityPeaks: updatedUser.productivityPeaks,
        energyPattern: updatedUser.energyPattern,
        blockedTimes: updatedUser.blockedTimes,
      },
    };
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account (GDPR)' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteAccount(@CurrentUser() user: User) {
    await this.usersService.deleteAccount(user.id);
    // No content response
  }

  @Get('me/export')
  @ApiOperation({ summary: 'Export all user data (GDPR)' })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  async exportData(@CurrentUser() user: User) {
    const data = await this.usersService.exportUserData(user.id);

    return {
      message: 'User data export completed',
      data,
    };
  }
}
