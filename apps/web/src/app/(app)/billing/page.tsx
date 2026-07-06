'use client';

import { UpgradeButton } from '@/components/upgrade-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateBillingPortalSession } from '@/hooks/use-graphql-extended';
import { formatTierLabel, getNextTier } from '@/lib/upgrade';
import type { UserTier } from '@/contexts/tier-context';
import { useUser } from '@clerk/nextjs';
import { CreditCard } from 'lucide-react';

const TIER_PRICES: Record<UserTier, string> = {
  FREE: 'Free',
  STARTER: '$7/month',
  PRO: '$15/month',
  PREMIUM: '$29/month',
};

export default function BillingPage() {
  const { user } = useUser();
  const tier = ((user?.publicMetadata?.tier as UserTier) || 'FREE') as UserTier;
  const nextTier = getNextTier(tier);
  const { createPortalSession, loading: portalLoading } = useCreateBillingPortalSession();

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and upgrades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current plan
          </CardTitle>
          <CardDescription>Your active MicroPlanner subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatTierLabel(tier)}</div>
              <div className="text-sm text-muted-foreground">{TIER_PRICES[tier]}</div>
            </div>
            <Badge variant={tier === 'FREE' ? 'secondary' : 'default'}>{tier}</Badge>
          </div>

          {nextTier && (
            <UpgradeButton className="w-full" size="lg" targetTier={nextTier} showIcon={false}>
              Upgrade to {formatTierLabel(nextTier)} — {TIER_PRICES[nextTier]}
            </UpgradeButton>
          )}

          {tier !== 'FREE' && (
            <Button
              variant="outline"
              className="w-full"
              disabled={portalLoading}
              onClick={() => createPortalSession()}
            >
              {portalLoading ? 'Opening portal…' : 'Manage subscription in Stripe'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
