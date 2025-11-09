// Temporary types file until Prisma client is generated
// Based on schema.prisma

export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  TRIALING = 'TRIALING',
}

export enum EnergyPattern {
  MORNING_PERSON = 'MORNING_PERSON',
  NIGHT_OWL = 'NIGHT_OWL',
  BALANCED = 'BALANCED',
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  timezone: string;

  // Subscription
  tier: SubscriptionTier;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;

  // Embedded preferences
  wakeTime: string;
  sleepTime: string;
  workStartTime: string;
  workEndTime: string;
  productivityPeaks: string[];
  energyPattern: EnergyPattern | null;
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
