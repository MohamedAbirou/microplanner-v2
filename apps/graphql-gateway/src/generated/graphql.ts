import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLContext } from '../types/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type ActivityMetadata = {
  __typename?: 'ActivityMetadata';
  color?: Maybe<Scalars['String']['output']>;
  emoji?: Maybe<Scalars['String']['output']>;
  goalId?: Maybe<Scalars['ID']['output']>;
  goalTitle?: Maybe<Scalars['String']['output']>;
  taskId?: Maybe<Scalars['ID']['output']>;
  taskTitle?: Maybe<Scalars['String']['output']>;
};

export type ActivityType =
  | 'GOAL_COMPLETED'
  | 'GOAL_CREATED'
  | 'MILESTONE_REACHED'
  | 'PLAN_GENERATED'
  | 'STREAK_ACHIEVED'
  | 'TASK_COMPLETED';

export type AiMemory = {
  __typename?: 'AiMemory';
  confidence: Scalars['Float']['output'];
  content: Scalars['JSON']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  memoryType: MemoryType;
  source?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  useCount: Scalars['Int']['output'];
};

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  keyPrefix: Scalars['String']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  rateLimit: Scalars['Int']['output'];
  scopes: Array<ApiScope>;
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
};

export type ApiKeyWithSecret = {
  __typename?: 'ApiKeyWithSecret';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  key?: Maybe<Scalars['String']['output']>;
  keyPrefix: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rateLimit?: Maybe<Scalars['Int']['output']>;
  scopes: Array<Scalars['String']['output']>;
};

export type ApiScope =
  | 'READ_ANALYTICS'
  | 'READ_GOALS'
  | 'READ_PLANS'
  | 'READ_TASKS'
  | 'WEBHOOKS'
  | 'WRITE_GOALS'
  | 'WRITE_PLANS'
  | 'WRITE_TASKS';

export type AutopilotMove = {
  __typename?: 'AutopilotMove';
  fromDate?: Maybe<Scalars['DateTime']['output']>;
  fromStart?: Maybe<Scalars['String']['output']>;
  reason: Scalars['String']['output'];
  taskId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  toDate?: Maybe<Scalars['DateTime']['output']>;
  toEnd: Scalars['String']['output'];
  toStart: Scalars['String']['output'];
};

export type AutopilotProposal = {
  __typename?: 'AutopilotProposal';
  appliedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  mode: Scalars['String']['output'];
  moves: Array<AutopilotMove>;
  status: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  trigger?: Maybe<Scalars['String']['output']>;
};

export type AutopilotStatus = {
  __typename?: 'AutopilotStatus';
  enabled: Scalars['Boolean']['output'];
  mode: Scalars['String']['output'];
  pending?: Maybe<AutopilotProposal>;
  recent: Array<AutopilotProposal>;
};

export type AvailabilitySchedule = {
  __typename?: 'AvailabilitySchedule';
  friday: Array<TimeSlot>;
  monday: Array<TimeSlot>;
  saturday: Array<TimeSlot>;
  sunday: Array<TimeSlot>;
  thursday: Array<TimeSlot>;
  tuesday: Array<TimeSlot>;
  wednesday: Array<TimeSlot>;
};

export type AvailabilityScheduleInput = {
  friday?: InputMaybe<Array<TimeSlotInput>>;
  monday?: InputMaybe<Array<TimeSlotInput>>;
  saturday?: InputMaybe<Array<TimeSlotInput>>;
  sunday?: InputMaybe<Array<TimeSlotInput>>;
  thursday?: InputMaybe<Array<TimeSlotInput>>;
  tuesday?: InputMaybe<Array<TimeSlotInput>>;
  wednesday?: InputMaybe<Array<TimeSlotInput>>;
};

export type AvailabilitySettings = {
  __typename?: 'AvailabilitySettings';
  schedule: AvailabilitySchedule;
  timezone: Scalars['String']['output'];
};

export type AvailabilitySettingsInput = {
  schedule: AvailabilityScheduleInput;
  timezone: Scalars['String']['input'];
};

export type BillingInfo = {
  __typename?: 'BillingInfo';
  invoices: Array<Invoice>;
  paymentMethod?: Maybe<PaymentMethod>;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  upcomingInvoice?: Maybe<UpcomingInvoice>;
};

export type BillingInterval =
  | 'MONTHLY'
  | 'YEARLY';

