import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier } from '@microplanner/database';
import * as crypto from 'crypto';
import {
  Team,
  TeamMember,
  TeamInvitation,
  TeamRole,
  MemberStatus,
  ApiKey,
  ApiScope,
  CreateTeamDto,
  UpdateTeamDto,
  InviteMemberDto,
  CreateApiKeyDto,
  ApiKeyResponse,
} from './types/premium.types';

/**
 * Premium Service
 *
 * Handles PREMIUM tier features:
 * - Team Workspace
 * - API Access
 */
@Injectable()
export class PremiumService {
  private readonly logger = new Logger(PremiumService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== TEAM WORKSPACE ====================

  /**
   * Create a new team (PREMIUM only)
   */
  async createTeam(userId: string, createDto: CreateTeamDto, userTier: SubscriptionTier): Promise<Team> {
    if (userTier !== SubscriptionTier.PREMIUM) {
      throw new ForbiddenException('Team workspaces are only available for PREMIUM users');
    }

    const defaultSettings = {
      allowMemberGoals: true,
      allowMemberPlans: true,
      requireApprovalForGoals: false,
      sharedCalendars: true,
      defaultWorkHours: { start: '09:00', end: '17:00' },
      workDays: [1, 2, 3, 4, 5],
      ...createDto.settings,
    };

    const team = await this.prisma.team.create({
      data: {
        ownerId: userId,
        name: createDto.name,
        description: createDto.description || null,
        maxMembers: createDto.maxMembers || 10,
        settings: defaultSettings as any,
        plan: 'premium',
      },
    });

    // Add owner as first member
    await this.prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'owner',
        status: 'active',
      },
    });

    this.logger.log(`Team created: ${team.id} by user ${userId}`);

    return team as unknown as Team;
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId, status: 'active' },
      include: { team: true },
    });

    return memberships.map((m) => m.team) as unknown as Team[];
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: string, userId: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some((m: any) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return team as unknown as Team;
  }

  /**
   * Invite member to team
   */
  async inviteMember(teamId: string, userId: string, inviteDto: InviteMemberDto): Promise<TeamInvitation> {
    // Verify user is admin/owner
    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId, userId, role: { in: ['owner', 'admin'] } },
    });

    if (!membership) {
      throw new ForbiddenException('Only team owners/admins can invite members');
    }

    // Check if already invited or member
    const existing = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        user: { email: inviteDto.email },
      },
    });

    if (existing) {
      throw new BadRequestException('User is already a team member');
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await this.prisma.teamInvitation.create({
      data: {
        teamId,
        email: inviteDto.email,
        role: inviteDto.role,
        invitedBy: userId,
        token,
        expiresAt,
      },
    });

    this.logger.log(`Team invitation sent to ${inviteDto.email} for team ${teamId}`);

    return invitation as unknown as TeamInvitation;
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<TeamMember> {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { token },
      include: { team: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }

    // Get user by ID
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException('This invitation is for a different email address');
    }

    // Create team membership
    const member = await this.prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId,
        role: invitation.role,
        status: 'active',
        invitedBy: invitation.invitedBy,
      },
    });

    // Mark invitation as accepted
    await this.prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    this.logger.log(`User ${userId} accepted invitation to team ${invitation.teamId}`);

    return member as unknown as TeamMember;
  }

  // ==================== API ACCESS ====================

  /**
   * Create API key (PREMIUM only)
   */
  async createApiKey(userId: string, createDto: CreateApiKeyDto, userTier: SubscriptionTier): Promise<ApiKeyResponse> {
    if (userTier !== SubscriptionTier.PREMIUM) {
      throw new ForbiddenException('API access is only available for PREMIUM users');
    }

    // Generate random API key
    const rawKey = `mp_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 8);

    // Hash the key using SHA-256
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Calculate expiration
    let expiresAt: Date | null = null;
    if (createDto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + createDto.expiresInDays);
    }

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: createDto.name,
        key: hashedKey,
        keyPrefix,
        scopes: createDto.scopes,
        rateLimit: createDto.rateLimit || 1000,
        expiresAt,
      },
    });

    this.logger.log(`API key created for user ${userId}: ${apiKey.name}`);

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned on creation
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes as any[],
      rateLimit: apiKey.rateLimit,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  /**
   * Get user's API keys
   */
  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Don't return the actual key
    return keys.map((key) => ({
      ...key,
      key: '***', // Masked
    })) as unknown as ApiKey[];
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    this.logger.log(`API key revoked: ${keyId}`);
  }

  /**
   * Validate API key
   */
  async validateApiKey(rawKey: string): Promise<{ userId: string; scopes: ApiScope[] } | null> {
    const keyPrefix = rawKey.substring(0, 8);

    const keys = await this.prisma.apiKey.findMany({
      where: {
        keyPrefix,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    for (const key of keys) {
      // Hash the provided key and compare with stored hash
      const hashedProvidedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
      const isValid = hashedProvidedKey === key.key;

      if (isValid) {
        // Update usage
        await this.prisma.apiKey.update({
          where: { id: key.id },
          data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date(),
          },
        });

        return {
          userId: key.userId,
          scopes: key.scopes as ApiScope[],
        };
      }
    }

    return null;
  }
}
