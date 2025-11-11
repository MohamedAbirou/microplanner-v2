'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Users,
  Zap,
  TrendingUp,
  MessageSquare,
  Calendar,
  BarChart3,
} from 'lucide-react';

export default function TeamsPage() {
  const features = [
    {
      icon: Users,
      title: 'Collaborative Task Management',
      description: 'Assign tasks to team members, track ownership, and maintain visibility across all ongoing work.',
    },
    {
      icon: Zap,
      title: 'Sprint Planning',
      description: 'Plan sprints efficiently with capacity planning, velocity tracking, and backlog prioritization.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Visibility',
      description: 'Real-time progress tracking keeps everyone informed about team performance and milestone achievement.',
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Integrated commenting and updates ensure team members stay aligned without context switching.',
    },
    {
      icon: Calendar,
      title: 'Shared Calendars',
      description: 'View team availability, schedule collaboratively, and prevent conflicts with shared calendar integration.',
    },
    {
      icon: BarChart3,
      title: 'Workload Balancing',
      description: 'Distribute work fairly across team members with workload insights and capacity management.',
    },
  ];

  const benefits = [
    {
      title: 'Enhanced Team Productivity',
      description: 'Clear planning and task ownership eliminate confusion and bottlenecks. Your team ships more value with less wasted effort.',
    },
    {
      title: 'Improved Accountability',
      description: 'Transparent task tracking and progress visibility hold everyone accountable. Team members know what\'s expected and can take ownership.',
    },
    {
      title: 'Better Cross-functional Alignment',
      description: 'When everyone can see the full picture of what\'s being built and why, collaboration improves dramatically. Reduce silos and improve coordination.',
    },
  ];

  return (
    <PageTemplate
      title="For Teams"
      subtitle="Team Coordination"
      description="Coordinate seamlessly across your team. MicroPlanner provides the visibility and structure teams need to execute efficiently and hit their goals."
      features={features}
      benefits={benefits}
    />
  );
}
