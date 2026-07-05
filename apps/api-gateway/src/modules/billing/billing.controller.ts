import { Controller, Get, Post, Put, Body, Headers, Query, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { BillingReconciliationService } from './billing-reconciliation.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import type { User, SubscriptionTierType } from '@microplanner/database';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Request } from 'express';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly reconciliationService: BillingReconciliationService,
  ) {}

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
  @ApiOperation({ summary: 'Cancel subscription (period-end by default; immediately: true to cancel now)' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  @ApiResponse({ status: 400, description: 'No active subscription found' })
  async cancelSubscription(
    @CurrentUser() user: User,
    @Body('immediately') immediately?: boolean
  ) {
    return this.billingService.cancelSubscription(user.id, immediately === true);
  }

  @Post('refund')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Refund a payment (admin only; partial supported; cumulative cap enforced)' })
  async refund(
    @CurrentUser() admin: User,
    @Body()
    dto: { userEmail: string; amountCents?: number; reason?: string; paymentIntentId?: string }
  ) {
    return this.billingService.refundPayment(admin.email, dto);
  }

  @Post('reconcile')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Manually trigger the billing reconciliation sweep (admin only)' })
  async reconcile() {
    return this.reconciliationService.reconcileAll();
  }

  @Get('info')
  @ApiOperation({ summary: 'Get full billing info (subscription, payment method, period)' })
  async getBillingInfo(@CurrentUser() user: User) {
    return this.billingService.getBillingInfo(user.id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get usage vs tier limits' })
  async getUsage(@CurrentUser() user: User) {
    return this.billingService.getUsageStats(user.id);
  }

  @Get('can-use-feature')
  @ApiOperation({ summary: 'Check if user can use a feature under their tier' })
  async canUseFeature(@CurrentUser() user: User, @Query('feature') feature: string) {
    return this.billingService.canUseFeature(user.id, feature);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade/change subscription tier' })
  async upgrade(@CurrentUser() user: User, @Body('tier') tier: SubscriptionTierType) {
    return this.billingService.upgradeSubscription(user.id, tier);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Resume a subscription set to cancel at period end' })
  async resume(@CurrentUser() user: User) {
    return this.billingService.resumeSubscription(user.id);
  }

  @Put('payment-method')
  @ApiOperation({ summary: 'Update default payment method' })
  async updatePaymentMethod(
    @CurrentUser() user: User,
    @Body('paymentMethodId') paymentMethodId: string
  ) {
    return this.billingService.updatePaymentMethod(user.id, paymentMethodId);
  }

  @Public() // Stripe calls this endpoint directly — signature verification is the auth
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
