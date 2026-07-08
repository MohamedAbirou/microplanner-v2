import type { UserTier } from '@/contexts/tier-context';

/** Next tier in the upgrade ladder, or null if already at top tier. */
export function getNextTier(tier: UserTier): UserTier | null {
  switch (tier) {
    case 'FREE':
      return 'STARTER';
    case 'STARTER':
      return 'PRO';
    case 'PRO':
      return 'PREMIUM';
    default:
      return null;
  }
}

export function formatTierLabel(tier: UserTier): string {
  return tier.charAt(0) + tier.slice(1).toLowerCase();
}

const TIER_PRICES: Record<UserTier, string> = {
  FREE: 'Free',
  STARTER: '$7/month',
  PRO: '$15/month',
  PREMIUM: '$29/month',
};

export function getTierPrice(tier: UserTier): string {
  return TIER_PRICES[tier];
}

/** Short marketing copy for the next-tier upgrade card. */
export function getUpgradePitch(tier: UserTier): string | null {
  const next = getNextTier(tier);
  if (!next) return null;
  switch (next) {
    case 'STARTER':
      return 'Unlock more goals, GPT-4o Mini plans, and templates';
    case 'PRO':
      return 'Unlock Claude Sonnet 3.5, unlimited plans, and advanced analytics';
    case 'PREMIUM':
      return 'Unlock team workspaces, API access, and priority support';
    default:
      return null;
  }
}
