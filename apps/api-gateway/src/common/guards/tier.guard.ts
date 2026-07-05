import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SubscriptionTierType } from '@microplanner/database';

/**
 * Tier hierarchy for access control
 * Higher tiers include access to lower tier features
 */
const TIER_HIERARCHY: Record<SubscriptionTierType, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  PREMIUM: 3,
};

/**
 * Decorator to specify minimum tier required for a resolver/controller
 * @example @RequireTier('PRO')
 */
export const RequireTier = (tier: SubscriptionTierType) => SetMetadata('tier', tier);

/**
 * Guard to enforce tier-based access control
 * Checks if user's subscription tier meets the minimum requirement
 */
@Injectable()
export class TierGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required tier from decorator
    const requiredTier = this.reflector.get<SubscriptionTierType>('tier', context.getHandler());

    // If no tier requirement, allow access
    if (!requiredTier) {
      return true;
    }

    // Get user from context (works for both HTTP and GraphQL)
    const user = this.getUser(context);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's tier meets requirement
    const userTierLevel = TIER_HIERARCHY[user.tier] || 0;
    const requiredTierLevel = TIER_HIERARCHY[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException(
        `This feature requires ${requiredTier} tier. Your current tier: ${user.tier}. Upgrade to access this feature.`
      );
    }

    return true;
  }

  /**
   * Extract user from execution context (HTTP or GraphQL)
   */
  private getUser(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'http') {
      const request = context.switchToHttp().getRequest();
      return request.user;
    }

    // GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext();
    return user;
  }
}

/**
 * Helper function to check tier access programmatically
 */
export function checkTierAccess(userTier: SubscriptionTierType, requiredTier: SubscriptionTierType): boolean {
  const userLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier];
  return userLevel >= requiredLevel;
}
