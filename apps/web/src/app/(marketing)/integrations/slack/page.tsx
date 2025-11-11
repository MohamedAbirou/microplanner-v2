'use client';

import {
  MessageSquare,
  Bell,
  CheckCircle2,
  Settings,
  Zap,
  Users,
} from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

const SlackPage = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Task Status Updates',
      description:
        'Send MicroPlanner task updates directly to Slack channels to keep your team informed in real-time.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'Receive deadline reminders, task assignments, and status changes as Slack messages.',
    },
    {
      icon: CheckCircle2,
      title: 'Complete Tasks from Slack',
      description:
        'Mark tasks as complete or update progress directly from Slack without switching applications.',
    },
    {
      icon: Settings,
      title: 'Customizable Alerts',
      description:
        'Create custom notification rules for different project statuses, priorities, and team members.',
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description:
        'Automate task creation, assignment, and status updates triggered by Slack commands.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Mention team members in Slack to assign MicroPlanner tasks and keep conversations contextual.',
    },
  ];

  const benefits = [
    {
      title: 'Reduce App Switching',
      description:
        'Manage your tasks and projects without leaving Slack, your primary communication hub for team coordination.',
    },
    {
      title: 'Improve Team Communication',
      description:
        'Keep everyone on the same page with automatic task updates and announcements in shared Slack channels.',
    },
    {
      title: 'Accelerate Decision Making',
      description:
        'Get instant notifications about project progress and blockers to make faster, more informed decisions.',
    },
  ];

  return (
    <PageTemplate
      subtitle="Integrations"
      title="Slack Integration"
      description="Connect MicroPlanner to Slack to manage tasks, receive notifications, and collaborate with your team directly in Slack."
      features={features}
      benefits={benefits}
      ctaText="Connect Slack"
      ctaLink="/sign-up?integration=slack"
    />
  );
};

export default SlackPage;
