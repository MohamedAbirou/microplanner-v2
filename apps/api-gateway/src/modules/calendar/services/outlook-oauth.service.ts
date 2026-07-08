import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../../database/prisma.service';
import { EncryptionService } from './encryption.service';
import type { CalendarToken } from '@microplanner/database';

const AUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const SCOPES = ['offline_access', 'openid', 'email', 'Calendars.ReadWrite', 'User.Read'];

/**
 * Microsoft Graph (Outlook) calendar OAuth lifecycle — the Outlook analogue of
 * GoogleOAuthService. Tokens are encrypted at rest and refreshed on demand.
 */
@Injectable()
export class OutlookOAuthService {
  private readonly logger = new Logger(OutlookOAuthService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  private clientId(): string {
    return this.configService.get<string>('OUTLOOK_CLIENT_ID') || '';
  }

  private clientSecret(): string {
    return this.configService.get<string>('OUTLOOK_CLIENT_SECRET') || '';
  }

  private redirectUri(): string {
    const explicit = this.configService.get<string>('OUTLOOK_REDIRECT_URI');
    if (explicit) return explicit;
    const base =
      this.configService.get<string>('API_PUBLIC_URL') ||
      this.configService.get<string>('APP_URL') ||
      'http://localhost:3001';
    return `${base}/api/v1/calendar/oauth/outlook/callback`;
  }

  private requireConfig() {
    if (!this.clientId() || !this.clientSecret()) {
      throw new UnauthorizedException(
        'Outlook calendar is not configured on this server (missing OUTLOOK_CLIENT_ID/SECRET)',
      );
    }
  }

  generateAuthUrl(userId: string): string {
    this.requireConfig();
    const state = Buffer.from(
      JSON.stringify({ userId, nonce: this.encryptionService.generateSecureRandom() }),
    ).toString('base64');
    const params = new URLSearchParams({
      client_id: this.clientId(),
      response_type: 'code',
      redirect_uri: this.redirectUri(),
      response_mode: 'query',
      scope: SCOPES.join(' '),
      state,
      prompt: 'consent',
    });
    return `${AUTH_BASE}/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string, userId: string): Promise<CalendarToken> {
    this.requireConfig();
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (stateData.userId !== userId) {
        throw new UnauthorizedException('Invalid state parameter');
      }

      const { data: tokens } = await axios.post(
        `${AUTH_BASE}/token`,
        new URLSearchParams({
          client_id: this.clientId(),
          client_secret: this.clientSecret(),
          code,
          redirect_uri: this.redirectUri(),
          grant_type: 'authorization_code',
          scope: SCOPES.join(' '),
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      if (!tokens.access_token) {
        throw new UnauthorizedException('No access token received from Microsoft');
      }

      // Fetch account email for display.
      let email: string | null = null;
      try {
        const { data: me } = await axios.get(`${GRAPH_BASE}/me`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        email = me.mail || me.userPrincipalName || null;
      } catch {
        // Non-fatal — connection still works without display email.
      }

      const encryptedAccessToken = await this.encryptionService.encrypt(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token
        ? await this.encryptionService.encrypt(tokens.refresh_token)
        : null;
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + Number(tokens.expires_in) * 1000)
        : null;

      const token = await this.prisma.calendarToken.upsert({
        where: { userId_provider: { userId, provider: 'outlook' } },
        create: {
          userId,
          provider: 'outlook',
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          calendarId: 'primary',
          calendarName: 'Outlook Calendar',
          email,
          syncEnabled: true,
        },
        update: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken ?? undefined,
          expiresAt,
          email,
          syncEnabled: true,
          syncErrors: 0,
          lastError: null,
        },
      });

      this.logger.log(`Saved Outlook calendar token for user ${userId}`);
      return token;
    } catch (error) {
      this.logger.error('Outlook OAuth callback failed', error as any);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Failed to authenticate with Outlook Calendar');
    }
  }

  /** Returns a valid access token, refreshing when close to expiry. */
  async getAccessToken(userId: string): Promise<string> {
    const token = await this.prisma.calendarToken.findUnique({
      where: { userId_provider: { userId, provider: 'outlook' } },
    });
    if (!token) {
      throw new UnauthorizedException('No Outlook calendar connected');
    }
    if (!token.syncEnabled) {
      throw new UnauthorizedException('Outlook calendar sync is disabled');
    }

    const expiresAt = token.expiresAt?.getTime() || 0;
    const needsRefresh = expiresAt - Date.now() < 5 * 60 * 1000;
    if (needsRefresh && token.refreshToken) {
      return this.refreshAccessToken(userId, token);
    }
    return this.encryptionService.decrypt(token.accessToken);
  }

  private async refreshAccessToken(userId: string, token: CalendarToken): Promise<string> {
    try {
      const refreshToken = token.refreshToken
        ? await this.encryptionService.decrypt(token.refreshToken)
        : null;
      if (!refreshToken) throw new Error('No refresh token available');

      const { data: tokens } = await axios.post(
        `${AUTH_BASE}/token`,
        new URLSearchParams({
          client_id: this.clientId(),
          client_secret: this.clientSecret(),
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: SCOPES.join(' '),
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      if (!tokens.access_token) throw new Error('No access token in refresh response');

      const encryptedAccessToken = await this.encryptionService.encrypt(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token
        ? await this.encryptionService.encrypt(tokens.refresh_token)
        : undefined;
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + Number(tokens.expires_in) * 1000)
        : null;

      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          syncErrors: 0,
          lastError: null,
        },
      });
      return tokens.access_token;
    } catch (error) {
      this.logger.error('Outlook token refresh failed', error as any);
      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: { syncErrors: { increment: 1 }, lastError: 'Failed to refresh access token' },
      });
      throw new UnauthorizedException('Failed to refresh Outlook access. Please reconnect.');
    }
  }

  async disconnect(userId: string): Promise<void> {
    const deleted = await this.prisma.calendarToken.deleteMany({
      where: { userId, provider: 'outlook' },
    });
    this.logger.log(`Disconnected Outlook for user ${userId} (${deleted.count} tokens)`);
  }
}
