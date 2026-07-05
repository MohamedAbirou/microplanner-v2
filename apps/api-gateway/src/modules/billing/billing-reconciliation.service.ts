import { SubscriptionStatus, SubscriptionTier } from '@microplanner/database';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { BillingService } from './billing.service';

/**
 * Billing reconciliation (adapted from the gap audit's C-9):
 * webhooks get lost — a server restart during delivery, a misconfigured
 * endpoint, a network blip — and a lost customer.subscription.deleted event
 * means a user keeps a paid tier forever (or loses one they paid for).
 *
 * This sweep runs daily and re-derives the local subscription state from
 * Stripe, dispatching through BillingService.syncSubscriptionState — the
 * SAME single write path the webhooks use. No parallel activation logic.
 *
 * It also makes the whole billing system work in environments where the
 * webhook endpoint is not publicly reachable yet (local dev, first deploy).
 */
@Injectable()
export class BillingReconciliationService {
  private readonly logger = new Logger(BillingReconciliationService.name);
  private running = false;

  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
  ) {}

  /** Daily at 06:30 UTC, after Stripe's overnight billing cycles settle. */
  @Cron('30 6 * * *')
  async reconcileDaily(): Promise<void> {
    await this.reconcileAll();
  }

  /**
   * Reconcile every user that has a Stripe customer. Returns a summary.
   * Idempotent — safe to run repeatedly or from multiple replicas (the
   * write path only sets state derived from Stripe's current truth).
   */
  async reconcileAll(): Promise<{ checked: number; synced: number; downgraded: number; errors: number }> {
    if (this.running) {
      this.logger.warn('Reconciliation already running — skipping');
      return { checked: 0, synced: 0, downgraded: 0, errors: 0 };
    }
    this.running = true;

    const summary = { checked: 0, synced: 0, downgraded: 0, errors: 0 };

    try {
      const stripe = this.billingService.getStripeClient();
      const users = await this.prisma.user.findMany({
        where: { stripeCustomerId: { not: null } },
        orderBy: { updatedAt: 'asc' },
      });

      for (const user of users) {
        summary.checked++;
        try {
          const subs = await stripe.subscriptions.list({
            customer: user.stripeCustomerId as string,
            status: 'all',
            limit: 10,
          });

          const relevant = this.pickRelevantSubscription(subs.data);

          if (relevant) {
            await this.billingService.syncSubscriptionState(user, relevant);
            summary.synced++;
          } else if (user.tier !== SubscriptionTier.FREE || user.subscriptionId) {
            // No subscription at Stripe but we think one exists — a lost
            // deletion webhook. Downgrade honestly.
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
            summary.downgraded++;
            this.logger.warn(
              `Reconciliation: user ${user.id} had tier ${user.tier} but no Stripe subscription — downgraded to FREE`
            );
          }
        } catch (error) {
          summary.errors++;
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Reconciliation failed for user ${user.id}: ${message}`);
          // continue with the next user — one bad record never stops the sweep
        }
      }

      this.logger.log(
        `Reconciliation complete: checked=${summary.checked} synced=${summary.synced} downgraded=${summary.downgraded} errors=${summary.errors}`
      );
      return summary;
    } finally {
      this.running = false;
    }
  }

  /**
   * Pick the subscription that should drive local state:
   * active > trialing > past_due > unpaid > most recently created.
   * Fully-canceled subscriptions only count when nothing better exists
   * (they drive the FREE downgrade through the sync path).
   */
  private pickRelevantSubscription(subs: Stripe.Subscription[]): Stripe.Subscription | null {
    if (subs.length === 0) return null;
    const priority: Record<string, number> = {
      active: 0,
      trialing: 1,
      past_due: 2,
      unpaid: 3,
      incomplete: 4,
      canceled: 5,
      incomplete_expired: 6,
    };
    return [...subs].sort((a, b) => {
      const pa = priority[a.status] ?? 9;
      const pb = priority[b.status] ?? 9;
      if (pa !== pb) return pa - pb;
      return b.created - a.created;
    })[0];
  }
}
