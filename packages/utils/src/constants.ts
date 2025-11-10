/**
 * Shared constants for MicroPlanner
 */

// Time constants
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

// Days of week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WORK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM',
} as const;

// Feature limits by tier
export const TIER_LIMITS = {
  FREE: {
    goals: 2,
    plansPerWeek: 5,
    schedulingLinks: 0,
    teamWorkspace: false,
    apiAccess: false,
  },
  STARTER: {
    goals: 5,
    plansPerWeek: 20,
    schedulingLinks: 0,
    teamWorkspace: false,
    apiAccess: false,
  },
  PRO: {
    goals: Infinity,
    plansPerWeek: Infinity,
    schedulingLinks: 5,
    teamWorkspace: false,
    apiAccess: false,
  },
  PREMIUM: {
    goals: Infinity,
    plansPerWeek: Infinity,
    schedulingLinks: Infinity,
    teamWorkspace: true,
    apiAccess: true,
  },
} as const;

// Energy patterns
export const ENERGY_PATTERNS = {
  MORNING: 'MORNING',
  EVENING: 'EVENING',
  FLEXIBLE: 'FLEXIBLE',
} as const;

// Themes
export const THEMES = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM',
} as const;

// Task priority levels
export const TASK_PRIORITIES = {
  LOWEST: 1,
  LOW: 3,
  MEDIUM: 5,
  HIGH: 7,
  HIGHEST: 10,
} as const;

// Goal flexibility scores
export const FLEXIBILITY_SCORES = {
  RIGID: 1,
  SOMEWHAT_FLEXIBLE: 3,
  FLEXIBLE: 5,
  VERY_FLEXIBLE: 7,
  EXTREMELY_FLEXIBLE: 10,
} as const;

// Duration presets (in minutes)
export const DURATION_PRESETS = {
  QUICK: 15,
  SHORT: 30,
  MEDIUM: 60,
  LONG: 90,
  EXTENDED: 120,
  HALF_DAY: 240,
  FULL_DAY: 480,
} as const;

// Time slot options
export const TIME_SLOTS = [
  'early-morning', // 5-8 AM
  'morning', // 8-12 PM
  'afternoon', // 12-5 PM
  'evening', // 5-9 PM
  'night', // 9 PM-12 AM
] as const;

// API endpoints (for REST fallback)
export const API_ENDPOINTS = {
  GRAPHQL: '/graphql',
  REST_BASE: '/api',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'microplanner_theme',
  AUTH_TOKEN: 'microplanner_auth_token',
  USER_PREFERENCES: 'microplanner_user_preferences',
  DRAFT_GOAL: 'microplanner_draft_goal',
  DRAFT_TASK: 'microplanner_draft_task',
  SIDEBAR_COLLAPSED: 'microplanner_sidebar_collapsed',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
} as const;

// Toast durations (in milliseconds)
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 4000,
  LONG: 6000,
} as const;

// Debounce/throttle delays (in milliseconds)
export const DELAYS = {
  SEARCH: 300,
  AUTOSAVE: 1000,
  RESIZE: 150,
  SCROLL: 100,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  ATTACHMENT: 10 * 1024 * 1024, // 10MB
} as const;

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'text/plain'],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  GOAL_CREATED: 'Goal created successfully!',
  GOAL_UPDATED: 'Goal updated successfully!',
  GOAL_DELETED: 'Goal deleted successfully!',
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_COMPLETED: 'Task marked as complete!',
  PLAN_GENERATED: 'Weekly plan generated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

// GraphQL cache policies
export const CACHE_POLICIES = {
  CACHE_FIRST: 'cache-first',
  CACHE_AND_NETWORK: 'cache-and-network',
  NETWORK_ONLY: 'network-only',
  NO_CACHE: 'no-cache',
  CACHE_ONLY: 'cache-only',
} as const;
