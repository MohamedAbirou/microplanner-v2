import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@microplanner/database';

/**
 * Custom decorator to extract the current user from the request
 *
 * Usage:
 * @Get('profile')
 * @UseGuards(ClerkAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
