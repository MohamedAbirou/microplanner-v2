import type { SubscriptionTierType, User } from '@microplanner/database';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { REQUIRED_TIERS_KEY } from '../decorators/require-subscription.decorator';

/**
 * Subscription Tier Guard
 * Checks if user has required subscription tier to access the route
 * Works for both HTTP (REST) and GraphQL contexts
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
    const requiredTiers = this.reflector.getAllAndOverride<SubscriptionTierType[]>(
      REQUIRED_TIERS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no required tiers specified, allow access
    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    // Get user from request (support both HTTP and GraphQL)
    const contextType = context.getType() as string;
    let user: User;

    if (contextType === 'graphql') {
      // For GraphQL requests
      const gqlContext = GqlExecutionContext.create(context);
      const { req } = gqlContext.getContext();
      user = req.user;
    } else {
      // For HTTP requests (REST)
      const request = context.switchToHttp().getRequest();
      user = request.user;
    }

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
