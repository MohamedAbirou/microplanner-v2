import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';

/**
 * Admin guard: allows only users whose (JWT-verified) email is listed in
 * the ADMIN_EMAILS env var (comma-separated). Runs AFTER the global
 * ClerkAuthGuard, so req.user is the verified DB user.
 *
 * With no ADMIN_EMAILS configured every admin route is refused — never
 * fail open on an administrative surface.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.length === 0) {
      throw new ForbiddenException(
        'Admin operations are not configured on this server (set ADMIN_EMAILS)'
      );
    }

    if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
      this.logger.warn(`Admin access denied for ${user?.email || 'unknown user'}`);
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
