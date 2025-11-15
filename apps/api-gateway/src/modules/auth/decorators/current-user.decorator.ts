import type { User } from '@microplanner/database';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom decorator to extract the current user from the request
 * Works for both HTTP (REST) and GraphQL contexts
 *
 * Usage:
 * @Get('profile')
 * @UseGuards(ClerkAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @Query()
 * @UseGuards(ClerkAuthGuard)
 * async someQuery(@CurrentUser() user: User) {
 *   return data;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    // Check if this is a GraphQL context
    const gqlContext = GqlExecutionContext.create(ctx);
    const contextType = ctx.getType() as string;

    if (contextType === 'graphql') {
      // For GraphQL requests
      const { req } = gqlContext.getContext();
      return req.user;
    } else {
      // For HTTP requests (REST)
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    }
  }
);
