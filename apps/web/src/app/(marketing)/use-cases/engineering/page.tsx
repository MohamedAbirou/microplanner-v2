'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Code,
  Terminal,
  GitBranch,
  AlertTriangle,
  BarChart3,
  Inbox,
} from 'lucide-react';

export default function EngineeringPage() {
  const features = [
    {
      icon: Code,
      title: 'Technical Debt Tracking',
      description: 'Monitor technical debt alongside features. Plan refactoring work strategically and prevent debt from spiraling.',
    },
    {
      icon: Terminal,
      title: 'Deployment Scheduling',
      description: 'Coordinate deployments, manage release windows, and track deployment status across environments.',
    },
    {
      icon: GitBranch,
      title: 'Code Review Management',
      description: 'Track code reviews in flight, manage PR priorities, and ensure nothing gets lost in the shuffle.',
    },
    {
      icon: AlertTriangle,
      title: 'Incident Response Planning',
      description: 'Prepare for incidents with playbooks, track incident resolution, and post-mortem follow-up tasks.',
    },
    {
      icon: BarChart3,
      title: 'Capacity Planning',
      description: 'Balance feature work, maintenance, and learning with realistic capacity planning and workload forecasting.',
    },
    {
      icon: Inbox,
      title: 'Backlog Management',
      description: 'Keep your backlog organized and prioritized. Surface important items and prevent the backlog from becoming overwhelming.',
    },
  ];

  const benefits = [
    {
      title: 'Higher Development Velocity',
      description: 'Streamlined planning reduces planning overhead. Engineers spend more time building and less time in meetings or searching for clarity.',
    },
    {
      title: 'Improved System Reliability',
      description: 'Proactive incident response planning and technical debt tracking lead to more stable systems and fewer production issues.',
    },
    {
      title: 'Better Engineer Satisfaction',
      description: 'Clear priorities, realistic timelines, and balanced workloads reduce burnout. Engineers feel empowered and valued.',
    },
  ];

  return (
    <PageTemplate
      title="For Engineering Teams"
      subtitle="Technical Execution"
      description="Build reliable systems with clear execution. MicroPlanner helps engineering teams manage technical work, balance priorities, and maintain momentum."
      features={features}
      benefits={benefits}
    />
  );
}
