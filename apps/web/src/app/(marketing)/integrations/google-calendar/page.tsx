'use client';

import {
  Calendar,
  Clock,
  Bell,
  Share2,
  BarChart3,
  Users,
  CheckCircle,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const GoogleCalendarPage = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Automatic Event Sync',
      description:
        'Automatically sync your Google Calendar events with MicroPlanner tasks and projects for complete visibility.',
    },
    {
      icon: Clock,
      title: 'Smart Time Blocking',
      description:
        'Block calendar time for your most important tasks and see real-time availability across your team.',
    },
    {
      icon: Bell,
      title: 'Intelligent Reminders',
      description:
        'Get notified before calendar events with MicroPlanner task reminders synced to your Google Calendar.',
    },
    {
      icon: Share2,
      title: 'Multi-Calendar Support',
      description:
        'Connect multiple Google Calendars and sync them all to get a unified view of your commitments.',
    },
    {
      icon: BarChart3,
      title: 'Time Tracking Analytics',
      description:
        'Analyze how much time you spend on different projects using Google Calendar event data.',
    },
    {
      icon: Users,
      title: 'Team Availability',
      description:
        'See your teammates\' Google Calendar availability when scheduling collaborative work.',
    },
  ];

  const benefits = [
    {
      title: 'Never Miss a Meeting Again',
      description:
        'MicroPlanner automatically syncs with your Google Calendar to ensure tasks align with your schedule and prevent overcommitment.',
    },
    {
      title: 'Reduce Context Switching',
      description:
        'Keep all your planning and scheduling in MicroPlanner while maintaining Google Calendar integration for your team.',
    },
    {
      title: 'Improve Time Management',
      description:
        'Get insights into how your calendar time relates to your tasks and projects for better planning decisions.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Google Calendar Integration"
      description="Seamlessly sync your Google Calendar with MicroPlanner to align your schedule with your tasks and projects."
      features={features}
      benefits={benefits}
      ctaText="Connect Google Calendar"
      ctaLink="/sign-up?integration=google-calendar"
    />
  );
};

export default GoogleCalendarPage;
