import { SubscriptionStatus, SubscriptionStatusType, SubscriptionTier, SubscriptionTierType, User } from '@microplanner/database';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { EmailService } from '../email/email.service';
import { PRICING_PLANS, TIER_LIMITS } from './billing.constants';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

/**
 * Dunning policy (adapted from the billing lifecycle gap audit):
 * - grace is anchored to the FIRST failure and never slides forward (C-7)
 * - after MAX failures OR grace expiry the account is suspended to FREE
 * - a later successful payment restores the paid tier instantly
 */
const MAX_PAYMENT_FAILURES = 3;
const PAYMENT_GRACE_DAYS = 7;
const WEBHOOK_DEDUP_TTL_SECONDS = 72 * 60 * 60; // Stripe retries up to 72h

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private redis: RedisService,
    private emailService: EmailService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy';
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  /** Expose the Stripe client for sibling billing services (reconciliation). */
  getStripeClient(): Stripe {
    return this.stripe;
  }

  /**
   * Resolve our tier from a Stripe price ID. This is the tamper/staleness
   * guard from the gap audit (C-10): the price on the subscription is the
   * source of truth, never checkout metadata alone.
   */
  resolveTierFromPriceId(priceId: string | undefined | null): SubscriptionTierType | null {
    if (!priceId) return null;
    const plan = PRICING_PLANS.find(p => p.priceId && p.priceId === priceId);
    return plan ? plan.tier : null;
  }

  /**
   * Resolve the local user a Stripe subscription belongs to:
   * metadata.userId first, then customer ID, then subscription ID.
   */
  private async resolveUserForSubscription(subscription: Stripe.Subscription): Promise<User | null> {
    const metaUserId = subscription.metadata?.userId;
    if (metaUserId) {
      const user = await this.prisma.user.findUnique({ where: { id: metaUserId } });
      if (user) return user;
    }
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
    if (customerId) {
      const user = await this.prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (user) return user;
    }
    return this.prisma.user.findFirst({ where: { subscriptionId: subscription.id } });
  }

  /**
   * THE single write path that maps a Stripe subscription onto the local
   * user (audit lesson C-9: no parallel activation logic — webhooks and
   * reconciliation both land here).
   */
  async syncSubscriptionState(user: User, subscription: Stripe.Subscription): Promise<void> {
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const tierFromPrice = this.resolveTierFromPriceId(priceId);
    const tierFromMeta = subscription.metadata?.tier as SubscriptionTierType | undefined;
    const paidTier = tierFromPrice || tierFromMeta || null;

    let status: SubscriptionStatusType;
    let tier: SubscriptionTierType | undefined;
    let clearDunning = false;
    let clearSubscriptionId = false;

    switch (subscription.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        tier = paidTier || undefined;
        clearDunning = true;
        break;
      case 'trialing':
        status = SubscriptionStatus.TRIALING;
        tier = paidTier || undefined;
        clearDunning = true;
        break;
      case 'past_due':
        // Keep the paid tier during grace; dunning handles escalation
        status = SubscriptionStatus.PAST_DUE;
        tier = paidTier || undefined;
        break;
      case 'canceled':
      case 'incomplete_expired':
        status = SubscriptionStatus.CANCELED;
        tier = SubscriptionTier.FREE;
        clearDunning = true;
        clearSubscriptionId = true;
        break;
      case 'unpaid':
        // Stripe exhausted retries — suspend to FREE (audit: SUSPENDED)
        status = SubscriptionStatus.INACTIVE;
        tier = SubscriptionTier.FREE;
        break;
      default:
        status = SubscriptionStatus.INACTIVE;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: status,
        ...(tier ? { tier } : {}),
        ...(clearSubscriptionId
          ? { subscriptionId: null }
          : { subscriptionId: subscription.id }),
        ...(clearDunning ? { paymentFailedCount: 0, paymentGraceUntil: null } : {}),
      },
    });

    this.logger.log(
      `Synced subscription ${subscription.id} for user ${user.id}: stripe=${subscription.status} -> ${status}${tier ? `, tier=${tier}` : ''}`
    );
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
      // Pin the checkout UI to English so a US product renders "$7.00/month"
      // rather than a geolocated locale (e.g. German "68,15 MAD pro Monat").
      // The charge currency itself is fixed by the Stripe Price (USD).
      locale: 'en',
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
  /**
   * Cancel a subscription.
   * Default: cancel at period end — the user KEEPS access and ACTIVE status
   * until the period boundary; the customer.subscription.deleted webhook (or
   * the reconciliation sweep) performs the actual FREE downgrade. This fixes
   * the audit's C-1 gap (instant CANCELED on a period-end cancel locked users
   * out of time they had paid for).
   * With immediately=true the subscription is cancelled at Stripe now and the
   * local downgrade is applied right away (idempotent with the webhook).
   */
  async cancelSubscription(userId: string, immediately = false) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.subscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === user.tier);
    const planName = plan?.name || user.tier;

    if (immediately) {
      const subscription = await this.stripe.subscriptions.cancel(user.subscriptionId);

      // Apply the downgrade through the single sync path (webhook-idempotent)
      await this.syncSubscriptionState(user, subscription);

      this.emailService
        .sendBillingLifecycleEmail(user.email, 'CANCELLED', {
          userName: user.name || undefined,
          planName,
          effectiveDate: new Date(),
        })
        .catch(() => undefined);

      this.logger.log(`Immediately cancelled subscription for user ${userId}`);
      return { message: 'Subscription cancelled. Your account is now on the Free plan.' };
    }

    const subscription = await this.stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Deliberately NOT changing subscriptionStatus here — the user stays
    // ACTIVE with full access until the period ends (C-1).
    // current_period_end lives on the subscription item in current Stripe API
    // versions (top-level kept as fallback for older versions).
    const periodEndUnix =
      (subscription.items?.data?.[0] as any)?.current_period_end ??
      (subscription as any).current_period_end;
    const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : null;

    this.emailService
      .sendBillingLifecycleEmail(user.email, 'CANCEL_SCHEDULED', {
        userName: user.name || undefined,
        planName,
        effectiveDate: periodEnd,
      })
      .catch(() => undefined);

    this.logger.log(`Scheduled cancellation for user ${userId} at period end`);

    return {
      message: 'Subscription will be cancelled at the end of the billing period. You keep full access until then.',
      effectiveAt: periodEnd,
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

    // Duplicate-delivery guard (audit C-6/E-class): Stripe retries webhooks
    // for up to 72h; a replayed event must be a no-op. Redis unavailability
    // fails open — handlers are individually idempotent state-sets.
    try {
      const dedupKey = `stripe:evt:${event.id}`;
      if (await this.redis.exists(dedupKey)) {
        this.logger.log(`Skipping duplicate webhook event ${event.id} (${event.type})`);
        return { received: true, duplicate: true };
      }
      await this.redis.set(dedupKey, '1', WEBHOOK_DEDUP_TTL_SECONDS);
    } catch {
      this.logger.warn('Webhook dedup check unavailable (Redis) — proceeding');
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
    if (!userId) {
      this.logger.error('Missing userId in checkout session metadata');
      return;
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.error(`Checkout completed for unknown user ${userId}`);
      return;
    }

    // Persist the customer link first so later events resolve by customer
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    if (customerId && user.stripeCustomerId !== customerId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
      user.stripeCustomerId = customerId;
    }

    // Tier comes from the REAL subscription's price, not just metadata
    // (metadata can be stale after upgrades; the price is the truth — C-10)
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    if (!subscriptionId) {
      this.logger.error(`Checkout session ${session.id} has no subscription`);
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.syncSubscriptionState(user, subscription);

    this.logger.log(`Checkout completed for user ${userId} (subscription ${subscriptionId})`);
  }

  /**
   * Handle customer.subscription.updated event.
   * All state mapping goes through syncSubscriptionState (single write path).
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const user = await this.resolveUserForSubscription(subscription);
    if (!user) {
      this.logger.error(`No local user for subscription ${subscription.id}`);
      return;
    }
    await this.syncSubscriptionState(user, subscription);
  }

  /**
   * Handle customer.subscription.deleted event — the authoritative FREE
   * downgrade for period-end cancellations (C-1), with the cancelled notice.
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const user = await this.resolveUserForSubscription(subscription);
    if (!user) {
      this.logger.error(`No local user for deleted subscription ${subscription.id}`);
      return;
    }

    // Capture the pre-downgrade plan name so the email names the plan the
    // user actually had ("PRO"), not "FREE" (audit Slice C lesson).
    const previousPlanName =
      PRICING_PLANS.find(p => p.tier === user.tier)?.name || user.tier;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        tier: SubscriptionTier.FREE,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionId: null,
        paymentFailedCount: 0,
        paymentGraceUntil: null,
      },
    });

    if (user.tier !== SubscriptionTier.FREE) {
      this.emailService
        .sendBillingLifecycleEmail(user.email, 'CANCELLED', {
          userName: user.name || undefined,
          planName: previousPlanName,
          effectiveDate: new Date(),
        })
        .catch(() => undefined);
    }

    this.logger.log(`Subscription deleted for user ${user.id}, downgraded to FREE`);
  }

  /**
   * Handle invoice.payment_failed event — the dunning state machine.
   * Grace is anchored to the FIRST failure and never slides forward (C-7);
   * after MAX failures or grace expiry the account suspends to FREE. Stripe
   * only emits this for real declines, so the transport-vs-decline taxonomy
   * (C-2) holds by construction: our own outages never reach this handler.
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customerId}`);
      return;
    }

    // A FREE user must never be dunned (C-8) — nothing to suspend
    if (user.tier === SubscriptionTier.FREE) {
      this.logger.warn(`Ignoring payment_failed for FREE user ${user.id}`);
      return;
    }

    const failedCount = user.paymentFailedCount + 1;
    // Anchored grace: reuse the existing window; only set it on first failure
    const graceUntil =
      user.paymentGraceUntil ??
      new Date(Date.now() + PAYMENT_GRACE_DAYS * 24 * 60 * 60 * 1000);

    const graceExpired = graceUntil.getTime() < Date.now();
    const shouldSuspend = failedCount >= MAX_PAYMENT_FAILURES || graceExpired;

    const planName = PRICING_PLANS.find(p => p.tier === user.tier)?.name || user.tier;

    if (shouldSuspend) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          tier: SubscriptionTier.FREE,
          subscriptionStatus: SubscriptionStatus.INACTIVE,
          paymentFailedCount: failedCount,
          // keep subscriptionId: Stripe may still recover the subscription,
          // and a later payment_succeeded restores the paid tier
        },
      });

      this.emailService
        .sendBillingLifecycleEmail(user.email, 'ACCOUNT_SUSPENDED', {
          userName: user.name || undefined,
          planName,
        })
        .catch(() => undefined);

      this.logger.warn(
        `User ${user.id} suspended to FREE after ${failedCount} failed payments (graceExpired=${graceExpired})`
      );
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
        paymentFailedCount: failedCount,
        paymentGraceUntil: graceUntil,
      },
    });

    this.emailService
      .sendBillingLifecycleEmail(user.email, 'PAYMENT_FAILED', {
        userName: user.name || undefined,
        planName,
        failedCount,
        graceUntil,
      })
      .catch(() => undefined);

    this.logger.log(
      `Payment failed for user ${user.id} (${failedCount}/${MAX_PAYMENT_FAILURES}), PAST_DUE until ${graceUntil.toISOString()}`
    );
  }

  /**
   * Handle invoice.payment_succeeded event — clears dunning, restores the
   * paid tier from the subscription's actual price, sends the receipt with
   * the hosted invoice link.
   */
  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`User not found for customer ${customerId}`);
      return;
    }

    // Restore the tier from the invoice's price (recovers suspended users)
    const priceId = invoice.lines?.data?.[0]?.pricing?.price_details?.price
      ?? (invoice.lines?.data?.[0] as any)?.price?.id;
    const tier = this.resolveTierFromPriceId(
      typeof priceId === 'string' ? priceId : (priceId as any)?.id
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        ...(tier ? { tier } : {}),
        paymentFailedCount: 0,
        paymentGraceUntil: null,
      },
    });

    // Receipt with the live hosted invoice URL (never a placeholder)
    if (invoice.amount_paid && invoice.amount_paid > 0) {
      const amountFormatted = `$${(invoice.amount_paid / 100).toFixed(2)}`;
      const planName = tier
        ? PRICING_PLANS.find(p => p.tier === tier)?.name || tier
        : PRICING_PLANS.find(p => p.tier === user.tier)?.name || user.tier;

      this.emailService
        .sendBillingLifecycleEmail(user.email, 'PAYMENT_RECEIPT', {
          userName: user.name || undefined,
          planName,
          amountFormatted,
          invoiceUrl: invoice.hosted_invoice_url || null,
        })
        .catch(() => undefined);
    }

    this.logger.log(`Payment succeeded for user ${user.id}, dunning cleared${tier ? `, tier=${tier}` : ''}`);
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

  /**
   * Full billing info: subscription + payment method + period (best effort —
   * Stripe details are optional so a missing/failed Stripe call never breaks the page).
   */
  async getBillingInfo(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === user.tier);

    let paymentMethod: { brand: string; last4: string } | null = null;
    let currentPeriodEnd: string | null = null;
    let cancelAtPeriodEnd = false;

    if (user.subscriptionId) {
      try {
        const sub = await this.stripe.subscriptions.retrieve(user.subscriptionId, {
          expand: ['default_payment_method', 'customer.invoice_settings.default_payment_method'],
        });
        cancelAtPeriodEnd = sub.cancel_at_period_end;

        // current_period_end lives on the subscription ITEM in current Stripe
        // API versions (top-level kept as fallback for older versions)
        const periodEnd =
          (sub.items?.data?.[0] as any)?.current_period_end ??
          (sub as any).current_period_end;
        if (periodEnd) currentPeriodEnd = new Date(periodEnd * 1000).toISOString();

        // Payment method: subscription default first, then the customer's
        // invoice default (where Checkout normally stores it)
        let pm = sub.default_payment_method as Stripe.PaymentMethod | null;
        if (!pm || typeof pm !== 'object') {
          const customer = sub.customer as any;
          const customerPm =
            customer && typeof customer === 'object' && !customer.deleted
              ? (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod | null)
              : null;
          pm = customerPm && typeof customerPm === 'object' ? customerPm : null;
        }
        if (pm && typeof pm === 'object' && pm.card) {
          paymentMethod = { brand: pm.card.brand, last4: pm.card.last4 };
        }
      } catch (error) {
        this.logger.warn(`Could not fetch Stripe subscription for user ${userId}`);
      }
    }

    return {
      tier: user.tier,
      status: user.subscriptionStatus,
      plan: plan
        ? { name: plan.name, price: plan.price / 100, interval: plan.interval, features: plan.features }
        : null,
      paymentMethod,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    };
  }

  /**
   * Usage vs tier limits
   */
  async getUsageStats(userId: string) {
    const [goals, plans] = await Promise.all([
      this.checkFeatureLimit(userId, 'goals'),
      this.checkFeatureLimit(userId, 'plans'),
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const tasksToday = await this.prisma.task.count({
      where: { userId, createdAt: { gte: startOfToday } },
    });

    return {
      goals: { current: goals.current, limit: goals.limit },
      plansThisWeek: { current: plans.current, limit: plans.limit },
      tasksCreatedToday: tasksToday,
    };
  }

  /**
   * Can the user use a feature? Countable features (goals/plans) check limits;
   * boolean features come from the pricing plan feature map.
   */
  async canUseFeature(userId: string, feature: string): Promise<{ canUse: boolean }> {
    if (feature === 'goals' || feature === 'plans') {
      const result = await this.checkFeatureLimit(userId, feature);
      return { canUse: result.allowed };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === user.tier);
    const value = plan ? (plan.features as Record<string, unknown>)[feature] : undefined;
    return { canUse: Boolean(value) };
  }

  /**
   * Upgrade (or change) subscription tier. With an active Stripe subscription
   * the price is swapped in place; otherwise falls back to a checkout session.
   */
  async upgradeSubscription(userId: string, tier: SubscriptionTierType) {
    if (tier === SubscriptionTier.FREE) {
      throw new BadRequestException('Use cancel to downgrade to the free tier');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = PRICING_PLANS.find(p => p.tier === tier);
    if (!plan || !plan.priceId) {
      throw new BadRequestException('Invalid tier');
    }

    if (!user.subscriptionId) {
      // No subscription yet — checkout flow instead
      return this.createCheckoutSession(userId, { tier } as CreateCheckoutDto);
    }

    const sub = await this.stripe.subscriptions.retrieve(user.subscriptionId);
    await this.stripe.subscriptions.update(user.subscriptionId, {
      items: [{ id: sub.items.data[0].id, price: plan.priceId }],
      proration_behavior: 'create_prorations',
      cancel_at_period_end: false,
      metadata: { userId: user.id, tier },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { tier, subscriptionStatus: SubscriptionStatus.ACTIVE },
    });

    this.logger.log(`Upgraded user ${userId} to ${tier}`);
    return { message: `Subscription upgraded to ${plan.name}`, tier };
  }

  /**
   * Resume a subscription that was set to cancel at period end
   */
  async resumeSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.subscriptionId) {
      throw new BadRequestException('No subscription to resume');
    }

    await this.stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    });

    this.logger.log(`Resumed subscription for user ${userId}`);
    return { message: 'Subscription resumed' };
  }

  /**
   * Attach a new default payment method to the customer
   */
  async updatePaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer found. Please subscribe first.');
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    await this.stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    if (user.subscriptionId) {
      await this.stripe.subscriptions.update(user.subscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }

    this.logger.log(`Updated payment method for user ${userId}`);
    return { message: 'Payment method updated' };
  }

  /**
   * Admin-only refund orchestration (audit C-16 / PZ-11 adapted to Stripe):
   * - refunds are never automatic (a mid-cycle cancel does NOT refund;
   *   a proration review is a deliberate, separate admin action)
   * - partial refunds supported; the CUMULATIVE refunded amount can never
   *   exceed the original charge
   * - every refund is journalled in the Stripe refund metadata (who/why)
   */
  async refundPayment(
    adminEmail: string,
    dto: { userEmail: string; amountCents?: number; reason?: string; paymentIntentId?: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.userEmail } });
    if (!user) {
      throw new NotFoundException(`No user with email ${dto.userEmail}`);
    }
    if (!user.stripeCustomerId) {
      throw new BadRequestException('User has no Stripe customer — nothing to refund');
    }

    // Resolve the charge to refund. Charges are stable across Stripe API
    // versions (invoice.payment_intent was removed in newer versions), and
    // the charge carries amount_captured + amount_refunded directly.
    let charge: Stripe.Charge;
    if (dto.paymentIntentId) {
      const charges = await this.stripe.charges.list({
        payment_intent: dto.paymentIntentId,
        limit: 1,
      });
      if (charges.data.length === 0) {
        throw new BadRequestException(`No charge found for payment ${dto.paymentIntentId}`);
      }
      charge = charges.data[0];
    } else {
      const charges = await this.stripe.charges.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });
      const latest = charges.data.find(c => c.status === 'succeeded' && c.amount_captured > 0);
      if (!latest) {
        throw new BadRequestException('No successful charge found for this user');
      }
      charge = latest;
    }

    const chargeCustomer =
      typeof charge.customer === 'string' ? charge.customer : charge.customer?.id;
    if (chargeCustomer !== user.stripeCustomerId) {
      // The audit's PZ-5 lesson: the charge must belong to the target user
      throw new BadRequestException('Payment does not belong to the specified user');
    }

    // Cumulative cap: captured minus already refunded (PZ-11)
    const refundable = charge.amount_captured - charge.amount_refunded;
    if (refundable <= 0) {
      throw new BadRequestException('This payment has already been fully refunded');
    }

    const amount = dto.amountCents ?? refundable;
    if (amount <= 0 || amount > refundable) {
      throw new BadRequestException(
        `Refund amount must be between 1 and ${refundable} cents (already refunded: ${charge.amount_refunded})`
      );
    }

    const refund = await this.stripe.refunds.create({
      charge: charge.id,
      amount,
      reason: 'requested_by_customer',
      metadata: {
        refundedByAdmin: adminEmail,
        internalReason: dto.reason || 'admin refund',
        userId: user.id,
      },
    });

    this.logger.warn(
      `REFUND: ${amount}c of charge ${charge.id} for user ${user.id} by admin ${adminEmail} (${dto.reason || 'no reason given'})`
    );

    return {
      refundId: refund.id,
      status: refund.status,
      amountCents: refund.amount,
      remainingRefundableCents: refundable - amount,
    };
  }
}
