'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Clock,
  Play,
  Activity,
  Zap,
  BarChart3,
  Target,
} from 'lucide-react';

export default function TimeTrackingPage() {
  const features = [
    {
      icon: Clock,
      title: 'One-Click Time Tracking',
      description:
        'Start and stop tracking with a single click. Minimal friction means better compliance and accurate data.',
    },
    {
      icon: Play,
      title: 'Smart Timer',
      description:
        'Intelligent timer that understands your work patterns. Get suggested break times and productivity insights.',
    },
    {
      icon: Activity,
      title: 'Automatic Task Tracking',
      description:
        'MicroPlanner can automatically track time when you switch between tasks. Never manually log time again.',
    },
    {
      icon: Zap,
      title: 'Real-Time Insights',
      description:
        'See how your time is distributed across projects and tasks in real-time. Make adjustments before the day ends.',
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description:
        'Generate comprehensive time reports by project, task, or team member. Understand where every hour goes.',
    },
    {
      icon: Target,
      title: 'Billable Hours',
      description:
        'Track billable vs. non-billable time effortlessly. Perfect for consultants and agencies managing client work.',
    },
  ];

  const benefits = [
    {
      title: 'Improve Time Awareness',
      description:
        'Discover where your time actually goes. Most people underestimate how long tasks take - data brings clarity.',
    },
    {
      title: 'Better Project Estimation',
      description:
        'Use historical time data to estimate future projects accurately. Deliver projects on time and on budget.',
    },
    {
      title: 'Enhanced Productivity',
      description:
        'Awareness drives change. Tracking time makes you more conscious of productivity and naturally improves focus.',
    },
  ];

  return (
    <PageTemplate
      title="Time Tracking"
      subtitle="UNDERSTAND YOUR TIME"
      description="Gain visibility into how you spend your time. Track hours against tasks and projects with precision, and use data-driven insights to optimize your work habits."
      features={features}
      benefits={benefits}
    />
  );
}
