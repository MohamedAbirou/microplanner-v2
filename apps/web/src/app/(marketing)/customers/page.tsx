'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';

export default function CustomersPage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Revenue Growth',
      description: 'Customers report average 40% increase in team productivity resulting in measurable revenue impact.',
    },
    {
      icon: Clock,
      title: 'Time Savings',
      description: 'Teams save 10+ hours per week through streamlined planning and automated workflows.',
    },
    {
      icon: Zap,
      title: 'Faster Execution',
      description: 'Project completion times reduced by 35% on average with better visibility and coordination.',
    },
    {
      icon: Target,
      title: 'Better Goal Achievement',
      description: 'Organizations achieve 60% higher success rate on strategic initiatives with structured planning.',
    },
    {
      icon: Award,
      title: 'Team Satisfaction',
      description: 'Team engagement scores increase by 45% due to clarity, reduced context switching, and alignment.',
    },
    {
      icon: BarChart3,
      title: 'Data-Driven Decisions',
      description: 'Advanced analytics provide actionable insights for smarter planning and resource allocation.',
    },
  ];

  const benefits = [
    {
      title: 'Enterprise Success',
      description:
        'Fortune 500 companies trust MicroPlanner to manage millions in project spend and keep complex initiatives on track.',
    },
    {
      title: 'Startup Acceleration',
      description:
        'Early-stage startups use our platform to scale faster, maintain focus, and accelerate from idea to market leadership.',
    },
    {
      title: 'Team Transformation',
      description:
        'From distributed remote teams to complex matrix organizations, MicroPlanner enables collaboration and coordination at scale.',
    },
  ];

  return (
    <PageTemplate
      title="Customer Success Stories"
      subtitle="Success at Scale"
      description="Discover how leading organizations use MicroPlanner to transform their planning and drive extraordinary results."
      features={features}
      benefits={benefits}
      ctaText="Read Case Studies"
      ctaLink="/customers/case-studies"
    />
  );
}
