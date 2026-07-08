import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationsService } from './integrations.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  IntegrationType,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from './types/integrations.types';

/**
 * Integrations Controller
 *
 * Handles third-party integrations and webhooks
 */
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // NOTE: literal routes (webhooks/*, oauth/*) are declared BEFORE the
  // parameterized :id routes below — Express matches in declaration order,
  // so GET :id declared first would shadow GET webhooks.

  // ==================== INTEGRATIONS ====================

  /**
   * Get user's integrations
   */
  @Get()
  async getUserIntegrations(@Request() req: any) {
    return this.integrationsService.getUserIntegrations(req.user.id);
  }

  /**
   * Create integration
   */
  @Post()
  async createIntegration(@Request() req: any, @Body() createDto: CreateIntegrationDto) {
    return this.integrationsService.createIntegration(req.user.id, createDto);
  }

  /**
   * Update integration
   */
  @Put(':id')
  async updateIntegration(
    @Request() req: any,
    @Param('id') integrationId: string,
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.updateIntegration(
      integrationId,
      req.user.id,
      updateDto,
    );
  }

  /**
   * Delete integration
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIntegration(@Request() req: any, @Param('id') integrationId: string) {
    await this.integrationsService.deleteIntegration(integrationId, req.user.id);
  }

  // ==================== OAUTH ====================

  /**
   * Get OAuth authorization URL
   */
  @Get('oauth/:type/authorize')
  async getOAuthUrl(@Request() req: any, @Param('type') type: IntegrationType) {
    // The redirect URI is derived server-side from a fixed origin so a caller
    // cannot inject an arbitrary redirect target (open-redirect protection).
    const authUrl = this.integrationsService.getOAuthUrl(type, req.user.id);
    return { url: authUrl };
  }

  /**
   * Handle OAuth callback
   *
   * The provider redirects the user's browser here. After exchanging the code
   * we 302 the browser back to the web app's integrations page with an honest
   * success/error status rather than dumping raw JSON on the user.
   */
  @Get('oauth/:type/callback')
  @Public()
  async handleOAuthCallback(
    @Param('type') type: IntegrationType,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') providerError: string,
    @Res() res: Response,
  ) {
    try {
      if (providerError) {
        throw new Error(providerError);
      }
      await this.integrationsService.handleOAuthCallback(type, { code, state });
      return res.redirect(this.integrationsService.postOAuthRedirectUrl(type));
    } catch (err: any) {
      const message = err?.message || 'OAuth connection failed';
      return res.redirect(this.integrationsService.postOAuthRedirectUrl(type, message));
    }
  }

  // ==================== WEBHOOKS ====================

  /**
   * Create webhook
   */
  @Post('webhooks')
  async createWebhook(@Request() req: any, @Body() createDto: CreateWebhookDto) {
    return this.integrationsService.createWebhook(req.user.id, createDto);
  }

  /**
   * Get user's webhooks
   */
  @Get('webhooks')
  async getUserWebhooks(@Request() req: any) {
    return this.integrationsService.getUserWebhooks(req.user.id);
  }

  /**
   * Update webhook
   */
  @Put('webhooks/:id')
  async updateWebhook(
    @Request() req: any,
    @Param('id') webhookId: string,
    @Body() updateDto: UpdateWebhookDto,
  ) {
    return this.integrationsService.updateWebhook(webhookId, req.user.id, updateDto);
  }

  /**
   * Delete webhook
   */
  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(@Request() req: any, @Param('id') webhookId: string) {
    await this.integrationsService.deleteWebhook(webhookId, req.user.id);
  }

  /**
   * Test webhook
   */
  @Post('webhooks/:id/test')
  async testWebhook(@Request() req: any, @Param('id') _webhookId: string) {
    // Trigger a test webhook event
    await this.integrationsService.triggerWebhook(
      'goal.created' as any,
      req.user.id,
      {
        test: true,
        message: 'This is a test webhook delivery',
      },
    );

    return { success: true, message: 'Test webhook triggered' };
  }

  /**
   * Get a single webhook
   */
  @Get('webhooks/:id')
  async getWebhook(@Request() req: any, @Param('id') webhookId: string) {
    return this.integrationsService.getWebhook(webhookId, req.user.id);
  }

  /**
   * Toggle webhook active state
   */
  @Put('webhooks/:id/toggle')
  async toggleWebhook(@Request() req: any, @Param('id') webhookId: string) {
    return this.integrationsService.toggleWebhook(webhookId, req.user.id);
  }

  /**
   * List webhook deliveries
   */
  @Get('webhooks/:id/deliveries')
  async getWebhookDeliveries(
    @Request() req: any,
    @Param('id') webhookId: string,
    @Query('take') take?: number,
  ) {
    return this.integrationsService.getWebhookDeliveries(webhookId, req.user.id, take);
  }

  /**
   * Retry a webhook delivery
   */
  @Post('webhooks/deliveries/:id/retry')
  async retryWebhookDelivery(@Request() req: any, @Param('id') deliveryId: string) {
    return this.integrationsService.retryWebhookDelivery(deliveryId, req.user.id);
  }

  /**
   * Inbound provider webhook (Linear/Todoist create/update/delete).
   *
   * Public: authenticated by the owning integration id in the query string plus
   * provider-specific signature verification inside the provider. The webhook
   * URL registered with the provider must be:
   *   {API_PUBLIC_URL}/api/v1/integrations/webhooks/inbound/:type?integration=<id>
   */
  @Post('webhooks/inbound/:type')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleInboundWebhook(
    @Param('type') _type: string,
    @Query('integration') integrationId: string,
    @Body() payload: any,
    @Request() req: any,
  ) {
    if (!integrationId) {
      return { applied: false };
    }
    return this.integrationsService.handleInboundWebhook(integrationId, payload, req.headers || {});
  }

  // ==================== PM INBOX (plan-day ritual) ====================

  /**
   * Open tasks across all connected PM integrations (preview, not imported).
   */
  @Get('pm-inbox')
  async getPmInbox(@Request() req: any) {
    return this.integrationsService.previewExternalTasks(req.user.id);
  }

  /**
   * Import a selected set of external tasks into MicroPlanner.
   */
  @Post('pm-import')
  async importPm(@Request() req: any, @Body() body: { items: any[] }) {
    return this.integrationsService.importExternalTasks(req.user.id, body?.items || []);
  }

  // ==================== PARAMETERIZED ROUTES (keep last) ====================

  /**
   * Get integration by ID
   */
  @Get(':id')
  async getIntegration(@Request() req: any, @Param('id') integrationId: string) {
    return this.integrationsService.getIntegration(integrationId, req.user.id);
  }

  /**
   * Manually trigger integration sync
   */
  @Post(':id/sync')
  async syncIntegration(@Request() req: any, @Param('id') integrationId: string) {
    return this.integrationsService.syncIntegration(integrationId, req.user.id);
  }

  /**
   * List selectable projects/boards/databases for a PM integration.
   */
  @Get(':id/resources')
  async getIntegrationResources(@Request() req: any, @Param('id') integrationId: string) {
    return this.integrationsService.listIntegrationResources(integrationId, req.user.id);
  }
}
