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
import {
  ExternalResource,
  ExternalTask,
  ProviderContext,
  ProviderSyncError,
  TaskProvider,
  WebhookTaskEvent,
  getTaskProvider,
} from './providers';

/** Per-sync outcome summary persisted to Integration.config.lastSyncStats. */
export interface SyncStats {
  imported: number;
  updated: number;
  completed: number;
  total: number;
  syncedAt: string;
  error?: string;
}

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
  getOAuthUrl(type: IntegrationType, userId: string): string {
    const state = this.generateOAuthState(userId, type);
    // The redirect URI must be byte-identical in the authorize request and the
    // later token exchange, so both derive it from oauthRedirectUri().
    const redirectUri = this.oauthRedirectUri(type);

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
      case IntegrationType.TODOIST:
        return this.getTodoistOAuthUrl(state, redirectUri);
      case IntegrationType.JIRA:
        return this.getJiraOAuthUrl(state, redirectUri);
      case IntegrationType.ASANA:
        return this.getAsanaOAuthUrl(state, redirectUri);
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
      case IntegrationType.TODOIST:
        credentials = await this.exchangeTodoistCode(callbackDto.code);
        break;
      case IntegrationType.JIRA:
        credentials = await this.exchangeJiraCode(callbackDto.code);
        config = await this.fetchJiraSite(credentials.access_token);
        break;
      case IntegrationType.ASANA:
        credentials = await this.exchangeAsanaCode(callbackDto.code);
        config = await this.fetchAsanaWorkspace(credentials.access_token);
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
    // Load the raw row (credentials intact) rather than the masked getIntegration().
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, userId },
    });
    if (!integration) {
      throw new NotFoundException('Integration not found');
    }
    if (!integration.isActive) {
      throw new BadRequestException('Integration is not active');
    }

    const provider = getTaskProvider(integration.type);

    // Non-PM integrations (Slack, Zoom, …) just record a sync timestamp.
    if (!provider) {
      const updated = await this.prisma.integration.update({
        where: { id: integrationId },
        data: { lastSyncAt: new Date() },
      });
      return this.mask(updated);
    }

    const ctx = await this.ensureFreshContext(integration, provider);
    let stats: SyncStats;
    try {
      const externalTasks = await provider.fetchTasks(ctx);
      stats = await this.reconcileImportedTasks(userId, integration.id, provider.source, externalTasks);
      await this.persistSyncResult(integration, { ...stats, error: undefined });
      this.logger.log(
        `Synced ${provider.source} for user ${userId}: +${stats.imported} imported, ${stats.updated} updated, ${stats.completed} completed`,
      );
    } catch (err: any) {
      const message =
        err instanceof ProviderSyncError ? err.message : err?.message || 'Sync failed';
      await this.persistSyncResult(integration, {
        imported: 0,
        updated: 0,
        completed: 0,
        total: 0,
        syncedAt: new Date().toISOString(),
        error: message,
      });
      this.logger.warn(`Sync failed for ${provider.source} (user ${userId}): ${message}`);
      throw new BadRequestException(message);
    }

    const refreshed = await this.prisma.integration.findUnique({ where: { id: integrationId } });
    return this.mask(refreshed!);
  }

  /**
   * Upsert fetched external tasks into MicroPlanner. Idempotent per external ID.
   * User-owned scheduling (date/time) is preserved on updates; only source-owned
   * fields (title/notes/priority/url/completion) are refreshed.
   */
  private async reconcileImportedTasks(
    userId: string,
    integrationId: string,
    source: string,
    externalTasks: ExternalTask[],
  ): Promise<SyncStats> {
    let imported = 0;
    let updated = 0;
    let completed = 0;

    for (const ext of externalTasks) {
      if (!ext.externalId) continue;

      const existing = await this.prisma.task.findFirst({
        where: { userId, externalSource: source, externalId: ext.externalId },
        select: { id: true, isCompleted: true },
      });

      if (!existing) {
        // Don't import items already completed upstream — nothing to schedule.
        if (ext.completed) continue;
        await this.prisma.task.create({
          data: this.buildImportedTaskCreate(userId, integrationId, source, ext),
        });
        imported++;
        continue;
      }

      // Reflect upstream completion into MicroPlanner (import-side of two-way).
      if (ext.completed && !existing.isCompleted) {
        await this.prisma.task.update({
          where: { id: existing.id },
          data: { isCompleted: true, completedAt: new Date(), externalSyncedAt: new Date() },
        });
        completed++;
        continue;
      }

      // Refresh source-owned fields without clobbering user scheduling.
      await this.prisma.task.update({
        where: { id: existing.id },
        data: {
          title: ext.title,
          notes: ext.notes ?? undefined,
          priority: ext.priority ?? undefined,
          externalUrl: ext.url ?? undefined,
          externalSyncedAt: new Date(),
        },
      });
      updated++;
    }

    return {
      imported,
      updated,
      completed,
      total: externalTasks.length,
      syncedAt: new Date().toISOString(),
    };
  }

  private buildImportedTaskCreate(
    userId: string,
    integrationId: string,
    source: string,
    ext: ExternalTask,
  ): any {
    const scheduledDate = this.startOfDay(ext.dueDate ?? new Date());
    // Imported tasks land in a default morning block; the user (or autopilot)
    // can reschedule. Times are placeholders, not a real calendar commitment.
    return {
      userId,
      integrationId,
      title: ext.title,
      notes: ext.notes ?? null,
      priority: ext.priority ?? 2,
      tags: [source],
      scheduledDate,
      startTime: '09:00',
      endTime: '09:30',
      durationMinutes: 30,
      isCompleted: false,
      aiGenerated: false,
      manuallyAdded: false,
      externalId: ext.externalId,
      externalSource: source,
      externalUrl: ext.url ?? null,
      externalSyncedAt: new Date(),
    };
  }

  /**
   * Sync-back: when a MicroPlanner task backed by an external item is completed,
   * close the item upstream. Best-effort and non-blocking for the caller.
   */
  async syncTaskCompletion(task: {
    id: string;
    userId: string;
    externalId: string | null;
    externalSource: string | null;
    integrationId: string | null;
  }): Promise<void> {
    if (!task.externalId || !task.externalSource) return;
    const provider = getTaskProvider(task.externalSource);
    if (!provider) return;

    const integration = task.integrationId
      ? await this.prisma.integration.findFirst({
          where: { id: task.integrationId, userId: task.userId },
        })
      : await this.prisma.integration.findFirst({
          where: { userId: task.userId, type: task.externalSource },
        });

    if (!integration || !integration.isActive) return;
    // Respect the configured direction — "import" is one-way only.
    const direction = (integration.config as any)?.syncDirection;
    if (direction === 'import') return;

    const ctx = await this.ensureFreshContext(integration, provider);
    try {
      await provider.completeTask(ctx, task.externalId);
      await this.prisma.task.update({
        where: { id: task.id },
        data: { externalSyncedAt: new Date() },
      });
      this.logger.log(`Synced completion of ${task.externalSource} task ${task.externalId} for user ${task.userId}`);
    } catch (err: any) {
      const message =
        err instanceof ProviderSyncError ? err.message : err?.message || 'sync-back failed';
      this.logger.warn(`Completion sync-back failed for task ${task.id}: ${message}`);
    }
  }

  /**
   * Preview open tasks across all connected PM integrations without importing —
   * used by the plan-day ritual. Flags items already present in MicroPlanner.
   */
  async previewExternalTasks(userId: string): Promise<
    Array<{
      integrationId: string;
      source: string;
      externalId: string;
      title: string;
      dueDate: Date | null;
      url: string | null;
      alreadyImported: boolean;
    }>
  > {
    const integrations = await this.prisma.integration.findMany({
      where: { userId, isActive: true },
    });
    const results: Array<any> = [];

    for (const integration of integrations) {
      const provider = getTaskProvider(integration.type);
      if (!provider) continue;
      try {
        const ctx = await this.ensureFreshContext(integration, provider);
        const tasks = await provider.fetchTasks(ctx);
        for (const t of tasks) {
          if (t.completed || !t.externalId) continue;
          results.push({
            integrationId: integration.id,
            source: provider.source,
            externalId: t.externalId,
            title: t.title,
            dueDate: t.dueDate ?? null,
            url: t.url ?? null,
            alreadyImported: false,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Preview failed for ${integration.type}: ${err?.message || err}`);
      }
    }

    if (results.length > 0) {
      const existing = await this.prisma.task.findMany({
        where: {
          userId,
          externalId: { in: results.map((r) => r.externalId) },
        },
        select: { externalSource: true, externalId: true },
      });
      const importedKeys = new Set(existing.map((e) => `${e.externalSource}:${e.externalId}`));
      for (const r of results) {
        r.alreadyImported = importedKeys.has(`${r.source}:${r.externalId}`);
      }
    }
    return results;
  }

  /** Import a selected set of external tasks into MicroPlanner. Idempotent. */
  async importExternalTasks(
    userId: string,
    items: Array<{ integrationId: string; source: string; externalId: string; title: string; dueDate?: string | null; url?: string | null }>,
  ): Promise<{ imported: number }> {
    let imported = 0;
    for (const item of items) {
      if (!getTaskProvider(item.source)) continue;
      const existing = await this.prisma.task.findFirst({
        where: { userId, externalSource: item.source, externalId: item.externalId },
        select: { id: true },
      });
      if (existing) continue;
      await this.prisma.task.create({
        data: this.buildImportedTaskCreate(userId, item.integrationId, item.source, {
          externalId: item.externalId,
          title: item.title,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          url: item.url ?? undefined,
          completed: false,
        }),
      });
      imported++;
    }
    return { imported };
  }

  /** List selectable projects/boards/databases for the settings UI. */
  async listIntegrationResources(
    integrationId: string,
    userId: string,
  ): Promise<ExternalResource[]> {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, userId },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    const provider = getTaskProvider(integration.type);
    if (!provider?.listResources) return [];
    const ctx = await this.ensureFreshContext(integration, provider);
    try {
      return await provider.listResources(ctx);
    } catch (err: any) {
      const message =
        err instanceof ProviderSyncError ? err.message : err?.message || 'Failed to list resources';
      throw new BadRequestException(message);
    }
  }

  /**
   * Handle an inbound provider webhook. The webhook URL must carry the owning
   * integration id (?integration=<id>) so we can resolve the user unambiguously.
   */
  async handleInboundWebhook(
    integrationId: string,
    rawPayload: any,
    headers: Record<string, any>,
  ): Promise<{ applied: boolean }> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });
    if (!integration || !integration.isActive) return { applied: false };

    const provider = getTaskProvider(integration.type);
    if (!provider?.parseWebhook) return { applied: false };

    const event: WebhookTaskEvent | null = provider.parseWebhook(rawPayload, headers);
    if (!event) return { applied: false };

    if (event.action === 'delete' && event.externalId) {
      await this.prisma.task.deleteMany({
        where: {
          userId: integration.userId,
          externalSource: provider.source,
          externalId: event.externalId,
        },
      });
      return { applied: true };
    }

    if (event.action === 'upsert' && event.task) {
      await this.reconcileImportedTasks(integration.userId, integration.id, provider.source, [
        event.task,
      ]);
      return { applied: true };
    }
    return { applied: false };
  }

  private providerContext(integration: any): ProviderContext {
    return {
      credentials: this.decryptCredentials(integration.credentials),
      config: (integration.config as Record<string, any>) || {},
    };
  }

  /** Public accessor for decrypted credentials (used by SlackService). */
  decryptIntegrationCredentials(integration: { credentials: any }): any {
    return this.decryptCredentials(integration.credentials);
  }

  /**
   * Build a provider context, refreshing short-lived OAuth tokens first (Jira,
   * Asana) and persisting the new credentials so future syncs stay authorized.
   */
  private async ensureFreshContext(integration: any, provider: TaskProvider): Promise<ProviderContext> {
    const ctx = this.providerContext(integration);
    if (!provider.refreshCredentials) return ctx;
    try {
      const refreshed = await provider.refreshCredentials(ctx);
      if (refreshed) {
        await this.prisma.integration.update({
          where: { id: integration.id },
          data: { credentials: this.encryptCredentials(refreshed) },
        });
        ctx.credentials = refreshed;
      }
    } catch (err: any) {
      this.logger.warn(
        `Token refresh failed for ${provider.source} (integration ${integration.id}): ${err?.message || err}`,
      );
    }
    return ctx;
  }

  private async persistSyncResult(integration: any, stats: SyncStats): Promise<void> {
    const config = { ...((integration.config as Record<string, any>) || {}) };
    config.lastSyncStats = stats;
    if (stats.error) {
      config.syncError = stats.error;
    } else {
      delete config.syncError;
    }
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        config: config as any,
        lastSyncAt: stats.error ? integration.lastSyncAt : new Date(),
      },
    });
  }

  private mask(integration: any): Integration {
    return { ...integration, credentials: {} } as unknown as Integration;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
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

  private getTodoistOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('TODOIST_CLIENT_ID');
    const scope = 'data:read_write';
    return `https://todoist.com/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  private getJiraOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('JIRA_CLIENT_ID');
    const scope = encodeURIComponent('read:jira-work write:jira-work read:jira-user offline_access');
    return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&prompt=consent`;
  }

  private getAsanaOAuthUrl(state: string, redirectUri: string): string {
    const clientId = this.config.get('ASANA_CLIENT_ID');
    return `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=default`;
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
    // Must point at the api-gateway's own public origin (where the callback
    // endpoint lives), not the web app. Falls back to APP_URL for back-compat.
    const base =
      this.config.get<string>('API_PUBLIC_URL') ||
      this.config.get<string>('APP_URL') ||
      'http://localhost:3001';
    return `${base}/api/v1/integrations/oauth/${provider}/callback`;
  }

  /**
   * Where to send the user's browser after the OAuth handshake completes.
   * Points at the web app's integrations page with a status query param so the
   * UI can show an honest success/error toast.
   */
  postOAuthRedirectUrl(type: IntegrationType, error?: string): string {
    const webBase =
      this.config.get<string>('WEB_APP_URL') ||
      this.config.get<string>('APP_URL') ||
      'http://localhost:3000';
    if (error) {
      return `${webBase}/integrations?integration_error=${encodeURIComponent(error)}`;
    }
    return `${webBase}/integrations?connected=${encodeURIComponent(type)}`;
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

  private async exchangeTodoistCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Todoist', 'TODOIST_CLIENT_ID', 'TODOIST_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://todoist.com/oauth/access_token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('todoist'),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    if (data.error) {
      throw new BadRequestException(`Todoist OAuth failed: ${data.error}`);
    }
    return data;
  }

  private async exchangeJiraCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Jira', 'JIRA_CLIENT_ID', 'JIRA_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://auth.atlassian.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: this.oauthRedirectUri('jira'),
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    // Persist absolute expiry so the provider can refresh proactively.
    if (data.expires_in) data.expires_at = Date.now() + Number(data.expires_in) * 1000;
    return data;
  }

  /** Atlassian 3LO tokens are cloud-scoped; resolve the site (cloudId) once. */
  private async fetchJiraSite(accessToken: string): Promise<any> {
    const { data } = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    });
    const site = Array.isArray(data) ? data[0] : null;
    if (!site) {
      throw new BadRequestException('No accessible Jira site found for this account');
    }
    return { cloudId: site.id, siteUrl: site.url, siteName: site.name };
  }

  private async exchangeAsanaCode(code: string): Promise<any> {
    const [clientId, clientSecret] = this.requireProviderConfig(
      'Asana', 'ASANA_CLIENT_ID', 'ASANA_CLIENT_SECRET'
    );
    const { data } = await axios.post(
      'https://app.asana.com/-/oauth_token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.oauthRedirectUri('asana'),
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    if (data.expires_in) data.expires_at = Date.now() + Number(data.expires_in) * 1000;
    return data;
  }

  private async fetchAsanaWorkspace(accessToken: string): Promise<any> {
    const { data } = await axios.get('https://app.asana.com/api/1.0/workspaces', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const ws = data?.data?.[0];
    return ws ? { workspaceId: ws.gid, workspaceName: ws.name } : {};
  }
}
