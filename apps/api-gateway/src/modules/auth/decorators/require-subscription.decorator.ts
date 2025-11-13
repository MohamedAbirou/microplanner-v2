import { SubscriptionTierType } from '@microplanner/database';
import { SetMetadata } from '@nestjs/common';

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
export const RequireSubscription = (tiers: SubscriptionTierType[]) =>
  SetMetadata(REQUIRED_TIERS_KEY, tiers);
