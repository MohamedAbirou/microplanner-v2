/**
 * Productivity & Work-Life Balance Types (Phase 18)
 *
 * Complete feature parity with ReclaimAI + surpass all competitors
 */

// ==================== WORK HOURS & BOUNDARIES ====================

/**
 * Work hours configuration
 */
export interface WorkHours {
  id: string;
  userId: string;
  timezone: string;

  // Weekly schedule
  monday: DayWorkHours;
  tuesday: DayWorkHours;
  wednesday: DayWorkHours;
  thursday: DayWorkHours;
  friday: DayWorkHours;
  saturday: DayWorkHours;
  sunday: DayWorkHours;

  // Work-life balance rules
  enforceWorkHours: boolean; // No scheduling outside work hours
  maxMeetingsPerDay: number | null; // Limit meetings per day
  maxMeetingHoursPerDay: number | null; // Limit meeting hours per day
  maxConsecutiveMeetings: number | null; // Limit back-to-back meetings

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Daily work hours
 */
export interface DayWorkHours {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breakTimes: BreakTime[];
}

/**
 * Break time
 */
export interface BreakTime {
  startTime: string; // "12:00"
  endTime: string; // "13:00"
  type: 'lunch' | 'break';
  protected: boolean; // Prevent scheduling over this
}

/**
 * Create/Update work hours DTO
 */
export interface UpsertWorkHoursDto {
  timezone?: string;
  monday?: DayWorkHours;
  tuesday?: DayWorkHours;
  wednesday?: DayWorkHours;
  thursday?: DayWorkHours;
  friday?: DayWorkHours;
  saturday?: DayWorkHours;
  sunday?: DayWorkHours;
  enforceWorkHours?: boolean;
  maxMeetingsPerDay?: number | null;
  maxMeetingHoursPerDay?: number | null;
  maxConsecutiveMeetings?: number | null;
}

// ==================== FOCUS TIME ====================

/**
 * Focus time block
 */
export interface FocusTimeBlock {
  id: string;
  userId: string;
  title: string;

  // Recurrence
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.

  // Time
  startTime: string; // "09:00"
  durationMinutes: number;

  // Priority & protection
  priority: number; // 1-10
  protected: boolean; // Prevent meetings during this time
  isActive: boolean;

  // Auto-scheduling
  autoSchedule: boolean; // Let AI find best time
  preferredTimeSlots: string[]; // ["morning", "afternoon"]

  // Metadata
  color: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create focus time DTO
 */
export interface CreateFocusTimeDto {
  title: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'custom';
  daysOfWeek?: number[];
  startTime?: string;
  durationMinutes: number;
  priority?: number;
  protected?: boolean;
  autoSchedule?: boolean;
  preferredTimeSlots?: string[];
  color?: string;
}

/**
 * Update focus time DTO
 */
export interface UpdateFocusTimeDto {
  title?: string;
  frequency?: 'daily' | 'weekdays' | 'weekly' | 'custom';
  daysOfWeek?: number[];
  startTime?: string;
  durationMinutes?: number;
  priority?: number;
  protected?: boolean;
  isActive?: boolean;
  autoSchedule?: boolean;
  preferredTimeSlots?: string[];
  color?: string;
}

// ==================== NO-MEETING DAYS ====================

/**
 * No-meeting day configuration
 */
export interface NoMeetingDay {
  id: string;
  userId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  isActive: boolean;
  allowExceptions: boolean; // Allow manual exceptions
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create no-meeting day DTO
 */
export interface CreateNoMeetingDayDto {
  dayOfWeek: number;
  allowExceptions?: boolean;
}

// ==================== PRIORITY HOURS ====================

/**
 * Priority hours configuration
 */
export interface PriorityHours {
  id: string;
  userId: string;

  // Time slots that are "priority" for deep work
  timeSlots: PriorityTimeSlot[];

  // Rules
  prioritizeFocusTime: boolean; // Schedule focus time during priority hours
  prioritizeTasks: boolean; // Schedule tasks during priority hours
  deprioritizeMeetings: boolean; // Avoid meetings during priority hours

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Priority time slot
 */
export interface PriorityTimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  priority: number; // 1-10
}

/**
 * Update priority hours DTO
 */
export interface UpdatePriorityHoursDto {
  timeSlots?: PriorityTimeSlot[];
  prioritizeFocusTime?: boolean;
  prioritizeTasks?: boolean;
  deprioritizeMeetings?: boolean;
}

// ==================== CALENDAR DEFENSE ====================

/**
 * Calendar defense rules
 */
export interface CalendarDefense {
  id: string;
  userId: string;

  // Auto-accept/decline rules
  autoAcceptDuringOpenHours: boolean;
  autoDeclineDuringFocusTime: boolean;
  autoDeclineOutsideWorkHours: boolean;
  autoDeclineDoubleBookings: boolean;

  // Meeting rules
  requireMinimumNotice: boolean;
  minimumNoticeHours: number; // e.g., 24 hours

  // Buffer rules
  requireBufferBetweenMeetings: boolean;
  bufferMinutes: number; // e.g., 15 minutes

