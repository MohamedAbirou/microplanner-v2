/**
 * MicroPlanner Configuration
 * Shared constants and feature flags across all apps
 */

// ============================================
// BRAND & DESIGN TOKENS
// ============================================

export * from './brand';

// ============================================
// APP CONFIGURATION
// ============================================

export const config = {
  appName: 'MicroPlanner',
  appDescription: 'AI-powered weekly planning that adapts to you',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  graphqlWsUrl: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
} as const;

// ============================================
// TIER LIMITS
// ============================================

export const TIER_LIMITS = {
  FREE: {
    maxGoals: 2,
    plansPerWeek: 5,
    aiTier: 'rule-based' as const,
    calendarSync: 'manual' as const,
    offlineMode: false,
    advancedInsights: false,
    autoRegen: false,
    priority: 1,
  },
  STARTER: {
    maxGoals: 5,
    plansPerWeek: 20,
    aiTier: 'standard' as const, // GPT-4o-mini
    calendarSync: 'auto' as const,
    offlineMode: true,
    advancedInsights: false,
    autoRegen: false,
    priority: 2,
  },
  PRO: {
    maxGoals: Infinity,
    plansPerWeek: Infinity,
    aiTier: 'complex' as const, // GPT-4o
    calendarSync: 'auto' as const,
    offlineMode: true,
    advancedInsights: true,
    autoRegen: true,
    priority: 3,
  },
} as const;

// ============================================
// PRICING
// ============================================

export const PRICING = {
  FREE: {
    monthly: 0,
    yearly: 0,
    currency: 'USD',
    stripePriceId: null,
  },
  STARTER: {
    monthly: 5,
    yearly: 50, // 17% discount
    currency: 'USD',
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  },
  PRO: {
    monthly: 12,
    yearly: 120, // 17% discount
    currency: 'USD',
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
} as const;

// ============================================
// AI CONFIGURATION
// ============================================

export const AI_CONFIG = {
  models: {
    'rule-based': {
      name: 'rule-based',
      provider: 'internal',
      costPerPlan: 0,
      avgLatencyMs: 100,
      maxGoals: 2,
    },
    'gpt-4o-mini': {
      name: 'gpt-4o-mini',
      provider: 'openai',
      costPerPlan: 0.03, // USD cents
      avgLatencyMs: 5000,
      maxGoals: 7,
    },
    'gpt-4o': {
      name: 'gpt-4o',
      provider: 'openai',
      costPerPlan: 0.08, // USD cents
      avgLatencyMs: 8000,
      maxGoals: Infinity,
    },
  },
  complexity: {
    simple: {
      model: 'rule-based',
      conditions: ['goalCount <= 2', '!energyPattern', '!blockedTimes'],
    },
    standard: {
      model: 'gpt-4o-mini',
      conditions: ['goalCount 3-5', 'basic constraints'],
    },
    complex: {
      model: 'gpt-4o',
      conditions: ['goalCount 6+', 'advanced constraints', 'energy patterns'],
    },
  },
  timeout: 30000, // 30 seconds
  maxRetries: 3,
} as const;

// ============================================
// CALENDAR CONFIGURATION
// ============================================

export const CALENDAR_CONFIG = {
  providers: {
    google: {
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      apiVersion: 'v3',
    },
    // Future: outlook, apple
  },
  sync: {
    batchSize: 10,
    maxRetries: 3,
    retryDelayMs: 2000,
    idempotencyKey: 'microplanner_task_id',
  },
} as const;

// ============================================
// TIME CONFIGURATION
// ============================================

export const TIME_CONFIG = {
  defaultWakeTime: '07:00',
  defaultSleepTime: '23:00',
  defaultWorkStart: '09:00',
  defaultWorkEnd: '17:00',
  minTaskDuration: 15, // minutes
  maxTaskDuration: 480, // 8 hours
  bufferBetweenTasks: 15, // minutes
  daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const,
} as const;

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  goal: {
    title: {
      minLength: 1,
      maxLength: 100,
    },
    description: {
      maxLength: 500,
    },
    frequencyPerWeek: {
      min: 1,
      max: 7,
    },
    durationMinutes: {
      min: 15,
      max: 480,
    },
    priority: {
      min: 1,
      max: 10,
    },
    flexibilityScore: {
      min: 1,
      max: 10,
    },
  },
  task: {
    title: {
      minLength: 1,
      maxLength: 200,
    },
    notes: {
      maxLength: 1000,
    },
    durationMinutes: {
      min: 15,
      max: 480,
    },
  },
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  // MVP Features (enabled)
  AUTH_CLERK: true,
  GOALS_CRUD: true,
  AI_PLANNING_RULE_BASED: true,
  AI_PLANNING_GPT: true,
  CALENDAR_GOOGLE: true,
  CALENDAR_SYNC: true,
  MOBILE_OFFLINE: true,
  PUSH_NOTIFICATIONS: true,
  BILLING_STRIPE: true,

  // Post-MVP Features (disabled)
  AI_MEMORY: false,
  CALENDAR_OUTLOOK: false,
  CALENDAR_APPLE: false,
  TEAM_WORKSPACES: false,
  VOICE_INPUT: false,
  WIDGETS: false,
  APPLE_WATCH: false,
  API_ACCESS: false,
} as const;

