import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../database/prisma.service';
import { PremiumService } from '../../premium/premium.service';
import { ApiScope } from '../../premium/types/premium.types';
import { API_SCOPE_KEY } from '../decorators/api-scope.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const API_KEY_PREFIX = 'mp_';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly premiumService: PremiumService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
    ) {
      return true;
    }

    if ((context.getType() as string) === 'graphql') return true;

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return true;

    const token = authorization.slice('Bearer '.length).trim();
    if (!token.startsWith(API_KEY_PREFIX)) return true;

    const identity = await this.premiumService.validateApiKey(token);
    if (!identity) throw new UnauthorizedException('Invalid, inactive, or expired API key');

    const user = await this.prisma.user.findUnique({ where: { id: identity.userId } });
    if (!user || user.tier !== 'PREMIUM') {
      throw new ForbiddenException('API access is only available for PREMIUM users');
    }

    const requiredScope = this.reflector.getAllAndOverride<ApiScope>(API_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredScope) {
      throw new ForbiddenException('This endpoint is not available through API keys');
    }
    if (!identity.scopes.includes(requiredScope)) {
      throw new ForbiddenException(`API key is missing the required scope: ${requiredScope}`);
    }

    request.user = user;
    request.apiKey = { userId: user.id, scopes: identity.scopes };
    return true;
  }
}
