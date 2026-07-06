'use client';

import type { UserTier } from '@/contexts/tier-context';
import { useTier } from '@/contexts/tier-context';
import { getNextTier } from '@/lib/upgrade';
import { useCreateCheckoutSession } from '@/hooks/use-graphql-extended';

export function useUpgradeCheckout(targetTier?: UserTier) {
  const { tier: currentTier } = useTier();
  const { createCheckout, loading, error } = useCreateCheckoutSession();
  const checkoutTier = targetTier ?? getNextTier(currentTier);

  const upgrade = () => {
    if (!checkoutTier) return;
    createCheckout({
      variables: { tier: checkoutTier, interval: 'MONTHLY' },
    });
  };

  return { upgrade, loading, error, checkoutTier, currentTier };
}
