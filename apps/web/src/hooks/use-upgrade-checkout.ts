'use client';

import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import type { UserTier } from '@/contexts/tier-context';
import { useTier } from '@/contexts/tier-context';
import { GET_MY_TIER } from '@/graphql/operations';
import { CREATE_CHECKOUT_SESSION, UPGRADE_SUBSCRIPTION } from '@/graphql/operations-extended';
import { formatTierLabel, getNextTier } from '@/lib/upgrade';

export function useUpgradeCheckout(targetTier?: UserTier) {
  const { tier: currentTier, subscriptionStatus, refetchTier } = useTier();
  const checkoutTier = targetTier ?? getNextTier(currentTier);
  const hasActiveSubscription =
    currentTier !== 'FREE' && subscriptionStatus === 'ACTIVE';

  const [createCheckout, { loading: checkoutLoading, error: checkoutError }] = useMutation(
    CREATE_CHECKOUT_SESSION,
    {
      onCompleted: (data) => {
        if (data.createCheckoutSession.url) {
          window.location.href = data.createCheckoutSession.url;
        }
      },
      onError: (error) => {
        toast.error('Failed to start checkout', { description: error.message });
      },
    }
  );

  const [upgradeSubscription, { loading: upgradeLoading, error: upgradeError }] = useMutation(
    UPGRADE_SUBSCRIPTION,
    {
      refetchQueries: [{ query: GET_MY_TIER }],
      onCompleted: (data) => {
        if (data.upgradeSubscription.url) {
          window.location.href = data.upgradeSubscription.url;
          return;
        }
        refetchTier();
        toast.success(
          checkoutTier
            ? `Upgraded to ${formatTierLabel(checkoutTier)}`
            : 'Subscription upgraded'
        );
      },
      onError: (error) => {
        toast.error('Failed to upgrade subscription', { description: error.message });
      },
    }
  );

  const loading = checkoutLoading || upgradeLoading;
  const error = checkoutError ?? upgradeError;

  const upgrade = () => {
    if (!checkoutTier) return;
    if (hasActiveSubscription) {
      upgradeSubscription({ variables: { tier: checkoutTier } });
    } else {
      createCheckout({ variables: { tier: checkoutTier, interval: 'MONTHLY' } });
    }
  };

  return { upgrade, loading, error, checkoutTier, currentTier };
}
