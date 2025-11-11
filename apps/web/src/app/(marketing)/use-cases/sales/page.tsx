'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  TrendingUp,
  Users,
  Target,
  Calendar,
  BarChart2,
  Award,
} from 'lucide-react';

export default function SalesPage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Sales Pipeline Management',
      description: 'Visualize your entire sales pipeline from leads to close. Track deal status and forecast revenue accurately.',
    },
    {
      icon: Users,
      title: 'Lead & Prospect Tracking',
      description: 'Organize and prioritize leads with detailed prospect profiles, interaction history, and engagement tracking.',
    },
    {
      icon: Target,
      title: 'Opportunity Scoring',
      description: 'Identify high-value opportunities quickly with scoring systems that highlight your best-fit prospects.',
    },
    {
      icon: Calendar,
      title: 'Meeting & Activity Scheduling',
      description: 'Schedule calls, demos, and follow-ups efficiently. Never miss a follow-up or meeting again.',
    },
    {
      icon: BarChart2,
      title: 'Forecast Accuracy',
      description: 'Improve forecast accuracy with historical data analysis, pipeline health tracking, and probability weighting.',
    },
    {
      icon: Award,
      title: 'Team Performance Tracking',
      description: 'Monitor individual and team performance with sales metrics, activity tracking, and recognition of top performers.',
    },
  ];

  const benefits = [
    {
      title: 'Increased Deal Closure Rates',
      description: 'With better pipeline visibility and systematic follow-up management, your team closes more deals. Focus energy on opportunities most likely to convert.',
    },
    {
      title: 'More Predictable Revenue',
      description: 'Accurate forecasting gives leadership confidence in revenue projections. Better planning across the organization.',
    },
    {
      title: 'Improved Sales Team Efficiency',
      description: 'Sales professionals spend less time on administrative work and more time selling. Better organization means more time with prospects and customers.',
    },
  ];

  return (
    <PageTemplate
      title="For Sales Teams"
      subtitle="Sales Excellence"
      description="Close more deals and hit quota consistently. MicroPlanner helps sales teams manage pipelines, track opportunities, and execute their strategy."
      features={features}
      benefits={benefits}
    />
  );
}
