'use client';

import {
  Video,
  Calendar,
  Users,
  Clock,
  FileText,
  Share2,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const ZoomPage = () => {
  const features = [
    {
      icon: Video,
      title: 'One-Click Meeting Links',
      description:
        'Generate Zoom meeting links directly within MicroPlanner tasks and projects for instant collaboration.',
    },
    {
      icon: Calendar,
      title: 'Calendar Integration',
      description:
        'Automatically create Zoom meetings when scheduling video calls for your team meetings in MicroPlanner.',
    },
    {
      icon: Users,
      title: 'Participant Management',
      description:
        'Automatically add task assignees and team members to Zoom meetings created from MicroPlanner.',
    },
    {
      icon: Clock,
      title: 'Meeting Reminders',
      description:
        'Set up reminders for upcoming Zoom meetings associated with your MicroPlanner tasks and projects.',
    },
    {
      icon: FileText,
      title: 'Recording Access',
      description:
        'Link Zoom recordings directly to tasks for easy reference and knowledge sharing across your team.',
    },
    {
      icon: Share2,
      title: 'Team Sharing',
      description:
        'Share Zoom meeting links with task collaborators and make them visible to all project participants.',
    },
  ];

  const benefits = [
    {
      title: 'Seamless Remote Collaboration',
      description:
        'Start video meetings without leaving MicroPlanner, making it easier to collaborate with distributed teams.',
    },
    {
      title: 'Organized Meeting Context',
      description:
        'Keep all your meeting recordings, notes, and decisions organized within the context of your MicroPlanner tasks.',
    },
    {
      title: 'Save Time on Setup',
      description:
        'Eliminate the need to manually create meetings and send links through emails and chat.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Zoom Integration"
      description="Create and manage Zoom meetings directly from MicroPlanner to simplify video collaboration and keep your team connected."
      features={features}
      benefits={benefits}
      ctaText="Connect Zoom"
      ctaLink="/sign-up?integration=zoom"
    />
  );
};

export default ZoomPage;
