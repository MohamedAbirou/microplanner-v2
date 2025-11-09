import { Controller, Get, Post, Body, UseGuards, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { WebhookService } from './webhook.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { User } from '@microplanner/database';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly webhookService: WebhookService
  ) {}

  @Get('config')
  @Public()
  @ApiOperation({ summary: 'Get Clerk configuration for client' })
  getConfig() {
    return {
      publishableKey: this.authService.getClerkPublishableKey(),
    };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      tier: user.tier,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    };
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Clerk webhook handler' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>
  ) {
    // Get raw body for signature verification
    const payload = req.rawBody?.toString() || JSON.stringify(req.body);

    // Verify webhook signature
    const event = this.webhookService.verifyWebhook(payload, headers);

    // Process the event
    await this.webhookService.handleWebhookEvent(event);

    return { received: true };
  }
}
