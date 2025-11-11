'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  Zap,
  BarChart3,
} from 'lucide-react';

export default function AffiliateProgram() {
  const features = [
    {
      icon: DollarSign,
      title: 'High Commission Rates',
      description: 'Earn 30% recurring commission on all new annual subscriptions referred through your unique affiliate link.',
    },
    {
      icon: TrendingUp,
      title: 'Passive Income Stream',
      description: 'Get paid monthly for the lifetime value of each customer you refer. Build wealth while you sleep.',
    },
    {
      icon: Users,
      title: 'Dedicated Affiliate Manager',
      description: 'Personal support to help you optimize your marketing strategy and maximize your earning potential.',
    },
    {
      icon: Gift,
      title: 'Marketing Resources',
      description: 'Pre-built landing pages, email templates, social media assets, and case studies to fuel your promotions.',
    },
    {
      icon: Zap,
      title: 'Real-Time Tracking',
      description: 'Advanced dashboard showing clicks, conversions, earnings, and detailed performance analytics.',
    },
    {
      icon: BarChart3,
      title: 'Performance Bonuses',
      description: 'Earn extra bonuses and tier-based incentives as you hit referral milestones and growth targets.',
    },
  ];

  const benefits = [
    {
      title: 'Trusted Product',
      description:
        'MicroPlanner is used by 2M+ professionals and endorsed by industry leaders. Your referrals promote a solution that genuinely delivers value.',
    },
    {
      title: 'Easy to Promote',
      description:
        'With a 14-day free trial and 60-day money-back guarantee, potential customers have zero risk. This means higher conversion rates for you.',
    },
    {
      title: 'Growing Opportunity',
      description:
        'As MicroPlanner expands globally, your earning potential grows. Top affiliates are already earning $10K+ per month in commissions.',
    },
  ];

  return (
    <PageTemplate
      title="Affiliate Program"
      subtitle="Earn While You Share"
      description="Join our affiliate program and earn generous commissions by referring MicroPlanner to your audience."
      features={features}
      benefits={benefits}
      ctaText="Apply Now"
      ctaLink="https://affiliates.microplanner.com/apply"
    />
  );
}
