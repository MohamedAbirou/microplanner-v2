'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Award,
} from 'lucide-react';

export default function AnalyticsPage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Comprehensive Dashboards',
      description:
        'Visualize your productivity with beautiful, interactive dashboards. See trends at a glance and dive deep into specifics.',
    },
    {
      icon: TrendingUp,
      title: 'Performance Metrics',
      description:
        'Track key metrics like task completion rate, average session duration, and goal progress. Measure what matters.',
    },
    {
      icon: Activity,
      title: 'Weekly & Monthly Reports',
      description:
        'Get automatic insights delivered to your inbox. Review your performance over different time periods with detailed breakdowns.',
    },
    {
      icon: Target,
      title: 'Goal Achievement Tracking',
      description:
        'See which goals are on track and which need attention. Identify patterns in what helps you succeed.',
    },
    {
      icon: Zap,
      title: 'Productivity Scoring',
      description:
        'Get a personalized productivity score based on your activities. Compare against your historical performance.',
    },
    {
      icon: Award,
      title: 'Benchmarking & Insights',
      description:
        'Learn how your productivity compares to similar professionals. Get actionable recommendations for improvement.',
    },
  ];

  const benefits = [
    {
      title: 'Data-Driven Decisions',
      description:
        'Stop guessing and start measuring. Make informed decisions about your work based on actual data and trends.',
    },
    {
      title: 'Identify Improvement Areas',
      description:
        'Discover patterns in your work. Analytics reveal what\'s working well and where you can optimize further.',
    },
    {
      title: 'Celebrate Progress',
      description:
        'See tangible evidence of your productivity improvements. Celebrate wins and stay motivated with visual progress tracking.',
    },
  ];

  return (
    <PageTemplate
      title="Productivity Analytics"
      subtitle="DATA-DRIVEN INSIGHTS"
      description="Transform your planning data into actionable insights. Understand your productivity patterns, track progress toward goals, and make informed decisions about how you spend your time."
      features={features}
      benefits={benefits}
    />
  );
}
