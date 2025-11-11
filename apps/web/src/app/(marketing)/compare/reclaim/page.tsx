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
  Shield,
  Workflow,
  Smartphone,
  Brain,
  Target,
} from 'lucide-react';

export default function ReclaimComparePage() {
  const advantages = [
    {
      icon: DollarSign,
      title: 'More Affordable Pricing',
      description:
        'Start with free tier and scale affordably. MicroPlanner costs significantly less than ReclaimAI while offering more comprehensive planning features.',
    },
    {
      icon: Brain,
      title: 'Superior AI-Powered Task Management',
      description:
        'Intelligent task prioritization based on deadlines, dependencies, and personal work patterns. MicroPlanner learns your preferences better than ReclaimAI.',
    },
    {
      icon: Workflow,
      title: 'Complete Workflow Integration',
      description:
        'Seamlessly connect with 50+ productivity tools. Our integration ecosystem is broader and more flexible than ReclaimAI\'s offering.',
    },
    {
      icon: Users,
      title: 'Better Team Collaboration',
      description:
        'Built-in team planning, workload balancing, and dependency management. Collaborate more effectively with cross-functional teams.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics & Insights',
      description:
        'Detailed productivity reports, time tracking analytics, and capacity planning insights that go deeper than ReclaimAI\'s reporting.',
    },
    {
      icon: Shield,
      title: 'Greater Customization Control',
      description:
        'Fully customize your planning workflow, automation rules, and interface preferences to match your unique process.',
    },
  ];

  const differentiators = [
    {
      title: 'Holistic Planning Platform',
      description:
        'While ReclaimAI focuses on calendar management, MicroPlanner is a complete planning ecosystem combining task management, calendar optimization, time tracking, and team coordination in one unified platform.',
    },
    {
      title: 'Transparent Pricing Model',
      description:
        'No surprise costs or hidden fees. Our straightforward pricing with free tier access means you only pay for what you need, unlike ReclaimAI\'s enterprise-focused pricing structure.',
    },
    {
      title: 'Developer-Friendly API',
      description:
        'Comprehensive API and webhook support for custom integrations. Build on MicroPlanner with extensive documentation and developer resources.',
    },
  ];

  return (
    <PageTemplate
      subtitle="MICROPLANNER VS RECLAIMAI"
      title="The Smarter Alternative to ReclaimAI"
      description="Compare how MicroPlanner delivers superior planning capabilities at a fraction of the cost. Get the calendar optimization you need plus comprehensive task management."
      ctaText="Start Free"
      ctaLink="/sign-up"
      features={advantages}
      benefits={differentiators}
    >
      <div className="mx-auto mb-16 max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-8 text-2xl font-bold">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left font-semibold">Feature</th>
                  <th className="pb-4 text-center font-semibold">
                    MicroPlanner
                  </th>
                  <th className="pb-4 text-center font-semibold">ReclaimAI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Calendar Optimization</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">AI-Powered Task Management</td>
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
                  <td className="py-4 pr-4">Team Planning & Collaboration</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Project Management</td>
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
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">50+ Integrations</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="py-4 pr-4">Email Support</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">Who Should Choose MicroPlanner?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Teams needing comprehensive planning:</strong> If you want
                calendar optimization AND task management in one platform.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Budget-conscious organizations:</strong> MicroPlanner
                delivers more features at lower price points than ReclaimAI.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Companies wanting deep integrations:</strong> Our broader
                ecosystem works seamlessly with your existing tools.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}
