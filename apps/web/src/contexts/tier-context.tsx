'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';

export type UserTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

interface TierLimits {
  // Core limits
  maxActiveGoals: number;
  maxGoalsPerPlan: number;
  maxTasksPerDay: number;
  maxPlansPerWeek: number; // Changed from maxPlansPerMonth!

  // AI features
  aiModel: 'rule-based' | 'gpt-4o-mini' | 'claude-sonnet-3.5';
  qualityScoreRange: [number, number]; // [min, max] expected quality

  // Feature access
  hasCalendarIntegration: boolean;
  hasTemplateAccess: boolean; // Can create & share templates
  hasAdvancedAnalytics: boolean;
  hasTeamWorkspace: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
}

interface TierContextValue {
  tier: UserTier;
  limits: TierLimits;
  isLoading: boolean;
}

/**
 * Tier limits based on Competitive Research Report recommendations
 *
 * Key changes from original:
 * - Plans are weekly not monthly (users need daily/weekly planning)
 * - AI models: rule-based → gpt-4o-mini → claude-sonnet-3.5
 * - Quality score ranges show expected AI performance
 * - Template access for viral growth
 * - Team workspace and API access for Premium only
 */
const tierLimits: Record<UserTier, TierLimits> = {
  FREE: {
    maxActiveGoals: 3,
    maxGoalsPerPlan: 3,
    maxTasksPerDay: 20,
    maxPlansPerWeek: 7, // One per day - enables habit formation
    aiModel: 'rule-based',
    qualityScoreRange: [70, 85],
    hasCalendarIntegration: false,
    hasTemplateAccess: false, // Can use templates but not create
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  STARTER: {
    maxActiveGoals: 5,
    maxGoalsPerPlan: 5,
    maxTasksPerDay: 40,
    maxPlansPerWeek: 15, // 2+ per day
    aiModel: 'gpt-4o-mini',
    qualityScoreRange: [80, 90],
    hasCalendarIntegration: true,
    hasTemplateAccess: true, // Can create & share templates
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PRO: {
    maxActiveGoals: 15,
    maxGoalsPerPlan: 10,
    maxTasksPerDay: 100,
    maxPlansPerWeek: -1, // Unlimited
    aiModel: 'claude-sonnet-3.5',
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true, // AI insights, pattern recognition
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxActiveGoals: -1, // Unlimited
    maxGoalsPerPlan: -1,
    maxTasksPerDay: -1,
    maxPlansPerWeek: -1,
    aiModel: 'claude-sonnet-3.5',
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true,
    hasTeamWorkspace: true, // Premium exclusive - shared plans, team analytics
    hasAPIAccess: true, // Premium exclusive - REST API, webhooks
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
export function useHasFeature(feature: keyof Pick<TierLimits, 'hasCalendarIntegration' | 'hasTemplateAccess' | 'hasAdvancedAnalytics' | 'hasTeamWorkspace' | 'hasAPIAccess' | 'hasPrioritySupport'>) {
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
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

/**
 * Check if user can perform an action based on tier
 * @param currentCount Current usage count
 * @param limitKey The limit to check against
 * @returns { canProceed: boolean, limit: number, remaining: number }
 */
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
    return { canProceed: true, limit: -1, remaining: -1, tier }; // unlimited
  }

  const remaining = Math.max(0, limit - currentCount);
  const canProceed = currentCount < limit;

  return { canProceed, limit, remaining, tier };
}
