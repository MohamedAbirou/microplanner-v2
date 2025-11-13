import { SubscriptionTier, SubscriptionTierType } from '@microplanner/database';

export interface PricingPlan {
  tier: SubscriptionTierType;
  name: string;
  price: number;
  priceId: string; // Stripe price ID
  interval: 'month' | 'year';
  features: {
    maxGoals: number;
    maxPlansPerWeek: number;
    aiModel: 'rule-based' | 'gpt-4o-mini' | 'claude-sonnet-3.5';
    calendarSync: boolean;
    autoSync: boolean;
    emailReminders: boolean;
    weeklyInsights: boolean;
    advancedInsights: boolean;
    aiLearning: boolean;
    weeklyAutoRegen: boolean;
    planTemplates: boolean;
    prioritySupport: boolean;
    teamWorkspace: boolean;
    teamMembers: number;
    customAIPersonas: boolean;
    sharedCalendars: boolean;
    apiAccess: boolean;
    apiCallsPerDay: number;
    whiteLabelExports: boolean;
    dedicatedSupport: boolean;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Free',
    price: 0,
    priceId: '', // No Stripe price for free tier
    interval: 'month',
    features: {
      maxGoals: 2,
      maxPlansPerWeek: 5,
      aiModel: 'rule-based', // Basic rule-based scheduler, no LLM
      calendarSync: true,
      autoSync: false, // Manual sync only
      emailReminders: false,
      weeklyInsights: true, // Basic stats
      advancedInsights: false,
      aiLearning: false,
      weeklyAutoRegen: false,
      planTemplates: false,
      prioritySupport: false,
      teamWorkspace: false,
      teamMembers: 1,
      customAIPersonas: false,
      sharedCalendars: false,
      apiAccess: false,
      apiCallsPerDay: 0,
      whiteLabelExports: false,
      dedicatedSupport: false,
    },
  },
  {
    tier: SubscriptionTier.STARTER,
    name: 'Starter',
    price: 700, // $7.00/month (in cents)
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    interval: 'month',
    features: {
      maxGoals: 5,
      maxPlansPerWeek: 20,
      aiModel: 'gpt-4o-mini', // GPT-4o-mini planner
      calendarSync: true,
      autoSync: true, // Auto calendar sync
      emailReminders: true,
      weeklyInsights: true,
      advancedInsights: false,
      aiLearning: false,
      weeklyAutoRegen: false,
      planTemplates: false,
      prioritySupport: false,
      teamWorkspace: false,
      teamMembers: 1,
      customAIPersonas: false,
      sharedCalendars: false,
      apiAccess: false,
      apiCallsPerDay: 0,
      whiteLabelExports: false,
      dedicatedSupport: false,
    },
  },
  {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    price: 1500, // $15.00/month (in cents)
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    interval: 'month',
    features: {
      maxGoals: Infinity,
      maxPlansPerWeek: Infinity,
      aiModel: 'claude-sonnet-3.5', // Claude Sonnet 3.5 planner
      calendarSync: true,
      autoSync: true,
      emailReminders: true,
      weeklyInsights: true,
      advancedInsights: true,
      aiLearning: true, // AI learns user patterns
      weeklyAutoRegen: true, // Auto-regenerate plans weekly
      planTemplates: true,
      prioritySupport: true, // Priority email support
      teamWorkspace: false,
      teamMembers: 1,
      customAIPersonas: false,
      sharedCalendars: false,
      apiAccess: false,
      apiCallsPerDay: 0,
      whiteLabelExports: false,
      dedicatedSupport: false,
    },
  },
  {
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium',
    price: 2900, // $29.00/month (in cents)
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    interval: 'month',
    features: {
      maxGoals: Infinity,
      maxPlansPerWeek: Infinity,
      aiModel: 'claude-sonnet-3.5', // Claude Sonnet 3.5 planner
      calendarSync: true,
      autoSync: true,
      emailReminders: true,
      weeklyInsights: true,
      advancedInsights: true,
      aiLearning: true,
      weeklyAutoRegen: true,
      planTemplates: true,
      prioritySupport: true,
      teamWorkspace: true, // Team workspace (up to 5 members)
      teamMembers: 5,
      customAIPersonas: true, // Custom AI personas
      sharedCalendars: true, // Shared team calendars
      apiAccess: true, // API access (100 calls/day)
      apiCallsPerDay: 100,
      whiteLabelExports: true, // White-label exports
      dedicatedSupport: true, // Dedicated support (4-hour response)
    },
  },
];

export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxGoals: 2,
    maxPlansPerWeek: 5,
  },
  [SubscriptionTier.STARTER]: {
    maxGoals: 5,
    maxPlansPerWeek: 20,
  },
  [SubscriptionTier.PRO]: {
    maxGoals: Infinity,
    maxPlansPerWeek: Infinity,
  },
  [SubscriptionTier.PREMIUM]: {
    maxGoals: Infinity,
    maxPlansPerWeek: Infinity,
  },
};
