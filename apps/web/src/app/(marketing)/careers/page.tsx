'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Briefcase,
  Zap,
  Users,
  Lightbulb,
  Heart,
  Globe,
} from 'lucide-react';

export default function CareersPage() {
  const features = [
    {
      icon: Briefcase,
      title: 'Diverse Roles',
      description: 'Join us in Engineering, Product, Design, Marketing, Sales, or Customer Success roles with exciting growth opportunities.',
    },
    {
      icon: Zap,
      title: 'Fast-Growing Company',
      description: 'Be part of a high-growth startup experiencing 150% YoY growth with ambitious expansion plans.',
    },
    {
      icon: Users,
      title: 'Collaborative Culture',
      description: 'Work alongside talented professionals who are passionate about innovation and creating meaningful products.',
    },
    {
      icon: Lightbulb,
      title: 'Impact-Driven Work',
      description: 'Your contributions directly shape the future of planning software used by millions worldwide.',
    },
    {
      icon: Heart,
      title: 'Wellness & Benefits',
      description: 'Competitive salary, comprehensive health insurance, unlimited PTO, and professional development allowance.',
    },
    {
      icon: Globe,
      title: 'Remote-Friendly',
      description: 'Work from anywhere with flexible schedules. We have offices in San Francisco, London, and Singapore.',
    },
  ];

  const benefits = [
    {
      title: 'Equity Ownership',
      description:
        'All employees receive stock options as part of their compensation package, allowing you to share in our success.',
    },
    {
      title: 'Professional Development',
      description:
        'Annual training budget, conference attendance, mentorship programs, and clear career progression paths.',
    },
    {
      title: 'Work-Life Balance',
      description:
        'We believe in sustainable productivity. Flexible hours, family-friendly policies, and mental health support are core to our culture.',
    },
  ];

  return (
    <PageTemplate
      title="Join Our Team"
      subtitle="We're Hiring"
      description="Help us build the future of planning software. Check out our open positions and be part of something amazing."
      features={features}
      benefits={benefits}
      ctaText="View Open Positions"
      ctaLink="https://careers.microplanner.com"
    />
  );
}
