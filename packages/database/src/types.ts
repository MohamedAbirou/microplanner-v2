// Single source of truth: Prisma-generated model types and enums.
// The previous hand-written interfaces drifted from schema.prisma (missing
// Task.recurrenceRule, User.context, etc.) — never redefine model shapes here.
export * from '@prisma/client';

import type {
  SubscriptionTier,
  SubscriptionStatus,
  EnergyPattern,
  PlanStatus,
  SyncStatus,
  MemoryType,
  ReferralStatus,
} from '@prisma/client';

// Back-compat aliases for the legacy `<Enum>Type` names used across api-gateway.
export type SubscriptionTierType = SubscriptionTier;
export type SubscriptionStatusType = SubscriptionStatus;
export type EnergyPatternType = EnergyPattern;
export type PlanStatusType = PlanStatus;
export type SyncStatusType = SyncStatus;
export type MemoryTypeType = MemoryType;
export type ReferralStatusType = ReferralStatus;
