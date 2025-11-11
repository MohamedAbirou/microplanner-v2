'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Target,
  Zap,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Clock,
} from 'lucide-react';

export default function GoalsPage() {
  const features = [
    {
      icon: Target,
      title: 'Smart Goal Setting',
      description:
        'Define ambitious yet achievable goals with our intelligent goal-setting framework. Break down long-term aspirations into actionable milestones.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description:
        'Visualize your progress with intuitive charts and metrics. See how close you are to achieving each goal and celebrate milestones along the way.',
    },
    {
      icon: CheckCircle2,
      title: 'Goal Alignment',
      description:
        'Link goals to daily tasks and projects. Ensure every action you take contributes meaningfully to your larger objectives.',
    },
    {
      icon: Zap,
      title: 'Priority Management',
      description:
        'Identify and focus on your most important goals. Use smart prioritization to stay focused on what truly matters.',
    },
    {
      icon: Lightbulb,
      title: 'Goal Inspiration',
      description:
        'Get suggestions based on proven goal-setting methodologies. Learn from experts and best practices built into MicroPlanner.',
    },
    {
      icon: Clock,
      title: 'Timeline Planning',
      description:
        'Set realistic deadlines and create structured timelines. MicroPlanner helps you pace your progress for sustainable success.',
    },
  ];

  const benefits = [
    {
      title: 'Clarity & Direction',
      description:
        'Transform vague aspirations into clear, measurable goals. Know exactly what you\'re working towards and why it matters to you.',
    },
    {
      title: 'Accountability & Motivation',
      description:
        'Track progress consistently and stay motivated. Regular visibility into your achievements builds momentum and confidence.',
    },
    {
      title: 'Success Rate Improvement',
      description:
        'Studies show that written, tracked goals are 10x more likely to be achieved. MicroPlanner makes goal management effortless.',
    },
  ];

  return (
    <PageTemplate
      title="Goal Setting & Tracking"
      subtitle="ACHIEVE YOUR AMBITIONS"
      description="Transform your aspirations into reality with powerful goal-setting and tracking tools. MicroPlanner helps you define clear objectives, monitor progress, and celebrate achievements."
      features={features}
      benefits={benefits}
    />
  );
}
