import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { PrismaService } from '../../../database/prisma.service';
import { EncryptionService } from './encryption.service';
import type { CalendarToken } from '@microplanner/database';

type OAuth2Client = Auth.OAuth2Client;

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {
    // Initialize OAuth2 client
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || 'your-client-id';
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') || 'your-client-secret';
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') || 'http://localhost:3000/api/v1/calendar/oauth/google/callback';

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
  }

  /**
   * Generate OAuth URL for user to authorize
   */
  generateAuthUrl(userId: string): string {
    const state = this.encryptionService.generateSecureRandom();

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: Buffer.from(JSON.stringify({ userId, nonce: state })).toString('base64'),
      prompt: 'consent', // Force consent screen to get refresh token
    });

    this.logger.log(`Generated OAuth URL for user ${userId}`);
    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async handleCallback(code: string, state: string, userId: string): Promise<CalendarToken> {
    try {
      // Verify state parameter
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (stateData.userId !== userId) {
        throw new UnauthorizedException('Invalid state parameter');
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new UnauthorizedException('No access token received');
      }

      // Get user's calendar info
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const calendarList = await calendar.calendarList.list();
      const primaryCalendar = calendarList.data.items?.find(cal => cal.primary);

      // Encrypt tokens before storing
      const encryptedAccessToken = await this.encryptionService.encrypt(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token
        ? await this.encryptionService.encrypt(tokens.refresh_token)
        : null;

      const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      // Upsert calendar token
      const calendarToken = await this.prisma.calendarToken.upsert({
        where: {
          userId_provider: {
            userId,
            provider: 'google',
          },
        },
        create: {
          userId,
          provider: 'google',
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          calendarId: primaryCalendar?.id || null,
          calendarName: primaryCalendar?.summary || null,
          email: userInfo.data.email || null,
          syncEnabled: true,
        },
        update: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt,
          calendarId: primaryCalendar?.id || null,
          calendarName: primaryCalendar?.summary || null,
          email: userInfo.data.email || null,
          syncEnabled: true,
          syncErrors: 0,
          lastError: null,
        },
      });

      this.logger.log(`Saved calendar token for user ${userId}`);
      return calendarToken;
    } catch (error) {
      this.logger.error('OAuth callback failed', error);
      throw new UnauthorizedException('Failed to authenticate with Google Calendar');
    }
  }

  /**
   * Get authenticated OAuth2 client for a user
   * Automatically refreshes token if expired
   */
  async getAuthenticatedClient(userId: string): Promise<OAuth2Client> {
    const token = await this.prisma.calendarToken.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'google',
        },
      },
    });

    if (!token) {
      throw new UnauthorizedException('No calendar connected. Please connect your calendar first.');
    }

    if (!token.syncEnabled) {
      throw new UnauthorizedException('Calendar sync is disabled');
    }

    // Decrypt tokens
    const accessToken = await this.encryptionService.decrypt(token.accessToken);
    const refreshToken = token.refreshToken
      ? await this.encryptionService.decrypt(token.refreshToken)
      : null;

    // Set credentials
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: token.expiresAt?.getTime(),
    });

    // Check if token is expired or about to expire (within 5 minutes)
    const now = Date.now();
    const expiresAt = token.expiresAt?.getTime() || 0;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresAt - now < fiveMinutes && refreshToken) {
      await this.refreshAccessToken(userId, token);
    }

    return this.oauth2Client;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(userId: string, token: CalendarToken): Promise<void> {
    try {
      this.logger.log(`Refreshing access token for user ${userId}`);

      const refreshToken = token.refreshToken
        ? await this.encryptionService.decrypt(token.refreshToken)
        : null;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token in refresh response');
      }

      // Encrypt new access token
      const encryptedAccessToken = await this.encryptionService.encrypt(credentials.access_token);
      const expiresAt = credentials.expiry_date ? new Date(credentials.expiry_date) : null;

      // Update token in database
      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          accessToken: encryptedAccessToken,
          expiresAt,
          syncErrors: 0,
          lastError: null,
        },
      });

      this.logger.log(`Access token refreshed for user ${userId}`);
    } catch (error) {
      this.logger.error('Token refresh failed', error);

      // Increment error count
      await this.prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          syncErrors: { increment: 1 },
          lastError: 'Failed to refresh access token',
        },
      });

      throw new UnauthorizedException('Failed to refresh calendar access. Please reconnect your calendar.');
    }
  }

  /**
   * Disconnect calendar (delete token)
   */
  async disconnect(userId: string): Promise<void> {
    const deleted = await this.prisma.calendarToken.deleteMany({
      where: {
        userId,
        provider: 'google',
      },
    });

    this.logger.log(`Disconnected calendar for user ${userId} (deleted ${deleted.count} tokens)`);
  }
}