  // Meeting length rules
  suggestShorterMeetings: boolean; // Suggest 25/50 min instead of 30/60
  defaultMeetingDuration: number; // Default to 30 min

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update calendar defense DTO
 */
export interface UpdateCalendarDefenseDto {
  autoAcceptDuringOpenHours?: boolean;
  autoDeclineDuringFocusTime?: boolean;
  autoDeclineOutsideWorkHours?: boolean;
  autoDeclineDoubleBookings?: boolean;
  requireMinimumNotice?: boolean;
  minimumNoticeHours?: number;
  requireBufferBetweenMeetings?: boolean;
  bufferMinutes?: number;
  suggestShorterMeetings?: boolean;
  defaultMeetingDuration?: number;
}

// ==================== SMART 1:1 SCHEDULING ====================

/**
 * Smart 1:1 configuration
 */
export interface Smart1on1 {
  id: string;
  userId: string;

  // Person details
  personName: string;
  personEmail: string;

  // Recurrence
  frequency: 'weekly' | 'biweekly' | 'monthly';
  durationMinutes: number;

  // Smart scheduling
  autoSchedule: boolean;
  autoRescheduleOnConflict: boolean;
  preferredDays: number[]; // Days of week
  preferredTimes: string[]; // ["morning", "afternoon"]

  // Status
  isActive: boolean;
  lastScheduledDate: Date | null;
  nextScheduledDate: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Smart 1:1 DTO
 */
export interface CreateSmart1on1Dto {
  personName: string;
  personEmail: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  durationMinutes?: number;
  autoSchedule?: boolean;
  autoRescheduleOnConflict?: boolean;
  preferredDays?: number[];
  preferredTimes?: string[];
}

/**
 * Update Smart 1:1 DTO
 */
export interface UpdateSmart1on1Dto {
  personName?: string;
  personEmail?: string;
  frequency?: 'weekly' | 'biweekly' | 'monthly';
  durationMinutes?: number;
  autoSchedule?: boolean;
  autoRescheduleOnConflict?: boolean;
  preferredDays?: number[];
  preferredTimes?: string[];
  isActive?: boolean;
}

// ==================== TRAVEL TIME ====================

/**
 * Location for travel time calculation
 */
export interface Location {
  address: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Travel time entry
 */
export interface TravelTime {
  id: string;
  userId: string;
  fromEventId: string;
  toEventId: string;
  estimatedMinutes: number;
  method: 'driving' | 'walking' | 'transit' | 'auto';
  createdAt: Date;
}

/**
 * Calculate travel time DTO
 */
export interface CalculateTravelTimeDto {
  fromLocation: Location;
  toLocation: Location;
  method?: 'driving' | 'walking' | 'transit' | 'auto';
  departureTime?: Date;
}

// ==================== KANBAN BOARD ====================

/**
 * Kanban board
 */
export interface KanbanBoard {
  id: string;
  userId: string;
  projectId?: string;

  name: string;
  description?: string;

  columns: KanbanColumn[];

  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Kanban column
 */
export interface KanbanColumn {
  id: string;
  boardId: string;
  name: string;
  order: number;
  color: string;
  taskIds: string[]; // Ordered task IDs
}

/**
 * Create Kanban board DTO
 */
export interface CreateKanbanBoardDto {
  name: string;
  description?: string;
  projectId?: string;
  columns?: Array<{
    name: string;
    color: string;
  }>;
}

/**
 * Update Kanban board DTO
 */
export interface UpdateKanbanBoardDto {
  name?: string;
  description?: string;
  columns?: KanbanColumn[];
}

/**
 * Move task in Kanban DTO
 */
export interface MoveTaskInKanbanDto {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
}

// ==================== PRODUCTIVITY SCORING ====================

/**
 * Enhanced productivity score
 */
export interface ProductivityScore {
  userId: string;
  date: Date;

  // Overall score
  overallScore: number; // 0-100

  // Component scores
  focusTimeScore: number; // Did they get enough focus time?
  taskCompletionScore: number; // Tasks completed vs scheduled
  meetingEfficiencyScore: number; // Meeting time vs productive time
  workLifeBalanceScore: number; // Respecting boundaries

  // Metrics
  totalFocusMinutes: number;
  totalMeetingMinutes: number;
  totalTaskMinutes: number;
  totalBreakMinutes: number;

  // Insights
  insights: string[];
  recommendations: string[];

  createdAt: Date;
}

// ==================== SMART NOTIFICATIONS ====================

/**
 * Smart notification
 */
export interface SmartNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification types
 */
export enum NotificationType {
  OVERBOOKED_DAY = 'overbooked_day',
  MISSING_BREAKS = 'missing_breaks',
  BACK_TO_BACK_MEETINGS = 'back_to_back_meetings',
  FOCUS_TIME_CONFLICT = 'focus_time_conflict',
  WORK_HOURS_VIOLATION = 'work_hours_violation',
  UPCOMING_MEETING = 'upcoming_meeting',
  TASK_DUE_SOON = 'task_due_soon',
  GOAL_PROGRESS = 'goal_progress',
  WEEKLY_SUMMARY = 'weekly_summary',
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  id: string;
  userId: string;

  // Channels
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;

  // Notification types enabled
  overbookedAlerts: boolean;
  breakReminders: boolean;
  focusTimeAlerts: boolean;
  upcomingMeetingAlerts: boolean;
  taskDueAlerts: boolean;
  weeklySummary: boolean;

  // Timing
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update notification preferences DTO
 */
export interface UpdateNotificationPreferencesDto {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  overbookedAlerts?: boolean;
  breakReminders?: boolean;
  focusTimeAlerts?: boolean;
  upcomingMeetingAlerts?: boolean;
  taskDueAlerts?: boolean;
  weeklySummary?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
