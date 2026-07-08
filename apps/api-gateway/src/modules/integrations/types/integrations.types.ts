/**
 * Third-Party Integrations Types
 *
 * Handles integrations with external services:
 * - Slack
 * - Zoom / Google Meet
 * - Notion
 * - Linear / GitHub
 * - Webhooks
 */

// ==================== INTEGRATION CONNECTIONS ====================

/**
 * Integration types
 */
export enum IntegrationType {
  SLACK = 'slack',
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google-meet',
  NOTION = 'notion',
  LINEAR = 'linear',
  GITHUB = 'github',
  TODOIST = 'todoist',
  JIRA = 'jira',
  ASANA = 'asana',
  WEBHOOK = 'webhook',
}

/**
 * Integration connection
 */
export interface Integration {
  id: string;
  userId: string;
  type: IntegrationType;
  name: string;
  isActive: boolean;
  config: IntegrationConfig;
  credentials: IntegrationCredentials;
  metadata: Record<string, any>;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  // Slack
  workspaceId?: string;
  workspaceName?: string;
  channelId?: string;
  channelName?: string;

  // Zoom
  meetingType?: 'instant' | 'scheduled';
  defaultDuration?: number;

  // Google Meet
  calendarId?: string;

  // Notion
  databaseId?: string;

  // Linear
  teamId?: string;
  projectId?: string;

  // GitHub
  repoOwner?: string;
  repoName?: string;

  // Webhook
  url?: string;
  events?: WebhookEvent[];
  secret?: string;
}

/**
 * Integration credentials (encrypted)
 */
export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
}

// ==================== SLACK ====================

/**
 * Slack integration settings
 */
export interface SlackIntegration {
  workspaceId: string;
  workspaceName: string;
  channelId: string;
  channelName: string;
  botUserId: string;
  notifications: SlackNotificationSettings;
}

/**
 * Slack notification settings
 */
export interface SlackNotificationSettings {
  taskCreated: boolean;
  taskCompleted: boolean;
  goalCreated: boolean;
  goalCompleted: boolean;
  planGenerated: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

/**
 * Slack message
 */
export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  threadTs?: string;
}

// ==================== ZOOM ====================

/**
 * Zoom integration settings
 */
export interface ZoomIntegration {
  userId: string;
  email: string;
  accountId: string;
  defaultSettings: ZoomMeetingSettings;
}

/**
 * Zoom meeting settings
 */
export interface ZoomMeetingSettings {
  duration: number; // Minutes
  timezone: string;
  password?: string;
  waitingRoom: boolean;
  joinBeforeHost: boolean;
  muteUponEntry: boolean;
  autoRecording: 'none' | 'local' | 'cloud';
}

/**
 * Zoom meeting
 */
export interface ZoomMeeting {
  id: string;
  meetingId: number;
  topic: string;
  startTime: Date;
  duration: number;
  joinUrl: string;
  password?: string;
  settings: ZoomMeetingSettings;
}

// ==================== GOOGLE MEET ====================

/**
 * Google Meet integration settings
 */
export interface GoogleMeetIntegration {
  email: string;
  calendarId: string;
  defaultDuration: number;
}

/**
 * Google Meet conference
 */
export interface GoogleMeetConference {
  id: string;
  conferenceId: string;
  entryPoints: Array<{
    entryPointType: string;
    uri: string;
    label?: string;
  }>;
  conferenceSolution: {
    name: string;
    iconUri: string;
  };
}

// ==================== NOTION ====================

/**
 * Notion integration settings
 */
export interface NotionIntegration {
  workspaceId: string;
  workspaceName: string;
  databaseId: string;
  databaseName: string;
  syncDirection: 'one-way' | 'two-way';
  syncFrequency: number; // Minutes
}

/**
 * Notion sync mapping
 */
export interface NotionSyncMapping {
  microplannerField: string;
  notionProperty: string;
  direction: 'to-notion' | 'from-notion' | 'both';
}

// ==================== LINEAR ====================

/**
 * Linear integration settings
 */
export interface LinearIntegration {
  teamId: string;
  teamName: string;
  projectId?: string;
  projectName?: string;
  syncTasks: boolean;
  syncGoals: boolean;
}

/**
 * Linear issue
 */
export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  state: string;
  priority: number;
  assignee?: string;
  dueDate?: Date;
}

// ==================== GITHUB ====================

/**
 * GitHub integration settings
 */
export interface GitHubIntegration {
  userId: string;
  username: string;
  repoOwner: string;
  repoName: string;
  syncIssues: boolean;
  syncPRs: boolean;
}

/**
 * GitHub issue
 */
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ==================== WEBHOOKS ====================

/**
 * Webhook events
 */
export enum WebhookEvent {
  // Goals
  GOAL_CREATED = 'goal.created',
  GOAL_UPDATED = 'goal.updated',
  GOAL_DELETED = 'goal.deleted',
  GOAL_COMPLETED = 'goal.completed',

  // Plans
  PLAN_GENERATED = 'plan.generated',
  PLAN_UPDATED = 'plan.updated',
  PLAN_DELETED = 'plan.deleted',

  // Tasks
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  TASK_COMPLETED = 'task.completed',

  // Bookings
  BOOKING_CREATED = 'booking.created',
  BOOKING_CONFIRMED = 'booking.confirmed',
  BOOKING_CANCELLED = 'booking.cancelled',

  // Subscription
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
}

/**
 * Webhook
 */
export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt: Date | null;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  userId: string;
}

/**
 * Webhook delivery
 */
export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  responseBody?: string;
  error?: string;
  attempts: number;
  lastAttemptAt: Date | null;
  createdAt: Date;
}

// ==================== DTOs ====================

/**
 * Create integration DTO
 */
export interface CreateIntegrationDto {
  type: IntegrationType;
  name: string;
  config: IntegrationConfig;
  // Credentials will be set via OAuth flow
}

/**
 * Update integration DTO
 */
export interface UpdateIntegrationDto {
  name?: string;
  config?: IntegrationConfig;
  isActive?: boolean;
}

/**
 * Create webhook DTO
 */
export interface CreateWebhookDto {
  url: string;
  events: WebhookEvent[];
  secret?: string; // If not provided, will be generated
}

/**
 * Update webhook DTO
 */
export interface UpdateWebhookDto {
  url?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

/**
 * OAuth callback data
 */
export interface OAuthCallbackDto {
  code: string;
  state: string;
}

/**
 * Slack send message DTO
 */
export interface SlackSendMessageDto {
  channel: string;
  text: string;
  blocks?: any[];
}

/**
 * Create Zoom meeting DTO
 */
export interface CreateZoomMeetingDto {
  topic: string;
  startTime: Date;
  duration: number;
  timezone?: string;
  password?: string;
  settings?: Partial<ZoomMeetingSettings>;
}

/**
 * Create Google Meet DTO
 */
export interface CreateGoogleMeetDto {
  summary: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

/**
 * Sync to Notion DTO
 */
export interface SyncToNotionDto {
  goalIds?: string[];
  taskIds?: string[];
  syncAll?: boolean;
}
