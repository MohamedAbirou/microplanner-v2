'use client';

import {
  Briefcase,
  Target,
  Users,
  BarChart3,
  Calendar,
  GitBranch,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const AsanaPage = () => {
  const features = [
    {
      icon: Briefcase,
      title: 'Project Synchronization',
      description:
        'Sync Asana projects with MicroPlanner to maintain a unified view across your project management workflow.',
    },
    {
      icon: Target,
      title: 'Task and Subtask Mapping',
      description:
        'Map Asana tasks and subtasks to MicroPlanner work items while preserving hierarchy and dependencies.',
    },
    {
      icon: Users,
      title: 'Team and Assignment Sync',
      description:
        'Keep team member assignments synchronized between Asana and MicroPlanner for accurate ownership.',
    },
    {
      icon: BarChart3,
      title: 'Portfolio Insights',
      description:
        'View Asana portfolio-level data in MicroPlanner dashboards for strategic planning and analytics.',
    },
    {
      icon: Calendar,
      title: 'Timeline Management',
      description:
        'Manage project timelines and dependencies from both Asana and MicroPlanner with automatic synchronization.',
    },
    {
      icon: GitBranch,
      title: 'Custom Field Mapping',
      description:
        'Map Asana custom fields to MicroPlanner properties for consistent data across both platforms.',
    },
  ];

  const benefits = [
    {
      title: 'Scale Your Team Operations',
      description:
        'Use Asana for team collaboration and MicroPlanner for strategic planning without context switching.',
    },
    {
      title: 'Data Consistency',
      description:
        'Keep project data synchronized across platforms to ensure your team is always working with current information.',
    },
    {
      title: 'Enhanced Visibility',
      description:
        'Get a complete view of project status, timelines, and dependencies across your entire organization.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Asana Integration"
      description="Seamlessly integrate MicroPlanner with Asana to create a powerful project management ecosystem for your entire team."
      features={features}
      benefits={benefits}
      ctaText="Connect Asana"
      ctaLink="/sign-up?integration=asana"
    />
  );
};

export default AsanaPage;