export type BillingPortalSession = {
  __typename?: 'BillingPortalSession';
  url: Scalars['String']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  attendeeEmail: Scalars['String']['output'];
  attendeeName: Scalars['String']['output'];
  attendeePhone?: Maybe<Scalars['String']['output']>;
  calendarEventId?: Maybe<Scalars['String']['output']>;
  cancelReason?: Maybe<Scalars['String']['output']>;
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customResponses?: Maybe<Scalars['JSON']['output']>;
  endTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  link: SchedulingLink;
  linkId: Scalars['ID']['output'];
  meetingUrl?: Maybe<Scalars['String']['output']>;
  reminderSent: Scalars['Boolean']['output'];
  startTime: Scalars['DateTime']['output'];
  status: BookingStatus;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BookingStatus =
  | 'CANCELED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'PENDING';

export type BreakTime = {
  __typename?: 'BreakTime';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type BreakTimeInput = {
  end: Scalars['String']['input'];
  start: Scalars['String']['input'];
};

export type BulkDeleteResult = {
  __typename?: 'BulkDeleteResult';
  count: Scalars['Int']['output'];
};

export type BusySlot = {
  __typename?: 'BusySlot';
  end: Scalars['DateTime']['output'];
  start: Scalars['DateTime']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type CalculateSleepInput = {
  timezone: Scalars['String']['input'];
  wakeTime: Scalars['String']['input'];
};

export type CalculateTravelTimeInput = {
  departureTime?: InputMaybe<Scalars['DateTime']['input']>;
  fromLocation: Scalars['String']['input'];
  mode?: InputMaybe<TravelMode>;
  toLocation: Scalars['String']['input'];
};

export type CalendarAuthPayload = {
  __typename?: 'CalendarAuthPayload';
  provider?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type CalendarConnection = {
  __typename?: 'CalendarConnection';
  calendarId?: Maybe<Scalars['String']['output']>;
  calendarName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  events: Array<CalendarEvent>;
  id: Scalars['ID']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastSyncAt?: Maybe<Scalars['DateTime']['output']>;
  provider: CalendarProvider;
  syncEnabled: Scalars['Boolean']['output'];
  syncErrors: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};


export type CalendarConnectionEventsArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CalendarDefense = {
  __typename?: 'CalendarDefense';
  autoAcceptDuringOpenHours: Scalars['Boolean']['output'];
  autoDeclineDoubleBookings: Scalars['Boolean']['output'];
  autoDeclineDuringFocusTime: Scalars['Boolean']['output'];
  autoDeclineOutsideWorkHours: Scalars['Boolean']['output'];
  bufferMinutes: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultMeetingDuration: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  minimumNoticeHours: Scalars['Int']['output'];
  requireBufferBetweenMeetings: Scalars['Boolean']['output'];
  requireMinimumNotice: Scalars['Boolean']['output'];
  suggestShorterMeetings: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type CalendarDefenseLogEntry = {
  __typename?: 'CalendarDefenseLogEntry';
  action: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  eventId: Scalars['String']['output'];
  eventStart: Scalars['DateTime']['output'];
  eventTitle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  provider: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export type CalendarDefenseRunResult = {
  __typename?: 'CalendarDefenseRunResult';
  actions: Scalars['Int']['output'];
};

export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  allDay: Scalars['Boolean']['output'];
  attendees: Array<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  end: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  source: CalendarProvider;
  start: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type CalendarIntegration = {
  __typename?: 'CalendarIntegration';
  email?: Maybe<Scalars['String']['output']>;
  isConnected: Scalars['Boolean']['output'];
  lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  provider: CalendarProvider;
};

export type CalendarProvider =
  | 'APPLE'
  | 'GOOGLE'
  | 'OUTLOOK';

export type CheckoutSession = {
  __typename?: 'CheckoutSession';
  sessionId: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CompleteOnboardingInput = {
  context: UserContext;
  firstGoalDescription?: InputMaybe<Scalars['String']['input']>;
  firstGoalTitle: Scalars['String']['input'];
  focusAreas: Array<FocusArea>;
  timezone: Scalars['String']['input'];
  wakeTime: Scalars['String']['input'];
};

export type ConnectCalendarInput = {
  code: Scalars['String']['input'];
  provider: CalendarProvider;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type ConnectIntegrationInput = {
  authCode?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  type: IntegrationType;
};

export type CreateAiMemoryInput = {
  confidence?: InputMaybe<Scalars['Float']['input']>;
  content: Scalars['JSON']['input'];
  memoryType: MemoryType;
};

export type CreateApiKeyInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  name: Scalars['String']['input'];
  scopes: Array<ApiScope>;
};

export type CreateBookingInput = {
  attendeeEmail: Scalars['String']['input'];
  attendeeName: Scalars['String']['input'];
  attendeePhone?: InputMaybe<Scalars['String']['input']>;
  customResponses?: InputMaybe<Scalars['JSON']['input']>;
  linkId: Scalars['ID']['input'];
  startTime: Scalars['DateTime']['input'];
  timezone: Scalars['String']['input'];
};

export type CreateCalendarEventInput = {
  allDay?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  end: Scalars['DateTime']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  start: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
};

export type CreateFocusTimeBlockInput = {
  autoSchedule?: InputMaybe<Scalars['Boolean']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  daysOfWeek: Array<Scalars['Int']['input']>;
  durationMinutes: Scalars['Int']['input'];
  frequency: FocusFrequency;
  preferredTimeSlots?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  protected?: InputMaybe<Scalars['Boolean']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateGoalInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes: Scalars['Int']['input'];
  emoji?: InputMaybe<Scalars['String']['input']>;
  flexibilityScore?: InputMaybe<Scalars['Int']['input']>;
  frequencyPerWeek: Scalars['Int']['input'];
  preferredTimes?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type CreateHabitInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  durationMinutes: Scalars['Int']['input'];
  flexible?: InputMaybe<Scalars['Boolean']['input']>;
  preferredWindowEnd: Scalars['String']['input'];
  preferredWindowStart: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type CreateKanbanBoardInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateNoMeetingDayInput = {
  allowExceptions?: InputMaybe<Scalars['Boolean']['input']>;
  dayOfWeek: Scalars['Int']['input'];
};

/** Input for creating a plan manually */
export type CreatePlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  goalIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
  weekStartDate: Scalars['DateTime']['input'];
};

/** Input for creating a plan template */
export type CreatePlanTemplateInput = {
  category: Scalars['String']['input'];
  description: Scalars['String']['input'];
  emoji?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  structure: Scalars['JSON']['input'];
  tags: Array<Scalars['String']['input']>;
};

export type CreateProjectInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  targetDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateSchedulingLinkInput = {
  availability: AvailabilitySettingsInput;
  bufferAfter?: InputMaybe<Scalars['Int']['input']>;
  bufferBefore?: InputMaybe<Scalars['Int']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  confirmationMessage?: InputMaybe<Scalars['String']['input']>;
  customQuestions?: InputMaybe<Array<CustomQuestionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration: Scalars['Int']['input'];
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  maxBookingsPerDay?: InputMaybe<Scalars['Int']['input']>;
  meetingType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  noticeTime?: InputMaybe<Scalars['Int']['input']>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  requiresConfirmation?: InputMaybe<Scalars['Boolean']['input']>;
  slug: Scalars['String']['input'];
};

export type CreateSmart1on1Input = {
  agendaTemplate?: InputMaybe<Scalars['String']['input']>;
  duration: Scalars['Int']['input'];
  frequency: Smart1on1Frequency;
  participantEmail: Scalars['String']['input'];
  preferredDays: Array<Scalars['Int']['input']>;
  preferredTimes: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateSubtaskInput = {
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  parentTaskId: Scalars['ID']['input'];
  scheduledDate?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreateTaskDependencyInput = {
  blockingTaskId: Scalars['ID']['input'];
  dependentTaskId: Scalars['ID']['input'];
  type?: InputMaybe<DependencyType>;
};

export type CreateTaskInput = {
  durationMinutes: Scalars['Int']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  recurrenceRule?: InputMaybe<RecurrenceRuleInput>;
  scheduledDate: Scalars['DateTime']['input'];
  startTime: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type CreateTeamInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWebhookInput = {
  events: Array<WebhookEvent>;
  secret?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type CustomQuestion = {
  __typename?: 'CustomQuestion';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  required: Scalars['Boolean']['output'];
  type: QuestionType;
};

export type CustomQuestionInput = {
  label: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  required: Scalars['Boolean']['input'];
  type: QuestionType;
};

export type DailyRitual = {
  __typename?: 'DailyRitual';
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  intention?: Maybe<Scalars['String']['output']>;
  planCompleted: Scalars['Boolean']['output'];
  reflection?: Maybe<Scalars['String']['output']>;
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  activeGoals: Scalars['Int']['output'];
  averagePlanQuality?: Maybe<Scalars['Float']['output']>;
  currentStreak: Scalars['Int']['output'];
  goalsMilestones: Scalars['Int']['output'];
  longestStreak: Scalars['Int']['output'];
  todayCompleted: Scalars['Int']['output'];
  todayCompletionRate: Scalars['Float']['output'];
  todayTasks: Scalars['Int']['output'];
  totalPlans: Scalars['Int']['output'];
  weekCompleted: Scalars['Int']['output'];
  weekCompletionRate: Scalars['Float']['output'];
  weekTasks: Scalars['Int']['output'];
};

export type DateRangeInput = {
  end: Scalars['DateTime']['input'];
  start: Scalars['DateTime']['input'];
};

export type DaySchedule = {
  __typename?: 'DaySchedule';
  breakTimes: Array<BreakTime>;
  endTime?: Maybe<Scalars['String']['output']>;
  isWorkDay: Scalars['Boolean']['output'];
  startTime?: Maybe<Scalars['String']['output']>;
};

export type DayScheduleInput = {
  breakTimes?: InputMaybe<Array<BreakTimeInput>>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  isWorkDay: Scalars['Boolean']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type DeletedProject = {
  __typename?: 'DeletedProject';
  id: Scalars['ID']['output'];
};

export type DeliveryStatus =
  | 'FAILED'
  | 'PENDING'
  | 'SUCCESS';

export type DependencyType =
  | 'BLOCKED_BY'
  | 'BLOCKS'
  | 'RELATED_TO';

export type EnergyPattern =
  | 'BALANCED'
  | 'MORNING_PERSON'
  | 'NIGHT_OWL';

export type FeatureLimits = {
  __typename?: 'FeatureLimits';
  advancedInsights: Scalars['Boolean']['output'];
  aiGenerations: Scalars['Int']['output'];
  aiModel: Scalars['String']['output'];
  aiPlansPerMonth?: Maybe<Scalars['Int']['output']>;
  apiAccess: Scalars['Boolean']['output'];
  calendarSync: Scalars['Boolean']['output'];
  customBranding: Scalars['Boolean']['output'];
  maxActiveGoals: Scalars['Int']['output'];
  maxGoals: Scalars['Int']['output'];
  maxProjects?: Maybe<Scalars['Int']['output']>;
  maxTasks?: Maybe<Scalars['Int']['output']>;
  maxTasksPerPlan: Scalars['Int']['output'];
  offlineMode: Scalars['Boolean']['output'];
  plansPerMonth: Scalars['Int']['output'];
  plansPerWeek: Scalars['Int']['output'];
  prioritySupport: Scalars['Boolean']['output'];
  tasksPerDay: Scalars['Int']['output'];
  teamMembers?: Maybe<Scalars['Int']['output']>;
  teamWorkspaces: Scalars['Boolean']['output'];
};

export type FocusArea =
  | 'BUSINESS'
  | 'CAREER'
  | 'CREATIVE'
  | 'FAMILY'
  | 'HEALTH'
  | 'HOBBIES'
  | 'HOME'
  | 'JOB_SEARCH'
  | 'LEARNING'
  | 'WRITING';

export type FocusFrequency =
  | 'CUSTOM'
  | 'DAILY'
  | 'WEEKDAYS'
  | 'WEEKLY';

export type FocusTimeBlock = {
  __typename?: 'FocusTimeBlock';
  autoSchedule: Scalars['Boolean']['output'];
  calendarProvider?: Maybe<Scalars['String']['output']>;
  calendarSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  daysOfWeek: Array<Scalars['Int']['output']>;
  durationMinutes: Scalars['Int']['output'];
  frequency: FocusFrequency;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  preferredTimeSlots: Array<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  protected: Scalars['Boolean']['output'];
  startTime?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

/** Input for generating a plan from a template */
export type GenerateFromTemplateInput = {
  templateId: Scalars['ID']['input'];
  weekStartDate: Scalars['String']['input'];
};

/** Input for generating a new plan */
export type GeneratePlanInput = {
  aiModel?: InputMaybe<Scalars['String']['input']>;
  goalIds: Array<Scalars['ID']['input']>;
  preferences?: InputMaybe<PlanPreferencesInput>;
  title?: InputMaybe<Scalars['String']['input']>;
  weekStartDate: Scalars['DateTime']['input'];
};

export type GetGoalSuggestionsInput = {
  context: UserContext;
  focusAreas: Array<FocusArea>;
};

export type Goal = {
  __typename?: 'Goal';
  color?: Maybe<Scalars['String']['output']>;
  completionRate?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentProgress?: Maybe<Scalars['Float']['output']>;
  currentStreak?: Maybe<Scalars['Int']['output']>;
  deadline?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  emoji?: Maybe<Scalars['String']['output']>;
  flexibilityScore?: Maybe<Scalars['Int']['output']>;
  frequencyPerWeek?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isArchived?: Maybe<Scalars['Boolean']['output']>;
  isPaused?: Maybe<Scalars['Boolean']['output']>;
  lastCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  longestStreak?: Maybe<Scalars['Int']['output']>;
  pausedUntil?: Maybe<Scalars['DateTime']['output']>;
  preferredTimes?: Maybe<Array<Scalars['String']['output']>>;
  priority?: Maybe<Scalars['Int']['output']>;
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['ID']['output']>;
  targetMetric?: Maybe<Scalars['String']['output']>;
  targetValue?: Maybe<Scalars['Float']['output']>;
  taskCount?: Maybe<Scalars['Int']['output']>;
  tasks: Array<Task>;
  title: Scalars['String']['output'];
  totalCompletions?: Maybe<Scalars['Int']['output']>;
  totalScheduled?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type GoalAnalytics = {
  __typename?: 'GoalAnalytics';
  averageDuration: Scalars['Float']['output'];
  bestTimeOfDay?: Maybe<Scalars['String']['output']>;
  completionRate: Scalars['Float']['output'];
  goalId: Scalars['ID']['output'];
  streakData: StreakData;
  totalCompletions: Scalars['Int']['output'];
  weeklyProgress: Array<WeeklyProgress>;
};

export type GoalAnalyticsReport = {
  __typename?: 'GoalAnalyticsReport';
  averageDuration?: Maybe<Scalars['Float']['output']>;
  bestTimeOfDay?: Maybe<Scalars['String']['output']>;
  completionRate: Scalars['Float']['output'];
  currentStreak: Scalars['Int']['output'];
  goal: Goal;
  goalId: Scalars['ID']['output'];
  longestStreak: Scalars['Int']['output'];
  totalCompletions: Scalars['Int']['output'];
  totalScheduled: Scalars['Int']['output'];
  weeklyProgress: Array<WeeklyGoalProgress>;
};

export type GoalOrderBy =
  | 'COMPLETION_RATE_ASC'
  | 'COMPLETION_RATE_DESC'
  | 'CREATED_ASC'
  | 'CREATED_DESC'
  | 'PRIORITY_ASC'
  | 'PRIORITY_DESC';

export type GoalSuggestion = {
  __typename?: 'GoalSuggestion';
  context: UserContext;
  description: Scalars['String']['output'];
  focusArea: FocusArea;
  title: Scalars['String']['output'];
};

export type Habit = {
  __typename?: 'Habit';
  calendarProvider?: Maybe<Scalars['String']['output']>;
  calendarSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  daysOfWeek: Array<Scalars['Int']['output']>;
  durationMinutes: Scalars['Int']['output'];
  flexible: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  preferredWindowEnd: Scalars['String']['output'];
  preferredWindowStart: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ImportPmTaskInput = {
  dueDate?: InputMaybe<Scalars['String']['input']>;
  externalId: Scalars['String']['input'];
  integrationId: Scalars['ID']['input'];
  source: Scalars['String']['input'];
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type Integration = {
  __typename?: 'Integration';
  config?: Maybe<Scalars['JSON']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastSyncAt?: Maybe<Scalars['DateTime']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  type: IntegrationType;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type IntegrationResource = {
  __typename?: 'IntegrationResource';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type IntegrationType =
  | 'ASANA'
  | 'CUSTOM'
  | 'GITHUB'
  | 'GOOGLE_MEET'
  | 'JIRA'
  | 'LINEAR'
  | 'NOTION'
  | 'SLACK'
  | 'TODOIST'
  | 'ZAPIER'
  | 'ZOOM';

export type InviteTeamMemberInput = {
  email: Scalars['String']['input'];
  role: TeamRole;
  teamId: Scalars['ID']['input'];
};

export type Invoice = {
  __typename?: 'Invoice';
  amountDue: Scalars['Int']['output'];
  amountPaid: Scalars['Int']['output'];
  created: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  hostedInvoiceUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  invoicePdf?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type KanbanBoard = {
  __typename?: 'KanbanBoard';
  columns: Array<KanbanColumn>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  projectId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type KanbanColumn = {
  __typename?: 'KanbanColumn';
  boardId: Scalars['ID']['output'];
  color: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  taskIds: Array<Scalars['ID']['output']>;
  tasks: Array<Task>;
};

export type MemberStatus =
  | 'ACTIVE'
  | 'INVITED'
  | 'SUSPENDED';

export type MemoryType =
  | 'AVOIDANCE_PATTERN'
  | 'COMPLETION_PATTERN'
  | 'CONTEXT_PREFERENCE'
  | 'ENERGY_INSIGHT'
  | 'TIME_PREFERENCE';

export type MoveTaskInKanbanInput = {
  fromColumnId?: InputMaybe<Scalars['ID']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  taskId: Scalars['ID']['input'];
  toColumnId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Accept a generated plan */
  acceptPlan: Plan;
  acceptTeamInvitation: TeamMember;
  applyAutopilotProposal: AutopilotProposal;
  archiveProject: Project;
  bulkDeleteTasks: BulkDeleteResult;
  bulkUpdateTasks: Array<Task>;
  calculateProductivityScore: ProductivityScore;
  calculateTravelTime: TravelTime;
  cancelBooking: Booking;
  cancelSubscription: UserSubscription;
  completeOnboarding: OnboardingResult;
  completeTask: Task;
  confirmBooking: Booking;
  connectCalendar: CalendarConnection;
  connectIntegration: Integration;
  createAiMemory: AiMemory;
  createApiKey: ApiKeyWithSecret;
  createBillingPortalSession: BillingPortalSession;
  createBooking: Booking;
  createCalendarEvent: CalendarEvent;
  createCheckoutSession: CheckoutSession;
  createFocusTimeBlock: FocusTimeBlock;
  createGoal: Goal;
  createHabit: Habit;
  createKanbanBoard: KanbanBoard;
  createNoMeetingDay: NoMeetingDay;
  /** Create a plan manually */
  createPlan: Plan;
  /** Create a plan template */
  createPlanTemplate: PlanTemplate;
  createProject: Project;
  createSchedulingLink: SchedulingLink;
  createSmart1on1: Smart1on1;
  createSubtask: Task;
  createTask: Task;
  createTaskDependency: TaskDependency;
  createTeam: Team;
  createWebhook: Webhook;
  deleteAiMemory: Scalars['Boolean']['output'];
  deleteApiKey: Scalars['Boolean']['output'];
  deleteCalendarEvent: Scalars['Boolean']['output'];
  deleteFocusTimeBlock: Scalars['Boolean']['output'];
  deleteGoal: Scalars['Boolean']['output'];
  deleteHabit: Scalars['Boolean']['output'];
  deleteKanbanBoard: Scalars['Boolean']['output'];
  deleteMyAccount: Scalars['Boolean']['output'];
  deleteNoMeetingDay: Scalars['Boolean']['output'];
  /** Delete a plan */
  deletePlan: Plan;
  /** Delete a plan template */
  deletePlanTemplate: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteSchedulingLink: Scalars['Boolean']['output'];
  deleteSmart1on1: Scalars['Boolean']['output'];
  deleteTask: Scalars['Boolean']['output'];
  deleteTaskDependency: Scalars['Boolean']['output'];
  deleteTeam: Scalars['Boolean']['output'];
  deleteWebhook: Scalars['Boolean']['output'];
  disconnectCalendar: Scalars['Boolean']['output'];
  disconnectIntegration: Scalars['Boolean']['output'];
  dismissAutopilotProposal: AutopilotProposal;
  generateInsights: Array<Scalars['String']['output']>;
  /** Generate a new plan using AI */
  generatePlan: Plan;
  /** Generate a new plan from a template */
  generatePlanFromTemplate: Plan;
  importPmTasks: PmImportResult;
  initiateCalendarAuth: CalendarAuthPayload;
  initiateIntegrationOAuth: OAuthRedirect;
  inviteTeamMember: TeamInvitation;
  logTime: TimeEntry;
  markNotificationAsRead: Scalars['Boolean']['output'];
  moveTaskInKanban: Scalars['Boolean']['output'];
  pauseGoal: Goal;
  redeemReferral: Scalars['Boolean']['output'];
  /** Regenerate a plan for the same week (creates a new draft) */
  regeneratePlan: Plan;
  registerPushToken: Scalars['Boolean']['output'];
  removeTeamMember: Scalars['Boolean']['output'];
  resumeGoal: Goal;
  resumeSubscription: UserSubscription;
  retryWebhookDelivery: WebhookDelivery;
  runAutopilot?: Maybe<AutopilotProposal>;
  runCalendarDefense: CalendarDefenseRunResult;
  /** Save an existing plan as a reusable template */
  saveAsPlanTemplate: PlanTemplate;
  scheduleSmart1on1: Smart1on1;
  sendTestPush: TestPushResult;
  /** Mark a template as the user's default */
  setDefaultPlanTemplate: PlanTemplate;
  shareGoalWithTeam: Scalars['Boolean']['output'];
  skipTask: Task;
  startTimer: TimeEntry;
  stopTimer: TimeEntry;
  syncAllCalendars: Array<SyncResult>;
  syncCalendar: SyncResult;
  syncIntegration: Integration;
  syncUser: User;
  toggleApiKey: ApiKey;
  toggleSchedulingLink: SchedulingLink;
  toggleWebhook: Webhook;
  unarchiveProject: Project;
  uncompleteTask: Task;
  unregisterPushToken: Scalars['Boolean']['output'];
  unshareGoalFromTeam: Scalars['Boolean']['output'];
  updateAutopilotSettings: AutopilotStatus;
  updateCalendarDefense: CalendarDefense;
  updateCalendarEvent: CalendarEvent;
  updateDailyRitual: DailyRitual;
  updateFocusTimeBlock: FocusTimeBlock;
  updateGoal: Goal;
  updateHabit: Habit;
  updateIntegration: Integration;
  updateKanbanBoard: KanbanBoard;
  updateNotificationPreferences: NotificationPreferences;
  /** Update onboarding progress (auto-save) */
  updateOnboardingProgress: Scalars['Boolean']['output'];
  updatePaymentMethod: PaymentMethod;
  /** Update a plan */
  updatePlan: Plan;
  updatePriorityHours: PriorityHours;
  updateProject: Project;
  updateSchedulingLink: SchedulingLink;
  updateSmart1on1: Smart1on1;
  updateTask: Task;
  updateTeam: Team;
  updateTeamMemberRole: TeamMember;
  updateUserProfile: User;
  updateUserSettings: UserSettings;
  updateWebhook: Webhook;
  updateWorkHours: WorkHours;
  upgradeSubscription: CheckoutSession;
};


export type MutationAcceptPlanArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAcceptTeamInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationApplyAutopilotProposalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationArchiveProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBulkDeleteTasksArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationBulkUpdateTasksArgs = {
  ids: Array<Scalars['ID']['input']>;
  input: UpdateTaskInput;
};


export type MutationCalculateProductivityScoreArgs = {
  date: Scalars['DateTime']['input'];
};


export type MutationCalculateTravelTimeArgs = {
  input: CalculateTravelTimeInput;
};


export type MutationCancelBookingArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCompleteOnboardingArgs = {
  input: CompleteOnboardingInput;
};


export type MutationCompleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationConfirmBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationConnectCalendarArgs = {
  input: ConnectCalendarInput;
};


export type MutationConnectIntegrationArgs = {
  input: ConnectIntegrationInput;
};


export type MutationCreateAiMemoryArgs = {
  input: CreateAiMemoryInput;
};


export type MutationCreateApiKeyArgs = {
  input: CreateApiKeyInput;
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateCalendarEventArgs = {
  input: CreateCalendarEventInput;
};


export type MutationCreateCheckoutSessionArgs = {
  interval: BillingInterval;
  tier: SubscriptionTier;
};


export type MutationCreateFocusTimeBlockArgs = {
  input: CreateFocusTimeBlockInput;
};


export type MutationCreateGoalArgs = {
  input: CreateGoalInput;
};


export type MutationCreateHabitArgs = {
  input: CreateHabitInput;
};


export type MutationCreateKanbanBoardArgs = {
  input: CreateKanbanBoardInput;
};


export type MutationCreateNoMeetingDayArgs = {
  input: CreateNoMeetingDayInput;
};


export type MutationCreatePlanArgs = {
  input: CreatePlanInput;
};


export type MutationCreatePlanTemplateArgs = {
  input: CreatePlanTemplateInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateSchedulingLinkArgs = {
  input: CreateSchedulingLinkInput;
};


export type MutationCreateSmart1on1Args = {
  input: CreateSmart1on1Input;
};


export type MutationCreateSubtaskArgs = {
  input: CreateSubtaskInput;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateTaskDependencyArgs = {
  input: CreateTaskDependencyInput;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
};


export type MutationCreateWebhookArgs = {
  input: CreateWebhookInput;
};


export type MutationDeleteAiMemoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteApiKeyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCalendarEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteFocusTimeBlockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteHabitArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteKanbanBoardArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNoMeetingDayArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePlanArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePlanTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSchedulingLinkArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSmart1on1Args = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskDependencyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTeamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDisconnectCalendarArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDisconnectIntegrationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDismissAutopilotProposalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGeneratePlanArgs = {
  input: GeneratePlanInput;
};


export type MutationGeneratePlanFromTemplateArgs = {
  input: GenerateFromTemplateInput;
};


export type MutationImportPmTasksArgs = {
  items: Array<ImportPmTaskInput>;
};


export type MutationInitiateCalendarAuthArgs = {
  provider: CalendarProvider;
};


export type MutationInitiateIntegrationOAuthArgs = {
  type: IntegrationType;
};


export type MutationInviteTeamMemberArgs = {
  input: InviteTeamMemberInput;
};


export type MutationLogTimeArgs = {
  date?: InputMaybe<Scalars['DateTime']['input']>;
  minutes: Scalars['Int']['input'];
  taskId: Scalars['ID']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveTaskInKanbanArgs = {
  input: MoveTaskInKanbanInput;
};


export type MutationPauseGoalArgs = {
  id: Scalars['ID']['input'];
  until?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationRedeemReferralArgs = {
  code: Scalars['String']['input'];
};


export type MutationRegeneratePlanArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegisterPushTokenArgs = {
  subscription: Scalars['JSON']['input'];
};


export type MutationRemoveTeamMemberArgs = {
  teamId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationResumeGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRetryWebhookDeliveryArgs = {
  deliveryId: Scalars['ID']['input'];
};


export type MutationRunAutopilotArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSaveAsPlanTemplateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  planId: Scalars['ID']['input'];
};


export type MutationScheduleSmart1on1Args = {
  id: Scalars['ID']['input'];
};


export type MutationSetDefaultPlanTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type MutationShareGoalWithTeamArgs = {
  goalId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationSkipTaskArgs = {
  id: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationStartTimerArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationStopTimerArgs = {
  taskId: Scalars['ID']['input'];
};


export type MutationSyncCalendarArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSyncIntegrationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSyncUserArgs = {
  input: SyncUserInput;
};


export type MutationToggleApiKeyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleSchedulingLinkArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnarchiveProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUncompleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnregisterPushTokenArgs = {
  endpoint: Scalars['String']['input'];
};


export type MutationUnshareGoalFromTeamArgs = {
  goalId: Scalars['ID']['input'];
};


export type MutationUpdateAutopilotSettingsArgs = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCalendarDefenseArgs = {
  input: UpdateCalendarDefenseInput;
};


export type MutationUpdateCalendarEventArgs = {
  id: Scalars['String']['input'];
  input: UpdateCalendarEventInput;
};


export type MutationUpdateDailyRitualArgs = {
  input: UpdateDailyRitualInput;
};


export type MutationUpdateFocusTimeBlockArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFocusTimeBlockInput;
};


export type MutationUpdateGoalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGoalInput;
};


export type MutationUpdateHabitArgs = {
  id: Scalars['ID']['input'];
  input: UpdateHabitInput;
};


export type MutationUpdateIntegrationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateIntegrationInput;
};


export type MutationUpdateKanbanBoardArgs = {
  id: Scalars['ID']['input'];
  input: UpdateKanbanBoardInput;
};


export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};


export type MutationUpdateOnboardingProgressArgs = {
  input: UpdateOnboardingProgressInput;
};


export type MutationUpdatePaymentMethodArgs = {
  paymentMethodId: Scalars['String']['input'];
};


export type MutationUpdatePlanArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePlanInput;
};


export type MutationUpdatePriorityHoursArgs = {
  input: UpdatePriorityHoursInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdateSchedulingLinkArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSchedulingLinkInput;
};


export type MutationUpdateSmart1on1Args = {
  id: Scalars['ID']['input'];
  input: UpdateSmart1on1Input;
};


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTaskInput;
};


export type MutationUpdateTeamArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeamInput;
};


export type MutationUpdateTeamMemberRoleArgs = {
  role: TeamRole;
  teamId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUpdateUserSettingsArgs = {
  input: UpdateUserSettingsInput;
};


export type MutationUpdateWebhookArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWebhookInput;
};


export type MutationUpdateWorkHoursArgs = {
  input: WorkHoursInput;
};


export type MutationUpgradeSubscriptionArgs = {
  tier: SubscriptionTier;
};

export type NoMeetingDay = {
  __typename?: 'NoMeetingDay';
  allowExceptions: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  dayOfWeek: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
  userId: Scalars['ID']['output'];
};

export type NotificationPreferences = {
  __typename?: 'NotificationPreferences';
  createdAt: Scalars['DateTime']['output'];
  enableBreakReminders: Scalars['Boolean']['output'];
  enableDailyReminders: Scalars['Boolean']['output'];
  enableFocusTimeAlerts: Scalars['Boolean']['output'];
  enableGoalMilestones: Scalars['Boolean']['output'];
  enableOverbookedAlerts: Scalars['Boolean']['output'];
  enableTaskReminders: Scalars['Boolean']['output'];
  enableUpcomingMeetings: Scalars['Boolean']['output'];
  enableWeeklyPlan: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  quietHoursEnd?: Maybe<Scalars['String']['output']>;
  quietHoursStart?: Maybe<Scalars['String']['output']>;
  reminderMinutesBefore: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type NotificationSettings = {
  __typename?: 'NotificationSettings';
  email?: Maybe<Scalars['Boolean']['output']>;
  goalMilestones?: Maybe<Scalars['Boolean']['output']>;
  planReminders?: Maybe<Scalars['Boolean']['output']>;
  productivityInsights?: Maybe<Scalars['Boolean']['output']>;
  push?: Maybe<Scalars['Boolean']['output']>;
  reminders?: Maybe<Scalars['Boolean']['output']>;
  taskReminders?: Maybe<Scalars['Boolean']['output']>;
  weeklySummary?: Maybe<Scalars['Boolean']['output']>;
};

export type NotificationSettingsInput = {
  email?: InputMaybe<Scalars['Boolean']['input']>;
  goalMilestones?: InputMaybe<Scalars['Boolean']['input']>;
  planReminders?: InputMaybe<Scalars['Boolean']['input']>;
  productivityInsights?: InputMaybe<Scalars['Boolean']['input']>;
  taskReminders?: InputMaybe<Scalars['Boolean']['input']>;
  weeklySummary?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NotificationType =
  | 'BACK_TO_BACK_MEETINGS'
  | 'FOCUS_TIME_CONFLICT'
  | 'GOAL_PROGRESS'
  | 'MISSING_BREAKS'
  | 'OVERBOOKED_DAY'
  | 'TASK_DUE_SOON'
  | 'UPCOMING_MEETING'
  | 'WEEKLY_SUMMARY'
  | 'WORK_HOURS_VIOLATION';

export type OAuthRedirect = {
  __typename?: 'OAuthRedirect';
  url: Scalars['String']['output'];
};

export type OnboardingResult = {
  __typename?: 'OnboardingResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type OnboardingStatus = {
  __typename?: 'OnboardingStatus';
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  currentStep?: Maybe<Scalars['Int']['output']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  brand: Scalars['String']['output'];
  expMonth: Scalars['Int']['output'];
  expYear: Scalars['Int']['output'];
  last4: Scalars['String']['output'];
};

/** Weekly plan generated by AI */
export type Plan = {
  __typename?: 'Plan';
  aiModel?: Maybe<Scalars['String']['output']>;
  completedTasks: Scalars['Int']['output'];
  completionRate: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  generationTime?: Maybe<Scalars['Float']['output']>;
  goals: Array<Goal>;
  id: Scalars['ID']['output'];
  qualityMetrics?: Maybe<Scalars['JSON']['output']>;
  qualityScore?: Maybe<Scalars['Int']['output']>;
  reasoning?: Maybe<Scalars['JSON']['output']>;
  status: PlanStatus;
  tasks: Array<Task>;
  title: Scalars['String']['output'];
  totalTasks: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  weekEndDate: Scalars['DateTime']['output'];
  weekStartDate: Scalars['DateTime']['output'];
};

/** Filter plans */
export type PlanFilterInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<PlanStatus>;
};

/** Plan generation preferences */
export type PlanPreferencesInput = {
  avoidWeekends?: InputMaybe<Scalars['Boolean']['input']>;
  bufferTime?: InputMaybe<Scalars['Int']['input']>;
  focusBlockDuration?: InputMaybe<Scalars['Int']['input']>;
  prioritizeMornings?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Plan status enum */
export type PlanStatus =
  | 'ACCEPTED'
  | 'APPLIED'
  | 'ARCHIVED'
  | 'DRAFT';

/** Plan template for marketplace */
export type PlanTemplate = {
  __typename?: 'PlanTemplate';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  creator: User;
  description: Scalars['String']['output'];
  emoji?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  rating?: Maybe<Scalars['Float']['output']>;
  structure: Scalars['JSON']['output'];
  tags: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
};

export type PmImportResult = {
  __typename?: 'PmImportResult';
  imported: Scalars['Int']['output'];
};

export type PmInboxTask = {
  __typename?: 'PmInboxTask';
  alreadyImported: Scalars['Boolean']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  externalId: Scalars['String']['output'];
  integrationId: Scalars['ID']['output'];
  source: Scalars['String']['output'];
  title: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type PriorityHours = {
  __typename?: 'PriorityHours';
  createdAt: Scalars['DateTime']['output'];
  deprioritizeMeetings: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  prioritizeFocusTime: Scalars['Boolean']['output'];
  prioritizeTasks: Scalars['Boolean']['output'];
  timeSlots: Array<PriorityTimeSlot>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type PriorityTimeSlot = {
  __typename?: 'PriorityTimeSlot';
  dayOfWeek: Scalars['Int']['output'];
  endTime: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
};

export type PriorityTimeSlotInput = {
  dayOfWeek: Scalars['Int']['input'];
  endTime: Scalars['String']['input'];
  priority: Scalars['Int']['input'];
  startTime: Scalars['String']['input'];
};

export type ProductivityScore = {
  __typename?: 'ProductivityScore';
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  focusTimeScore: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  insights: Array<Scalars['String']['output']>;
  meetingEfficiencyScore: Scalars['Int']['output'];
  overallScore: Scalars['Int']['output'];
  recommendations: Array<Scalars['String']['output']>;
  taskCompletionScore: Scalars['Int']['output'];
  totalBreakMinutes: Scalars['Int']['output'];
  totalFocusMinutes: Scalars['Int']['output'];
  totalMeetingMinutes: Scalars['Int']['output'];
  totalTaskMinutes: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
  workLifeBalanceScore: Scalars['Int']['output'];
};

export type ProductivityWindow = {
  __typename?: 'ProductivityWindow';
  end: Scalars['String']['output'];
  peak: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type Project = {
  __typename?: 'Project';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  color: Scalars['String']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedTaskCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  goals: Array<Goal>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  kanbanBoards: Array<KanbanBoard>;
  name: Scalars['String']['output'];
  progressPercentage: Scalars['Float']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  targetDate?: Maybe<Scalars['DateTime']['output']>;
  taskCount: Scalars['Int']['output'];
  tasks: Array<Task>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type ProjectOrderBy =
  | 'CREATED_ASC'
  | 'CREATED_DESC'
  | 'NAME_ASC'
  | 'NAME_DESC'
  | 'PROGRESS_DESC';

export type ProjectWithStats = {
  __typename?: 'ProjectWithStats';
  color: Scalars['String']['output'];
  completedTaskCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  goalCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  progressPercentage: Scalars['Float']['output'];
  taskCount: Scalars['Int']['output'];
  totalEstimatedMinutes: Scalars['Int']['output'];
  totalTrackedMinutes: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  aiMemories: Array<AiMemory>;
  apiKey?: Maybe<ApiKey>;
  apiKeys: Array<ApiKey>;
  autopilotStatus: AutopilotStatus;
  availableSlots: Array<TimeSlot>;
  billingInfo?: Maybe<BillingInfo>;
  booking?: Maybe<Booking>;
  bookings: Array<Booking>;
  busySlots: Array<BusySlot>;
  /** Calculate optimal sleep schedule based on wake time */
  calculateSleepRecommendation: SleepRecommendation;
  calendarConnection: CalendarConnection;
  calendarConnections: Array<CalendarConnection>;
  calendarDefense?: Maybe<CalendarDefense>;
  calendarDefenseLog: Array<CalendarDefenseLogEntry>;
  calendarEvents: Array<CalendarEvent>;
  canUseFeature: Scalars['Boolean']['output'];
  /** Get current week's plan */
  currentPlan?: Maybe<Plan>;
  dailyRitual?: Maybe<DailyRitual>;
  dashboardStats: DashboardStats;
  exportMyData: Scalars['JSON']['output'];
  focusTimeBlock?: Maybe<FocusTimeBlock>;
  focusTimeBlocks: Array<FocusTimeBlock>;
  /** Get AI-powered goal suggestions based on user context */
  getGoalSuggestions: Array<GoalSuggestion>;
  goal?: Maybe<Goal>;
  goalAnalytics: GoalAnalytics;
  goalAnalyticsReport: GoalAnalyticsReport;
  goals: Array<Goal>;
  habits: Array<Habit>;
  insights: Array<Scalars['String']['output']>;
  integration?: Maybe<Integration>;
  integrationResources: Array<IntegrationResource>;
  integrations: Array<Integration>;
  kanbanBoard?: Maybe<KanbanBoard>;
  kanbanBoards: Array<KanbanBoard>;
  me?: Maybe<User>;
  myReferralStats: ReferralStats;
  noMeetingDays: Array<NoMeetingDay>;
  notificationPreferences?: Maybe<NotificationPreferences>;
  notifications: Array<Notification>;
  onboardingStatus: OnboardingStatus;
  /** Get single plan by ID */
  plan?: Maybe<Plan>;
  /** Get single plan template */
  planTemplate?: Maybe<PlanTemplate>;
  /** Get plan templates */
  planTemplates: Array<PlanTemplate>;
  /** Get all plans for current user */
  plans: Array<Plan>;
  pmInboxTasks: Array<PmInboxTask>;
  priorityHours?: Maybe<PriorityHours>;
  productivityScore?: Maybe<ProductivityScore>;
  productivityScores: Array<ProductivityScore>;
  project?: Maybe<Project>;
  projectWithStats: ProjectWithStats;
  projects: Array<Project>;
  quickActions: Array<QuickAction>;
  recentActivity: Array<RecentActivity>;
  rescheduleSuggestion?: Maybe<RescheduleSuggestion>;
  schedulingLink?: Maybe<SchedulingLink>;
  schedulingLinkBySlug?: Maybe<SchedulingLink>;
  schedulingLinks: Array<SchedulingLink>;
  searchTasks: Array<Task>;
  smart1on1?: Maybe<Smart1on1>;
  smart1on1s: Array<Smart1on1>;
  subscription?: Maybe<UserSubscription>;
  subtasks: Array<Task>;
  task?: Maybe<Task>;
  taskWithDependencies: TaskWithDependencies;
  tasks: Array<Task>;
  tasksByGoal: Array<Task>;
  tasksByProject: Array<Task>;
  team?: Maybe<Team>;
  teamDashboard: TeamDashboard;
  teamGoals: Array<TeamGoal>;
  teamInvitations: Array<TeamInvitation>;
  teamMembers: Array<TeamMember>;
  teams: Array<Team>;
  upcomingEvents: Array<CalendarEvent>;
  upcomingTasks: Array<UpcomingTask>;
  usageStats: UsageStats;
  user?: Maybe<User>;
  userSettings?: Maybe<UserSettings>;
  webhook?: Maybe<Webhook>;
  webhookDeliveries: Array<WebhookDelivery>;
  webhooks: Array<Webhook>;
  weekOverview: Array<WeekOverview>;
  weeklyReview: WeeklyReview;
  weeklyStats: WeeklyStats;
  workHours?: Maybe<WorkHours>;
};


export type QueryApiKeyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAvailableSlotsArgs = {
  date: Scalars['DateTime']['input'];
  linkId: Scalars['ID']['input'];
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingsArgs = {
  linkId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<BookingStatus>;
};


export type QueryBusySlotsArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryCalculateSleepRecommendationArgs = {
  input: CalculateSleepInput;
};


export type QueryCalendarConnectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCalendarDefenseLogArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCalendarEventsArgs = {
  calendarIds?: InputMaybe<Array<Scalars['String']['input']>>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryCanUseFeatureArgs = {
  feature: Scalars['String']['input'];
};


export type QueryDailyRitualArgs = {
  date: Scalars['String']['input'];
};


export type QueryFocusTimeBlockArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFocusTimeBlocksArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetGoalSuggestionsArgs = {
  input: GetGoalSuggestionsInput;
};


export type QueryGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGoalAnalyticsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGoalAnalyticsReportArgs = {
  goalId: Scalars['ID']['input'];
};


export type QueryGoalsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPaused?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<GoalOrderBy>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInsightsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryIntegrationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryIntegrationResourcesArgs = {
  id: Scalars['ID']['input'];
};


export type QueryIntegrationsArgs = {
  type?: InputMaybe<IntegrationType>;
};


export type QueryKanbanBoardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryKanbanBoardsArgs = {
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryNoMeetingDaysArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryNotificationsArgs = {
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPlanArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlanTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlanTemplatesArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlansArgs = {
  filter?: InputMaybe<PlanFilterInput>;
};


export type QueryProductivityScoreArgs = {
  date: Scalars['DateTime']['input'];
};


export type QueryProductivityScoresArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectWithStatsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectsArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<ProjectOrderBy>;
};


export type QueryRecentActivityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRescheduleSuggestionArgs = {
  taskId: Scalars['ID']['input'];
};


export type QuerySchedulingLinkArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySchedulingLinkBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QuerySearchTasksArgs = {
  query: Scalars['String']['input'];
};


export type QuerySmart1on1Args = {
  id: Scalars['ID']['input'];
};


export type QuerySubtasksArgs = {
  parentTaskId: Scalars['ID']['input'];
};


export type QueryTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaskWithDependenciesArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTasksArgs = {
  filter?: InputMaybe<TaskFilterInput>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  orderBy?: InputMaybe<TaskOrderBy>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  scheduledDate?: InputMaybe<Scalars['DateTime']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<TaskSortInput>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTasksByGoalArgs = {
  goalId: Scalars['ID']['input'];
};


export type QueryTasksByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeamDashboardArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryTeamGoalsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryTeamInvitationsArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryTeamMembersArgs = {
  teamId: Scalars['ID']['input'];
};


export type QueryUpcomingEventsArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryUpcomingTasksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebhookArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebhookDeliveriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  webhookId: Scalars['ID']['input'];
};


export type QueryWeekOverviewArgs = {
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryWeeklyStatsArgs = {
  weekStart?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuestionType =
  | 'EMAIL'
  | 'PHONE'
  | 'SELECT'
  | 'TEXT'
  | 'TEXTAREA';

export type QuickAction = {
  __typename?: 'QuickAction';
  action: Scalars['String']['output'];
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  variant: QuickActionVariant;
};

export type QuickActionVariant =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SUCCESS'
  | 'WARNING';

export type RecentActivity = {
  __typename?: 'RecentActivity';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<ActivityMetadata>;
  timestamp: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  type: ActivityType;
};

export type RecurrenceFrequency =
  | 'DAILY'
  | 'MONTHLY'
  | 'WEEKLY'
  | 'YEARLY';

export type RecurrenceRule = {
  __typename?: 'RecurrenceRule';
  dayOfMonth?: Maybe<Scalars['Int']['output']>;
  daysOfWeek?: Maybe<Array<Scalars['Int']['output']>>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  frequency: RecurrenceFrequency;
  interval: Scalars['Int']['output'];
  monthOfYear?: Maybe<Scalars['Int']['output']>;
  occurrences?: Maybe<Scalars['Int']['output']>;
};

export type RecurrenceRuleInput = {
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  frequency: RecurrenceFrequency;
  interval: Scalars['Int']['input'];
  monthOfYear?: InputMaybe<Scalars['Int']['input']>;
  occurrences?: InputMaybe<Scalars['Int']['input']>;
};

export type ReferralEntry = {
  __typename?: 'ReferralEntry';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  referredName: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type ReferralStats = {
  __typename?: 'ReferralStats';
  activeReferrals: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  pendingReferrals: Scalars['Int']['output'];
  referrals: Array<ReferralEntry>;
  totalReferrals: Scalars['Int']['output'];
};

export type RescheduleSuggestion = {
  __typename?: 'RescheduleSuggestion';
  endTime: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  scheduledDate: Scalars['DateTime']['output'];
  startTime: Scalars['String']['output'];
  taskId: Scalars['ID']['output'];
};

export type SchedulingLink = {
  __typename?: 'SchedulingLink';
  availability: AvailabilitySettings;
  bookingCount: Scalars['Int']['output'];
  bookings: Array<Booking>;
  bufferAfter: Scalars['Int']['output'];
  bufferBefore: Scalars['Int']['output'];
  color: Scalars['String']['output'];
  confirmationMessage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customQuestions: Array<CustomQuestion>;
  description?: Maybe<Scalars['String']['output']>;
  duration: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  maxBookingsPerDay?: Maybe<Scalars['Int']['output']>;
  meetingType: Scalars['String']['output'];
  name: Scalars['String']['output'];
  noticeTime: Scalars['Int']['output'];
  redirectUrl?: Maybe<Scalars['String']['output']>;
  requiresConfirmation: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type SleepRecommendation = {
  __typename?: 'SleepRecommendation';
  benefits: Array<Scalars['String']['output']>;
  cycles: Scalars['Int']['output'];
  energyPattern: EnergyPattern;
  explanation: Scalars['String']['output'];
  optimalSleepTime: Scalars['String']['output'];
  productivityWindow: ProductivityWindow;
  tips: Array<Scalars['String']['output']>;
  totalSleepHours: Scalars['Float']['output'];
  wakeTime: Scalars['String']['output'];
  windDownTime: Scalars['String']['output'];
};

export type Smart1on1 = {
  __typename?: 'Smart1on1';
  agendaTemplate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  duration: Scalars['Int']['output'];
  frequency: Smart1on1Frequency;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastMeetingDate?: Maybe<Scalars['DateTime']['output']>;
  nextMeetingDate?: Maybe<Scalars['DateTime']['output']>;
  participantEmail: Scalars['String']['output'];
  preferredDays: Array<Scalars['Int']['output']>;
  preferredTimes: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Smart1on1Frequency =
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'WEEKLY';

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type StreakData = {
  __typename?: 'StreakData';
  currentStreak: Scalars['Int']['output'];
  longestStreak: Scalars['Int']['output'];
  streakHistory: Array<StreakEntry>;
};

export type StreakEntry = {
  __typename?: 'StreakEntry';
  completed: Scalars['Boolean']['output'];
  date: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  _empty?: Maybe<Scalars['String']['output']>;
  calendarSyncStatus: SyncResult;
  focusTimeCreated: FocusTimeBlock;
  focusTimeDeleted: Scalars['ID']['output'];
  focusTimeUpdated: FocusTimeBlock;
  goalCreated: Goal;
  goalDeleted: Scalars['ID']['output'];
  goalUpdated: Goal;
  kanbanBoardUpdated: KanbanBoard;
  noMeetingDayCreated: NoMeetingDay;
  noMeetingDayDeleted: Scalars['ID']['output'];
  notificationPreferencesUpdated: NotificationPreferences;
  notificationRead: Scalars['ID']['output'];
  notificationReceived: Notification;
  /** Subscribe to plan generation updates */
  planGenerated: Plan;
  /** Subscribe to plan updates */
  planUpdated: Plan;
  projectCreated: Project;
  projectDeleted: DeletedProject;
  projectUpdated: Project;
  smart1on1Created: Smart1on1;
  smart1on1Deleted: Scalars['ID']['output'];
  smart1on1Updated: Smart1on1;
  taskCreated: Task;
  taskDeleted: Scalars['ID']['output'];
  taskUpdated: Task;
  timerStarted: TimeEntry;
  timerStopped: TimeEntry;
  workHoursUpdated: WorkHours;
};


export type SubscriptionCalendarSyncStatusArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionGoalCreatedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionGoalDeletedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionGoalUpdatedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionPlanGeneratedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionPlanUpdatedArgs = {
  planId: Scalars['ID']['input'];
};


export type SubscriptionTaskCreatedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionTaskDeletedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionTaskUpdatedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionTimerStartedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionTimerStoppedArgs = {
  userId: Scalars['ID']['input'];
};

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'INACTIVE'
  | 'PAST_DUE'
  | 'TRIALING';

export type SubscriptionTier =
  | 'FREE'
  | 'PREMIUM'
  | 'PRO'
  | 'STARTER';

export type SyncError = {
  __typename?: 'SyncError';
  code?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  taskId?: Maybe<Scalars['ID']['output']>;
};

export type SyncResult = {
  __typename?: 'SyncResult';
  duration: Scalars['Int']['output'];
  errors: Array<SyncError>;
  provider: CalendarProvider;
  success: Scalars['Boolean']['output'];
  tasksAttempted: Scalars['Int']['output'];
  tasksFailed: Scalars['Int']['output'];
  tasksSucceeded: Scalars['Int']['output'];
};

export type SyncStatus =
  | 'CONFLICT'
  | 'FAILED'
  | 'PENDING'
  | 'SYNCED'
  | 'SYNCING';

export type SyncUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  clerkId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<Scalars['String']['input']>;
};

export type Task = {
  __typename?: 'Task';
  actualEndTime?: Maybe<Scalars['DateTime']['output']>;
  actualStartTime?: Maybe<Scalars['DateTime']['output']>;
  aiGenerated: Scalars['Boolean']['output'];
  aiReasoning?: Maybe<Scalars['String']['output']>;
  blockedBy: Array<TaskDependency>;
  blockedByCount?: Maybe<Scalars['Int']['output']>;
  calendarEventId?: Maybe<Scalars['String']['output']>;
  calendarProvider?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dependencies: Array<TaskDependency>;
  dependencyCount?: Maybe<Scalars['Int']['output']>;
  durationMinutes: Scalars['Int']['output'];
  endTime: Scalars['String']['output'];
  goal?: Maybe<Goal>;
  goalId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  instanceDate?: Maybe<Scalars['DateTime']['output']>;
  isCompleted: Scalars['Boolean']['output'];
  isRecurringInstance?: Maybe<Scalars['Boolean']['output']>;
  isSkipped: Scalars['Boolean']['output'];
  isTimerRunning: Scalars['Boolean']['output'];
  localId?: Maybe<Scalars['String']['output']>;
  manuallyAdded: Scalars['Boolean']['output'];
  manuallyMoved: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  offlineCreatedAt?: Maybe<Scalars['DateTime']['output']>;
  parentTask?: Maybe<Task>;
  parentTaskId?: Maybe<Scalars['ID']['output']>;
  pendingSync: Scalars['Boolean']['output'];
  planId?: Maybe<Scalars['ID']['output']>;
  priority: Scalars['Int']['output'];
  project?: Maybe<Project>;
  projectId?: Maybe<Scalars['ID']['output']>;
  recurrenceRule?: Maybe<RecurrenceRule>;
  recurringTaskId?: Maybe<Scalars['ID']['output']>;
  scheduledDate: Scalars['DateTime']['output'];
  skippedAt?: Maybe<Scalars['DateTime']['output']>;
  skippedReason?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['String']['output'];
  subtaskCount?: Maybe<Scalars['Int']['output']>;
  subtasks: Array<Task>;
  syncError?: Maybe<Scalars['String']['output']>;
  syncStatus: SyncStatus;
  syncedAt?: Maybe<Scalars['DateTime']['output']>;
  tags: Array<Scalars['String']['output']>;
  timeEntries: Array<TimeEntry>;
  timeSpentMinutes: Scalars['Int']['output'];
  timerStartedAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type TaskDependency = {
  __typename?: 'TaskDependency';
  blockingTask: Task;
  blockingTaskId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  dependentTask: Task;
  dependentTaskId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  type: DependencyType;
};

export type TaskFilterInput = {
  aiGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  dateRange?: InputMaybe<DateRangeInput>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  planId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  scheduledDate?: InputMaybe<Scalars['DateTime']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  weekStart?: InputMaybe<Scalars['String']['input']>;
};

export type TaskInfo = {
  __typename?: 'TaskInfo';
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type TaskOrderBy =
  | 'CREATED_ASC'
  | 'CREATED_DESC'
  | 'PRIORITY_ASC'
  | 'PRIORITY_DESC'
  | 'SCHEDULED_DATE_ASC'
  | 'SCHEDULED_DATE_DESC';

export type TaskSortField =
  | 'CREATED_AT'
  | 'PRIORITY'
  | 'SCHEDULED_DATE'
  | 'TITLE'
  | 'UPDATED_AT';

export type TaskSortInput = {
  direction: SortDirection;
  field: TaskSortField;
};

export type TaskWithDependencies = {
  __typename?: 'TaskWithDependencies';
  blockingTasks: Array<TaskInfo>;
  canStart: Scalars['Boolean']['output'];
  dependentTasks: Array<TaskInfo>;
  id: Scalars['ID']['output'];
  isBlocked: Scalars['Boolean']['output'];
  isCompleted: Scalars['Boolean']['output'];
  scheduledDate: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type Team = {
  __typename?: 'Team';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  invitations: Array<TeamInvitation>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  maxMembers: Scalars['Int']['output'];
  members: Array<TeamMember>;
  name: Scalars['String']['output'];
  owner: User;
  ownerId: Scalars['ID']['output'];
  plan: TeamPlan;
  settings: TeamSettings;
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamDashboard = {
  __typename?: 'TeamDashboard';
  completionRate: Scalars['Int']['output'];
  goals: Array<TeamGoal>;
  memberCount: Scalars['Int']['output'];
  members: Array<TeamMemberStat>;
  teamId: Scalars['ID']['output'];
  totalTasks: Scalars['Int']['output'];
  totalTasksCompleted: Scalars['Int']['output'];
};

export type TeamGoal = {
  __typename?: 'TeamGoal';
  color?: Maybe<Scalars['String']['output']>;
  completionRate: Scalars['Float']['output'];
  emoji?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  ownerName: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TeamInvitation = {
  __typename?: 'TeamInvitation';
  acceptedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  invitedBy: Scalars['ID']['output'];
  inviter: User;
  role: TeamRole;
  status?: Maybe<Scalars['String']['output']>;
  team: Team;
  teamId: Scalars['ID']['output'];
  token: Scalars['String']['output'];
};

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  invitedBy?: Maybe<Scalars['String']['output']>;
  joinedAt: Scalars['DateTime']['output'];
  role: TeamRole;
  status: MemberStatus;
  teamId: Scalars['ID']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type TeamMemberStat = {
  __typename?: 'TeamMemberStat';
  completionRate: Scalars['Int']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
  tasksCompleted: Scalars['Int']['output'];
  tasksTotal: Scalars['Int']['output'];
  userId: Scalars['ID']['output'];
};

export type TeamPlan =
  | 'ENTERPRISE'
  | 'PREMIUM';

export type TeamRole =
  | 'ADMIN'
  | 'MEMBER'
  | 'OWNER'
  | 'VIEWER';

export type TeamSettings = {
  __typename?: 'TeamSettings';
  allowMemberInvites: Scalars['Boolean']['output'];
  requireApproval: Scalars['Boolean']['output'];
  sharedCalendar: Scalars['Boolean']['output'];
  sharedGoals: Scalars['Boolean']['output'];
};

export type TeamSettingsInput = {
  allowMemberInvites?: InputMaybe<Scalars['Boolean']['input']>;
  requireApproval?: InputMaybe<Scalars['Boolean']['input']>;
  sharedCalendar?: InputMaybe<Scalars['Boolean']['input']>;
  sharedGoals?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TestPushResult = {
  __typename?: 'TestPushResult';
  configured: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
  sent: Scalars['Int']['output'];
};

export type Theme =
  | 'DARK'
  | 'LIGHT'
  | 'SYSTEM';

export type TimeEntry = {
  __typename?: 'TimeEntry';
  actualEndTime?: Maybe<Scalars['DateTime']['output']>;
  actualStartTime?: Maybe<Scalars['DateTime']['output']>;
  isTimerRunning: Scalars['Boolean']['output'];
  taskId: Scalars['ID']['output'];
  timeSpentMinutes: Scalars['Int']['output'];
  timerStartedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TimeSlot = {
  __typename?: 'TimeSlot';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type TimeSlotInput = {
  end: Scalars['String']['input'];
  start: Scalars['String']['input'];
};

export type TravelMode =
  | 'BICYCLING'
  | 'DRIVING'
  | 'TRANSIT'
  | 'WALKING';

export type TravelTime = {
  __typename?: 'TravelTime';
  distance: Scalars['String']['output'];
  durationMinutes: Scalars['Int']['output'];
  fromLocation: Scalars['String']['output'];
  mode: TravelMode;
  toLocation: Scalars['String']['output'];
};

export type UpcomingInvoice = {
  __typename?: 'UpcomingInvoice';
  amountDue: Scalars['Int']['output'];
  currency: Scalars['String']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  total: Scalars['Int']['output'];
};

export type UpcomingTask = {
  __typename?: 'UpcomingTask';
  dueDate: Scalars['DateTime']['output'];
  estimatedDuration?: Maybe<Scalars['Int']['output']>;
  goalEmoji?: Maybe<Scalars['String']['output']>;
  goalId?: Maybe<Scalars['ID']['output']>;
  goalTitle?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  priority: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type UpdateCalendarDefenseInput = {
  autoAcceptDuringOpenHours?: InputMaybe<Scalars['Boolean']['input']>;
  autoDeclineDoubleBookings?: InputMaybe<Scalars['Boolean']['input']>;
  autoDeclineDuringFocusTime?: InputMaybe<Scalars['Boolean']['input']>;
  autoDeclineOutsideWorkHours?: InputMaybe<Scalars['Boolean']['input']>;
  bufferMinutes?: InputMaybe<Scalars['Int']['input']>;
  defaultMeetingDuration?: InputMaybe<Scalars['Int']['input']>;
  minimumNoticeHours?: InputMaybe<Scalars['Int']['input']>;
  requireBufferBetweenMeetings?: InputMaybe<Scalars['Boolean']['input']>;
  requireMinimumNotice?: InputMaybe<Scalars['Boolean']['input']>;
  suggestShorterMeetings?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateCalendarEventInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['DateTime']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDailyRitualInput = {
  date: Scalars['String']['input'];
  intention?: InputMaybe<Scalars['String']['input']>;
  planCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  reflection?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFocusTimeBlockInput = {
  autoSchedule?: InputMaybe<Scalars['Boolean']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  frequency?: InputMaybe<FocusFrequency>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  preferredTimeSlots?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  protected?: InputMaybe<Scalars['Boolean']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGoalInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  emoji?: InputMaybe<Scalars['String']['input']>;
  flexibilityScore?: InputMaybe<Scalars['Int']['input']>;
  frequencyPerWeek?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPaused?: InputMaybe<Scalars['Boolean']['input']>;
  preferredTimes?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHabitInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  flexible?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  preferredWindowEnd?: InputMaybe<Scalars['String']['input']>;
  preferredWindowStart?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateIntegrationInput = {
  config?: InputMaybe<Scalars['JSON']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateKanbanBoardInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNotificationPreferencesInput = {
  enableBreakReminders?: InputMaybe<Scalars['Boolean']['input']>;
  enableDailyReminders?: InputMaybe<Scalars['Boolean']['input']>;
  enableFocusTimeAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  enableGoalMilestones?: InputMaybe<Scalars['Boolean']['input']>;
  enableOverbookedAlerts?: InputMaybe<Scalars['Boolean']['input']>;
  enableTaskReminders?: InputMaybe<Scalars['Boolean']['input']>;
  enableUpcomingMeetings?: InputMaybe<Scalars['Boolean']['input']>;
  enableWeeklyPlan?: InputMaybe<Scalars['Boolean']['input']>;
  quietHoursEnd?: InputMaybe<Scalars['String']['input']>;
  quietHoursStart?: InputMaybe<Scalars['String']['input']>;
  reminderMinutesBefore?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateOnboardingProgressInput = {
  context?: InputMaybe<UserContext>;
  focusAreas?: InputMaybe<Array<FocusArea>>;
  step: Scalars['Int']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
  wakeTime?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a plan */
export type UpdatePlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PlanStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePriorityHoursInput = {
  deprioritizeMeetings?: InputMaybe<Scalars['Boolean']['input']>;
  prioritizeFocusTime?: InputMaybe<Scalars['Boolean']['input']>;
  prioritizeTasks?: InputMaybe<Scalars['Boolean']['input']>;
  timeSlots?: InputMaybe<Array<PriorityTimeSlotInput>>;
};

export type UpdateProjectInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  targetDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateSchedulingLinkInput = {
  availability?: InputMaybe<AvailabilitySettingsInput>;
  bufferAfter?: InputMaybe<Scalars['Int']['input']>;
  bufferBefore?: InputMaybe<Scalars['Int']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  confirmationMessage?: InputMaybe<Scalars['String']['input']>;
  customQuestions?: InputMaybe<Array<CustomQuestionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  maxBookingsPerDay?: InputMaybe<Scalars['Int']['input']>;
  meetingType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  noticeTime?: InputMaybe<Scalars['Int']['input']>;
  redirectUrl?: InputMaybe<Scalars['String']['input']>;
  requiresConfirmation?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateSmart1on1Input = {
  agendaTemplate?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  frequency?: InputMaybe<Smart1on1Frequency>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  participantEmail?: InputMaybe<Scalars['String']['input']>;
  preferredDays?: InputMaybe<Array<Scalars['Int']['input']>>;
  preferredTimes?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTaskInput = {
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  goalId?: InputMaybe<Scalars['ID']['input']>;
  isCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  recurrenceRule?: InputMaybe<RecurrenceRuleInput>;
  scheduledDate?: InputMaybe<Scalars['DateTime']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<TeamSettingsInput>;
};

export type UpdateUserProfileInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserSettingsInput = {
  energyPattern?: InputMaybe<EnergyPattern>;
  notifications?: InputMaybe<NotificationSettingsInput>;
  theme?: InputMaybe<Theme>;
};

export type UpdateWebhookInput = {
  events?: InputMaybe<Array<WebhookEvent>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UsageStats = {
  __typename?: 'UsageStats';
  aiGenerationLimit: Scalars['Int']['output'];
  aiGenerationsUsed: Scalars['Int']['output'];
  aiUsagePercent: Scalars['Float']['output'];
  goalLimit: Scalars['Int']['output'];
  goalUsagePercent: Scalars['Float']['output'];
  goalsCreated: Scalars['Int']['output'];
  planLimit: Scalars['Int']['output'];
  planUsagePercent: Scalars['Float']['output'];
  plansGenerated: Scalars['Int']['output'];
  resetsAt: Scalars['DateTime']['output'];
  taskLimit: Scalars['Int']['output'];
  taskUsagePercent: Scalars['Float']['output'];
  tasksCreated: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  clerkId: Scalars['String']['output'];
  context?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  energyPattern?: Maybe<EnergyPattern>;
  focusAreas: Array<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language: Scalars['String']['output'];
  lastSeenAt: Scalars['DateTime']['output'];
  name?: Maybe<Scalars['String']['output']>;
  onboardingCompleted: Scalars['Boolean']['output'];
  onboardingStep: Scalars['Int']['output'];
  productivityPeaks: Array<Scalars['String']['output']>;
  settings?: Maybe<UserSettings>;
  sleepTime: Scalars['String']['output'];
  subscriptionStatus: SubscriptionStatus;
  tier: SubscriptionTier;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wakeTime: Scalars['String']['output'];
  workEndTime: Scalars['String']['output'];
  workStartTime: Scalars['String']['output'];
};

export type UserContext =
  | 'BETWEEN_OPPORTUNITIES'
  | 'EMPLOYED_FULLTIME'
  | 'EMPLOYED_PARTTIME'
  | 'FREELANCER'
  | 'OTHER'
  | 'PARENT_CAREGIVER'
  | 'RETIRED'
  | 'STUDENT';

export type UserSettings = {
  __typename?: 'UserSettings';
  calendarIntegrations?: Maybe<Array<CalendarIntegration>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  defaultTaskDuration?: Maybe<Scalars['Int']['output']>;
  energyPattern?: Maybe<EnergyPattern>;
  firstName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  notifications?: Maybe<NotificationSettings>;
  onboardingCompleted?: Maybe<Scalars['Boolean']['output']>;
  onboardingCompletedAt?: Maybe<Scalars['DateTime']['output']>;
  theme?: Maybe<Theme>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId?: Maybe<Scalars['ID']['output']>;
  workingHours?: Maybe<WorkingHours>;
};

export type UserSubscription = {
  __typename?: 'UserSubscription';
  cancelAtPeriodEnd: Scalars['Boolean']['output'];
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart?: Maybe<Scalars['DateTime']['output']>;
  features: FeatureLimits;
  id: Scalars['ID']['output'];
  status: SubscriptionStatus;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  stripeSubscriptionId?: Maybe<Scalars['String']['output']>;
  tier: SubscriptionTier;
  trialEnd?: Maybe<Scalars['DateTime']['output']>;
  trialStart?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Webhook = {
  __typename?: 'Webhook';
  createdAt: Scalars['DateTime']['output'];
  deliveries: Array<WebhookDelivery>;
  events: Array<WebhookEvent>;
  failureCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastTriggeredAt?: Maybe<Scalars['DateTime']['output']>;
  secret: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type WebhookDelivery = {
  __typename?: 'WebhookDelivery';
  attempts: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  event: WebhookEvent;
  id: Scalars['ID']['output'];
  lastAttemptAt?: Maybe<Scalars['DateTime']['output']>;
  payload: Scalars['JSON']['output'];
  responseBody?: Maybe<Scalars['String']['output']>;
  status: DeliveryStatus;
  statusCode?: Maybe<Scalars['Int']['output']>;
  webhookId: Scalars['ID']['output'];
};

export type WebhookEvent =
  | 'BOOKING_CANCELED'
  | 'BOOKING_CREATED'
  | 'GOAL_CREATED'
  | 'GOAL_DELETED'
  | 'GOAL_UPDATED'
  | 'PLAN_ACCEPTED'
  | 'PLAN_GENERATED'
  | 'TASK_COMPLETED'
  | 'TASK_CREATED'
  | 'TASK_DELETED'
  | 'TASK_UPDATED';

export type WeekOverview = {
  __typename?: 'WeekOverview';
  date: Scalars['DateTime']['output'];
  dayOfWeek: Scalars['Int']['output'];
  productivity: Scalars['Float']['output'];
  tasksCompleted: Scalars['Int']['output'];
  tasksScheduled: Scalars['Int']['output'];
  totalDuration: Scalars['Int']['output'];
};

export type WeeklyGoalProgress = {
  __typename?: 'WeeklyGoalProgress';
  completed: Scalars['Int']['output'];
  completionRate: Scalars['Float']['output'];
  scheduled: Scalars['Int']['output'];
  week: Scalars['String']['output'];
};

export type WeeklyProgress = {
  __typename?: 'WeeklyProgress';
  completed: Scalars['Int']['output'];
  completionRate: Scalars['Float']['output'];
  scheduled: Scalars['Int']['output'];
  week: Scalars['String']['output'];
};

export type WeeklyReview = {
  __typename?: 'WeeklyReview';
  completionRate: Scalars['Float']['output'];
  goalsCreated: Scalars['Int']['output'];
  plansGenerated: Scalars['Int']['output'];
  productivity: Scalars['String']['output'];
  recommendation: Scalars['String']['output'];
  tasksCompleted: Scalars['Int']['output'];
  topGoals: Array<WeeklyReviewGoal>;
  weekEndDate: Scalars['DateTime']['output'];
  weekStartDate: Scalars['DateTime']['output'];
};

export type WeeklyReviewGoal = {
  __typename?: 'WeeklyReviewGoal';
  completions: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type WeeklyStats = {
  __typename?: 'WeeklyStats';
  activeGoals: Scalars['Int']['output'];
  averageProductivityScore?: Maybe<Scalars['Int']['output']>;
  bestDay?: Maybe<Scalars['String']['output']>;
  completedTasks: Scalars['Int']['output'];
  completionRate: Scalars['Float']['output'];
  currentStreak: Scalars['Int']['output'];
  focusHours: Scalars['Float']['output'];
  goalsCompletionRate: Scalars['Float']['output'];
  longestStreak: Scalars['Int']['output'];
  totalHoursCompleted: Scalars['Float']['output'];
  totalHoursScheduled: Scalars['Float']['output'];
  totalTasks: Scalars['Int']['output'];
  weekEnd: Scalars['DateTime']['output'];
  weekStart: Scalars['DateTime']['output'];
  worstDay?: Maybe<Scalars['String']['output']>;
};

export type WorkHours = {
  __typename?: 'WorkHours';
  createdAt: Scalars['DateTime']['output'];
  enforceWorkHours: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  maxConsecutiveMeetings?: Maybe<Scalars['Int']['output']>;
  maxMeetingHoursPerDay?: Maybe<Scalars['Int']['output']>;
  maxMeetingsPerDay?: Maybe<Scalars['Int']['output']>;
  schedule: WorkWeekSchedule;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type WorkHoursInput = {
  enforceWorkHours?: InputMaybe<Scalars['Boolean']['input']>;
  maxConsecutiveMeetings?: InputMaybe<Scalars['Int']['input']>;
  maxMeetingHoursPerDay?: InputMaybe<Scalars['Int']['input']>;
  maxMeetingsPerDay?: InputMaybe<Scalars['Int']['input']>;
  schedule?: InputMaybe<WorkWeekScheduleInput>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type WorkWeekSchedule = {
  __typename?: 'WorkWeekSchedule';
  friday: DaySchedule;
  monday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  thursday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
};

export type WorkWeekScheduleInput = {
  friday?: InputMaybe<DayScheduleInput>;
  monday?: InputMaybe<DayScheduleInput>;
  saturday?: InputMaybe<DayScheduleInput>;
  sunday?: InputMaybe<DayScheduleInput>;
  thursday?: InputMaybe<DayScheduleInput>;
  tuesday?: InputMaybe<DayScheduleInput>;
  wednesday?: InputMaybe<DayScheduleInput>;
};

export type WorkingHours = {
  __typename?: 'WorkingHours';
  end: Scalars['String']['output'];
  start: Scalars['String']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  ActivityMetadata: ResolverTypeWrapper<ActivityMetadata>;
  ActivityType: ActivityType;
  AiMemory: ResolverTypeWrapper<AiMemory>;
  ApiKey: ResolverTypeWrapper<ApiKey>;
  ApiKeyWithSecret: ResolverTypeWrapper<ApiKeyWithSecret>;
  ApiScope: ApiScope;
  AutopilotMove: ResolverTypeWrapper<AutopilotMove>;
  AutopilotProposal: ResolverTypeWrapper<AutopilotProposal>;
  AutopilotStatus: ResolverTypeWrapper<AutopilotStatus>;
  AvailabilitySchedule: ResolverTypeWrapper<AvailabilitySchedule>;
  AvailabilityScheduleInput: AvailabilityScheduleInput;
  AvailabilitySettings: ResolverTypeWrapper<AvailabilitySettings>;
  AvailabilitySettingsInput: AvailabilitySettingsInput;
  BillingInfo: ResolverTypeWrapper<BillingInfo>;
  BillingInterval: BillingInterval;
  BillingPortalSession: ResolverTypeWrapper<BillingPortalSession>;
  Booking: ResolverTypeWrapper<Booking>;
  BookingStatus: BookingStatus;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BreakTime: ResolverTypeWrapper<BreakTime>;
  BreakTimeInput: BreakTimeInput;
  BulkDeleteResult: ResolverTypeWrapper<BulkDeleteResult>;
  BusySlot: ResolverTypeWrapper<BusySlot>;
  CalculateSleepInput: CalculateSleepInput;
  CalculateTravelTimeInput: CalculateTravelTimeInput;
  CalendarAuthPayload: ResolverTypeWrapper<CalendarAuthPayload>;
  CalendarConnection: ResolverTypeWrapper<CalendarConnection>;
  CalendarDefense: ResolverTypeWrapper<CalendarDefense>;
  CalendarDefenseLogEntry: ResolverTypeWrapper<CalendarDefenseLogEntry>;
  CalendarDefenseRunResult: ResolverTypeWrapper<CalendarDefenseRunResult>;
  CalendarEvent: ResolverTypeWrapper<CalendarEvent>;
  CalendarIntegration: ResolverTypeWrapper<CalendarIntegration>;
  CalendarProvider: CalendarProvider;
  CheckoutSession: ResolverTypeWrapper<CheckoutSession>;
  CompleteOnboardingInput: CompleteOnboardingInput;
  ConnectCalendarInput: ConnectCalendarInput;
  ConnectIntegrationInput: ConnectIntegrationInput;
  CreateAiMemoryInput: CreateAiMemoryInput;
  CreateApiKeyInput: CreateApiKeyInput;
  CreateBookingInput: CreateBookingInput;
  CreateCalendarEventInput: CreateCalendarEventInput;
  CreateFocusTimeBlockInput: CreateFocusTimeBlockInput;
  CreateGoalInput: CreateGoalInput;
  CreateHabitInput: CreateHabitInput;
  CreateKanbanBoardInput: CreateKanbanBoardInput;
  CreateNoMeetingDayInput: CreateNoMeetingDayInput;
  CreatePlanInput: CreatePlanInput;
  CreatePlanTemplateInput: CreatePlanTemplateInput;
  CreateProjectInput: CreateProjectInput;
  CreateSchedulingLinkInput: CreateSchedulingLinkInput;
  CreateSmart1on1Input: CreateSmart1on1Input;
  CreateSubtaskInput: CreateSubtaskInput;
  CreateTaskDependencyInput: CreateTaskDependencyInput;
  CreateTaskInput: CreateTaskInput;
  CreateTeamInput: CreateTeamInput;
  CreateWebhookInput: CreateWebhookInput;
  CustomQuestion: ResolverTypeWrapper<CustomQuestion>;
  CustomQuestionInput: CustomQuestionInput;
  DailyRitual: ResolverTypeWrapper<DailyRitual>;
  DashboardStats: ResolverTypeWrapper<DashboardStats>;
  DateRangeInput: DateRangeInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DaySchedule: ResolverTypeWrapper<DaySchedule>;
  DayScheduleInput: DayScheduleInput;
  DeletedProject: ResolverTypeWrapper<DeletedProject>;
  DeliveryStatus: DeliveryStatus;
  DependencyType: DependencyType;
  EnergyPattern: EnergyPattern;
  FeatureLimits: ResolverTypeWrapper<FeatureLimits>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FocusArea: FocusArea;
  FocusFrequency: FocusFrequency;
  FocusTimeBlock: ResolverTypeWrapper<FocusTimeBlock>;
  GenerateFromTemplateInput: GenerateFromTemplateInput;
  GeneratePlanInput: GeneratePlanInput;
  GetGoalSuggestionsInput: GetGoalSuggestionsInput;
  Goal: ResolverTypeWrapper<Goal>;
  GoalAnalytics: ResolverTypeWrapper<GoalAnalytics>;
  GoalAnalyticsReport: ResolverTypeWrapper<GoalAnalyticsReport>;
  GoalOrderBy: GoalOrderBy;
  GoalSuggestion: ResolverTypeWrapper<GoalSuggestion>;
  Habit: ResolverTypeWrapper<Habit>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  ImportPmTaskInput: ImportPmTaskInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Integration: ResolverTypeWrapper<Integration>;
  IntegrationResource: ResolverTypeWrapper<IntegrationResource>;
  IntegrationType: IntegrationType;
  InviteTeamMemberInput: InviteTeamMemberInput;
  Invoice: ResolverTypeWrapper<Invoice>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  KanbanBoard: ResolverTypeWrapper<KanbanBoard>;
  KanbanColumn: ResolverTypeWrapper<KanbanColumn>;
  MemberStatus: MemberStatus;
  MemoryType: MemoryType;
  MoveTaskInKanbanInput: MoveTaskInKanbanInput;
  Mutation: ResolverTypeWrapper<{}>;
  NoMeetingDay: ResolverTypeWrapper<NoMeetingDay>;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationPreferences: ResolverTypeWrapper<NotificationPreferences>;
  NotificationSettings: ResolverTypeWrapper<NotificationSettings>;
  NotificationSettingsInput: NotificationSettingsInput;
  NotificationType: NotificationType;
  OAuthRedirect: ResolverTypeWrapper<OAuthRedirect>;
  OnboardingResult: ResolverTypeWrapper<OnboardingResult>;
  OnboardingStatus: ResolverTypeWrapper<OnboardingStatus>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  Plan: ResolverTypeWrapper<Plan>;
  PlanFilterInput: PlanFilterInput;
  PlanPreferencesInput: PlanPreferencesInput;
  PlanStatus: PlanStatus;
  PlanTemplate: ResolverTypeWrapper<PlanTemplate>;
  PmImportResult: ResolverTypeWrapper<PmImportResult>;
  PmInboxTask: ResolverTypeWrapper<PmInboxTask>;
  PriorityHours: ResolverTypeWrapper<PriorityHours>;
  PriorityTimeSlot: ResolverTypeWrapper<PriorityTimeSlot>;
  PriorityTimeSlotInput: PriorityTimeSlotInput;
  ProductivityScore: ResolverTypeWrapper<ProductivityScore>;
  ProductivityWindow: ResolverTypeWrapper<ProductivityWindow>;
  Project: ResolverTypeWrapper<Project>;
  ProjectOrderBy: ProjectOrderBy;
  ProjectWithStats: ResolverTypeWrapper<ProjectWithStats>;
  Query: ResolverTypeWrapper<{}>;
  QuestionType: QuestionType;
  QuickAction: ResolverTypeWrapper<QuickAction>;
  QuickActionVariant: QuickActionVariant;
  RecentActivity: ResolverTypeWrapper<RecentActivity>;
  RecurrenceFrequency: RecurrenceFrequency;
  RecurrenceRule: ResolverTypeWrapper<RecurrenceRule>;
  RecurrenceRuleInput: RecurrenceRuleInput;
  ReferralEntry: ResolverTypeWrapper<ReferralEntry>;
  ReferralStats: ResolverTypeWrapper<ReferralStats>;
  RescheduleSuggestion: ResolverTypeWrapper<RescheduleSuggestion>;
  SchedulingLink: ResolverTypeWrapper<SchedulingLink>;
  SleepRecommendation: ResolverTypeWrapper<SleepRecommendation>;
  Smart1on1: ResolverTypeWrapper<Smart1on1>;
  Smart1on1Frequency: Smart1on1Frequency;
  SortDirection: SortDirection;
  StreakData: ResolverTypeWrapper<StreakData>;
  StreakEntry: ResolverTypeWrapper<StreakEntry>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  SubscriptionStatus: SubscriptionStatus;
  SubscriptionTier: SubscriptionTier;
  SyncError: ResolverTypeWrapper<SyncError>;
  SyncResult: ResolverTypeWrapper<SyncResult>;
  SyncStatus: SyncStatus;
  SyncUserInput: SyncUserInput;
  Task: ResolverTypeWrapper<Task>;
  TaskDependency: ResolverTypeWrapper<TaskDependency>;
  TaskFilterInput: TaskFilterInput;
  TaskInfo: ResolverTypeWrapper<TaskInfo>;
  TaskOrderBy: TaskOrderBy;
  TaskSortField: TaskSortField;
  TaskSortInput: TaskSortInput;
  TaskWithDependencies: ResolverTypeWrapper<TaskWithDependencies>;
  Team: ResolverTypeWrapper<Team>;
  TeamDashboard: ResolverTypeWrapper<TeamDashboard>;
  TeamGoal: ResolverTypeWrapper<TeamGoal>;
  TeamInvitation: ResolverTypeWrapper<TeamInvitation>;
  TeamMember: ResolverTypeWrapper<TeamMember>;
  TeamMemberStat: ResolverTypeWrapper<TeamMemberStat>;
  TeamPlan: TeamPlan;
  TeamRole: TeamRole;
  TeamSettings: ResolverTypeWrapper<TeamSettings>;
  TeamSettingsInput: TeamSettingsInput;
  TestPushResult: ResolverTypeWrapper<TestPushResult>;
  Theme: Theme;
  TimeEntry: ResolverTypeWrapper<TimeEntry>;
  TimeSlot: ResolverTypeWrapper<TimeSlot>;
  TimeSlotInput: TimeSlotInput;
  TravelMode: TravelMode;
  TravelTime: ResolverTypeWrapper<TravelTime>;
  UpcomingInvoice: ResolverTypeWrapper<UpcomingInvoice>;
  UpcomingTask: ResolverTypeWrapper<UpcomingTask>;
  UpdateCalendarDefenseInput: UpdateCalendarDefenseInput;
  UpdateCalendarEventInput: UpdateCalendarEventInput;
  UpdateDailyRitualInput: UpdateDailyRitualInput;
  UpdateFocusTimeBlockInput: UpdateFocusTimeBlockInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateHabitInput: UpdateHabitInput;
  UpdateIntegrationInput: UpdateIntegrationInput;
  UpdateKanbanBoardInput: UpdateKanbanBoardInput;
  UpdateNotificationPreferencesInput: UpdateNotificationPreferencesInput;
  UpdateOnboardingProgressInput: UpdateOnboardingProgressInput;
  UpdatePlanInput: UpdatePlanInput;
  UpdatePriorityHoursInput: UpdatePriorityHoursInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateSchedulingLinkInput: UpdateSchedulingLinkInput;
  UpdateSmart1on1Input: UpdateSmart1on1Input;
  UpdateTaskInput: UpdateTaskInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserSettingsInput: UpdateUserSettingsInput;
  UpdateWebhookInput: UpdateWebhookInput;
  UsageStats: ResolverTypeWrapper<UsageStats>;
  User: ResolverTypeWrapper<User>;
  UserContext: UserContext;
  UserSettings: ResolverTypeWrapper<UserSettings>;
  UserSubscription: ResolverTypeWrapper<UserSubscription>;
  Webhook: ResolverTypeWrapper<Webhook>;
  WebhookDelivery: ResolverTypeWrapper<WebhookDelivery>;
  WebhookEvent: WebhookEvent;
  WeekOverview: ResolverTypeWrapper<WeekOverview>;
  WeeklyGoalProgress: ResolverTypeWrapper<WeeklyGoalProgress>;
  WeeklyProgress: ResolverTypeWrapper<WeeklyProgress>;
  WeeklyReview: ResolverTypeWrapper<WeeklyReview>;
  WeeklyReviewGoal: ResolverTypeWrapper<WeeklyReviewGoal>;
  WeeklyStats: ResolverTypeWrapper<WeeklyStats>;
  WorkHours: ResolverTypeWrapper<WorkHours>;
  WorkHoursInput: WorkHoursInput;
  WorkWeekSchedule: ResolverTypeWrapper<WorkWeekSchedule>;
  WorkWeekScheduleInput: WorkWeekScheduleInput;
  WorkingHours: ResolverTypeWrapper<WorkingHours>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ActivityMetadata: ActivityMetadata;
  AiMemory: AiMemory;
  ApiKey: ApiKey;
  ApiKeyWithSecret: ApiKeyWithSecret;
  AutopilotMove: AutopilotMove;
  AutopilotProposal: AutopilotProposal;
  AutopilotStatus: AutopilotStatus;
  AvailabilitySchedule: AvailabilitySchedule;
  AvailabilityScheduleInput: AvailabilityScheduleInput;
  AvailabilitySettings: AvailabilitySettings;
  AvailabilitySettingsInput: AvailabilitySettingsInput;
  BillingInfo: BillingInfo;
  BillingPortalSession: BillingPortalSession;
  Booking: Booking;
  Boolean: Scalars['Boolean']['output'];
  BreakTime: BreakTime;
  BreakTimeInput: BreakTimeInput;
  BulkDeleteResult: BulkDeleteResult;
  BusySlot: BusySlot;
  CalculateSleepInput: CalculateSleepInput;
  CalculateTravelTimeInput: CalculateTravelTimeInput;
  CalendarAuthPayload: CalendarAuthPayload;
  CalendarConnection: CalendarConnection;
  CalendarDefense: CalendarDefense;
  CalendarDefenseLogEntry: CalendarDefenseLogEntry;
  CalendarDefenseRunResult: CalendarDefenseRunResult;
  CalendarEvent: CalendarEvent;
  CalendarIntegration: CalendarIntegration;
  CheckoutSession: CheckoutSession;
  CompleteOnboardingInput: CompleteOnboardingInput;
  ConnectCalendarInput: ConnectCalendarInput;
  ConnectIntegrationInput: ConnectIntegrationInput;
  CreateAiMemoryInput: CreateAiMemoryInput;
  CreateApiKeyInput: CreateApiKeyInput;
  CreateBookingInput: CreateBookingInput;
  CreateCalendarEventInput: CreateCalendarEventInput;
  CreateFocusTimeBlockInput: CreateFocusTimeBlockInput;
  CreateGoalInput: CreateGoalInput;
  CreateHabitInput: CreateHabitInput;
  CreateKanbanBoardInput: CreateKanbanBoardInput;
  CreateNoMeetingDayInput: CreateNoMeetingDayInput;
  CreatePlanInput: CreatePlanInput;
  CreatePlanTemplateInput: CreatePlanTemplateInput;
  CreateProjectInput: CreateProjectInput;
  CreateSchedulingLinkInput: CreateSchedulingLinkInput;
  CreateSmart1on1Input: CreateSmart1on1Input;
  CreateSubtaskInput: CreateSubtaskInput;
  CreateTaskDependencyInput: CreateTaskDependencyInput;
  CreateTaskInput: CreateTaskInput;
  CreateTeamInput: CreateTeamInput;
  CreateWebhookInput: CreateWebhookInput;
  CustomQuestion: CustomQuestion;
  CustomQuestionInput: CustomQuestionInput;
  DailyRitual: DailyRitual;
  DashboardStats: DashboardStats;
  DateRangeInput: DateRangeInput;
  DateTime: Scalars['DateTime']['output'];
  DaySchedule: DaySchedule;
  DayScheduleInput: DayScheduleInput;
  DeletedProject: DeletedProject;
  FeatureLimits: FeatureLimits;
  Float: Scalars['Float']['output'];
  FocusTimeBlock: FocusTimeBlock;
  GenerateFromTemplateInput: GenerateFromTemplateInput;
  GeneratePlanInput: GeneratePlanInput;
  GetGoalSuggestionsInput: GetGoalSuggestionsInput;
  Goal: Goal;
  GoalAnalytics: GoalAnalytics;
  GoalAnalyticsReport: GoalAnalyticsReport;
  GoalSuggestion: GoalSuggestion;
  Habit: Habit;
  ID: Scalars['ID']['output'];
  ImportPmTaskInput: ImportPmTaskInput;
  Int: Scalars['Int']['output'];
  Integration: Integration;
  IntegrationResource: IntegrationResource;
  InviteTeamMemberInput: InviteTeamMemberInput;
  Invoice: Invoice;
  JSON: Scalars['JSON']['output'];
  KanbanBoard: KanbanBoard;
  KanbanColumn: KanbanColumn;
  MoveTaskInKanbanInput: MoveTaskInKanbanInput;
  Mutation: {};
  NoMeetingDay: NoMeetingDay;
  Notification: Notification;
  NotificationPreferences: NotificationPreferences;
  NotificationSettings: NotificationSettings;
  NotificationSettingsInput: NotificationSettingsInput;
  OAuthRedirect: OAuthRedirect;
  OnboardingResult: OnboardingResult;
  OnboardingStatus: OnboardingStatus;
  PaymentMethod: PaymentMethod;
  Plan: Plan;
  PlanFilterInput: PlanFilterInput;
  PlanPreferencesInput: PlanPreferencesInput;
  PlanTemplate: PlanTemplate;
  PmImportResult: PmImportResult;
  PmInboxTask: PmInboxTask;
  PriorityHours: PriorityHours;
  PriorityTimeSlot: PriorityTimeSlot;
  PriorityTimeSlotInput: PriorityTimeSlotInput;
  ProductivityScore: ProductivityScore;
  ProductivityWindow: ProductivityWindow;
  Project: Project;
  ProjectWithStats: ProjectWithStats;
  Query: {};
  QuickAction: QuickAction;
  RecentActivity: RecentActivity;
  RecurrenceRule: RecurrenceRule;
  RecurrenceRuleInput: RecurrenceRuleInput;
  ReferralEntry: ReferralEntry;
  ReferralStats: ReferralStats;
  RescheduleSuggestion: RescheduleSuggestion;
  SchedulingLink: SchedulingLink;
  SleepRecommendation: SleepRecommendation;
  Smart1on1: Smart1on1;
  StreakData: StreakData;
  StreakEntry: StreakEntry;
  String: Scalars['String']['output'];
  Subscription: {};
  SyncError: SyncError;
  SyncResult: SyncResult;
  SyncUserInput: SyncUserInput;
  Task: Task;
  TaskDependency: TaskDependency;
  TaskFilterInput: TaskFilterInput;
  TaskInfo: TaskInfo;
  TaskSortInput: TaskSortInput;
  TaskWithDependencies: TaskWithDependencies;
  Team: Team;
  TeamDashboard: TeamDashboard;
  TeamGoal: TeamGoal;
  TeamInvitation: TeamInvitation;
  TeamMember: TeamMember;
  TeamMemberStat: TeamMemberStat;
  TeamSettings: TeamSettings;
  TeamSettingsInput: TeamSettingsInput;
  TestPushResult: TestPushResult;
  TimeEntry: TimeEntry;
  TimeSlot: TimeSlot;
  TimeSlotInput: TimeSlotInput;
  TravelTime: TravelTime;
  UpcomingInvoice: UpcomingInvoice;
  UpcomingTask: UpcomingTask;
  UpdateCalendarDefenseInput: UpdateCalendarDefenseInput;
  UpdateCalendarEventInput: UpdateCalendarEventInput;
  UpdateDailyRitualInput: UpdateDailyRitualInput;
  UpdateFocusTimeBlockInput: UpdateFocusTimeBlockInput;
  UpdateGoalInput: UpdateGoalInput;
  UpdateHabitInput: UpdateHabitInput;
  UpdateIntegrationInput: UpdateIntegrationInput;
  UpdateKanbanBoardInput: UpdateKanbanBoardInput;
  UpdateNotificationPreferencesInput: UpdateNotificationPreferencesInput;
  UpdateOnboardingProgressInput: UpdateOnboardingProgressInput;
  UpdatePlanInput: UpdatePlanInput;
  UpdatePriorityHoursInput: UpdatePriorityHoursInput;
  UpdateProjectInput: UpdateProjectInput;
  UpdateSchedulingLinkInput: UpdateSchedulingLinkInput;
  UpdateSmart1on1Input: UpdateSmart1on1Input;
  UpdateTaskInput: UpdateTaskInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserSettingsInput: UpdateUserSettingsInput;
  UpdateWebhookInput: UpdateWebhookInput;
  UsageStats: UsageStats;
  User: User;
  UserSettings: UserSettings;
  UserSubscription: UserSubscription;
  Webhook: Webhook;
  WebhookDelivery: WebhookDelivery;
  WeekOverview: WeekOverview;
  WeeklyGoalProgress: WeeklyGoalProgress;
  WeeklyProgress: WeeklyProgress;
  WeeklyReview: WeeklyReview;
  WeeklyReviewGoal: WeeklyReviewGoal;
  WeeklyStats: WeeklyStats;
  WorkHours: WorkHours;
  WorkHoursInput: WorkHoursInput;
  WorkWeekSchedule: WorkWeekSchedule;
  WorkWeekScheduleInput: WorkWeekScheduleInput;
  WorkingHours: WorkingHours;
}>;

export type ActivityMetadataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ActivityMetadata'] = ResolversParentTypes['ActivityMetadata']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  goalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taskId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  taskTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AiMemoryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AiMemory'] = ResolversParentTypes['AiMemory']> = ResolversObject<{
  confidence?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  memoryType?: Resolver<ResolversTypes['MemoryType'], ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  useCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ApiKeyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ApiKey'] = ResolversParentTypes['ApiKey']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  keyPrefix?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rateLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scopes?: Resolver<Array<ResolversTypes['ApiScope']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  usageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ApiKeyWithSecretResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ApiKeyWithSecret'] = ResolversParentTypes['ApiKeyWithSecret']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyPrefix?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rateLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  scopes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AutopilotMoveResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AutopilotMove'] = ResolversParentTypes['AutopilotMove']> = ResolversObject<{
  fromDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  fromStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  toEnd?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toStart?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AutopilotProposalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AutopilotProposal'] = ResolversParentTypes['AutopilotProposal']> = ResolversObject<{
  appliedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  moves?: Resolver<Array<ResolversTypes['AutopilotMove']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  trigger?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AutopilotStatusResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AutopilotStatus'] = ResolversParentTypes['AutopilotStatus']> = ResolversObject<{
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  mode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pending?: Resolver<Maybe<ResolversTypes['AutopilotProposal']>, ParentType, ContextType>;
  recent?: Resolver<Array<ResolversTypes['AutopilotProposal']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AvailabilityScheduleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AvailabilitySchedule'] = ResolversParentTypes['AvailabilitySchedule']> = ResolversObject<{
  friday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  monday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  saturday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  sunday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  thursday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  tuesday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  wednesday?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AvailabilitySettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AvailabilitySettings'] = ResolversParentTypes['AvailabilitySettings']> = ResolversObject<{
  schedule?: Resolver<ResolversTypes['AvailabilitySchedule'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BillingInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BillingInfo'] = ResolversParentTypes['BillingInfo']> = ResolversObject<{
  invoices?: Resolver<Array<ResolversTypes['Invoice']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  stripeCustomerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  upcomingInvoice?: Resolver<Maybe<ResolversTypes['UpcomingInvoice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BillingPortalSessionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BillingPortalSession'] = ResolversParentTypes['BillingPortalSession']> = ResolversObject<{
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BookingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = ResolversObject<{
  attendeeEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  attendeeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  attendeePhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  calendarEventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canceledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customResponses?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  link?: Resolver<ResolversTypes['SchedulingLink'], ParentType, ContextType>;
  linkId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reminderSent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BookingStatus'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BreakTimeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BreakTime'] = ResolversParentTypes['BreakTime']> = ResolversObject<{
  end?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BulkDeleteResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BulkDeleteResult'] = ResolversParentTypes['BulkDeleteResult']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BusySlotResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BusySlot'] = ResolversParentTypes['BusySlot']> = ResolversObject<{
  end?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarAuthPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarAuthPayload'] = ResolversParentTypes['CalendarAuthPayload']> = ResolversObject<{
  provider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarConnectionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarConnection'] = ResolversParentTypes['CalendarConnection']> = ResolversObject<{
  calendarId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  calendarName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['CalendarEvent']>, ParentType, ContextType, Partial<CalendarConnectionEventsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastSyncAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['CalendarProvider'], ParentType, ContextType>;
  syncEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  syncErrors?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarDefenseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarDefense'] = ResolversParentTypes['CalendarDefense']> = ResolversObject<{
  autoAcceptDuringOpenHours?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  autoDeclineDoubleBookings?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  autoDeclineDuringFocusTime?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  autoDeclineOutsideWorkHours?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bufferMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  defaultMeetingDuration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  minimumNoticeHours?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  requireBufferBetweenMeetings?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireMinimumNotice?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  suggestShorterMeetings?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarDefenseLogEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarDefenseLogEntry'] = ResolversParentTypes['CalendarDefenseLogEntry']> = ResolversObject<{
  action?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  eventId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventStart?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  eventTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarDefenseRunResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarDefenseRunResult'] = ResolversParentTypes['CalendarDefenseRunResult']> = ResolversObject<{
  actions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarEvent'] = ResolversParentTypes['CalendarEvent']> = ResolversObject<{
  allDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  attendees?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  end?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['CalendarProvider'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CalendarIntegrationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarIntegration'] = ResolversParentTypes['CalendarIntegration']> = ResolversObject<{
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isConnected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastSyncedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['CalendarProvider'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CheckoutSessionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CheckoutSession'] = ResolversParentTypes['CheckoutSession']> = ResolversObject<{
  sessionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomQuestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CustomQuestion'] = ResolversParentTypes['CustomQuestion']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  options?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  required?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['QuestionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DailyRitualResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyRitual'] = ResolversParentTypes['DailyRitual']> = ResolversObject<{
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  intention?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  planCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reflection?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DashboardStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DashboardStats'] = ResolversParentTypes['DashboardStats']> = ResolversObject<{
  activeGoals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  averagePlanQuality?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  currentStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  goalsMilestones?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  longestStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  todayCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  todayCompletionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  todayTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPlans?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weekCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weekCompletionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  weekTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DayScheduleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DaySchedule'] = ResolversParentTypes['DaySchedule']> = ResolversObject<{
  breakTimes?: Resolver<Array<ResolversTypes['BreakTime']>, ParentType, ContextType>;
  endTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isWorkDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeletedProjectResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DeletedProject'] = ResolversParentTypes['DeletedProject']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FeatureLimitsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FeatureLimits'] = ResolversParentTypes['FeatureLimits']> = ResolversObject<{
  advancedInsights?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aiGenerations?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  aiModel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  aiPlansPerMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  apiAccess?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  calendarSync?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  customBranding?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maxActiveGoals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxGoals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxProjects?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  maxTasks?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  maxTasksPerPlan?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  offlineMode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  plansPerMonth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plansPerWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  prioritySupport?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tasksPerDay?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  teamMembers?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  teamWorkspaces?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FocusTimeBlockResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FocusTimeBlock'] = ResolversParentTypes['FocusTimeBlock']> = ResolversObject<{
  autoSchedule?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  calendarProvider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  calendarSyncedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  daysOfWeek?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['FocusFrequency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  preferredTimeSlots?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  protected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Goal'] = ResolversParentTypes['Goal']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completionRate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentProgress?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  currentStreak?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  deadline?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  durationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  flexibilityScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  frequencyPerWeek?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isArchived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPaused?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastCompletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  longestStreak?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pausedUntil?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  preferredTimes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  targetMetric?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  targetValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taskCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalCompletions?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalScheduled?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoalAnalyticsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoalAnalytics'] = ResolversParentTypes['GoalAnalytics']> = ResolversObject<{
  averageDuration?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bestTimeOfDay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  goalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  streakData?: Resolver<ResolversTypes['StreakData'], ParentType, ContextType>;
  totalCompletions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weeklyProgress?: Resolver<Array<ResolversTypes['WeeklyProgress']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoalAnalyticsReportResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoalAnalyticsReport'] = ResolversParentTypes['GoalAnalyticsReport']> = ResolversObject<{
  averageDuration?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  bestTimeOfDay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  currentStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  goal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType>;
  goalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  longestStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCompletions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalScheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weeklyProgress?: Resolver<Array<ResolversTypes['WeeklyGoalProgress']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GoalSuggestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GoalSuggestion'] = ResolversParentTypes['GoalSuggestion']> = ResolversObject<{
  context?: Resolver<ResolversTypes['UserContext'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  focusArea?: Resolver<ResolversTypes['FocusArea'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HabitResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Habit'] = ResolversParentTypes['Habit']> = ResolversObject<{
  calendarProvider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  calendarSyncedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  daysOfWeek?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  flexible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  preferredWindowEnd?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preferredWindowStart?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IntegrationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Integration'] = ResolversParentTypes['Integration']> = ResolversObject<{
  config?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastSyncAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IntegrationResourceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['IntegrationResource'] = ResolversParentTypes['IntegrationResource']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvoiceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = ResolversObject<{
  amountDue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  amountPaid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  created?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostedInvoiceUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  invoicePdf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type KanbanBoardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['KanbanBoard'] = ResolversParentTypes['KanbanBoard']> = ResolversObject<{
  columns?: Resolver<Array<ResolversTypes['KanbanColumn']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KanbanColumnResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['KanbanColumn'] = ResolversParentTypes['KanbanColumn']> = ResolversObject<{
  boardId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  taskIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  acceptPlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationAcceptPlanArgs, 'id'>>;
  acceptTeamInvitation?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType, RequireFields<MutationAcceptTeamInvitationArgs, 'token'>>;
  applyAutopilotProposal?: Resolver<ResolversTypes['AutopilotProposal'], ParentType, ContextType, RequireFields<MutationApplyAutopilotProposalArgs, 'id'>>;
  archiveProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationArchiveProjectArgs, 'id'>>;
  bulkDeleteTasks?: Resolver<ResolversTypes['BulkDeleteResult'], ParentType, ContextType, RequireFields<MutationBulkDeleteTasksArgs, 'ids'>>;
  bulkUpdateTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationBulkUpdateTasksArgs, 'ids' | 'input'>>;
  calculateProductivityScore?: Resolver<ResolversTypes['ProductivityScore'], ParentType, ContextType, RequireFields<MutationCalculateProductivityScoreArgs, 'date'>>;
  calculateTravelTime?: Resolver<ResolversTypes['TravelTime'], ParentType, ContextType, RequireFields<MutationCalculateTravelTimeArgs, 'input'>>;
  cancelBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCancelBookingArgs, 'id'>>;
  cancelSubscription?: Resolver<ResolversTypes['UserSubscription'], ParentType, ContextType>;
  completeOnboarding?: Resolver<ResolversTypes['OnboardingResult'], ParentType, ContextType, RequireFields<MutationCompleteOnboardingArgs, 'input'>>;
  completeTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationCompleteTaskArgs, 'id'>>;
  confirmBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationConfirmBookingArgs, 'id'>>;
  connectCalendar?: Resolver<ResolversTypes['CalendarConnection'], ParentType, ContextType, RequireFields<MutationConnectCalendarArgs, 'input'>>;
  connectIntegration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType, RequireFields<MutationConnectIntegrationArgs, 'input'>>;
  createAiMemory?: Resolver<ResolversTypes['AiMemory'], ParentType, ContextType, RequireFields<MutationCreateAiMemoryArgs, 'input'>>;
  createApiKey?: Resolver<ResolversTypes['ApiKeyWithSecret'], ParentType, ContextType, RequireFields<MutationCreateApiKeyArgs, 'input'>>;
  createBillingPortalSession?: Resolver<ResolversTypes['BillingPortalSession'], ParentType, ContextType>;
  createBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCreateBookingArgs, 'input'>>;
  createCalendarEvent?: Resolver<ResolversTypes['CalendarEvent'], ParentType, ContextType, RequireFields<MutationCreateCalendarEventArgs, 'input'>>;
  createCheckoutSession?: Resolver<ResolversTypes['CheckoutSession'], ParentType, ContextType, RequireFields<MutationCreateCheckoutSessionArgs, 'interval' | 'tier'>>;
  createFocusTimeBlock?: Resolver<ResolversTypes['FocusTimeBlock'], ParentType, ContextType, RequireFields<MutationCreateFocusTimeBlockArgs, 'input'>>;
  createGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationCreateGoalArgs, 'input'>>;
  createHabit?: Resolver<ResolversTypes['Habit'], ParentType, ContextType, RequireFields<MutationCreateHabitArgs, 'input'>>;
  createKanbanBoard?: Resolver<ResolversTypes['KanbanBoard'], ParentType, ContextType, RequireFields<MutationCreateKanbanBoardArgs, 'input'>>;
  createNoMeetingDay?: Resolver<ResolversTypes['NoMeetingDay'], ParentType, ContextType, RequireFields<MutationCreateNoMeetingDayArgs, 'input'>>;
  createPlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationCreatePlanArgs, 'input'>>;
  createPlanTemplate?: Resolver<ResolversTypes['PlanTemplate'], ParentType, ContextType, RequireFields<MutationCreatePlanTemplateArgs, 'input'>>;
  createProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createSchedulingLink?: Resolver<ResolversTypes['SchedulingLink'], ParentType, ContextType, RequireFields<MutationCreateSchedulingLinkArgs, 'input'>>;
  createSmart1on1?: Resolver<ResolversTypes['Smart1on1'], ParentType, ContextType, RequireFields<MutationCreateSmart1on1Args, 'input'>>;
  createSubtask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationCreateSubtaskArgs, 'input'>>;
  createTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'input'>>;
  createTaskDependency?: Resolver<ResolversTypes['TaskDependency'], ParentType, ContextType, RequireFields<MutationCreateTaskDependencyArgs, 'input'>>;
  createTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationCreateTeamArgs, 'input'>>;
  createWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationCreateWebhookArgs, 'input'>>;
  deleteAiMemory?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteAiMemoryArgs, 'id'>>;
  deleteApiKey?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteApiKeyArgs, 'id'>>;
  deleteCalendarEvent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCalendarEventArgs, 'id'>>;
  deleteFocusTimeBlock?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteFocusTimeBlockArgs, 'id'>>;
  deleteGoal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGoalArgs, 'id'>>;
  deleteHabit?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteHabitArgs, 'id'>>;
  deleteKanbanBoard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteKanbanBoardArgs, 'id'>>;
  deleteMyAccount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  deleteNoMeetingDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteNoMeetingDayArgs, 'id'>>;
  deletePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationDeletePlanArgs, 'id'>>;
  deletePlanTemplate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePlanTemplateArgs, 'id'>>;
  deleteProject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'id'>>;
  deleteSchedulingLink?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSchedulingLinkArgs, 'id'>>;
  deleteSmart1on1?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteSmart1on1Args, 'id'>>;
  deleteTask?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTaskArgs, 'id'>>;
  deleteTaskDependency?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTaskDependencyArgs, 'id'>>;
  deleteTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTeamArgs, 'id'>>;
  deleteWebhook?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteWebhookArgs, 'id'>>;
  disconnectCalendar?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDisconnectCalendarArgs, 'id'>>;
  disconnectIntegration?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDisconnectIntegrationArgs, 'id'>>;
  dismissAutopilotProposal?: Resolver<ResolversTypes['AutopilotProposal'], ParentType, ContextType, RequireFields<MutationDismissAutopilotProposalArgs, 'id'>>;
  generateInsights?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  generatePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationGeneratePlanArgs, 'input'>>;
  generatePlanFromTemplate?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationGeneratePlanFromTemplateArgs, 'input'>>;
  importPmTasks?: Resolver<ResolversTypes['PmImportResult'], ParentType, ContextType, RequireFields<MutationImportPmTasksArgs, 'items'>>;
  initiateCalendarAuth?: Resolver<ResolversTypes['CalendarAuthPayload'], ParentType, ContextType, RequireFields<MutationInitiateCalendarAuthArgs, 'provider'>>;
  initiateIntegrationOAuth?: Resolver<ResolversTypes['OAuthRedirect'], ParentType, ContextType, RequireFields<MutationInitiateIntegrationOAuthArgs, 'type'>>;
  inviteTeamMember?: Resolver<ResolversTypes['TeamInvitation'], ParentType, ContextType, RequireFields<MutationInviteTeamMemberArgs, 'input'>>;
  logTime?: Resolver<ResolversTypes['TimeEntry'], ParentType, ContextType, RequireFields<MutationLogTimeArgs, 'minutes' | 'taskId'>>;
  markNotificationAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMarkNotificationAsReadArgs, 'id'>>;
  moveTaskInKanban?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMoveTaskInKanbanArgs, 'input'>>;
  pauseGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationPauseGoalArgs, 'id'>>;
  redeemReferral?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRedeemReferralArgs, 'code'>>;
  regeneratePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationRegeneratePlanArgs, 'id'>>;
  registerPushToken?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRegisterPushTokenArgs, 'subscription'>>;
  removeTeamMember?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveTeamMemberArgs, 'teamId' | 'userId'>>;
  resumeGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationResumeGoalArgs, 'id'>>;
  resumeSubscription?: Resolver<ResolversTypes['UserSubscription'], ParentType, ContextType>;
  retryWebhookDelivery?: Resolver<ResolversTypes['WebhookDelivery'], ParentType, ContextType, RequireFields<MutationRetryWebhookDeliveryArgs, 'deliveryId'>>;
  runAutopilot?: Resolver<Maybe<ResolversTypes['AutopilotProposal']>, ParentType, ContextType, Partial<MutationRunAutopilotArgs>>;
  runCalendarDefense?: Resolver<ResolversTypes['CalendarDefenseRunResult'], ParentType, ContextType>;
  saveAsPlanTemplate?: Resolver<ResolversTypes['PlanTemplate'], ParentType, ContextType, RequireFields<MutationSaveAsPlanTemplateArgs, 'name' | 'planId'>>;
  scheduleSmart1on1?: Resolver<ResolversTypes['Smart1on1'], ParentType, ContextType, RequireFields<MutationScheduleSmart1on1Args, 'id'>>;
  sendTestPush?: Resolver<ResolversTypes['TestPushResult'], ParentType, ContextType>;
  setDefaultPlanTemplate?: Resolver<ResolversTypes['PlanTemplate'], ParentType, ContextType, RequireFields<MutationSetDefaultPlanTemplateArgs, 'id'>>;
  shareGoalWithTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationShareGoalWithTeamArgs, 'goalId' | 'teamId'>>;
  skipTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationSkipTaskArgs, 'id'>>;
  startTimer?: Resolver<ResolversTypes['TimeEntry'], ParentType, ContextType, RequireFields<MutationStartTimerArgs, 'taskId'>>;
  stopTimer?: Resolver<ResolversTypes['TimeEntry'], ParentType, ContextType, RequireFields<MutationStopTimerArgs, 'taskId'>>;
  syncAllCalendars?: Resolver<Array<ResolversTypes['SyncResult']>, ParentType, ContextType>;
  syncCalendar?: Resolver<ResolversTypes['SyncResult'], ParentType, ContextType, RequireFields<MutationSyncCalendarArgs, 'id'>>;
  syncIntegration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType, RequireFields<MutationSyncIntegrationArgs, 'id'>>;
  syncUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationSyncUserArgs, 'input'>>;
  toggleApiKey?: Resolver<ResolversTypes['ApiKey'], ParentType, ContextType, RequireFields<MutationToggleApiKeyArgs, 'id'>>;
  toggleSchedulingLink?: Resolver<ResolversTypes['SchedulingLink'], ParentType, ContextType, RequireFields<MutationToggleSchedulingLinkArgs, 'id'>>;
  toggleWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationToggleWebhookArgs, 'id'>>;
  unarchiveProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUnarchiveProjectArgs, 'id'>>;
  uncompleteTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationUncompleteTaskArgs, 'id'>>;
  unregisterPushToken?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnregisterPushTokenArgs, 'endpoint'>>;
  unshareGoalFromTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnshareGoalFromTeamArgs, 'goalId'>>;
  updateAutopilotSettings?: Resolver<ResolversTypes['AutopilotStatus'], ParentType, ContextType, Partial<MutationUpdateAutopilotSettingsArgs>>;
  updateCalendarDefense?: Resolver<ResolversTypes['CalendarDefense'], ParentType, ContextType, RequireFields<MutationUpdateCalendarDefenseArgs, 'input'>>;
  updateCalendarEvent?: Resolver<ResolversTypes['CalendarEvent'], ParentType, ContextType, RequireFields<MutationUpdateCalendarEventArgs, 'id' | 'input'>>;
  updateDailyRitual?: Resolver<ResolversTypes['DailyRitual'], ParentType, ContextType, RequireFields<MutationUpdateDailyRitualArgs, 'input'>>;
  updateFocusTimeBlock?: Resolver<ResolversTypes['FocusTimeBlock'], ParentType, ContextType, RequireFields<MutationUpdateFocusTimeBlockArgs, 'id' | 'input'>>;
  updateGoal?: Resolver<ResolversTypes['Goal'], ParentType, ContextType, RequireFields<MutationUpdateGoalArgs, 'id' | 'input'>>;
  updateHabit?: Resolver<ResolversTypes['Habit'], ParentType, ContextType, RequireFields<MutationUpdateHabitArgs, 'id' | 'input'>>;
  updateIntegration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType, RequireFields<MutationUpdateIntegrationArgs, 'id' | 'input'>>;
  updateKanbanBoard?: Resolver<ResolversTypes['KanbanBoard'], ParentType, ContextType, RequireFields<MutationUpdateKanbanBoardArgs, 'id' | 'input'>>;
  updateNotificationPreferences?: Resolver<ResolversTypes['NotificationPreferences'], ParentType, ContextType, RequireFields<MutationUpdateNotificationPreferencesArgs, 'input'>>;
  updateOnboardingProgress?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUpdateOnboardingProgressArgs, 'input'>>;
  updatePaymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationUpdatePaymentMethodArgs, 'paymentMethodId'>>;
  updatePlan?: Resolver<ResolversTypes['Plan'], ParentType, ContextType, RequireFields<MutationUpdatePlanArgs, 'id' | 'input'>>;
  updatePriorityHours?: Resolver<ResolversTypes['PriorityHours'], ParentType, ContextType, RequireFields<MutationUpdatePriorityHoursArgs, 'input'>>;
  updateProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUpdateProjectArgs, 'id' | 'input'>>;
  updateSchedulingLink?: Resolver<ResolversTypes['SchedulingLink'], ParentType, ContextType, RequireFields<MutationUpdateSchedulingLinkArgs, 'id' | 'input'>>;
  updateSmart1on1?: Resolver<ResolversTypes['Smart1on1'], ParentType, ContextType, RequireFields<MutationUpdateSmart1on1Args, 'id' | 'input'>>;
  updateTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationUpdateTaskArgs, 'id' | 'input'>>;
  updateTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUpdateTeamArgs, 'id' | 'input'>>;
  updateTeamMemberRole?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType, RequireFields<MutationUpdateTeamMemberRoleArgs, 'role' | 'teamId' | 'userId'>>;
  updateUserProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  updateUserSettings?: Resolver<ResolversTypes['UserSettings'], ParentType, ContextType, RequireFields<MutationUpdateUserSettingsArgs, 'input'>>;
  updateWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationUpdateWebhookArgs, 'id' | 'input'>>;
  updateWorkHours?: Resolver<ResolversTypes['WorkHours'], ParentType, ContextType, RequireFields<MutationUpdateWorkHoursArgs, 'input'>>;
  upgradeSubscription?: Resolver<ResolversTypes['CheckoutSession'], ParentType, ContextType, RequireFields<MutationUpgradeSubscriptionArgs, 'tier'>>;
}>;

export type NoMeetingDayResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NoMeetingDay'] = ResolversParentTypes['NoMeetingDay']> = ResolversObject<{
  allowExceptions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dayOfWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationType'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationPreferencesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NotificationPreferences'] = ResolversParentTypes['NotificationPreferences']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  enableBreakReminders?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableDailyReminders?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableFocusTimeAlerts?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableGoalMilestones?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableOverbookedAlerts?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableTaskReminders?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableUpcomingMeetings?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  enableWeeklyPlan?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quietHoursEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quietHoursStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reminderMinutesBefore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type NotificationSettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NotificationSettings'] = ResolversParentTypes['NotificationSettings']> = ResolversObject<{
  email?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  goalMilestones?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  planReminders?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  productivityInsights?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  push?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  reminders?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  taskReminders?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  weeklySummary?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OAuthRedirectResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OAuthRedirect'] = ResolversParentTypes['OAuthRedirect']> = ResolversObject<{
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OnboardingResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OnboardingResult'] = ResolversParentTypes['OnboardingResult']> = ResolversObject<{
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OnboardingStatusResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OnboardingStatus'] = ResolversParentTypes['OnboardingStatus']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  currentStep?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PaymentMethodResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = ResolversObject<{
  brand?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expMonth?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expYear?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  last4?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlanResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Plan'] = ResolversParentTypes['Plan']> = ResolversObject<{
  aiModel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  generationTime?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  qualityMetrics?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  qualityScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  reasoning?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PlanStatus'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  weekEndDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weekStartDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PlanTemplateResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PlanTemplate'] = ResolversParentTypes['PlanTemplate']> = ResolversObject<{
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creator?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isFeatured?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  structure?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  usageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PmImportResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PmImportResult'] = ResolversParentTypes['PmImportResult']> = ResolversObject<{
  imported?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PmInboxTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PmInboxTask'] = ResolversParentTypes['PmInboxTask']> = ResolversObject<{
  alreadyImported?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  externalId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  integrationId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PriorityHoursResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PriorityHours'] = ResolversParentTypes['PriorityHours']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deprioritizeMeetings?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  prioritizeFocusTime?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  prioritizeTasks?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timeSlots?: Resolver<Array<ResolversTypes['PriorityTimeSlot']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PriorityTimeSlotResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PriorityTimeSlot'] = ResolversParentTypes['PriorityTimeSlot']> = ResolversObject<{
  dayOfWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductivityScoreResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProductivityScore'] = ResolversParentTypes['ProductivityScore']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  focusTimeScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  insights?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  meetingEfficiencyScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  overallScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  recommendations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  taskCompletionScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalBreakMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalFocusMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalMeetingMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalTaskMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  workLifeBalanceScore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductivityWindowResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProductivityWindow'] = ResolversParentTypes['ProductivityWindow']> = ResolversObject<{
  end?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  peak?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = ResolversObject<{
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  completedTaskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  kanbanBoards?: Resolver<Array<ResolversTypes['KanbanBoard']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progressPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  targetDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProjectWithStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ProjectWithStats'] = ResolversParentTypes['ProjectWithStats']> = ResolversObject<{
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  completedTaskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progressPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalEstimatedMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalTrackedMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  aiMemories?: Resolver<Array<ResolversTypes['AiMemory']>, ParentType, ContextType>;
  apiKey?: Resolver<Maybe<ResolversTypes['ApiKey']>, ParentType, ContextType, RequireFields<QueryApiKeyArgs, 'id'>>;
  apiKeys?: Resolver<Array<ResolversTypes['ApiKey']>, ParentType, ContextType>;
  autopilotStatus?: Resolver<ResolversTypes['AutopilotStatus'], ParentType, ContextType>;
  availableSlots?: Resolver<Array<ResolversTypes['TimeSlot']>, ParentType, ContextType, RequireFields<QueryAvailableSlotsArgs, 'date' | 'linkId'>>;
  billingInfo?: Resolver<Maybe<ResolversTypes['BillingInfo']>, ParentType, ContextType>;
  booking?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType, RequireFields<QueryBookingArgs, 'id'>>;
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType, Partial<QueryBookingsArgs>>;
  busySlots?: Resolver<Array<ResolversTypes['BusySlot']>, ParentType, ContextType, RequireFields<QueryBusySlotsArgs, 'endDate' | 'startDate'>>;
  calculateSleepRecommendation?: Resolver<ResolversTypes['SleepRecommendation'], ParentType, ContextType, RequireFields<QueryCalculateSleepRecommendationArgs, 'input'>>;
  calendarConnection?: Resolver<ResolversTypes['CalendarConnection'], ParentType, ContextType, RequireFields<QueryCalendarConnectionArgs, 'id'>>;
  calendarConnections?: Resolver<Array<ResolversTypes['CalendarConnection']>, ParentType, ContextType>;
  calendarDefense?: Resolver<Maybe<ResolversTypes['CalendarDefense']>, ParentType, ContextType>;
  calendarDefenseLog?: Resolver<Array<ResolversTypes['CalendarDefenseLogEntry']>, ParentType, ContextType, Partial<QueryCalendarDefenseLogArgs>>;
  calendarEvents?: Resolver<Array<ResolversTypes['CalendarEvent']>, ParentType, ContextType, Partial<QueryCalendarEventsArgs>>;
  canUseFeature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryCanUseFeatureArgs, 'feature'>>;
  currentPlan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType>;
  dailyRitual?: Resolver<Maybe<ResolversTypes['DailyRitual']>, ParentType, ContextType, RequireFields<QueryDailyRitualArgs, 'date'>>;
  dashboardStats?: Resolver<ResolversTypes['DashboardStats'], ParentType, ContextType>;
  exportMyData?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  focusTimeBlock?: Resolver<Maybe<ResolversTypes['FocusTimeBlock']>, ParentType, ContextType, RequireFields<QueryFocusTimeBlockArgs, 'id'>>;
  focusTimeBlocks?: Resolver<Array<ResolversTypes['FocusTimeBlock']>, ParentType, ContextType, Partial<QueryFocusTimeBlocksArgs>>;
  getGoalSuggestions?: Resolver<Array<ResolversTypes['GoalSuggestion']>, ParentType, ContextType, RequireFields<QueryGetGoalSuggestionsArgs, 'input'>>;
  goal?: Resolver<Maybe<ResolversTypes['Goal']>, ParentType, ContextType, RequireFields<QueryGoalArgs, 'id'>>;
  goalAnalytics?: Resolver<ResolversTypes['GoalAnalytics'], ParentType, ContextType, RequireFields<QueryGoalAnalyticsArgs, 'id'>>;
  goalAnalyticsReport?: Resolver<ResolversTypes['GoalAnalyticsReport'], ParentType, ContextType, RequireFields<QueryGoalAnalyticsReportArgs, 'goalId'>>;
  goals?: Resolver<Array<ResolversTypes['Goal']>, ParentType, ContextType, Partial<QueryGoalsArgs>>;
  habits?: Resolver<Array<ResolversTypes['Habit']>, ParentType, ContextType>;
  insights?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, Partial<QueryInsightsArgs>>;
  integration?: Resolver<Maybe<ResolversTypes['Integration']>, ParentType, ContextType, RequireFields<QueryIntegrationArgs, 'id'>>;
  integrationResources?: Resolver<Array<ResolversTypes['IntegrationResource']>, ParentType, ContextType, RequireFields<QueryIntegrationResourcesArgs, 'id'>>;
  integrations?: Resolver<Array<ResolversTypes['Integration']>, ParentType, ContextType, Partial<QueryIntegrationsArgs>>;
  kanbanBoard?: Resolver<Maybe<ResolversTypes['KanbanBoard']>, ParentType, ContextType, RequireFields<QueryKanbanBoardArgs, 'id'>>;
  kanbanBoards?: Resolver<Array<ResolversTypes['KanbanBoard']>, ParentType, ContextType, Partial<QueryKanbanBoardsArgs>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myReferralStats?: Resolver<ResolversTypes['ReferralStats'], ParentType, ContextType>;
  noMeetingDays?: Resolver<Array<ResolversTypes['NoMeetingDay']>, ParentType, ContextType, Partial<QueryNoMeetingDaysArgs>>;
  notificationPreferences?: Resolver<Maybe<ResolversTypes['NotificationPreferences']>, ParentType, ContextType>;
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, Partial<QueryNotificationsArgs>>;
  onboardingStatus?: Resolver<ResolversTypes['OnboardingStatus'], ParentType, ContextType>;
  plan?: Resolver<Maybe<ResolversTypes['Plan']>, ParentType, ContextType, RequireFields<QueryPlanArgs, 'id'>>;
  planTemplate?: Resolver<Maybe<ResolversTypes['PlanTemplate']>, ParentType, ContextType, RequireFields<QueryPlanTemplateArgs, 'id'>>;
  planTemplates?: Resolver<Array<ResolversTypes['PlanTemplate']>, ParentType, ContextType, Partial<QueryPlanTemplatesArgs>>;
  plans?: Resolver<Array<ResolversTypes['Plan']>, ParentType, ContextType, Partial<QueryPlansArgs>>;
  pmInboxTasks?: Resolver<Array<ResolversTypes['PmInboxTask']>, ParentType, ContextType>;
  priorityHours?: Resolver<Maybe<ResolversTypes['PriorityHours']>, ParentType, ContextType>;
  productivityScore?: Resolver<Maybe<ResolversTypes['ProductivityScore']>, ParentType, ContextType, RequireFields<QueryProductivityScoreArgs, 'date'>>;
  productivityScores?: Resolver<Array<ResolversTypes['ProductivityScore']>, ParentType, ContextType, RequireFields<QueryProductivityScoresArgs, 'endDate' | 'startDate'>>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType, RequireFields<QueryProjectArgs, 'id'>>;
  projectWithStats?: Resolver<ResolversTypes['ProjectWithStats'], ParentType, ContextType, RequireFields<QueryProjectWithStatsArgs, 'id'>>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType, Partial<QueryProjectsArgs>>;
  quickActions?: Resolver<Array<ResolversTypes['QuickAction']>, ParentType, ContextType>;
  recentActivity?: Resolver<Array<ResolversTypes['RecentActivity']>, ParentType, ContextType, Partial<QueryRecentActivityArgs>>;
  rescheduleSuggestion?: Resolver<Maybe<ResolversTypes['RescheduleSuggestion']>, ParentType, ContextType, RequireFields<QueryRescheduleSuggestionArgs, 'taskId'>>;
  schedulingLink?: Resolver<Maybe<ResolversTypes['SchedulingLink']>, ParentType, ContextType, RequireFields<QuerySchedulingLinkArgs, 'id'>>;
  schedulingLinkBySlug?: Resolver<Maybe<ResolversTypes['SchedulingLink']>, ParentType, ContextType, RequireFields<QuerySchedulingLinkBySlugArgs, 'slug'>>;
  schedulingLinks?: Resolver<Array<ResolversTypes['SchedulingLink']>, ParentType, ContextType>;
  searchTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QuerySearchTasksArgs, 'query'>>;
  smart1on1?: Resolver<Maybe<ResolversTypes['Smart1on1']>, ParentType, ContextType, RequireFields<QuerySmart1on1Args, 'id'>>;
  smart1on1s?: Resolver<Array<ResolversTypes['Smart1on1']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['UserSubscription']>, ParentType, ContextType>;
  subtasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QuerySubtasksArgs, 'parentTaskId'>>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTaskArgs, 'id'>>;
  taskWithDependencies?: Resolver<ResolversTypes['TaskWithDependencies'], ParentType, ContextType, RequireFields<QueryTaskWithDependenciesArgs, 'id'>>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, Partial<QueryTasksArgs>>;
  tasksByGoal?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTasksByGoalArgs, 'goalId'>>;
  tasksByProject?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTasksByProjectArgs, 'projectId'>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<QueryTeamArgs, 'id'>>;
  teamDashboard?: Resolver<ResolversTypes['TeamDashboard'], ParentType, ContextType, RequireFields<QueryTeamDashboardArgs, 'teamId'>>;
  teamGoals?: Resolver<Array<ResolversTypes['TeamGoal']>, ParentType, ContextType, RequireFields<QueryTeamGoalsArgs, 'teamId'>>;
  teamInvitations?: Resolver<Array<ResolversTypes['TeamInvitation']>, ParentType, ContextType, RequireFields<QueryTeamInvitationsArgs, 'teamId'>>;
  teamMembers?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType, RequireFields<QueryTeamMembersArgs, 'teamId'>>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  upcomingEvents?: Resolver<Array<ResolversTypes['CalendarEvent']>, ParentType, ContextType, Partial<QueryUpcomingEventsArgs>>;
  upcomingTasks?: Resolver<Array<ResolversTypes['UpcomingTask']>, ParentType, ContextType, Partial<QueryUpcomingTasksArgs>>;
  usageStats?: Resolver<ResolversTypes['UsageStats'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userSettings?: Resolver<Maybe<ResolversTypes['UserSettings']>, ParentType, ContextType>;
  webhook?: Resolver<Maybe<ResolversTypes['Webhook']>, ParentType, ContextType, RequireFields<QueryWebhookArgs, 'id'>>;
  webhookDeliveries?: Resolver<Array<ResolversTypes['WebhookDelivery']>, ParentType, ContextType, RequireFields<QueryWebhookDeliveriesArgs, 'webhookId'>>;
  webhooks?: Resolver<Array<ResolversTypes['Webhook']>, ParentType, ContextType>;
  weekOverview?: Resolver<Array<ResolversTypes['WeekOverview']>, ParentType, ContextType, Partial<QueryWeekOverviewArgs>>;
  weeklyReview?: Resolver<ResolversTypes['WeeklyReview'], ParentType, ContextType>;
  weeklyStats?: Resolver<ResolversTypes['WeeklyStats'], ParentType, ContextType, Partial<QueryWeeklyStatsArgs>>;
  workHours?: Resolver<Maybe<ResolversTypes['WorkHours']>, ParentType, ContextType>;
}>;

export type QuickActionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['QuickAction'] = ResolversParentTypes['QuickAction']> = ResolversObject<{
  action?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variant?: Resolver<ResolversTypes['QuickActionVariant'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RecentActivityResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RecentActivity'] = ResolversParentTypes['RecentActivity']> = ResolversObject<{
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['ActivityMetadata']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ActivityType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RecurrenceRuleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RecurrenceRule'] = ResolversParentTypes['RecurrenceRule']> = ResolversObject<{
  dayOfMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  daysOfWeek?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['RecurrenceFrequency'], ParentType, ContextType>;
  interval?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monthOfYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  occurrences?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReferralEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ReferralEntry'] = ResolversParentTypes['ReferralEntry']> = ResolversObject<{
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  referredName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReferralStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ReferralStats'] = ResolversParentTypes['ReferralStats']> = ResolversObject<{
  activeReferrals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pendingReferrals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  referrals?: Resolver<Array<ResolversTypes['ReferralEntry']>, ParentType, ContextType>;
  totalReferrals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RescheduleSuggestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RescheduleSuggestion'] = ResolversParentTypes['RescheduleSuggestion']> = ResolversObject<{
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduledDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SchedulingLinkResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SchedulingLink'] = ResolversParentTypes['SchedulingLink']> = ResolversObject<{
  availability?: Resolver<ResolversTypes['AvailabilitySettings'], ParentType, ContextType>;
  bookingCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  bufferAfter?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bufferBefore?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  confirmationMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customQuestions?: Resolver<Array<ResolversTypes['CustomQuestion']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  maxBookingsPerDay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  noticeTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  redirectUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requiresConfirmation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SleepRecommendationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SleepRecommendation'] = ResolversParentTypes['SleepRecommendation']> = ResolversObject<{
  benefits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  cycles?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  energyPattern?: Resolver<ResolversTypes['EnergyPattern'], ParentType, ContextType>;
  explanation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  optimalSleepTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productivityWindow?: Resolver<ResolversTypes['ProductivityWindow'], ParentType, ContextType>;
  tips?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  totalSleepHours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  wakeTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  windDownTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Smart1on1Resolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Smart1on1'] = ResolversParentTypes['Smart1on1']> = ResolversObject<{
  agendaTemplate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['Smart1on1Frequency'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastMeetingDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  nextMeetingDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  participantEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preferredDays?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  preferredTimes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StreakDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StreakData'] = ResolversParentTypes['StreakData']> = ResolversObject<{
  currentStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  longestStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  streakHistory?: Resolver<Array<ResolversTypes['StreakEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StreakEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StreakEntry'] = ResolversParentTypes['StreakEntry']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  _empty?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "_empty", ParentType, ContextType>;
  calendarSyncStatus?: SubscriptionResolver<ResolversTypes['SyncResult'], "calendarSyncStatus", ParentType, ContextType, RequireFields<SubscriptionCalendarSyncStatusArgs, 'userId'>>;
  focusTimeCreated?: SubscriptionResolver<ResolversTypes['FocusTimeBlock'], "focusTimeCreated", ParentType, ContextType>;
  focusTimeDeleted?: SubscriptionResolver<ResolversTypes['ID'], "focusTimeDeleted", ParentType, ContextType>;
  focusTimeUpdated?: SubscriptionResolver<ResolversTypes['FocusTimeBlock'], "focusTimeUpdated", ParentType, ContextType>;
  goalCreated?: SubscriptionResolver<ResolversTypes['Goal'], "goalCreated", ParentType, ContextType, RequireFields<SubscriptionGoalCreatedArgs, 'userId'>>;
  goalDeleted?: SubscriptionResolver<ResolversTypes['ID'], "goalDeleted", ParentType, ContextType, RequireFields<SubscriptionGoalDeletedArgs, 'userId'>>;
  goalUpdated?: SubscriptionResolver<ResolversTypes['Goal'], "goalUpdated", ParentType, ContextType, RequireFields<SubscriptionGoalUpdatedArgs, 'userId'>>;
  kanbanBoardUpdated?: SubscriptionResolver<ResolversTypes['KanbanBoard'], "kanbanBoardUpdated", ParentType, ContextType>;
  noMeetingDayCreated?: SubscriptionResolver<ResolversTypes['NoMeetingDay'], "noMeetingDayCreated", ParentType, ContextType>;
  noMeetingDayDeleted?: SubscriptionResolver<ResolversTypes['ID'], "noMeetingDayDeleted", ParentType, ContextType>;
  notificationPreferencesUpdated?: SubscriptionResolver<ResolversTypes['NotificationPreferences'], "notificationPreferencesUpdated", ParentType, ContextType>;
  notificationRead?: SubscriptionResolver<ResolversTypes['ID'], "notificationRead", ParentType, ContextType>;
  notificationReceived?: SubscriptionResolver<ResolversTypes['Notification'], "notificationReceived", ParentType, ContextType>;
  planGenerated?: SubscriptionResolver<ResolversTypes['Plan'], "planGenerated", ParentType, ContextType, RequireFields<SubscriptionPlanGeneratedArgs, 'userId'>>;
  planUpdated?: SubscriptionResolver<ResolversTypes['Plan'], "planUpdated", ParentType, ContextType, RequireFields<SubscriptionPlanUpdatedArgs, 'planId'>>;
  projectCreated?: SubscriptionResolver<ResolversTypes['Project'], "projectCreated", ParentType, ContextType>;
  projectDeleted?: SubscriptionResolver<ResolversTypes['DeletedProject'], "projectDeleted", ParentType, ContextType>;
  projectUpdated?: SubscriptionResolver<ResolversTypes['Project'], "projectUpdated", ParentType, ContextType>;
  smart1on1Created?: SubscriptionResolver<ResolversTypes['Smart1on1'], "smart1on1Created", ParentType, ContextType>;
  smart1on1Deleted?: SubscriptionResolver<ResolversTypes['ID'], "smart1on1Deleted", ParentType, ContextType>;
  smart1on1Updated?: SubscriptionResolver<ResolversTypes['Smart1on1'], "smart1on1Updated", ParentType, ContextType>;
  taskCreated?: SubscriptionResolver<ResolversTypes['Task'], "taskCreated", ParentType, ContextType, RequireFields<SubscriptionTaskCreatedArgs, 'userId'>>;
  taskDeleted?: SubscriptionResolver<ResolversTypes['ID'], "taskDeleted", ParentType, ContextType, RequireFields<SubscriptionTaskDeletedArgs, 'userId'>>;
  taskUpdated?: SubscriptionResolver<ResolversTypes['Task'], "taskUpdated", ParentType, ContextType, RequireFields<SubscriptionTaskUpdatedArgs, 'userId'>>;
  timerStarted?: SubscriptionResolver<ResolversTypes['TimeEntry'], "timerStarted", ParentType, ContextType, RequireFields<SubscriptionTimerStartedArgs, 'userId'>>;
  timerStopped?: SubscriptionResolver<ResolversTypes['TimeEntry'], "timerStopped", ParentType, ContextType, RequireFields<SubscriptionTimerStoppedArgs, 'userId'>>;
  workHoursUpdated?: SubscriptionResolver<ResolversTypes['WorkHours'], "workHoursUpdated", ParentType, ContextType>;
}>;

export type SyncErrorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SyncError'] = ResolversParentTypes['SyncError']> = ResolversObject<{
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taskId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SyncResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SyncResult'] = ResolversParentTypes['SyncResult']> = ResolversObject<{
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<Array<ResolversTypes['SyncError']>, ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['CalendarProvider'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tasksAttempted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasksFailed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasksSucceeded?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = ResolversObject<{
  actualEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  actualStartTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  aiGenerated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  aiReasoning?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  blockedBy?: Resolver<Array<ResolversTypes['TaskDependency']>, ParentType, ContextType>;
  blockedByCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  calendarEventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  calendarProvider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dependencies?: Resolver<Array<ResolversTypes['TaskDependency']>, ParentType, ContextType>;
  dependencyCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  goal?: Resolver<Maybe<ResolversTypes['Goal']>, ParentType, ContextType>;
  goalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  instanceDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRecurringInstance?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSkipped?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isTimerRunning?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  localId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  manuallyAdded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  manuallyMoved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  offlineCreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  parentTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  parentTaskId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  pendingSync?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  planId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  recurrenceRule?: Resolver<Maybe<ResolversTypes['RecurrenceRule']>, ParentType, ContextType>;
  recurringTaskId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  scheduledDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  skippedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  skippedReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subtaskCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subtasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  syncError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  syncStatus?: Resolver<ResolversTypes['SyncStatus'], ParentType, ContextType>;
  syncedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  timeEntries?: Resolver<Array<ResolversTypes['TimeEntry']>, ParentType, ContextType>;
  timeSpentMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timerStartedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskDependencyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskDependency'] = ResolversParentTypes['TaskDependency']> = ResolversObject<{
  blockingTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  blockingTaskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dependentTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  dependentTaskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DependencyType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskInfo'] = ResolversParentTypes['TaskInfo']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TaskWithDependenciesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskWithDependencies'] = ResolversParentTypes['TaskWithDependencies']> = ResolversObject<{
  blockingTasks?: Resolver<Array<ResolversTypes['TaskInfo']>, ParentType, ContextType>;
  canStart?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  dependentTasks?: Resolver<Array<ResolversTypes['TaskInfo']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scheduledDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitations?: Resolver<Array<ResolversTypes['TeamInvitation']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  maxMembers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  plan?: Resolver<ResolversTypes['TeamPlan'], ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['TeamSettings'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamDashboardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamDashboard'] = ResolversParentTypes['TeamDashboard']> = ResolversObject<{
  completionRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['TeamGoal']>, ParentType, ContextType>;
  memberCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['TeamMemberStat']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalTasksCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamGoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamGoal'] = ResolversParentTypes['TeamGoal']> = ResolversObject<{
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  emoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  ownerName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamInvitationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamInvitation'] = ResolversParentTypes['TeamInvitation']> = ResolversObject<{
  acceptedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitedBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inviter?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['TeamRole'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamMemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamMember'] = ResolversParentTypes['TeamMember']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  joinedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['TeamRole'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['MemberStatus'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamMemberStatResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamMemberStat'] = ResolversParentTypes['TeamMemberStat']> = ResolversObject<{
  completionRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tasksCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasksTotal?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamSettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamSettings'] = ResolversParentTypes['TeamSettings']> = ResolversObject<{
  allowMemberInvites?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireApproval?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  sharedCalendar?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  sharedGoals?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TestPushResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TestPushResult'] = ResolversParentTypes['TestPushResult']> = ResolversObject<{
  configured?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TimeEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TimeEntry'] = ResolversParentTypes['TimeEntry']> = ResolversObject<{
  actualEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  actualStartTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  isTimerRunning?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeSpentMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timerStartedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TimeSlotResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TimeSlot'] = ResolversParentTypes['TimeSlot']> = ResolversObject<{
  end?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TravelTimeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TravelTime'] = ResolversParentTypes['TravelTime']> = ResolversObject<{
  distance?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fromLocation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mode?: Resolver<ResolversTypes['TravelMode'], ParentType, ContextType>;
  toLocation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpcomingInvoiceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UpcomingInvoice'] = ResolversParentTypes['UpcomingInvoice']> = ResolversObject<{
  amountDue?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  periodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  periodStart?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpcomingTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UpcomingTask'] = ResolversParentTypes['UpcomingTask']> = ResolversObject<{
  dueDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  estimatedDuration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  goalEmoji?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goalId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  goalTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UsageStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UsageStats'] = ResolversParentTypes['UsageStats']> = ResolversObject<{
  aiGenerationLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  aiGenerationsUsed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  aiUsagePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  goalLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  goalUsagePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  goalsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  planLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  planUsagePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  plansGenerated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resetsAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  taskLimit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  taskUsagePercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  tasksCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  clerkId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyPattern?: Resolver<Maybe<ResolversTypes['EnergyPattern']>, ParentType, ContextType>;
  focusAreas?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  fullName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastSeenAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  onboardingCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onboardingStep?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productivityPeaks?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  settings?: Resolver<Maybe<ResolversTypes['UserSettings']>, ParentType, ContextType>;
  sleepTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subscriptionStatus?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['SubscriptionTier'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  wakeTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workEndTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workStartTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserSettings'] = ResolversParentTypes['UserSettings']> = ResolversObject<{
  calendarIntegrations?: Resolver<Maybe<Array<ResolversTypes['CalendarIntegration']>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  defaultTaskDuration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  energyPattern?: Resolver<Maybe<ResolversTypes['EnergyPattern']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notifications?: Resolver<Maybe<ResolversTypes['NotificationSettings']>, ParentType, ContextType>;
  onboardingCompleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  onboardingCompletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  theme?: Resolver<Maybe<ResolversTypes['Theme']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  workingHours?: Resolver<Maybe<ResolversTypes['WorkingHours']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserSubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['UserSubscription'] = ResolversParentTypes['UserSubscription']> = ResolversObject<{
  cancelAtPeriodEnd?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canceledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentPeriodEnd?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  currentPeriodStart?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  features?: Resolver<ResolversTypes['FeatureLimits'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  stripeCustomerId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeSubscriptionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['SubscriptionTier'], ParentType, ContextType>;
  trialEnd?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  trialStart?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WebhookResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Webhook'] = ResolversParentTypes['Webhook']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deliveries?: Resolver<Array<ResolversTypes['WebhookDelivery']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['WebhookEvent']>, ParentType, ContextType>;
  failureCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastTriggeredAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  secret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WebhookDeliveryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WebhookDelivery'] = ResolversParentTypes['WebhookDelivery']> = ResolversObject<{
  attempts?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event?: Resolver<ResolversTypes['WebhookEvent'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastAttemptAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  payload?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  responseBody?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['DeliveryStatus'], ParentType, ContextType>;
  statusCode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  webhookId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeekOverviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeekOverview'] = ResolversParentTypes['WeekOverview']> = ResolversObject<{
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dayOfWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productivity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  tasksCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasksScheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalDuration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyGoalProgressResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeeklyGoalProgress'] = ResolversParentTypes['WeeklyGoalProgress']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  scheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyProgressResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeeklyProgress'] = ResolversParentTypes['WeeklyProgress']> = ResolversObject<{
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  scheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeeklyReview'] = ResolversParentTypes['WeeklyReview']> = ResolversObject<{
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  goalsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plansGenerated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  productivity?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recommendation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tasksCompleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  topGoals?: Resolver<Array<ResolversTypes['WeeklyReviewGoal']>, ParentType, ContextType>;
  weekEndDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weekStartDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyReviewGoalResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeeklyReviewGoal'] = ResolversParentTypes['WeeklyReviewGoal']> = ResolversObject<{
  completions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeeklyStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeeklyStats'] = ResolversParentTypes['WeeklyStats']> = ResolversObject<{
  activeGoals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  averageProductivityScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bestDay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  currentStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  focusHours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  goalsCompletionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longestStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalHoursCompleted?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalHoursScheduled?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalTasks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  weekEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weekStart?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  worstDay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkHoursResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkHours'] = ResolversParentTypes['WorkHours']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  enforceWorkHours?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxConsecutiveMeetings?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  maxMeetingHoursPerDay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  maxMeetingsPerDay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  schedule?: Resolver<ResolversTypes['WorkWeekSchedule'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkWeekScheduleResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkWeekSchedule'] = ResolversParentTypes['WorkWeekSchedule']> = ResolversObject<{
  friday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  monday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  saturday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  sunday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  thursday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  tuesday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  wednesday?: Resolver<ResolversTypes['DaySchedule'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkingHoursResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkingHours'] = ResolversParentTypes['WorkingHours']> = ResolversObject<{
  end?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  ActivityMetadata?: ActivityMetadataResolvers<ContextType>;
  AiMemory?: AiMemoryResolvers<ContextType>;
  ApiKey?: ApiKeyResolvers<ContextType>;
  ApiKeyWithSecret?: ApiKeyWithSecretResolvers<ContextType>;
  AutopilotMove?: AutopilotMoveResolvers<ContextType>;
  AutopilotProposal?: AutopilotProposalResolvers<ContextType>;
  AutopilotStatus?: AutopilotStatusResolvers<ContextType>;
  AvailabilitySchedule?: AvailabilityScheduleResolvers<ContextType>;
  AvailabilitySettings?: AvailabilitySettingsResolvers<ContextType>;
  BillingInfo?: BillingInfoResolvers<ContextType>;
  BillingPortalSession?: BillingPortalSessionResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  BreakTime?: BreakTimeResolvers<ContextType>;
  BulkDeleteResult?: BulkDeleteResultResolvers<ContextType>;
  BusySlot?: BusySlotResolvers<ContextType>;
  CalendarAuthPayload?: CalendarAuthPayloadResolvers<ContextType>;
  CalendarConnection?: CalendarConnectionResolvers<ContextType>;
  CalendarDefense?: CalendarDefenseResolvers<ContextType>;
  CalendarDefenseLogEntry?: CalendarDefenseLogEntryResolvers<ContextType>;
  CalendarDefenseRunResult?: CalendarDefenseRunResultResolvers<ContextType>;
  CalendarEvent?: CalendarEventResolvers<ContextType>;
  CalendarIntegration?: CalendarIntegrationResolvers<ContextType>;
  CheckoutSession?: CheckoutSessionResolvers<ContextType>;
  CustomQuestion?: CustomQuestionResolvers<ContextType>;
  DailyRitual?: DailyRitualResolvers<ContextType>;
  DashboardStats?: DashboardStatsResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DaySchedule?: DayScheduleResolvers<ContextType>;
  DeletedProject?: DeletedProjectResolvers<ContextType>;
  FeatureLimits?: FeatureLimitsResolvers<ContextType>;
  FocusTimeBlock?: FocusTimeBlockResolvers<ContextType>;
  Goal?: GoalResolvers<ContextType>;
  GoalAnalytics?: GoalAnalyticsResolvers<ContextType>;
  GoalAnalyticsReport?: GoalAnalyticsReportResolvers<ContextType>;
  GoalSuggestion?: GoalSuggestionResolvers<ContextType>;
  Habit?: HabitResolvers<ContextType>;
  Integration?: IntegrationResolvers<ContextType>;
  IntegrationResource?: IntegrationResourceResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  KanbanBoard?: KanbanBoardResolvers<ContextType>;
  KanbanColumn?: KanbanColumnResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NoMeetingDay?: NoMeetingDayResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationPreferences?: NotificationPreferencesResolvers<ContextType>;
  NotificationSettings?: NotificationSettingsResolvers<ContextType>;
  OAuthRedirect?: OAuthRedirectResolvers<ContextType>;
  OnboardingResult?: OnboardingResultResolvers<ContextType>;
  OnboardingStatus?: OnboardingStatusResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  Plan?: PlanResolvers<ContextType>;
  PlanTemplate?: PlanTemplateResolvers<ContextType>;
  PmImportResult?: PmImportResultResolvers<ContextType>;
  PmInboxTask?: PmInboxTaskResolvers<ContextType>;
  PriorityHours?: PriorityHoursResolvers<ContextType>;
  PriorityTimeSlot?: PriorityTimeSlotResolvers<ContextType>;
  ProductivityScore?: ProductivityScoreResolvers<ContextType>;
  ProductivityWindow?: ProductivityWindowResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectWithStats?: ProjectWithStatsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QuickAction?: QuickActionResolvers<ContextType>;
  RecentActivity?: RecentActivityResolvers<ContextType>;
  RecurrenceRule?: RecurrenceRuleResolvers<ContextType>;
  ReferralEntry?: ReferralEntryResolvers<ContextType>;
  ReferralStats?: ReferralStatsResolvers<ContextType>;
  RescheduleSuggestion?: RescheduleSuggestionResolvers<ContextType>;
  SchedulingLink?: SchedulingLinkResolvers<ContextType>;
  SleepRecommendation?: SleepRecommendationResolvers<ContextType>;
  Smart1on1?: Smart1on1Resolvers<ContextType>;
  StreakData?: StreakDataResolvers<ContextType>;
  StreakEntry?: StreakEntryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SyncError?: SyncErrorResolvers<ContextType>;
  SyncResult?: SyncResultResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TaskDependency?: TaskDependencyResolvers<ContextType>;
  TaskInfo?: TaskInfoResolvers<ContextType>;
  TaskWithDependencies?: TaskWithDependenciesResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamDashboard?: TeamDashboardResolvers<ContextType>;
  TeamGoal?: TeamGoalResolvers<ContextType>;
  TeamInvitation?: TeamInvitationResolvers<ContextType>;
  TeamMember?: TeamMemberResolvers<ContextType>;
  TeamMemberStat?: TeamMemberStatResolvers<ContextType>;
  TeamSettings?: TeamSettingsResolvers<ContextType>;
  TestPushResult?: TestPushResultResolvers<ContextType>;
  TimeEntry?: TimeEntryResolvers<ContextType>;
  TimeSlot?: TimeSlotResolvers<ContextType>;
  TravelTime?: TravelTimeResolvers<ContextType>;
  UpcomingInvoice?: UpcomingInvoiceResolvers<ContextType>;
  UpcomingTask?: UpcomingTaskResolvers<ContextType>;
  UsageStats?: UsageStatsResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserSettings?: UserSettingsResolvers<ContextType>;
  UserSubscription?: UserSubscriptionResolvers<ContextType>;
  Webhook?: WebhookResolvers<ContextType>;
  WebhookDelivery?: WebhookDeliveryResolvers<ContextType>;
  WeekOverview?: WeekOverviewResolvers<ContextType>;
  WeeklyGoalProgress?: WeeklyGoalProgressResolvers<ContextType>;
  WeeklyProgress?: WeeklyProgressResolvers<ContextType>;
  WeeklyReview?: WeeklyReviewResolvers<ContextType>;
  WeeklyReviewGoal?: WeeklyReviewGoalResolvers<ContextType>;
  WeeklyStats?: WeeklyStatsResolvers<ContextType>;
  WorkHours?: WorkHoursResolvers<ContextType>;
  WorkWeekSchedule?: WorkWeekScheduleResolvers<ContextType>;
  WorkingHours?: WorkingHoursResolvers<ContextType>;
}>;

