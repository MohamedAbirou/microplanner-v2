import { Controller, Post, Get, Delete, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PremiumService } from './premium.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import {
  CreateTeamDto,
  InviteMemberDto,
  CreateApiKeyDto,
} from './types/premium.types';

@ApiTags('premium')
@ApiBearerAuth()
@Controller('premium')
export class PremiumController {
  private readonly logger = new Logger(PremiumController.name);

  constructor(private readonly premiumService: PremiumService) {}

  // ==================== TEAM WORKSPACE ====================

  /**
   * POST /premium/teams
   * Create a new team
   */
  @Post('teams')
  @ApiOperation({ summary: 'Create team workspace (PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  @RequireSubscription([SubscriptionTier.PREMIUM])
  async createTeam(@CurrentUser() user: User, @Body() createDto: CreateTeamDto) {
    const team = await this.premiumService.createTeam(user.id, createDto, user.tier);

    return {
      message: 'Team created successfully',
      team,
    };
  }

  /**
   * GET /premium/teams
   * Get user's teams
   */
  @Get('teams')
  @ApiOperation({ summary: 'Get user teams' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async getUserTeams(@CurrentUser() user: User) {
    const teams = await this.premiumService.getUserTeams(user.id);

    return {
      message: 'Teams retrieved successfully',
      teams,
    };
  }

  /**
   * GET /premium/teams/:id
   * Get team details
   */
  @Get('teams/:id')
  @ApiOperation({ summary: 'Get team details' })
  @ApiResponse({ status: 200, description: 'Team retrieved successfully' })
  async getTeam(@CurrentUser() user: User, @Param('id') teamId: string) {
    const team = await this.premiumService.getTeam(teamId, user.id);

    return {
      message: 'Team retrieved successfully',
      team,
    };
  }

  /**
   * POST /premium/teams/:id/invite
   * Invite member to team
   */
  @Post('teams/:id/invite')
  @ApiOperation({ summary: 'Invite member to team (PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @RequireSubscription([SubscriptionTier.PREMIUM])
  async inviteMember(
    @CurrentUser() user: User,
    @Param('id') teamId: string,
    @Body() inviteDto: InviteMemberDto,
  ) {
    const invitation = await this.premiumService.inviteMember(teamId, user.id, inviteDto);

    return {
      message: 'Invitation sent successfully',
      invitation,
    };
  }

  /**
   * POST /premium/teams/accept/:token
   * Accept team invitation
   */
  @Post('teams/accept/:token')
  @ApiOperation({ summary: 'Accept team invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  async acceptInvitation(@CurrentUser() user: User, @Param('token') token: string) {
    const member = await this.premiumService.acceptInvitation(token, user.id);

    return {
      message: 'Invitation accepted successfully',
      member,
    };
  }

  // ==================== API ACCESS ====================

  /**
   * POST /premium/api-keys
   * Create API key
   */
  @Post('api-keys')
  @ApiOperation({ summary: 'Create API key (PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  @RequireSubscription([SubscriptionTier.PREMIUM])
  async createApiKey(@CurrentUser() user: User, @Body() createDto: CreateApiKeyDto) {
    const apiKey = await this.premiumService.createApiKey(user.id, createDto, user.tier);

    return {
      message: 'API key created successfully. Save it now - it will not be shown again!',
      apiKey,
    };
  }

  /**
   * GET /premium/api-keys
   * Get user's API keys
   */
  @Get('api-keys')
  @ApiOperation({ summary: 'Get user API keys' })
  @ApiResponse({ status: 200, description: 'API keys retrieved successfully' })
  async getUserApiKeys(@CurrentUser() user: User) {
    const apiKeys = await this.premiumService.getUserApiKeys(user.id);

    return {
      message: 'API keys retrieved successfully',
      apiKeys,
    };
  }

  /**
   * DELETE /premium/api-keys/:id
   * Revoke API key
   */
  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  async revokeApiKey(@CurrentUser() user: User, @Param('id') keyId: string) {
    await this.premiumService.revokeApiKey(keyId, user.id);

    return {
      message: 'API key revoked successfully',
    };
  }
}
