'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Zap,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ListTodo,
  Workflow,
  Brain,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function CalendlyComparePage() {
  const advantages = [
    {
      icon: ListTodo,
      title: 'Complete Task Management',
      description:
        'Calendly handles scheduling, but MicroPlanner adds comprehensive task management, project planning, and workflow automation to keep everything organized.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Planning Assistant',
      description:
        'Beyond just scheduling meetings, MicroPlanner intelligently plans your entire day, prioritizes tasks, and optimizes your time using advanced AI.',
    },
    {
      icon: DollarSign,
      title: 'Better Value for Money',
      description:
        'Calendly charges for basic features. MicroPlanner provides scheduling, task management, time tracking, and team features at a lower total cost of ownership.',
    },
    {
      icon: Users,
      title: 'Superior Team Features',
      description:
        'Calendly focuses on individual scheduling. MicroPlanner includes built-in team coordination, workload balancing, and collaborative planning tools.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Insights',
      description:
        'Detailed productivity metrics, time allocation reports, and capacity planning analytics that go far beyond Calendly\'s basic availability tracking.',
    },
    {
      icon: Workflow,
      title: 'Deep Integration Ecosystem',
      description:
        'Connect with 50+ tools seamlessly. MicroPlanner\'s integration network is broader and more flexible than Calendly\'s limited connector options.',
    },
  ];

  const differentiators = [
    {
      title: 'Holistic Planning vs Scheduling Only',
      description:
        'Calendly is excellent at one thing: scheduling meetings. MicroPlanner is a complete planning platform combining scheduling with task management, project planning, team coordination, and intelligent time allocation.',
    },
    {
      title: 'Intelligent Time Management',
      description:
        'MicroPlanner doesn\'t just show availability; it intelligently fills your available time with high-priority tasks, breaks, and deep work blocks using AI. Calendly only facilitates meetings.',
    },
    {
      title: 'All-in-One vs Best-of-Breed Ecosystem',
      description:
        'Replace multiple tools with MicroPlanner\'s unified platform. Get planning, scheduling, task management, and team collaboration in one place, reducing tool sprawl and switching costs.',
    },
  ];

  return (
    <PageTemplate
      subtitle="MICROPLANNER VS CALENDLY"
      title="The Planning Platform That Goes Beyond Meeting Scheduling"
      description="Calendly is great for scheduling, but MicroPlanner goes further. Get meeting scheduling plus comprehensive task management, intelligent planning, and team coordination in one unified platform."
      ctaText="Start Free"
      ctaLink="/sign-up"
      features={advantages}
      benefits={differentiators}
    >
      <div className="mx-auto mb-16 max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-8 text-2xl font-bold">Comprehensive Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left font-semibold">Feature</th>
                  <th className="pb-4 text-center font-semibold">
                    MicroPlanner
                  </th>
                  <th className="pb-4 text-center font-semibold">Calendly</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Meeting Scheduling</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Task Management</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Project Planning</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">AI-Powered Planning</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Time Tracking</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Team Collaboration</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Workload Balancing</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Advanced Analytics</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Free Tier</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="py-4 pr-4">Native Integration Support</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="mb-6 text-2xl font-bold">The Planning Gap Calendly Can\'t Fill</h2>
            <p className="mb-4 text-muted-foreground">
              Calendly solved the meeting scheduling problem, but professionals face a
              bigger challenge: how do I organize and execute all my tasks between
              meetings? MicroPlanner fills that gap with intelligent task management
              and planning.
            </p>
            <p className="text-muted-foreground">
              Our users typically keep using their scheduling tool alongside MicroPlanner
              for meeting booking, but rely on MicroPlanner for their complete planning
              and productivity system.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="mb-6 text-2xl font-bold">Perfect For</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
                <span>
                  <strong>Sales professionals:</strong> Schedule customer calls with
                  Calendly, manage leads and follow-ups with MicroPlanner.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
                <span>
                  <strong>Project managers:</strong> Replace multiple tools with
                  MicroPlanner\'s comprehensive project and team management.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
                <span>
                  <strong>Busy executives:</strong> Get intelligent time management
                  that schedules your day, not just your meetings.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
                <span>
                  <strong>Growing teams:</strong> Coordinate across people with
                  workload balancing and team capacity planning features.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
