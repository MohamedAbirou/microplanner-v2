// Temporary types file until Prisma client is generated
// Based on schema.prisma

export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
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

export enum PlanStatus {
  DRAFT = 'DRAFT',
  ACCEPTED = 'ACCEPTED',
  APPLIED = 'APPLIED',
  ARCHIVED = 'ARCHIVED',
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
  status: PlanStatus;
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

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT',
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
  syncStatus: SyncStatus;
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
