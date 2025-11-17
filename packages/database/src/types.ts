// Temporary types file until Prisma client is generated
// Based on schema.prisma
// NOTE: Using const enums to match Prisma-generated types

export const SubscriptionTier = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
} as const;

export type SubscriptionTierType = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  TRIALING: 'TRIALING',
} as const;

export type SubscriptionStatusType = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

export const EnergyPattern = {
  MORNING_PERSON: 'MORNING_PERSON',
  NIGHT_OWL: 'NIGHT_OWL',
  BALANCED: 'BALANCED',
} as const;

export type EnergyPatternType = typeof EnergyPattern[keyof typeof EnergyPattern];

export const WaitlistStatus = {
  PENDING: 'PENDING',
  INVITED: 'INVITED',
  CONVERTED: 'CONVERTED',
  DECLINED: 'DECLINED',
  INVALID: 'INVALID',
} as const;

export type WaitlistStatusType = typeof WaitlistStatus[keyof typeof WaitlistStatus];

export const PlanStatus = {
  DRAFT: 'DRAFT',
  ACCEPTED: 'ACCEPTED',
  APPLIED: 'APPLIED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type PlanStatusType = typeof PlanStatus[keyof typeof PlanStatus];

export const SyncStatus = {
  PENDING: 'PENDING',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
  CONFLICT: 'CONFLICT',
} as const;

export type SyncStatusType = typeof SyncStatus[keyof typeof SyncStatus];

export const MemoryType = {
  TIME_PREFERENCE: 'TIME_PREFERENCE',
  COMPLETION_PATTERN: 'COMPLETION_PATTERN',
  ENERGY_INSIGHT: 'ENERGY_INSIGHT',
  AVOIDANCE_PATTERN: 'AVOIDANCE_PATTERN',
  CONTEXT_PREFERENCE: 'CONTEXT_PREFERENCE',
} as const;

export type MemoryTypeType = typeof MemoryType[keyof typeof MemoryType];

export const ReferralStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type ReferralStatusType = typeof ReferralStatus[keyof typeof ReferralStatus];

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  timezone: string;

  // Subscription
  tier: SubscriptionTierType;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatusType;

  // Embedded preferences
  wakeTime: string;
  sleepTime: string;
  workStartTime: string;
  workEndTime: string;
  productivityPeaks: string[];
  energyPattern: EnergyPatternType | null;
  blockedTimes: any | null; // Json type

  // Device tokens
  pushTokens: string[];

  // Metadata
  onboardingCompleted: boolean;
  onboardingStep: number;
  language: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
}

export interface Goal {
  id: string;
  userId: string;

  // Goal details
  title: string;
  description: string | null;
  emoji: string | null;
  color: string | null;

  // Scheduling parameters
  frequencyPerWeek: number;
  durationMinutes: number;
  preferredTimes: string[];
  flexibilityScore: number;

  // Priority & status
  priority: number;
  isActive: boolean;
  isPaused: boolean;
  pausedUntil: Date | null;

  // Analytics
  completionRate: number;
  totalCompletions: number;
  totalScheduled: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyPlan {
  id: string;
  userId: string;

  // Plan timing
  weekStartDate: Date;
  weekEndDate: Date;

  // Plan data
  planJson: any; // Json type
  reasoning: any | null; // Json type

  // Status
  status: PlanStatusType;
  acceptedAt: Date | null;
  appliedAt: Date | null;
  archivedAt: Date | null;

  // AI metadata
  aiModel: string | null;
  complexity: string | null;
  generationTime: number | null;
  generationCost: number | null;
  tokenUsage: number | null;

  // Quality metrics
  qualityScore: number | null;
  userSatisfaction: string | null;
  editCount: number;
  regenerateCount: number;

  // Analytics
  completionRate: number;
  totalTasks: number;
  completedTasks: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  goalId: string | null;
  planId: string | null;

  // Task details
  title: string;
  notes: string | null;
  priority: number;
  tags: string[];

  // Scheduling
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;

  // Status
  isCompleted: boolean;
  completedAt: Date | null;
  isSkipped: boolean;
  skippedReason: string | null;
  skippedAt: Date | null;

  // Source tracking
  aiGenerated: boolean;
  manuallyAdded: boolean;
  manuallyMoved: boolean;
  aiReasoning: string | null;

  // Calendar sync
  calendarEventId: string | null;
  calendarProvider: string | null;
  syncedAt: Date | null;
  syncStatus: SyncStatusType;
  syncError: string | null;

  // Offline support
  localId: string | null;
  pendingSync: boolean;
  offlineCreatedAt: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarToken {
  id: string;
  userId: string;

  // Provider
  provider: string;

  // OAuth tokens (encrypted)
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;

  // Calendar metadata
  calendarId: string | null;
  calendarName: string | null;
  email: string | null;

  // Sync state
  lastSyncAt: Date | null;
  syncEnabled: boolean;
  syncErrors: number;
  lastError: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncLog {
  id: string;
  userId: string;
  planId: string | null;

  // Sync details
  syncType: string;
  tasksAttempted: number;
  tasksSucceeded: number;
  tasksFailed: number;

  // Results
  success: boolean;
  errors: any | null;
  duration: number;

  // Timestamp
  createdAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  sessionId: string | null;

  // Event details
  event: string;
  properties: any | null;

  // Context
  platform: string | null;
  appVersion: string | null;
  userTier: string | null;

  // Timestamp
  timestamp: Date;
}

export interface LLMUsage {
  id: string;
  userId: string | null;
  planId: string | null;

  // LLM details
  model: string;
  operation: string;

  // Token usage
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;

  // Performance
  latency: number;
  success: boolean;
  errorMessage: string | null;

  // Timestamp
  timestamp: Date;
}
