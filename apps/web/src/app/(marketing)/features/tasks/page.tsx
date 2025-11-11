'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  AlertCircle,
  Clock,
  Layers,
  ListChecks,
  Repeat,
  Tag,
} from 'lucide-react';

export default function TasksPage() {
  const features = [
    {
      icon: ListChecks,
      title: 'Intelligent Task Creation',
      description:
        'Create tasks with natural language input. MicroPlanner understands your intent and automatically organizes tasks into projects.',
    },
    {
      icon: Layers,
      title: 'Flexible Organization',
      description:
        'Organize tasks by projects, tags, and custom categories. Build a system that matches how your mind works.',
    },
    {
      icon: Repeat,
      title: 'Recurring Tasks',
      description:
        'Set up recurring tasks for habits and routine work. Never forget important recurring activities again.',
    },
    {
      icon: Clock,
      title: 'Time Estimation',
      description:
        'Estimate task duration and track actual time spent. Improve your planning accuracy over time with historical data.',
    },
    {
      icon: Tag,
      title: 'Smart Filtering',
      description:
        'Filter and find tasks instantly with powerful search and multi-tag filtering. Your task list adapts to your current context.',
    },
    {
      icon: AlertCircle,
      title: 'Priority & Dependencies',
      description:
        'Mark task dependencies and set priority levels. Understand what needs to happen first and avoid blockers.',
    },
  ];

  const benefits = [
    {
      title: 'Reduced Cognitive Load',
      description:
        'Offload task management to MicroPlanner and free your mind for actual work. Get things off your mind and into a trusted system.',
    },
    {
      title: 'Increased Productivity',
      description:
        'Complete more meaningful work with better task organization. Clear task lists lead to better focus and faster completion rates.',
    },
    {
      title: 'Zero Task Loss',
      description:
        'Never lose track of important tasks again. Everything is captured, organized, and ready when you need it.',
    },
  ];

  return (
    <PageTemplate
      title="Task Management"
      subtitle="GET THINGS DONE"
      description="Master your to-do list with intelligent task management. Create, organize, and track tasks effortlessly while staying focused on what matters most."
      features={features}
      benefits={benefits}
    />
  );
}
