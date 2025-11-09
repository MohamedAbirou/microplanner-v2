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
    const clerkJwksUrl = `https://${configService.get('CLERK_DOMAIN')}/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksClient.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: clerkJwksUrl,
      }),
      audience: configService.get('CLERK_AUDIENCE'),
      issuer: `https://${configService.get('CLERK_DOMAIN')}`,
      algorithms: ['RS256'],
    });

    this.logger.log('Clerk JWT Strategy initialized');
    this.logger.debug(`JWKS URL: ${clerkJwksUrl}`);
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
