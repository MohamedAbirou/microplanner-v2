import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import {
  Integration,
  Webhook,
  IntegrationType,
  WebhookEvent,
  WebhookPayload,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  OAuthCallbackDto,
} from './types/integrations.types';

/**
 * Integrations Service
 *
 * Handles third-party integrations:
 * - OAuth flows
 * - Webhook management
 * - Integration-specific actions
 */
@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ==================== INTEGRATIONS ====================

  /**
   * Get user's integrations
   */
  async getUserIntegrations(userId: string): Promise<Integration[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Don't expose credentials
    return integrations.map((integration) => ({
      ...integration,
      credentials: {}, // Masked
    })) as unknown as Integration[];
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string, userId: string): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return {
      ...integration,
      credentials: {}, // Masked
    } as unknown as Integration;
  }

  /**
   * Create integration (OAuth will populate credentials)
   */
  async createIntegration(
    userId: string,
    createDto: CreateIntegrationDto,
  ): Promise<Integration> {
    const integration = await this.prisma.integration.create({
      data: {
        userId,
        type: createDto.type,
        name: createDto.name,
        config: createDto.config as any,
        credentials: {},
        isActive: true,
      },
    });

    this.logger.log(`Integration created: ${integration.id} (${integration.type}) by user ${userId}`);

    return integration as unknown as Integration;
  }

  /**
   * Update integration
   */
  async updateIntegration(
    integrationId: string,
    userId: string,
    updateDto: UpdateIntegrationDto,
  ): Promise<Integration> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const updated = await this.prisma.integration.update({
      where: { id: integrationId },
      data: {
        name: updateDto.name,
        config: updateDto.config as any,
        isActive: updateDto.isActive,
      },
    });

    this.logger.log(`Integration updated: ${integrationId}`);

    return updated as unknown as Integration;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string, userId: string): Promise<void> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    await this.prisma.integration.delete({
      where: { id: integrationId },
    });

    this.logger.log(`Integration deleted: ${integrationId}`);
  }

  // ==================== OAUTH ====================

  /**
   * Get OAuth authorization URL
   */
  getOAuthUrl(type: IntegrationType, userId: string, redirectUri: string): string {
    const state = this.generateOAuthState(userId, type);

    switch (type) {
      case IntegrationType.SLACK:
        return this.getSlackOAuthUrl(state, redirectUri);
      case IntegrationType.ZOOM:
        return this.getZoomOAuthUrl(state, redirectUri);
      case IntegrationType.GOOGLE_MEET:
        return this.getGoogleOAuthUrl(state, redirectUri);
      case IntegrationType.NOTION:
        return this.getNotionOAuthUrl(state, redirectUri);
      case IntegrationType.LINEAR:
        return this.getLinearOAuthUrl(state, redirectUri);
      case IntegrationType.GITHUB:
        return this.getGitHubOAuthUrl(state, redirectUri);
      default:
        throw new BadRequestException('Unsupported integration type');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    type: IntegrationType,
    callbackDto: OAuthCallbackDto,
  ): Promise<{ userId: string; integrationId: string }> {
    // Verify state
    const { userId } = this.verifyOAuthState(callbackDto.state, type);

    // Exchange code for tokens
    let credentials: any;
    let config: any = {};

    switch (type) {
      case IntegrationType.SLACK:
        credentials = await this.exchangeSlackCode(callbackDto.code);
        config = {
          workspaceId: credentials.team.id,
          workspaceName: credentials.team.name,
        };
        break;
      case IntegrationType.ZOOM:
        credentials = await this.exchangeZoomCode(callbackDto.code);
        break;
      case IntegrationType.GOOGLE_MEET:
        credentials = await this.exchangeGoogleCode(callbackDto.code);
        break;
      case IntegrationType.NOTION:
        credentials = await this.exchangeNotionCode(callbackDto.code);
        break;
      case IntegrationType.LINEAR:
        credentials = await this.exchangeLinearCode(callbackDto.code);
        break;
      case IntegrationType.GITHUB:
        credentials = await this.exchangeGitHubCode(callbackDto.code);
        break;
      default:
        throw new BadRequestException('Unsupported integration type');
    }

    // Create or update integration
    const existing = await this.prisma.integration.findFirst({
      where: { userId, type },
    });

    let integration;
    if (existing) {
      integration = await this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          credentials: this.encryptCredentials(credentials),
          config: config as any,
          isActive: true,
        },
      });
    } else {
      integration = await this.prisma.integration.create({
        data: {
          userId,
          type,
          name: `${type} Integration`,
          config: config as any,
          credentials: this.encryptCredentials(credentials),
          isActive: true,
        },
      });
    }

    this.logger.log(`OAuth completed for ${type}: ${integration.id}`);

    return { userId, integrationId: integration.id };
  }

  // ==================== WEBHOOKS ====================

  /**
   * Create webhook
   */
  async createWebhook(userId: string, createDto: CreateWebhookDto): Promise<Webhook> {
    // Validate URL
    try {
      new URL(createDto.url);
    } catch (error) {
      throw new BadRequestException('Invalid webhook URL');
    }

    // Generate secret if not provided
    const secret = createDto.secret || crypto.randomBytes(32).toString('hex');

    const webhook = await this.prisma.webhook.create({
      data: {
        userId,
        url: createDto.url,
        events: createDto.events,
        secret,
        isActive: true,
      },
    });

    this.logger.log(`Webhook created: ${webhook.id} by user ${userId}`);

    return webhook as unknown as Webhook;
  }

  /**
   * Get user's webhooks
   */
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return webhooks as unknown as Webhook[];
  }

  /**
   * Update webhook
   */
  async updateWebhook(
    webhookId: string,
    userId: string,
    updateDto: UpdateWebhookDto,
  ): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const updated = await this.prisma.webhook.update({
      where: { id: webhookId },
      data: {
        url: updateDto.url,
        events: updateDto.events,
        isActive: updateDto.isActive,
      },
    });

    this.logger.log(`Webhook updated: ${webhookId}`);

    return updated as unknown as Webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string, userId: string): Promise<void> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: { id: webhookId },
    });

    this.logger.log(`Webhook deleted: ${webhookId}`);
  }

  /**
   * Get a single webhook (owner only)
   */
  async getWebhook(webhookId: string, userId: string): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook as unknown as Webhook;
  }

  /**
   * Toggle a webhook's active state
   */
  async toggleWebhook(webhookId: string, userId: string): Promise<Webhook> {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const updated = await this.prisma.webhook.update({
      where: { id: webhookId },
      data: { isActive: !webhook.isActive },
    });

    this.logger.log(`Webhook ${webhookId} ${updated.isActive ? 'enabled' : 'disabled'}`);
    return updated as unknown as Webhook;
  }

  /**
   * List deliveries for a webhook (owner only)
   */
  async getWebhookDeliveries(webhookId: string, userId: string, take = 50) {
    // Ownership check
    await this.getWebhook(webhookId, userId);

    return this.prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: Number(take) || 50,
    });
  }

  /**
   * Retry a failed webhook delivery (owner only)
   */
  async retryWebhookDelivery(deliveryId: string, userId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery || delivery.webhook.userId !== userId) {
      throw new NotFoundException('Webhook delivery not found');
    }

    const payload = delivery.payload as any;

    try {
      const signature = this.generateWebhookSignature(payload, delivery.webhook.secret);
      const response = await axios.post(delivery.webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-MicroPlanner-Signature': signature,
          'X-MicroPlanner-Event': delivery.event,
        },
        timeout: 10000,
      });

      return this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'success',
          statusCode: response.status,
          responseBody: JSON.stringify(response.data),
          error: null,
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });
    } catch (error: any) {
      return this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          statusCode: error?.response?.status || null,
          error: error?.message || 'Delivery failed',
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });
    }
  }

  /**
   * Manually trigger a sync for an integration.
   * Marks the sync time; the per-provider sync logic hooks in here as it lands.
   */
  async syncIntegration(integrationId: string, userId: string): Promise<Integration> {
    const integration = await this.getIntegration(integrationId, userId);

    if (!(integration as any).isActive) {
      throw new BadRequestException('Integration is not active');
    }

    const updated = await this.prisma.integration.update({
      where: { id: integrationId },
      data: { lastSyncAt: new Date() },
    });

    this.logger.log(`Integration ${integrationId} synced`);
    return updated as unknown as Integration;
  }

  /**
   * Trigger webhook event
   */
  async triggerWebhook(event: WebhookEvent, userId: string, data: any): Promise<void> {
    // Find all active webhooks for this user that listen to this event
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        userId,
        isActive: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) {
      return; // No webhooks to trigger
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date(),
      data,
      userId,
    };

    // Trigger all webhooks asynchronously
    for (const webhook of webhooks) {
      this.deliverWebhook(webhook.id, payload).catch((error) => {
        this.logger.error(`Failed to deliver webhook ${webhook.id}: ${error.message}`);
      });
    }
  }

  /**
   * Deliver webhook (with retry logic)
   */
  private async deliverWebhook(webhookId: string, payload: WebhookPayload): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) return;

    // Create delivery record
    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        event: payload.event,
        payload: payload as any,
        status: 'pending',
        attempts: 0,
      },
    });

    // Attempt delivery with exponential backoff (1s, 2s, 4s between tries)
    const signature = this.generateWebhookSignature(payload, webhook.secret);
    const maxAttempts = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-MicroPlanner-Signature': signature,
            'X-MicroPlanner-Event': payload.event,
          },
          timeout: 10000, // 10 seconds
        });

        // Success
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'success',
            statusCode: response.status,
            responseBody: JSON.stringify(response.data),
            attempts: attempt,
            lastAttemptAt: new Date(),
          },
        });

        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: {
            lastTriggeredAt: new Date(),
            failureCount: 0,
          },
        });

        this.logger.log(
          `Webhook delivered successfully: ${webhookId} (${payload.event}, attempt ${attempt})`
        );
        return;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Webhook delivery attempt ${attempt}/${maxAttempts} failed: ${webhookId} - ${error.message}`
        );
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
        }
      }
    }

    // All attempts failed
    await this.prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'failed',
        statusCode: lastError?.response?.status,
        error: lastError?.message || 'Delivery failed',
        attempts: maxAttempts,
        lastAttemptAt: new Date(),
      },
    });

    await this.prisma.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: { increment: 1 },
      },
    });

    this.logger.error(`Webhook delivery failed after ${maxAttempts} attempts: ${webhookId}`);
  }

  // ==================== HELPER METHODS ====================

  private generateOAuthState(userId: string, type: IntegrationType): string {
    const state = {
      userId,
      type,
      timestamp: Date.now(),
    };
    return Buffer.from(JSON.stringify(state)).toString('base64');
  }

  private verifyOAuthState(state: string, type: IntegrationType): { userId: string } {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      if (decoded.type !== type) {
        throw new Error('Invalid state type');
      }
      // Check timestamp (should be within 10 minutes)
      if (Date.now() - decoded.timestamp > 10 * 60 * 1000) {
        throw new Error('State expired');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new BadRequestException('Invalid OAuth state');
    }
  }

  /**
   * AES-256-GCM encryption for stored OAuth credentials.
   * Key: sha256(ENCRYPTION_KEY). Output: { __enc: 'aes-256-gcm', iv, tag, data }.
   */
  private getEncryptionKey(): Buffer {
    const secret =
      this.config.get<string>('ENCRYPTION_KEY') ||
      this.config.get<string>('ENCRYPTION_SECRET') ||
      '';
    if (!secret || secret.startsWith('your-')) {
      throw new BadRequestException(
        'ENCRYPTION_KEY is not configured — cannot store integration credentials securely'
      );
    }
    return crypto.createHash('sha256').update(secret).digest();
  }

  private encryptCredentials(credentials: any): any {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(credentials), 'utf8');
    const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return {
      __enc: 'aes-256-gcm',
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      data: data.toString('base64'),
    };
  }

  private decryptCredentials(encrypted: any): any {
    // Back-compat: rows written before encryption existed are plain objects
    if (!encrypted || encrypted.__enc !== 'aes-256-gcm') {
      return encrypted;
    }
    const key = this.getEncryptionKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encrypted.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, 'base64')),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString('utf8'));
  }

  private generateWebhookSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  // OAuth URL generators (placeholder implementations)
  private getSlackOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('SLACK_CLIENT_ID');
    const scopes = 'chat:write,channels:read,users:read';
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  private getZoomOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('ZOOM_CLIENT_ID');
    return `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  private getGoogleOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('GOOGLE_CLIENT_ID');
    const scopes = 'https://www.googleapis.com/auth/calendar';
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;
  }

  private getNotionOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('NOTION_CLIENT_ID');
    return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  private getLinearOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('LINEAR_CLIENT_ID');
    return `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
  }

  private getGitHubOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('GITHUB_CLIENT_ID');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=repo`;
  }

  /**
   * OAuth code exchanges. Each provider needs its CLIENT_ID/CLIENT_SECRET
   * env vars; without them the exchange fails with a clear config error
   * (the UI surfaces it) rather than pretending to connect.
   */
  private requireProviderConfig(provider: string, ...keys: string[]): string[] {
    const values = keys.map((k) => this.config.get<string>(k));
    if (values.some((v) => !v)) {
      throw new BadRequestException(
        `${provider} integration is not configured on this server (missing ${keys.join('/')})`
      );
    }
    return values as string[];
  }

  private oauthRedirectUri(provider: string): string {
    const base = this.config.get<string>('APP_URL') || 'http://localhost:3001';
    return `${base}/api/v1/integrations/oauth/${provider}/callback`;
  }

  private async exchangeSlackCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Slack', 'SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://slack.com/api/oauth.v2.access',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('slack'),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    if (!data.ok) {
      throw new BadRequestException(`Slack OAuth failed: ${data.error}`);
    }
    return data;
  }

  private async exchangeZoomCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Zoom', 'ZOOM_CLIENT_ID', 'ZOOM_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.oauthRedirectUri('zoom'),
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data;
  }

  private async exchangeGoogleCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Google', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('google-meet'),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return data;
  }

  private async exchangeNotionCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Notion', 'NOTION_CLIENT_ID', 'NOTION_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.oauthRedirectUri('notion'),
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  }

  private async exchangeLinearCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Linear', 'LINEAR_CLIENT_ID', 'LINEAR_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://api.linear.app/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('linear'),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return data;
  }

  private async exchangeGitHubCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'GitHub', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('github'),
      },
      { headers: { Accept: 'application/json' } }
    );
    if (data.error) {
      throw new BadRequestException(`GitHub OAuth failed: ${data.error_description || data.error}`);
    }
    return data;
  }
}
