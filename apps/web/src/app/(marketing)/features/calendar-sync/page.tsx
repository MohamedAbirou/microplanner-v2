'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Calendar,
  RefreshCw,
  Clock,
  Eye,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function CalendarSyncPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Multi-Calendar Integration',
      description:
        'Connect Google Calendar, Outlook, Apple Calendar, and more. See all your commitments in one unified view.',
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Synchronization',
      description:
        'Keep everything in sync automatically. Changes in MicroPlanner instantly reflect in your calendar and vice versa.',
    },
    {
      icon: Clock,
      title: 'Smart Time Blocking',
      description:
        'Block out time for deep work, breaks, and personal time. Protect your focused work periods automatically.',
    },
    {
      icon: Eye,
      title: 'Schedule Visibility',
      description:
        'See your full week or month at a glance. View task workload alongside calendar events for better planning.',
    },
    {
      icon: AlertCircle,
      title: 'Conflict Detection',
      description:
        'MicroPlanner alerts you to scheduling conflicts before they happen. Avoid double-booking and time management disasters.',
    },
    {
      icon: Zap,
      title: 'Automatic Scheduling',
      description:
        'Let MicroPlanner intelligently schedule tasks during available slots. Find optimal times for task execution automatically.',
    },
  ];

  const benefits = [
    {
      title: 'Single Source of Truth',
      description:
        'Stop context-switching between apps. Your calendar, tasks, and projects all live in perfect harmony in MicroPlanner.',
    },
    {
      title: 'Better Time Utilization',
      description:
        'Never waste time again wondering when you can work on tasks. See available time and schedule intelligently.',
    },
    {
      title: 'Seamless Workflow',
      description:
        'Work with your existing tools. MicroPlanner integrates with calendars you already use, eliminating friction.',
    },
  ];

  return (
    <PageTemplate
      title="Calendar Synchronization"
      subtitle="PERFECT TIME ALIGNMENT"
      description="Synchronize your calendar with your planning system. Never miss a beat with integrated calendar management that keeps your schedule perfectly aligned with your tasks and goals."
      features={features}
      benefits={benefits}
    />
  );
}
