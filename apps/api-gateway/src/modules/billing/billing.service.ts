import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import Stripe from 'stripe';
import { SubscriptionTier, SubscriptionStatus } from '@microplanner/database';
import { PRICING_PLANS, TIER_LIMITS } from './billing.constants';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy';
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  /**
   * Get all pricing plans
   */
  getPlans() {
    return {
      plans: PRICING_PLANS.map(plan => ({
        tier: plan.tier,
        name: plan.name,
        price: plan.price / 100, // Convert cents to dollars
        interval: plan.interval,
        features: plan.features,
      })),
    };
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(userId: string, dto: CreateCheckoutDto) {
    if (dto.tier === SubscriptionTier.FREE) {
      throw new BadRequestException('Cannot create checkout for free tier');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === dto.tier);
    if (!plan) {
      throw new BadRequestException('Invalid tier');
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          clerkId: user.clerkId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const successUrl = dto.successUrl || `${this.configService.get('APP_URL')}/dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${this.configService.get('APP_URL')}/billing`;

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        tier: dto.tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: dto.tier,
        },
      },
    });

    this.logger.log(`Created checkout session ${session.id} for user ${userId}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Get Stripe customer portal URL
   */
  async getCustomerPortalUrl(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found. Please subscribe first.');
    }

    const returnUrl = `${this.configService.get('APP_URL')}/billing`;

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Get current subscription details
   */
  async getCurrentSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === user.tier);

    return {
      tier: user.tier,
      status: user.subscriptionStatus,
      plan: plan ? {
        name: plan.name,
        price: plan.price / 100,
        features: plan.features,
      } : null,
      stripeSubscriptionId: user.subscriptionId,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.subscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    // Cancel at period end (not immediately)
    await this.stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
      },
    });

    this.logger.log(`Cancelled subscription for user ${userId}`);

    return {
      message: 'Subscription will be cancelled at the end of the billing period',
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException('Webhook signature verification failed');
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle checkout.session.completed event
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as SubscriptionTier;

    if (!userId || !tier) {
      this.logger.error('Missing userId or tier in checkout session metadata');
      return;
    }

    const subscriptionId = session.subscription as string;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tier,
        subscriptionId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        stripeCustomerId: session.customer as string,
      },
    });

    this.logger.log(`Checkout completed for user ${userId}, upgraded to ${tier}`);
  }

  /**
   * Handle customer.subscription.updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const tier = subscription.metadata?.tier as SubscriptionTier;

    if (!userId) {
      this.logger.error('Missing userId in subscription metadata');
      return;
    }

    let status: SubscriptionStatus;
    switch (subscription.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'past_due':
        status = SubscriptionStatus.PAST_DUE;
        break;
      case 'canceled':
        status = SubscriptionStatus.CANCELED;
        break;
      case 'trialing':
        status = SubscriptionStatus.TRIALING;
        break;
      default:
        status = SubscriptionStatus.INACTIVE;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tier: tier || undefined,
        subscriptionStatus: status,
      },
    });

    this.logger.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  }

  /**
   * Handle customer.subscription.deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      this.logger.error('Missing userId in subscription metadata');
      return;
    }

    // Downgrade to free tier
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionId: null,
      },
    });

    this.logger.log(`Subscription deleted for user ${userId}, downgraded to FREE`);
  }

  /**
   * Handle invoice.payment_failed event
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customerId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });

    this.logger.log(`Payment failed for user ${user.id}, marked as PAST_DUE`);
  }

  /**
   * Handle invoice.payment_succeeded event
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customerId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });

    this.logger.log(`Payment succeeded for user ${user.id}, marked as ACTIVE`);
  }

  /**
   * Check if user has reached limit for a feature
   */
  async checkFeatureLimit(userId: string, feature: 'goals' | 'plans'): Promise<{ allowed: boolean; limit: number; current: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const limits = TIER_LIMITS[user.tier];

    if (feature === 'goals') {
      const currentGoals = await this.prisma.goal.count({
        where: { userId, isActive: true },
      });

      return {
        allowed: currentGoals < limits.maxGoals,
        limit: limits.maxGoals,
        current: currentGoals,
      };
    } else {
      // Check plans created this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      weekStart.setHours(0, 0, 0, 0);

      const currentPlans = await this.prisma.weeklyPlan.count({
        where: {
          userId,
          createdAt: { gte: weekStart },
        },
      });

      return {
        allowed: currentPlans < limits.maxPlansPerWeek,
        limit: limits.maxPlansPerWeek,
        current: currentPlans,
      };
    }
  }
}