// ============================================
// ANALYTICS EVENTS
// ============================================

export const ANALYTICS_EVENTS = {
  // User Events
  USER_SIGNUP: 'user_signup',
  USER_ONBOARDING_COMPLETE: 'user_onboarding_complete',
  USER_SUBSCRIPTION_STARTED: 'user_subscription_started',
  USER_SUBSCRIPTION_CANCELLED: 'user_subscription_cancelled',

  // Goal Events
  GOAL_CREATED: 'goal_created',
  GOAL_UPDATED: 'goal_updated',
  GOAL_DELETED: 'goal_deleted',
  GOAL_PAUSED: 'goal_paused',
  GOAL_ACTIVATED: 'goal_activated',

  // Plan Events
  PLAN_GENERATED: 'plan_generated',
  PLAN_ACCEPTED: 'plan_accepted',
  PLAN_REJECTED: 'plan_rejected',
  PLAN_REGENERATED: 'plan_regenerated',
  PLAN_APPLIED: 'plan_applied',

  // Task Events
  TASK_CREATED: 'task_created',
  TASK_COMPLETED: 'task_completed',
  TASK_SKIPPED: 'task_skipped',
  TASK_MOVED: 'task_moved',

  // Calendar Events
  CALENDAR_CONNECTED: 'calendar_connected',
  CALENDAR_DISCONNECTED: 'calendar_disconnected',
  CALENDAR_SYNC_SUCCESS: 'calendar_sync_success',
  CALENDAR_SYNC_FAILED: 'calendar_sync_failed',
  CALENDAR_CONFLICT: 'calendar_conflict',

  // AI Events
  AI_FALLBACK: 'ai_fallback',
  AI_ERROR: 'ai_error',
  AI_COST_ALERT: 'ai_cost_alert',
} as const;

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Authentication (1xxx)
  UNAUTHORIZED: 'ERR_1001',
  INVALID_TOKEN: 'ERR_1002',
  TOKEN_EXPIRED: 'ERR_1003',

  // Authorization (2xxx)
  FORBIDDEN: 'ERR_2001',
  INSUFFICIENT_TIER: 'ERR_2002',
  RESOURCE_NOT_OWNED: 'ERR_2003',

  // Validation (3xxx)
  VALIDATION_FAILED: 'ERR_3001',
  INVALID_INPUT: 'ERR_3002',
  MISSING_REQUIRED_FIELD: 'ERR_3003',

  // Resource (4xxx)
  RESOURCE_NOT_FOUND: 'ERR_4001',
  RESOURCE_ALREADY_EXISTS: 'ERR_4002',
  RESOURCE_LIMIT_EXCEEDED: 'ERR_4003',

  // Business Logic (5xxx)
  GOAL_LIMIT_EXCEEDED: 'ERR_5001',
  PLAN_LIMIT_EXCEEDED: 'ERR_5002',
  INVALID_TIME_RANGE: 'ERR_5003',
  CALENDAR_NOT_CONNECTED: 'ERR_5004',

  // External Services (6xxx)
  AI_SERVICE_ERROR: 'ERR_6001',
  CALENDAR_API_ERROR: 'ERR_6002',
  PAYMENT_ERROR: 'ERR_6003',

  // Internal (9xxx)
  INTERNAL_SERVER_ERROR: 'ERR_9001',
  DATABASE_ERROR: 'ERR_9002',
  UNKNOWN_ERROR: 'ERR_9999',
} as const;

// ============================================
// RATE LIMITS
// ============================================

export const RATE_LIMITS = {
  FREE: {
    requests: {
      perMinute: 20,
      perHour: 100,
      perDay: 500,
    },
    planGeneration: {
      perDay: 5,
      perWeek: 5,
    },
  },
  STARTER: {
    requests: {
      perMinute: 60,
      perHour: 500,
      perDay: 5000,
    },
    planGeneration: {
      perDay: 10,
      perWeek: 20,
    },
  },
  PRO: {
    requests: {
      perMinute: 120,
      perHour: 2000,
      perDay: 20000,
    },
    planGeneration: {
      perDay: Infinity,
      perWeek: Infinity,
    },
  },
} as const;

// ============================================
// ENVIRONMENT HELPERS
// ============================================

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue!;
}
