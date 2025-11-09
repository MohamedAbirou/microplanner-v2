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
  HttpCode,
  HttpStatus,
  Redirect,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  IntegrationType,
  CreateIntegrationDto,
  UpdateIntegrationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  OAuthCallbackDto,
} from './types/integrations.types';

/**
 * Integrations Controller
 *
 * Handles third-party integrations and webhooks
 */
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  // ==================== INTEGRATIONS ====================

  /**
   * Get user's integrations
   */
  @Get()
  async getUserIntegrations(@Request() req: any) {
    return this.integrationsService.getUserIntegrations(req.user.userId);
  }

  /**
   * Get integration by ID
   */
  @Get(':id')
  async getIntegration(@Request() req: any, @Param('id') integrationId: string) {
    return this.integrationsService.getIntegration(integrationId, req.user.userId);
  }

  /**
   * Create integration
   */
  @Post()
  async createIntegration(@Request() req: any, @Body() createDto: CreateIntegrationDto) {
    return this.integrationsService.createIntegration(req.user.userId, createDto);
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
      req.user.userId,
      updateDto,
    );
  }

  /**
   * Delete integration
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIntegration(@Request() req: any, @Param('id') integrationId: string) {
    await this.integrationsService.deleteIntegration(integrationId, req.user.userId);
  }

  // ==================== OAUTH ====================

  /**
   * Get OAuth authorization URL
   */
  @Get('oauth/:type/authorize')
  async getOAuthUrl(
    @Request() req: any,
    @Param('type') type: IntegrationType,
    @Query('redirect_uri') redirectUri: string,
  ) {
    const authUrl = this.integrationsService.getOAuthUrl(
      type,
      req.user.userId,
      redirectUri || `${process.env.APP_URL}/integrations/callback`,
    );

    return { url: authUrl };
  }

  /**
   * Handle OAuth callback
   */
  @Get('oauth/:type/callback')
  @Public()
  async handleOAuthCallback(
    @Param('type') type: IntegrationType,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const result = await this.integrationsService.handleOAuthCallback(type, { code, state });

    // Redirect to frontend with success
    return {
      success: true,
      integrationId: result.integrationId,
      message: `${type} integration connected successfully`,
    };
  }

  // ==================== WEBHOOKS ====================

  /**
   * Create webhook
   */
  @Post('webhooks')
  async createWebhook(@Request() req: any, @Body() createDto: CreateWebhookDto) {
    return this.integrationsService.createWebhook(req.user.userId, createDto);
  }

  /**
   * Get user's webhooks
   */
  @Get('webhooks')
  async getUserWebhooks(@Request() req: any) {
    return this.integrationsService.getUserWebhooks(req.user.userId);
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
    return this.integrationsService.updateWebhook(webhookId, req.user.userId, updateDto);
  }

  /**
   * Delete webhook
   */
  @Delete('webhooks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWebhook(@Request() req: any, @Param('id') webhookId: string) {
    await this.integrationsService.deleteWebhook(webhookId, req.user.userId);
  }

  /**
   * Test webhook
   */
  @Post('webhooks/:id/test')
  async testWebhook(@Request() req: any, @Param('id') webhookId: string) {
    // Trigger a test webhook event
    await this.integrationsService.triggerWebhook(
      'goal.created' as any,
      req.user.userId,
      {
        test: true,
        message: 'This is a test webhook delivery',
      },
    );

    return { success: true, message: 'Test webhook triggered' };
  }
}
