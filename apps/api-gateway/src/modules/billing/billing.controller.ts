import { Controller, Get, Post, Delete, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Request } from 'express';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all pricing plans' })
  @ApiResponse({ status: 200, description: 'Pricing plans retrieved successfully' })
  getPlans() {
    const result = this.billingService.getPlans();

    return {
      message: 'Pricing plans retrieved successfully',
      ...result,
    };
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid tier or cannot checkout for free tier' })
  async createCheckout(@CurrentUser() user: User, @Body() createCheckoutDto: CreateCheckoutDto) {
    const result = await this.billingService.createCheckoutSession(user.id, createCheckoutDto);

    return {
      message: 'Checkout session created successfully',
      ...result,
    };
  }

  @Get('portal')
  @ApiOperation({ summary: 'Get Stripe customer portal URL' })
  @ApiResponse({ status: 200, description: 'Customer portal URL retrieved successfully' })
  @ApiResponse({ status: 400, description: 'No Stripe customer found' })
  async getCustomerPortal(@CurrentUser() user: User) {
    const result = await this.billingService.getCustomerPortalUrl(user.id);

    return {
      message: 'Customer portal URL retrieved successfully',
      ...result,
    };
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved successfully' })
  async getCurrentSubscription(@CurrentUser() user: User) {
    const result = await this.billingService.getCurrentSubscription(user.id);

    return {
      message: 'Subscription details retrieved successfully',
      ...result,
    };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 400, description: 'No active subscription found' })
  async cancelSubscription(@CurrentUser() user: User) {
    const result = await this.billingService.cancelSubscription(user.id);

    return result;
  }

  @Post('webhooks/stripe')
  @ApiExcludeEndpoint() // Exclude from Swagger docs (no auth required)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Webhook signature verification failed' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Get raw body for signature verification
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    const result = await this.billingService.handleWebhook(signature, rawBody);

    return result;
  }
}
