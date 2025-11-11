'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  CheckCircle2,
  Calendar,
  TrendingUp,
  Repeat,
  Zap,
  Award,
} from 'lucide-react';

export default function HabitsPage() {
  const features = [
    {
      icon: CheckCircle2,
      title: 'Habit Creation & Setup',
      description:
        'Build new habits with guided setup. Define frequency, reminders, and goals for each habit you want to develop.',
    },
    {
      icon: Calendar,
      title: 'Daily Habit Tracking',
      description:
        'Check off habits as you complete them each day. Visual feedback from your habit calendar keeps motivation high.',
    },
    {
      icon: Repeat,
      title: 'Streak Tracking',
      description:
        'Watch your streaks grow as you build consistency. Seeing consecutive successful days drives motivation and accountability.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Visualization',
      description:
        'See your habit progress over weeks and months. Charts and heatmaps show patterns and improvements over time.',
    },
    {
      icon: Zap,
      title: 'Smart Reminders',
      description:
        'Receive timely reminders to complete your habits. Adjust reminder timing to fit your routine perfectly.',
    },
    {
      icon: Award,
      title: 'Milestone Celebrations',
      description:
        'Unlock achievements and milestones as you build consistency. Celebrate 7, 30, 100-day streaks and major accomplishments.',
    },
  ];

  const benefits = [
    {
      title: 'Build Lasting Habits',
      description:
        'Research shows it takes 66 days on average to form a habit. MicroPlanner\'s tracking system supports you through the entire journey.',
    },
    {
      title: 'Compound Growth',
      description:
        'Small daily habits compound into massive results over time. Track the habits that matter most and watch your life transform.',
    },
    {
      title: 'Increased Self-Discipline',
      description:
        'Regular habit tracking builds discipline and accountability. Each completed day strengthens your ability to follow through.',
    },
  ];

  return (
    <PageTemplate
      title="Habit Tracking"
      subtitle="BUILD LASTING HABITS"
      description="Transform your life one habit at a time. Track daily habits, build consistency streaks, and celebrate progress as you develop the behaviors that lead to long-term success."
      features={features}
      benefits={benefits}
    />
  );
}
