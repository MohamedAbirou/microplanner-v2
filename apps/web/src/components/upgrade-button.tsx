'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import type { UserTier } from '@/contexts/tier-context';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';
import { formatTierLabel } from '@/lib/upgrade';
import { Sparkles } from 'lucide-react';

interface UpgradeButtonProps extends ButtonProps {
  targetTier?: UserTier;
  showIcon?: boolean;
}

export function UpgradeButton({
  targetTier,
  showIcon = true,
  children,
  onClick,
  disabled,
  ...props
}: UpgradeButtonProps) {
  const { upgrade, loading, checkoutTier } = useUpgradeCheckout(targetTier);

  if (!checkoutTier) {
    return null;
  }

  const label = children ?? `Upgrade to ${formatTierLabel(checkoutTier)}`;

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          upgrade();
        }
      }}
    >
      {showIcon && <Sparkles className="h-3.5 w-3.5 mr-2" />}
      {loading ? 'Upgrading…' : label}
    </Button>
  );
}
