'use client';

import {
  Database,
  Link2,
  FileText,
  BarChart3,
  Share2,
  Layers,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const NotionPage = () => {
  const features = [
    {
      icon: Database,
      title: 'Database Sync',
      description:
        'Connect your Notion databases to MicroPlanner and sync tasks, projects, and documents seamlessly.',
    },
    {
      icon: Link2,
      title: 'Bidirectional Linking',
      description:
        'Link MicroPlanner tasks to Notion pages and keep them synchronized automatically.',
    },
    {
      icon: FileText,
      title: 'Document Integration',
      description:
        'Attach Notion documents and project dashboards directly to MicroPlanner tasks for easy access.',
    },
    {
      icon: BarChart3,
      title: 'Template Replication',
      description:
        'Use Notion templates to create standardized task structures and project setups in MicroPlanner.',
    },
    {
      icon: Share2,
      title: 'Team Knowledge Base',
      description:
        'Link MicroPlanner projects to your Notion team wiki and knowledge base for centralized documentation.',
    },
    {
      icon: Layers,
      title: 'Custom Properties',
      description:
        'Map Notion database properties to MicroPlanner fields for consistent data across platforms.',
    },
  ];

  const benefits = [
    {
      title: 'Unified Knowledge Management',
      description:
        'Keep your planning in MicroPlanner and documentation in Notion while maintaining a synchronized workflow.',
    },
    {
      title: 'Enhanced Project Documentation',
      description:
        'Automatically create Notion pages from MicroPlanner projects with all relevant context and metadata.',
    },
    {
      title: 'Better Information Organization',
      description:
        'Leverage Notion\'s powerful database features while maintaining your task management in MicroPlanner.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Notion Integration"
      description="Connect MicroPlanner with Notion to unify your project management and knowledge base in one seamless workflow."
      features={features}
      benefits={benefits}
      ctaText="Connect Notion"
      ctaLink="/sign-up?integration=notion"
    />
  );
};

export default NotionPage;
