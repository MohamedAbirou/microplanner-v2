import { SubscriptionTier } from '@microplanner/database';

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  priceId: string; // Stripe price ID
  interval: 'month' | 'year';
  features: {
    maxGoals: number;
    maxPlansPerWeek: number;
    aiModel: 'gpt-4o-mini' | 'gpt-4o';
    calendarSync: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
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
      aiModel: 'gpt-4o-mini',
      calendarSync: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  {
    tier: SubscriptionTier.STARTER,
    name: 'Starter',
    price: 999, // $9.99/month
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    interval: 'month',
    features: {
      maxGoals: 5,
      maxPlansPerWeek: 20,
      aiModel: 'gpt-4o-mini',
      calendarSync: true,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    price: 1999, // $19.99/month
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    interval: 'month',
    features: {
      maxGoals: Infinity,
      maxPlansPerWeek: Infinity,
      aiModel: 'gpt-4o',
      calendarSync: true,
      prioritySupport: true,
      advancedAnalytics: true,
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
};
