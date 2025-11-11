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
  Lightbulb,
  Workflow,
  Lock,
  Brain,
  Target,
  Gauge,
} from 'lucide-react';

export default function MotionComparePage() {
  const advantages = [
    {
      icon: DollarSign,
      title: '50% Less Expensive',
      description:
        'Motion costs significantly more for similar features. MicroPlanner delivers powerful scheduling and planning at half the price with no compromise on quality.',
    },
    {
      icon: Brain,
      title: 'Better Task Management System',
      description:
        'Comprehensive task organization with priorities, dependencies, and custom workflows. MicroPlanner\'s task engine is more intuitive and feature-rich than Motion\'s.',
    },
    {
      icon: Workflow,
      title: 'Easier to Learn and Use',
      description:
        'Intuitive interface designed for immediate productivity. Set up MicroPlanner in minutes without steep learning curves that Motion requires.',
    },
    {
      icon: Users,
      title: 'Superior Team Planning Features',
      description:
        'Built-in workload balancing, capacity planning, and team coordination tools that simplify multi-person project management.',
    },
    {
      icon: Gauge,
      title: 'More Granular Customization',
      description:
        'Fine-tune every aspect of your planning workflow with advanced customization options and flexible automation rules.',
    },
    {
      icon: Lock,
      title: 'Better Data Privacy Controls',
      description:
        'Enterprise-grade security with GDPR compliance and detailed privacy controls. Your data stays under your control.',
    },
  ];

  const differentiators = [
    {
      title: 'Affordability Without Compromise',
      description:
        'Motion charges premium prices for AI features. MicroPlanner includes advanced AI planning capabilities in all tiers, making intelligent automation accessible to businesses of all sizes.',
    },
    {
      title: 'Flexible Project Management',
      description:
        'Handle simple tasks to complex multi-team projects with MicroPlanner\'s adaptable system. Unlike Motion\'s rigid structure, our platform grows with your needs.',
    },
    {
      title: 'Better Mobile Experience',
      description:
        'Manage your entire planning workflow on mobile without limitations. MicroPlanner\'s mobile app is more responsive and feature-complete than Motion\'s offering.',
    },
  ];

  return (
    <PageTemplate
      subtitle="MICROPLANNER VS MOTION"
      title="Superior Planning at Half the Price"
      description="Motion comes with premium pricing. MicroPlanner delivers the same powerful AI-driven scheduling with better value, easier learning curve, and superior team features."
      ctaText="Start Free"
      ctaLink="/sign-up"
      features={advantages}
      benefits={differentiators}
    >
      <div className="mx-auto mb-16 max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-8 text-2xl font-bold">Detailed Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left font-semibold">Feature</th>
                  <th className="pb-4 text-center font-semibold">
                    MicroPlanner
                  </th>
                  <th className="pb-4 text-center font-semibold">Motion</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">AI Task Scheduling</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">AI in Free Tier</td>
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
                  <td className="py-4 pr-4">Team Collaboration</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Time Tracking & Analytics</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <AlertCircle className="mx-auto h-5 w-5 text-gray-400" />
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Custom Workflows</td>
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
                <tr className="border-b border-border hover:bg-accent/50">
                  <td className="py-4 pr-4">Calendar Sync</td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="text-center">
                    <CheckCircle className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                </tr>
                <tr className="hover:bg-accent/50">
                  <td className="py-4 pr-4">Starting Price</td>
                  <td className="text-center font-semibold">Free</td>
                  <td className="text-center font-semibold">$19/month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-bold">Why Teams Switch to MicroPlanner</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Cost-conscious teams:</strong> Get Motion-like features at
                1/3 the price with our flexible pricing model.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Project-focused organizations:</strong> Built-in project
                management is native to MicroPlanner, not an add-on.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="mt-1 h-5 w-5 flex-shrink-0 text-primary-500" />
              <span>
                <strong>Teams that value simplicity:</strong> MicroPlanner\'s
                intuitive design means faster adoption and immediate ROI.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PageTemplate>
  );
}
