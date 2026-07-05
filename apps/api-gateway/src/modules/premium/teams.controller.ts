import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PremiumService } from './premium.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { CreateTeamDto, CreateApiKeyDto, InviteMemberDto, UpdateTeamDto } from './types/premium.types';

/**
 * REST contract the GraphQL gateway's TeamsAPI datasource expects
 * (base /api/v1/teams — including API keys, which the gateway also
 * routes through this base). Returns bare entities, not {message,...}
 * wrappers, because the datasource passes responses straight through.
 *
 * Route order matters: literal segments (api-keys, invitations/accept)
 * are declared before parameterized :id routes so they are matched first.
 */
@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly premiumService: PremiumService) {}

  // ==================== API KEYS (literal routes first) ====================

  @Get('api-keys')
  @ApiOperation({ summary: 'List API keys' })
  async getApiKeys(@CurrentUser() user: User) {
    return this.premiumService.getUserApiKeys(user.id);
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create API key (PREMIUM only)' })
  @RequireSubscription([SubscriptionTier.PREMIUM])
  async createApiKey(@CurrentUser() user: User, @Body() createDto: CreateApiKeyDto) {
    return this.premiumService.createApiKey(user.id, createDto, user.tier);
  }

  @Get('api-keys/:id')
  @ApiOperation({ summary: 'Get an API key (masked)' })
  async getApiKey(@CurrentUser() user: User, @Param('id') id: string) {
    return this.premiumService.getApiKey(id, user.id);
  }

  @Put('api-keys/:id/toggle')
  @ApiOperation({ summary: 'Toggle API key active state' })
  async toggleApiKey(@CurrentUser() user: User, @Param('id') id: string) {
    return this.premiumService.toggleApiKey(id, user.id);
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke API key' })
  async deleteApiKey(@CurrentUser() user: User, @Param('id') id: string) {
    await this.premiumService.revokeApiKey(id, user.id);
  }

  // ==================== INVITATION ACCEPT (literal before :id) ====================

  @Post('invitations/accept')
  @ApiOperation({ summary: 'Accept a team invitation by token' })
  async acceptInvitation(@CurrentUser() user: User, @Body('token') token: string) {
    return this.premiumService.acceptInvitation(token, user.id);
  }

  // ==================== TEAMS ====================

  @Get()
  @ApiOperation({ summary: 'List user teams' })
  async getTeams(@CurrentUser() user: User) {
    return this.premiumService.getUserTeams(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create team (PREMIUM only)' })
  @RequireSubscription([SubscriptionTier.PREMIUM])
  async createTeam(@CurrentUser() user: User, @Body() createDto: CreateTeamDto) {
    return this.premiumService.createTeam(user.id, createDto, user.tier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team details' })
  async getTeam(@CurrentUser() user: User, @Param('id') id: string) {
    return this.premiumService.getTeam(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team' })
  async updateTeam(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateTeamDto
  ) {
    return this.premiumService.updateTeam(id, user.id, updateDto as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete team (owner only)' })
  async deleteTeam(@CurrentUser() user: User, @Param('id') id: string) {
    await this.premiumService.deleteTeam(id, user.id);
  }

  // ==================== MEMBERS & INVITATIONS ====================

  @Get(':id/members')
  @ApiOperation({ summary: 'List team members' })
  async getMembers(@CurrentUser() user: User, @Param('id') id: string) {
    return this.premiumService.getTeamMembers(id, user.id);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'List pending invitations' })
  async getInvitations(@CurrentUser() user: User, @Param('id') id: string) {
    return this.premiumService.getTeamInvitations(id, user.id);
  }

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Invite a member' })
  async invite(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() inviteDto: InviteMemberDto
  ) {
    return this.premiumService.inviteMember(id, user.id, inviteDto);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a team member' })
  async removeMember(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('memberId') memberId: string
  ) {
    await this.premiumService.removeMember(id, memberId, user.id);
  }

  @Put(':id/members/:memberId/role')
  @ApiOperation({ summary: "Change a member's role" })
  async updateMemberRole(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('role') role: string
  ) {
    return this.premiumService.updateMemberRole(id, memberId, role, user.id);
  }
}
