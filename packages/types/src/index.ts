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

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'TRIALING';

export type EnergyPattern =
  | 'MORNING_PERSON'
  | 'NIGHT_OWL'
  | 'BALANCED';

export type MemoryType =
  | 'TIME_PREFERENCE'
  | 'COMPLETION_PATTERN'
  | 'ENERGY_INSIGHT'
  | 'AVOIDANCE_PATTERN'
  | 'CONTEXT_PREFERENCE';

export type ReferralStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED';

export type WaitlistStatus =
  | 'PENDING'
  | 'INVITED'
  | 'CONVERTED'
  | 'DECLINED'
  | 'INVALID';

export type NotificationType =
  | 'TASK_DUE'
  | 'GOAL_MILESTONE'
  | 'WEEKLY_PLAN'
  | 'DAILY_REMINDER'
  | 'OVERBOOKED_ALERT'
  | 'BREAK_REMINDER'
  | 'FOCUS_TIME_ALERT'
  | 'UPCOMING_MEETING';


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

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isArchived: boolean;
  archivedAt?: string;
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  isArchived?: boolean;
  completedAt?: string;
}

// ============================================
// Task Dependency Types
// ============================================

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  blockingTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish';
  createdAt: string;
}

export interface CreateTaskDependencyDto {
  dependentTaskId: string;
  blockingTaskId: string;
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish';
}

// ============================================
// Plan Template Types
// ============================================

export interface PlanTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  isPublic: boolean;
  isDefault: boolean;
  usageCount: number;
  tags: string[];
  tasks: TemplateTask[];
  estimatedTotalHours: number;
  tasksPerDay: Record<DayOfWeek, number>;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateTask {
  title: string;
  durationMinutes: number;
  dayOfWeek: DayOfWeek;
  preferredTime?: string;
  notes?: string;
  tags?: string[];
}

export interface CreatePlanTemplateDto {
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  tags?: string[];
  tasks: TemplateTask[];
}

// ============================================
// Waitlist Types
// ============================================

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  useCase?: string;
  referralSource?: string;
  status: WaitlistStatus;
  position: number;
  invitedAt?: string;
  convertedAt?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JoinWaitlistDto {
  email: string;
  name?: string;
  useCase?: string;
  referralSource?: string;
}

export interface WaitlistStats {
  total: number;
  pending: number;
  invited: number;
  converted: number;
  declined: number;
  invalid: number;
  averageWaitDays: number;
}

// ============================================
// AI Memory Types
// ============================================

export interface AIMemory {
  id: string;
  userId: string;
  memoryType: MemoryType;
  content: Record<string, any>;
  confidence: number;
  useCount: number;
  lastUsedAt?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Referral Types
// ============================================

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: ReferralStatus;
  rewardGranted: boolean;
  referralCode?: string;
  source?: string;
  createdAt: string;
  completedAt?: string;
}

// ============================================
// Productivity Types (Phase 18)
// ============================================

export interface WorkHours {
  id: string;
  userId: string;
  timezone: string;
  schedule: Record<DayOfWeek, WorkHoursSchedule>;
  enforceWorkHours: boolean;
  maxMeetingsPerDay?: number;
  maxMeetingHoursPerDay?: number;
  maxConsecutiveMeetings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkHoursSchedule {
  isWorkDay: boolean;
  startTime: string;
  endTime: string;
  breakTimes?: Array<{ start: string; end: string }>;
}

export interface FocusTimeBlock {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  daysOfWeek: number[];
  startTime?: string;
  durationMinutes: number;
  priority: number;
  protected: boolean;
  isActive: boolean;
  autoSchedule: boolean;
  preferredTimeSlots: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  isDefault: boolean;
  columns: KanbanColumn[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  order: number;
  color: string;
  taskIds: string[];
}

export interface ProductivityScore {
  id: string;
  userId: string;
  date: string;
  overallScore: number;
  focusTimeScore: number;
  taskCompletionScore: number;
  meetingEfficiencyScore: number;
  workLifeBalanceScore: number;
  totalFocusMinutes: number;
  totalMeetingMinutes: number;
  totalTaskMinutes: number;
  totalBreakMinutes: number;
  insights: string[];
  recommendations: string[];
  createdAt: string;
}

// ============================================
// Team Types (Premium)
// ============================================

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  plan: 'premium' | 'enterprise';
  maxMembers: number;
  logoUrl?: string;
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  requireApproval: boolean;
  sharedCalendar: boolean;
  sharedGoals: boolean;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  invitedBy?: string;
  joinedAt: string;
}

// ============================================
// Scheduling Types (Premium)
// ============================================

export interface SchedulingLink {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  meetingType: string;
  location?: string;
  color: string;
  isActive: boolean;
  isPublic: boolean;
  requiresConfirmation: boolean;
  maxBookingsPerDay?: number;
  noticeTime: number;
  availability: AvailabilitySettings;
  customQuestions: CustomQuestion[];
  redirectUrl?: string;
  confirmationMessage?: string;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySettings {
  timezone: string;
  schedule: Record<DayOfWeek, AvailabilitySlot[]>;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface Booking {
  id: string;
  linkId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  canceledAt?: string;
  cancelReason?: string;
  customResponses: Record<string, string>;
  meetingUrl?: string;
  calendarEventId?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}
