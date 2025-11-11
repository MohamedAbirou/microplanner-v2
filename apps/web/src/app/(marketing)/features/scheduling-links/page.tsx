'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Link2,
  Users,
  Shield,
  Zap,
  Globe,
  BarChart3,
} from 'lucide-react';

export default function SchedulingLinksPage() {
  const features = [
    {
      icon: Link2,
      title: 'Shareable Booking Links',
      description:
        'Create unique scheduling links to share with clients, colleagues, and stakeholders. Let people book time without the back-and-forth.',
    },
    {
      icon: Users,
      title: 'Team Scheduling',
      description:
        'Coordinate meetings with multiple team members. Show availability across your entire team and find the best meeting times.',
    },
    {
      icon: Shield,
      title: 'Privacy & Control',
      description:
        'Control exactly when people can book and what information they see. Keep sensitive time slots private and protected.',
    },
    {
      icon: Zap,
      title: 'Instant Confirmations',
      description:
        'Automated booking confirmations and reminders reduce no-shows. Calendar invites are sent instantly to all participants.',
    },
    {
      icon: Globe,
      title: 'Timezone Support',
      description:
        'Handle global teams effortlessly. Scheduling links automatically adjust for different time zones.',
    },
    {
      icon: BarChart3,
      title: 'Booking Analytics',
      description:
        'Track which time slots are most popular and optimize your availability. Get insights into booking patterns and preferences.',
    },
  ];

  const benefits = [
    {
      title: 'Eliminate Scheduling Friction',
      description:
        'Stop spending hours coordinating meetings. Let your network self-serve with instant booking capabilities.',
    },
    {
      title: 'Respect Everyone\'s Time',
      description:
        'Reduce scheduling emails and back-and-forth. Everyone sees exactly what\'s available and books instantly.',
    },
    {
      title: 'Professional Image',
      description:
        'Branded scheduling links reflect well on you and your organization. Look organized and professional to clients and partners.',
    },
  ];

  return (
    <PageTemplate
      title="Meeting Scheduling Links"
      subtitle="STREAMLINED MEETINGS"
      description="Stop the scheduling back-and-forth. Share meeting links with your network and let people book time with you instantly, with full control and privacy protection."
      features={features}
      benefits={benefits}
    />
  );
}
