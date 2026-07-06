'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import { Button } from '@/components/ui/button';
import {
  Headphones,
  BookOpen,
  MessageSquare,
  Clock,
  Zap,
  Globe,
} from 'lucide-react';

export default function ContactSupportPage() {
  const features = [
    {
      icon: Headphones,
      title: '24/7 Support Team',
      description: 'Round-the-clock support available in 15 languages to help you whenever you need assistance.',
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Knowledge Base',
      description: 'Over 500 detailed articles, video tutorials, and best practice guides for self-service learning.',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat Support',
      description: 'Connect instantly with our support team for real-time help and immediate answers to your questions.',
    },
    {
      icon: Clock,
      title: 'Fast Response Times',
      description: 'Average response time of 5 minutes for urgent issues, 30 minutes for standard inquiries.',
    },
    {
      icon: Zap,
      title: 'Proactive Monitoring',
      description: 'We monitor your account health and proactively alert you to any potential issues or optimization opportunities.',
    },
    {
      icon: Globe,
      title: 'Community Forum',
      description: 'Connect with thousands of MicroPlanner users, share tips, and learn from successful implementations.',
    },
  ];

  const benefits = [
    {
      title: 'Multi-Channel Support',
      description:
        'Reach us via email, live chat, phone, or social media. Choose the channel that works best for you and we\'ll be there.',
    },
    {
      title: 'Expert Assistance',
      description:
        'Our support team consists of certified professionals with deep product knowledge who can help with complex scenarios.',
    },
    {
      title: 'Continuous Learning',
      description:
        'Regular webinars, training sessions, and documentation updates ensure you always have access to the latest information.',
    },
  ];

  return (
    <PageTemplate
      title="Customer Support"
      subtitle="We're Here to Help"
      description="Get the support you need when you need it. Our team is dedicated to your success."
      features={features}
      benefits={benefits}
      ctaText="Email Support"
      ctaLink="mailto:support@microplanner.com"
    >
      <div className="mb-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Email Support</h3>
          <p className="text-muted-foreground">
            <a href="mailto:support@microplanner.com" className="text-primary-500 hover:underline">
              support@microplanner.com
            </a>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Response within 24 hours</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Live Chat</h3>
          <p className="text-muted-foreground">Chat with support agents instantly</p>
          <Button className="mt-4 w-full">
            Start Chat
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">Knowledge Base</h3>
          <p className="text-muted-foreground">Search our extensive help documentation</p>
          <Button variant="outline" size="sm" className="mt-4 w-full">
            Browse Docs
          </Button>
        </div>
      </div>
    </PageTemplate>
  );
}
