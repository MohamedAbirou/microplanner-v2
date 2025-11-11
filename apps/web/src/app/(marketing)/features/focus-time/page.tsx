'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Zap,
  Bell,
  Clock,
  Eye,
  Music,
  TrendingUp,
} from 'lucide-react';

export default function FocusTimePage() {
  const features = [
    {
      icon: Zap,
      title: 'Deep Work Sessions',
      description:
        'Schedule dedicated deep work blocks with customizable durations. Protect your focus time from distractions and interruptions.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'Control interruptions during focus sessions. Only critical notifications get through; others can wait until your session ends.',
    },
    {
      icon: Clock,
      title: 'Pomodoro & Custom Timers',
      description:
        'Use proven productivity techniques like Pomodoro. Set custom work and break intervals that match your rhythm.',
    },
    {
      icon: Eye,
      title: 'Focus Mode',
      description:
        'Activate Focus Mode to hide distractions. Minimize unnecessary UI elements and stay laser-focused on your current task.',
    },
    {
      icon: Music,
      title: 'Ambient Support',
      description:
        'Built-in or integrated ambient sounds, music suggestions, and noise options help you maintain concentration.',
    },
    {
      icon: TrendingUp,
      title: 'Focus Analytics',
      description:
        'Track your focus streaks and peak productivity times. Discover when you\'re most productive and optimize accordingly.',
    },
  ];

  const benefits = [
    {
      title: 'Maximize Deep Work',
      description:
        'Achieve flow state more easily. Distraction-free environments enable you to do your best work and produce higher quality results.',
    },
    {
      title: 'Better Work-Life Balance',
      description:
        'Clear boundaries between work and breaks improve overall wellbeing. Know when to focus and when to rest.',
    },
    {
      title: 'Increased Output Quality',
      description:
        'Deep work produces better results. Studies show that uninterrupted focus leads to 30-40% higher quality output.',
    },
  ];

  return (
    <PageTemplate
      title="Deep Work Focus Time"
      subtitle="ELIMINATE DISTRACTIONS"
      description="Create an environment for deep work and sustained focus. Protect your concentration, eliminate distractions, and achieve flow state with powerful focus-enabling features."
      features={features}
      benefits={benefits}
    />
  );
}
