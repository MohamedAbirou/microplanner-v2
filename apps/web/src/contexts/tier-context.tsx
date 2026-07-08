'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { GET_MY_TIER } from '@/graphql/operations';
import { initialQueryLoading } from '@/lib/graphql-loading';

export type UserTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

interface TierLimits {
  maxActiveGoals: number;
  maxGoalsPerPlan: number;
  maxTasksPerDay: number;
  maxPlansPerWeek: number;
  aiModel: 'rule-based' | 'gpt-4o-mini' | 'claude-sonnet-3.5';
  qualityScoreRange: [number, number];
  hasCalendarIntegration: boolean;
  hasTemplateAccess: boolean;
  hasAdvancedAnalytics: boolean;
  hasTeamWorkspace: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
}

interface TierContextValue {
  tier: UserTier;
  subscriptionStatus: string | null;
  limits: TierLimits;
  isLoading: boolean;
  refetchTier: () => void;
}

const tierLimits: Record<UserTier, TierLimits> = {
  FREE: {
    maxActiveGoals: 2,
    maxGoalsPerPlan: 2,
    maxTasksPerDay: 20,
    maxPlansPerWeek: 5,
    aiModel: 'rule-based',
    qualityScoreRange: [70, 85],
    hasCalendarIntegration: true,
    hasTemplateAccess: false,
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  STARTER: {
    maxActiveGoals: 5,
    maxGoalsPerPlan: 5,
    maxTasksPerDay: 40,
    maxPlansPerWeek: 20,
    aiModel: 'gpt-4o-mini',
    qualityScoreRange: [80, 90],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PRO: {
    maxActiveGoals: -1,
    maxGoalsPerPlan: 10,
    maxTasksPerDay: 100,
    maxPlansPerWeek: -1,
    aiModel: 'claude-sonnet-3.5',
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxActiveGoals: -1,
    maxGoalsPerPlan: -1,
    maxTasksPerDay: -1,
    maxPlansPerWeek: -1,
    aiModel: 'claude-sonnet-3.5',
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true,
    hasTeamWorkspace: true,
    hasAPIAccess: true,
    hasPrioritySupport: true,
  },
};

const TierContext = React.createContext<TierContextValue | undefined>(undefined);

function TierProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const { data, loading, refetch, error } = useQuery(GET_MY_TIER, {
    fetchPolicy: sessionId ? 'network-only' : 'cache-first',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const tier = (data?.me?.tier as UserTier) || 'FREE';
  const subscriptionStatus = data?.me?.subscriptionStatus ?? null;
  const limits = tierLimits[tier] ?? tierLimits.FREE;

  // After Stripe checkout redirect, force-refresh tier from DB and clean URL
  React.useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const refresh = async () => {
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        await refetch();
        await new Promise((r) => setTimeout(r, attempt === 0 ? 500 : 1500));
      }
      if (!cancelled) {
        router.replace('/dashboard');
      }
    };

    refresh();
    return () => {
      cancelled = true;
    };
  }, [sessionId, refetch, router]);

  React.useEffect(() => {
    if (error) {
      console.error('[TierProvider] Failed to load tier from API:', error);
    }
  }, [error]);

  const value: TierContextValue = {
    tier,
    subscriptionStatus,
    limits,
    isLoading: initialQueryLoading(loading, data),
    refetchTier: () => {
      void refetch();
    },
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function TierProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <TierProviderInner>{children}</TierProviderInner>
    </React.Suspense>
  );
}

export function useTier() {
  const context = React.useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}

export function useHasFeature(
  feature: keyof Pick<
    TierLimits,
    | 'hasCalendarIntegration'
    | 'hasTemplateAccess'
    | 'hasAdvancedAnalytics'
    | 'hasTeamWorkspace'
    | 'hasAPIAccess'
    | 'hasPrioritySupport'
  >
) {
  const { limits } = useTier();
  return limits[feature];
}

export function useCanExceedLimit(
  limitKey: keyof Pick<TierLimits, 'maxActiveGoals' | 'maxGoalsPerPlan' | 'maxTasksPerDay' | 'maxPlansPerWeek'>,
  currentCount: number
) {
  const { limits } = useTier();
  const limit = limits[limitKey];
  if (typeof limit !== 'number') return false;
  if (limit === -1) return true;
  return currentCount < limit;
}

export function useCheckLimit(
  limitKey: keyof Pick<TierLimits, 'maxActiveGoals' | 'maxGoalsPerPlan' | 'maxTasksPerDay' | 'maxPlansPerWeek'>,
  currentCount: number
) {
  const { limits, tier } = useTier();
  const limit = limits[limitKey];

  if (typeof limit !== 'number') {
    return { canProceed: false, limit: 0, remaining: 0, tier };
  }

  if (limit === -1) {
    return { canProceed: true, limit: -1, remaining: -1, tier };
  }

  const remaining = Math.max(0, limit - currentCount);
  const canProceed = currentCount < limit;

  return { canProceed, limit, remaining, tier };
}
