import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../billing.service';

export const FEATURE_GATE_KEY = 'featureGate';

export interface FeatureGateOptions {
  feature: 'goals' | 'plans';
  errorMessage?: string;
}

/**
 * Decorator to enforce feature gates based on subscription tier
 * Usage: @FeatureGate({ feature: 'goals', errorMessage: 'Upgrade to create more goals' })
 */
export const FeatureGate = (options: FeatureGateOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const reflector = new Reflector();
    reflector.getAllAndOverride(FEATURE_GATE_KEY, [descriptor?.value, target]);
    Reflect.defineMetadata(FEATURE_GATE_KEY, options, descriptor?.value || target);
    return descriptor;
  };
};

@Injectable()
export class FeatureGateGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private billingService: BillingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<FeatureGateOptions>(
      FEATURE_GATE_KEY,
      context.getHandler(),
    );

    if (!options) {
      // No feature gate defined, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has reached the limit
    const check = await this.billingService.checkFeatureLimit(user.id, options.feature);

    if (!check.allowed) {
      const defaultMessage = `You have reached your ${options.feature} limit (${check.current}/${check.limit}). Upgrade to create more.`;
      throw new ForbiddenException(options.errorMessage || defaultMessage);
    }

    return true;
  }
}
