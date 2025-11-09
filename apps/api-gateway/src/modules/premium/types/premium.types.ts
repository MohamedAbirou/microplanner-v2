/**
 * Team Workspace & API Access Types
 *
 * PREMIUM tier features for team collaboration and API access
 */

// ==================== TEAM WORKSPACE ====================

/**
 * Team workspace
 */
export interface Team {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  plan: TeamPlan;
  maxMembers: number;
  logoUrl: string | null;
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team plan tiers
 */
export enum TeamPlan {
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Team settings
 */
export interface TeamSettings {
  allowMemberGoals: boolean;
  allowMemberPlans: boolean;
  requireApprovalForGoals: boolean;
  sharedCalendars: boolean;
  defaultWorkHours: {
    start: string;
    end: string;
  };
  workDays: number[];
}

/**
 * Team member
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: string | null;
  status: MemberStatus;
}

/**
 * Team member roles
 */
export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/**
 * Member status
 */
export enum MemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  SUSPENDED = 'suspended',
}

/**
 * Team invitation
 */
export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

/**
 * Create team DTO
 */
export interface CreateTeamDto {
  name: string;
  description?: string;
  maxMembers?: number;
  settings?: Partial<TeamSettings>;
}

/**
 * Update team DTO
 */
export interface UpdateTeamDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  settings?: Partial<TeamSettings>;
}

/**
 * Invite member DTO
 */
export interface InviteMemberDto {
  email: string;
  role: TeamRole;
}

// ==================== API ACCESS ====================

/**
 * API key
 */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string; // Hashed
  keyPrefix: string; // First 8 chars for display
  scopes: ApiScope[];
  rateLimit: number;
  usageCount: number;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API scopes
 */
export enum ApiScope {
  READ_GOALS = 'goals:read',
  WRITE_GOALS = 'goals:write',
  READ_PLANS = 'plans:read',
  WRITE_PLANS = 'plans:write',
  READ_TASKS = 'tasks:read',
  WRITE_TASKS = 'tasks:write',
  READ_ANALYTICS = 'analytics:read',
  READ_USER = 'user:read',
  WRITE_USER = 'user:write',
  ADMIN = 'admin',
}

/**
 * Create API key DTO
 */
export interface CreateApiKeyDto {
  name: string;
  scopes: ApiScope[];
  expiresInDays?: number; // null = never expires
  rateLimit?: number; // requests per hour
}

/**
 * API key response (includes raw key once)
 */
export interface ApiKeyResponse {
  id: string;
  name: string;
  key?: string; // Only on creation
  keyPrefix: string;
  scopes: ApiScope[];
  rateLimit: number;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * API usage statistics
 */
export interface ApiUsageStats {
  totalRequests: number;
  requestsThisMonth: number;
  requestsToday: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  errorRate: number;
  averageResponseTime: number;
  lastRequest: Date | null;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number; // seconds
}

// ==================== SHARED RESOURCES ====================

/**
 * Team goal (shared goal)
 */
export interface TeamGoal {
  goalId: string;
  teamId: string;
  visibility: GoalVisibility;
  assignedTo: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
}

/**
 * Goal visibility
 */
export enum GoalVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

/**
 * Team analytics
 */
export interface TeamAnalytics {
  teamId: string;
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
  teamCompletionRate: number;
  memberStats: Array<{
    userId: string;
    userName: string;
    tasksCompleted: number;
    goalsCompleted: number;
    contributionScore: number;
  }>;
  updatedAt: Date;
}
