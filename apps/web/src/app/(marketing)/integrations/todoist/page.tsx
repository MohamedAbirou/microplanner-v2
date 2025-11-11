'use client';

import {
  CheckSquare,
  Layers,
  Filter,
  Zap,
  BarChart3,
  Share2,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const TodoistPage = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Task Synchronization',
      description:
        'Sync your Todoist tasks with MicroPlanner projects for a unified view of your work across platforms.',
    },
    {
      icon: Layers,
      title: 'Project Structure Mapping',
      description:
        'Map Todoist projects to MicroPlanner projects and keep their structure and hierarchy synchronized.',
    },
    {
      icon: Filter,
      title: 'Smart Filters',
      description:
        'Create filters to automatically sync specific Todoist tasks based on labels, priorities, or due dates.',
    },
    {
      icon: Zap,
      title: 'Automation Rules',
      description:
        'Set up automation to create MicroPlanner tasks from Todoist items or vice versa based on conditions.',
    },
    {
      icon: BarChart3,
      title: 'Productivity Insights',
      description:
        'Analyze your Todoist data within MicroPlanner dashboards for comprehensive productivity metrics.',
    },
    {
      icon: Share2,
      title: 'Team Collaboration',
      description:
        'Share Todoist projects in MicroPlanner and collaborate on shared tasks across both platforms.',
    },
  ];

  const benefits = [
    {
      title: 'Consolidate Your Workflow',
      description:
        'Use Todoist for quick capture and MicroPlanner for comprehensive project planning without data silos.',
    },
    {
      title: 'Eliminate Duplicates',
      description:
        'Never worry about managing the same tasks in multiple places with automatic synchronization.',
    },
    {
      title: 'Increased Visibility',
      description:
        'See all your Todoist tasks in your MicroPlanner workflow for complete project visibility.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Todoist Integration"
      description="Sync your Todoist tasks with MicroPlanner to create a powerful unified task management and project planning system."
      features={features}
      benefits={benefits}
      ctaText="Connect Todoist"
      ctaLink="/sign-up?integration=todoist"
    />
  );
};

export default TodoistPage;
