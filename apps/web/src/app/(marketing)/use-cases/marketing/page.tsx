'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Megaphone,
  Calendar,
  Folder,
  BarChart2,
  Users,
  Clock,
} from 'lucide-react';

export default function MarketingPage() {
  const features = [
    {
      icon: Megaphone,
      title: 'Campaign Planning',
      description: 'Plan marketing campaigns from concept to launch with timelines, milestones, and cross-functional coordination.',
    },
    {
      icon: Calendar,
      title: 'Content Calendar',
      description: 'Plan content across channels with editorial calendars, publishing schedules, and content distribution tracking.',
    },
    {
      icon: Folder,
      title: 'Asset Management',
      description: 'Organize marketing assets, creative work, and approvals in one central location with version control.',
    },
    {
      icon: BarChart2,
      title: 'Campaign Performance Tracking',
      description: 'Monitor campaign metrics, track ROI, and identify what\'s working to optimize future campaigns.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Coordinate across writers, designers, and strategists with clear task ownership and progress visibility.',
    },
    {
      icon: Clock,
      title: 'Deadline Management',
      description: 'Manage campaign deadlines, production timelines, and release schedules to ensure timely execution.',
    },
  ];

  const benefits = [
    {
      title: 'Faster Campaign Execution',
      description: 'Streamlined planning and coordination means campaigns go from concept to launch faster. Reduce planning cycles and accelerate time-to-market.',
    },
    {
      title: 'Better Campaign Results',
      description: 'With clear strategy alignment and systematic execution, campaigns deliver stronger results. Data-driven decisions improve ROI.',
    },
    {
      title: 'Improved Team Collaboration',
      description: 'Clear task ownership and shared visibility eliminate miscommunication. Your team works more cohesively toward shared goals.',
    },
  ];

  return (
    <PageTemplate
      title="For Marketing Teams"
      subtitle="Marketing Success"
      description="Execute campaigns with precision and impact. MicroPlanner helps marketing teams plan, coordinate, and measure campaigns that drive results."
      features={features}
      benefits={benefits}
    />
  );
}
