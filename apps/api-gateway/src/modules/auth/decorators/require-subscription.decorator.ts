import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '@microplanner/database';

/**
 * Metadata key for required subscription tiers
 */
export const REQUIRED_TIERS_KEY = 'requiredTiers';

/**
 * Decorator to restrict access to specific subscription tiers
 *
 * Usage:
 * @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
 * @Get('premium-feature')
 * async premiumFeature(@CurrentUser() user: User) {
 *   // Only PRO and PREMIUM users can access this
 * }
 */
export const RequireSubscription = (tiers: SubscriptionTier[]) =>
  SetMetadata(REQUIRED_TIERS_KEY, tiers);
