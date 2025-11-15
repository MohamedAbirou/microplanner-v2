import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, ClerkPayload } from '../auth.service';
import type { User } from '@microplanner/database';
import * as jwksClient from 'jwks-rsa';

/**
 * Clerk JWT Strategy
 * Validates JWT tokens issued by Clerk using their public JWKS
 */
@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private readonly logger = new Logger(ClerkStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clerkDomain = configService.get('CLERK_DOMAIN');
    const clerkJwksUrl = `https://${clerkDomain}/.well-known/jwks.json`;
    const clerkAudience = configService.get('CLERK_AUDIENCE');

    // Build strategy options
    const strategyOptions: any = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksClient.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: clerkJwksUrl,
      }),
      issuer: `https://${clerkDomain}`,
      algorithms: ['RS256'],
    };

    // Only add audience if it's configured
    // Clerk tokens don't include audience by default, so this is optional
    if (clerkAudience) {
      strategyOptions.audience = clerkAudience;
    }

    super(strategyOptions);

    this.logger.log('Clerk JWT Strategy initialized');
    this.logger.debug(`JWKS URL: ${clerkJwksUrl}`);
    this.logger.debug(`Audience: ${clerkAudience || 'not configured (optional)'}`);
  }

  /**
   * Validate the JWT payload and return the user
   */
  async validate(payload: ClerkPayload): Promise<User> {
    this.logger.debug(`Validating JWT for user: ${payload.sub}`);

    try {
      const user = await this.authService.validateClerkUser(payload);
      return user;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`JWT validation failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
