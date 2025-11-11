'use client';

import {
  Code2,
  AlertCircle,
  Users,
  GitBranch,
  BarChart3,
  Settings,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const JiraPage = () => {
  const features = [
    {
      icon: Code2,
      title: 'Issue Tracking Integration',
      description:
        'Connect Jira issues to MicroPlanner tasks to bridge software development and project management workflows.',
    },
    {
      icon: AlertCircle,
      title: 'Status and Priority Sync',
      description:
        'Keep Jira issue status and priority synchronized with MicroPlanner task states automatically.',
    },
    {
      icon: Users,
      title: 'Developer and PM Alignment',
      description:
        'Help development teams and project managers stay aligned with automatic data synchronization.',
    },
    {
      icon: GitBranch,
      title: 'Sprint and Release Planning',
      description:
        'View Jira sprints and releases in MicroPlanner to coordinate development with business initiatives.',
    },
    {
      icon: BarChart3,
      title: 'Velocity and Progress Tracking',
      description:
        'Track team velocity and sprint progress from Jira within MicroPlanner dashboards and reports.',
    },
    {
      icon: Settings,
      title: 'Custom Workflow Mapping',
      description:
        'Map Jira custom workflows and fields to MicroPlanner for process-specific project management.',
    },
  ];

  const benefits = [
    {
      title: 'Unified Development and Planning',
      description:
        'Bridge the gap between software development and business planning with seamless Jira integration.',
    },
    {
      title: 'Real-Time Progress Visibility',
      description:
        'Get instant insights into development progress and sprint health through MicroPlanner dashboards.',
    },
    {
      title: 'Reduce Manual Updates',
      description:
        'Eliminate manual status updates between Jira and planning tools with automatic synchronization.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Jira Integration"
      description="Connect MicroPlanner with Jira to align your development and business planning teams for better project execution."
      features={features}
      benefits={benefits}
      ctaText="Connect Jira"
      ctaLink="/sign-up?integration=jira"
    />
  );
};

export default JiraPage;
