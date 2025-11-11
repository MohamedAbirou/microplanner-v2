'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  Zap,
  Shield,
  Headphones,
  Rocket,
} from 'lucide-react';

export default function ContactSalesPage() {
  const features = [
    {
      icon: DollarSign,
      title: 'Flexible Pricing',
      description: 'Custom pricing plans tailored to your organization size, features needed, and budget constraints.',
    },
    {
      icon: Users,
      title: 'Dedicated Account Manager',
      description: 'Get personalized support from an account manager who understands your business and goals.',
    },
    {
      icon: Zap,
      title: 'Quick Implementation',
      description: 'Fast onboarding with guided setup, data migration support, and comprehensive training for your team.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II compliant with advanced security features, SSO, and data privacy certifications.',
    },
    {
      icon: Headphones,
      title: '24/7 Priority Support',
      description: 'Dedicated support channel with guaranteed response times and escalation procedures for enterprise customers.',
    },
    {
      icon: Rocket,
      title: 'Integration Ecosystem',
      description: 'Seamless integrations with 200+ business tools including Slack, Jira, Salesforce, and more.',
    },
  ];

  const benefits = [
    {
      title: 'ROI Within 3 Months',
      description:
        'Most organizations see measurable ROI within the first 90 days through improved efficiency and reduced overhead.',
    },
    {
      title: 'Scalable Solution',
      description:
        'From 10 to 10,000 users, our platform scales with your organization without performance degradation or additional complexity.',
    },
    {
      title: 'Partnership Approach',
      description:
        'We invest in your success with regular check-ins, optimization reviews, and quarterly business reviews to maximize value.',
    },
  ];

  return (
    <PageTemplate
      title="Contact Our Sales Team"
      subtitle="Enterprise Solutions"
      description="Let's discuss how MicroPlanner can transform your organization's planning and execution."
      features={features}
      benefits={benefits}
      ctaText="Schedule a Demo"
      ctaLink="https://calendly.com/microplanner-sales"
    >
      <div className="mb-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Email</h3>
          <p className="text-muted-foreground">
            <a href="mailto:sales@microplanner.com" className="text-primary-500 hover:underline">
              sales@microplanner.com
            </a>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Response within 2 hours</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Phone</h3>
          <p className="text-muted-foreground">
            <a href="tel:+1-800-MICROPLAN" className="text-primary-500 hover:underline">
              +1 (800) 646-2776
            </a>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Mon-Fri, 8am-6pm PT</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Live Chat</h3>
          <p className="text-muted-foreground">Chat with our sales team in real-time</p>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            Start Chat
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
}
