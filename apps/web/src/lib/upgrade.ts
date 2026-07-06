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
