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
