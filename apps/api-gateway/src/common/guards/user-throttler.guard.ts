import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit guard that keys by authenticated user id (Clerk `sub`, resolved
 * to the DB user by ClerkAuthGuard) and falls back to client IP for
 * unauthenticated / public routes.
 *
 * Registered globally so every REST + GraphQL operation is bounded. Per-route
 * overrides use `@Throttle({ default: { limit, ttl } })` (e.g. plan generation).
 * Do not add extra named throttlers to ThrottlerModule — Nest applies all of
 * them globally unless each route opts out with @SkipThrottle.
 *
 * Runs AFTER ClerkAuthGuard in the global guard chain so `req.user` is
 * populated for authenticated requests.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  /**
   * Support both HTTP and GraphQL execution contexts. NestJS's default
   * ThrottlerGuard only understands HTTP; GraphQL requests carry the
   * req/res on the GraphQL context.
   */
  getRequestResponse(context: ExecutionContext) {
    if ((context.getType() as string) === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();
      return { req: gqlCtx.req, res: gqlCtx.req?.res ?? gqlCtx.res };
    }
    return super.getRequestResponse(context);
  }

  /**
   * Tracker string = the throttle bucket key. Prefer the authenticated user id
   * so a single user cannot bypass their limit by rotating source IPs, and so
   * shared-NAT users don't collide. Fall back to IP when unauthenticated.
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId: string | undefined = req?.user?.id;
    if (userId) return `user:${userId}`;

    const ip =
      req?.ips?.length > 0
        ? req.ips[0]
        : req?.ip ?? req?.socket?.remoteAddress ?? 'unknown';
    return `ip:${ip}`;
  }
}
// NestJS ThrottlerGuard v5 emits the 429 + Retry-After header natively when a
// bucket is exhausted; we only customize the tracker key and GraphQL context
// extraction above.
