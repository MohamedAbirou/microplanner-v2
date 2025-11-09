import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionTier } from '@microplanner/database';
import { REQUIRED_TIERS_KEY } from '../decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';

/**
 * Subscription Tier Guard
 * Checks if user has required subscription tier to access the route
 *
 * Usage:
 * Apply globally or use @UseGuards(SubscriptionGuard)
 * Combined with @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required tiers from decorator metadata
    const requiredTiers = this.reflector.getAllAndOverride<SubscriptionTier[]>(
      REQUIRED_TIERS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no required tiers specified, allow access
    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user's tier is in the required list
    if (!requiredTiers.includes(user.tier)) {
      throw new ForbiddenException(
        `This feature requires ${requiredTiers.join(' or ')} subscription. Current tier: ${user.tier}`,
      );
    }

    return true;
  }
}
