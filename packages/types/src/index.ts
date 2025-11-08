// ============================================
// API Request/Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// User Types
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  timezone: string;
  tier: SubscriptionTier;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  wakeTime: string;
  sleepTime: string;
  workStartTime: string;
  workEndTime: string;
  productivityPeaks: string[];
  energyPattern?: 'MORNING_PERSON' | 'NIGHT_OWL' | 'BALANCED';
  blockedTimes?: BlockedTime[];
}

export interface BlockedTime {
  day: DayOfWeek;
  start: string;
  end: string;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO';

// ============================================
// Goal Types
// ============================================

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  preferredTimes: string[];
  flexibilityScore: number;
  priority: number;
  isActive: boolean;
  isPaused: boolean;
  pausedUntil?: string;
  completionRate: number;
  totalCompletions: number;
  totalScheduled: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  preferredTimes?: string[];
  priority?: number;
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
  isActive?: boolean;
  isPaused?: boolean;
  pausedUntil?: string;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  userId: string;
  goalId?: string;
  planId?: string;
  title: string;
  notes?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isCompleted: boolean;
  completedAt?: string;
  isSkipped: boolean;
  skippedReason?: string;
  aiGenerated: boolean;
  aiReasoning?: string;
  calendarEventId?: string;
  calendarProvider?: string;
  syncStatus: SyncStatus;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface CreateTaskDto {
  title: string;
  notes?: string;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  goalId?: string;
}

// ============================================
// Plan Types
// ============================================

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  planJson: PlanStructure;
  reasoning?: Record<string, string>;
  status: PlanStatus;
  acceptedAt?: string;
  appliedAt?: string;
  aiModel?: string;
  complexity?: string;
  generationTime?: number;
  generationCost?: number;
  qualityScore?: number;
  userSatisfaction?: string;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanStructure {
  monday: PlannedTask[];
  tuesday: PlannedTask[];
  wednesday: PlannedTask[];
  thursday: PlannedTask[];
  friday: PlannedTask[];
  saturday: PlannedTask[];
  sunday: PlannedTask[];
}

export interface PlannedTask {
  goalId: string;
  title: string;
  start: string;
  end: string;
  reasoning: string;
}

export type PlanStatus = 'DRAFT' | 'ACCEPTED' | 'APPLIED' | 'ARCHIVED';

export interface GeneratePlanRequest {
  weekStartDate: string;
  userId: string;
  goals: Goal[];
  preferences: UserPreferences;
  busySlots?: BusySlot[];
  pastPlans?: WeeklyPlan[];
}

export interface GeneratePlanResponse {
  plan: PlanStructure;
  complexity: 'simple' | 'standard' | 'complex';
  qualityScore: number;
  metadata: {
    model: string;
    tier: string;
    latency: number;
    cost: number;
    tokenUsage?: number;
  };
}

export interface BusySlot {
  day: DayOfWeek;
  start: string;
  end: string;
  title: string;
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  calendarId: string;
}

export interface CalendarConnection {
  provider: 'google' | 'outlook' | 'apple';
  email: string;
  calendarId: string;
  calendarName: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
}

export interface SyncRequest {
  planId: string;
  calendarProvider: string;
  conflictResolution?: ConflictResolution[];
}

export interface ConflictResolution {
  taskId: string;
  action: 'skip' | 'adjust' | 'overwrite';
  newStartTime?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface WeeklyInsights {
  week: string;
  completionRate: number;
  totalHoursScheduled: number;
  totalHoursCompleted: number;
  goalBreakdown: GoalInsight[];
  bestDay: DayOfWeek;
  worstDay: DayOfWeek;
  streak: number;
}

export interface GoalInsight {
  goalId: string;
  goalTitle: string;
  completionRate: number;
  tasksCompleted: number;
  tasksScheduled: number;
}

// ============================================
// Billing Types
// ============================================

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  features: FeatureLimits;
}

export interface FeatureLimits {
  maxGoals: number;
  plansPerWeek: number;
  aiTier: 'rule-based' | 'standard' | 'complex';
  calendarSync: boolean;
  offlineMode: boolean;
  advancedInsights: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// ============================================
// Utility Types
// ============================================

export type Awaitable<T> = T | Promise<T>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
