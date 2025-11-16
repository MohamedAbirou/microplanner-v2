'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';

export type UserTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

interface TierLimits {
  maxGoalsPerPlan: number;
  maxTasksPerDay: number;
  maxPlansPerMonth: number;
  aiModelAccess: string[];
  hasCalendarIntegration: boolean;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
}

interface TierContextValue {
  tier: UserTier;
  limits: TierLimits;
  isLoading: boolean;
}

const tierLimits: Record<UserTier, TierLimits> = {
  FREE: {
    maxGoalsPerPlan: 3,
    maxTasksPerDay: 10,
    maxPlansPerMonth: 2,
    aiModelAccess: ['gpt-3.5-turbo'],
    hasCalendarIntegration: false,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
  },
  STARTER: {
    maxGoalsPerPlan: 5,
    maxTasksPerDay: 25,
    maxPlansPerMonth: 8,
    aiModelAccess: ['gpt-3.5-turbo', 'gpt-4'],
    hasCalendarIntegration: true,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
  },
  PRO: {
    maxGoalsPerPlan: 10,
    maxTasksPerDay: 50,
    maxPlansPerMonth: 20,
    aiModelAccess: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    hasCalendarIntegration: true,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxGoalsPerPlan: -1, // unlimited
    maxTasksPerDay: -1, // unlimited
    maxPlansPerMonth: -1, // unlimited
    aiModelAccess: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-opus'],
    hasCalendarIntegration: true,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
  },
};

const TierContext = React.createContext<TierContextValue | undefined>(undefined);

export function TierProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  const tier = (user?.publicMetadata?.tier as UserTier) || 'FREE';
  const limits = tierLimits[tier];

  const value: TierContextValue = {
    tier,
    limits,
    isLoading: !isLoaded,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  const context = React.useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}

// Helper hooks for common tier checks
export function useHasFeature(feature: keyof TierLimits) {
  const { limits } = useTier();
  return limits[feature];
}

export function useCanExceedLimit(limitKey: keyof Pick<TierLimits, 'maxGoalsPerPlan' | 'maxTasksPerDay' | 'maxPlansPerMonth'>, currentCount: number) {
  const { limits } = useTier();
  const limit = limits[limitKey];
  if (typeof limit !== 'number') return false;
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}
