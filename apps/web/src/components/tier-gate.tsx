'use client';

import * as React from 'react';
import { useTier, type UserTier } from '@/contexts/tier-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Users, Zap, Check } from 'lucide-react';
import Link from 'next/link';

interface TierGateProps {
  /**
   * Minimum tier required to access this feature
   */
  requiredTier: UserTier;

  /**
   * Feature name for display in upgrade prompt
   */
  feature: string;

  /**
   * Content to show if user has access
   */
  children: React.ReactNode;

  /**
   * Custom fallback to show if user doesn't have access
   * If not provided, shows default upgrade prompt
   */
  fallback?: React.ReactNode;

  /**
   * Show a "Pro" badge instead of blocking (for soft gates)
   */
  softGate?: boolean;
}

/**
 * TierGate component to control access to features based on user's subscription tier
 *
 * Usage:
 * ```tsx
 * <TierGate requiredTier="PRO" feature="Advanced Analytics">
 *   <AnalyticsDashboard />
 * </TierGate>
 * ```
 */
export function TierGate({
  requiredTier,
  feature,
  children,
  fallback,
  softGate = false,
}: TierGateProps) {
  const { tier } = useTier();

  const hasAccess = checkTierAccess(tier, requiredTier);

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If soft gate, render children with overlay
  if (softGate) {
    return (
      <div className="relative">
        <div className="pointer-events-none blur-sm">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Upgrade Required</CardTitle>
              </div>
              <CardDescription>{feature} is available in {requiredTier} tier</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/settings/billing">Upgrade Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return <UpgradePrompt requiredTier={requiredTier} feature={feature} currentTier={tier} />;
}

/**
 * Default upgrade prompt shown when user doesn't have access
 */
function UpgradePrompt({
  requiredTier,
  feature,
  currentTier,
}: {
  requiredTier: UserTier;
  feature: string;
  currentTier: UserTier;
}) {
  const benefits = getTierBenefits(requiredTier);
  const price = getTierPrice(requiredTier);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-2xl w-full border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {requiredTier === 'PRO' && <Sparkles className="h-12 w-12 text-primary" />}
            {requiredTier === 'PREMIUM' && <Users className="h-12 w-12 text-primary" />}
            {requiredTier === 'STARTER' && <Zap className="h-12 w-12 text-primary" />}
          </div>
          <CardTitle className="text-2xl mb-2">Upgrade to {requiredTier}</CardTitle>
          <CardDescription className="text-base">
            <strong>{feature}</strong> is available in the {requiredTier} plan
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline">Current: {currentTier}</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="default">{requiredTier}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div>
            <h4 className="font-semibold mb-3">What you'll get:</h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{price}</div>
            <div className="text-sm text-muted-foreground">per month, billed annually</div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Button asChild className="flex-1" size="lg">
              <Link href="/settings/billing">
                Upgrade to {requiredTier}
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/pricing">
                Compare Plans
              </Link>
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-center text-sm text-muted-foreground">
            Cancel anytime. 14-day money-back guarantee.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Check if user's tier meets requirement
 */
function checkTierAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierHierarchy: Record<UserTier, number> = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    PREMIUM: 3,
  };

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}

/**
 * Get benefits for each tier
 */
function getTierBenefits(tier: UserTier): string[] {
  const benefits: Record<UserTier, string[]> = {
    FREE: [],
    STARTER: [
      'Up to 5 active goals',
      '15 plans per week',
      'GPT-4o Mini AI planning',
      'Quality scores 80-90',
      'Google Calendar integration',
      'Create & share plan templates',
    ],
    PRO: [
      'Up to 15 active goals',
      'Unlimited plans per week',
      'Claude Sonnet 3.5 AI planning (best quality)',
      'Quality scores 85-95',
      'Advanced analytics & AI insights',
      'Pattern recognition',
      'Priority email support',
    ],
    PREMIUM: [
      'Unlimited goals',
      'Unlimited plans',
      'Claude Sonnet 3.5 AI',
      'Team workspaces (shared plans & analytics)',
      'Full API access',
      'Scheduling links (Calendly-like)',
      'Webhooks',
      'Priority support',
      'Early access to new features',
    ],
  };

  return benefits[tier] || [];
}

/**
 * Get pricing for each tier
 */
function getTierPrice(tier: UserTier): string {
  const prices: Record<UserTier, string> = {
    FREE: 'Free',
    STARTER: '$7/month',
    PRO: '$15/month',
    PREMIUM: '$40/month',
  };

  return prices[tier] || '';
}
