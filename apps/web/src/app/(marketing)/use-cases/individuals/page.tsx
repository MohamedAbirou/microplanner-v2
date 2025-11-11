'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  CheckCircle,
  Target,
  Clock,
  Zap,
  Users,
  Star,
} from 'lucide-react';

export default function IndividualsPage() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Daily Task Management',
      description: 'Organize your daily tasks with smart prioritization, ensuring you focus on what matters most each day.',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and monitor personal goals with milestone tracking and progress visualization to stay motivated.',
    },
    {
      icon: Clock,
      title: 'Time Blocking',
      description: 'Schedule dedicated time blocks for focused work, eliminating context switching and distractions.',
    },
    {
      icon: Zap,
      title: 'Habit Building',
      description: 'Build positive habits with streak tracking, reminders, and progress analytics for consistent personal growth.',
    },
    {
      icon: Users,
      title: 'Collaboration & Sharing',
      description: 'Share plans with friends, family, or mentors to get accountability and support for your goals.',
    },
    {
      icon: Star,
      title: 'Personal Insights',
      description: 'Gain actionable insights about your productivity patterns and time allocation with detailed analytics.',
    },
  ];

  const benefits = [
    {
      title: 'Increased Personal Productivity',
      description: 'Take control of your schedule with intuitive planning tools designed for individual success. MicroPlanner helps you eliminate overwhelm and focus on what truly matters, leading to measurable improvements in daily output.',
    },
    {
      title: 'Better Work-Life Balance',
      description: 'Balance your personal and professional commitments with ease. Set boundaries, manage energy levels, and allocate time intentionally across all life areas.',
    },
    {
      title: 'Long-term Success & Growth',
      description: 'Move beyond daily chaos to strategic personal planning. Track progress toward major life goals and build sustainable systems that compound over time.',
    },
  ];

  return (
    <PageTemplate
      title="For Individuals"
      subtitle="Personal Planning"
      description="Take control of your life with MicroPlanner. From daily tasks to long-term goals, manage every aspect of your personal and professional growth."
      features={features}
      benefits={benefits}
    />
  );
}
