'use client';

import {
  Zap,
  GitBranch,
  Users,
  BarChart3,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const LinearPage = () => {
  const features = [
    {
      icon: Zap,
      title: 'Fast Issue Sync',
      description:
        'Sync Linear issues with MicroPlanner for rapid project management and seamless workflow integration.',
    },
    {
      icon: GitBranch,
      title: 'Team Sync and Cycles',
      description:
        'View Linear team structure and work cycles in MicroPlanner for better capacity planning.',
    },
    {
      icon: Users,
      title: 'Assignment Management',
      description:
        'Keep track of Linear issue assignments and automatically map them to MicroPlanner task owners.',
    },
    {
      icon: BarChart3,
      title: 'Roadmap Integration',
      description:
        'Connect Linear roadmaps to MicroPlanner for comprehensive strategic and execution planning.',
    },
    {
      icon: AlertCircle,
      title: 'Real-Time Status Updates',
      description:
        'Get instant updates when Linear issue status changes and keep MicroPlanner tasks in sync.',
    },
    {
      icon: Layers,
      title: 'Project Structure Mapping',
      description:
        'Map Linear projects and initiatives to MicroPlanner projects while maintaining structural integrity.',
    },
  ];

  const benefits = [
    {
      title: 'Modern Integration for Modern Teams',
      description:
        'Use Linear for lightweight issue tracking and MicroPlanner for comprehensive project planning.',
    },
    {
      title: 'Zero Context Switching',
      description:
        'Work in your preferred tool while automatically keeping data synchronized across platforms.',
    },
    {
      title: 'Complete Development Visibility',
      description:
        'See the full picture of your development pipeline and business initiatives in one unified dashboard.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Linear Integration"
      description="Integrate MicroPlanner with Linear for modern teams to streamline issue tracking and project planning workflows."
      features={features}
      benefits={benefits}
      ctaText="Connect Linear"
      ctaLink="/sign-up?integration=linear"
    />
  );
};

export default LinearPage;
