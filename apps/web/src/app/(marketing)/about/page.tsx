'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Users,
  Globe,
  Lightbulb,
  Award,
  TrendingUp,
  Heart,
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: 'Team of 50+ Experts',
      description: 'Our diverse team brings decades of combined experience in project management and productivity solutions.',
    },
    {
      icon: Globe,
      title: 'Trusted Globally',
      description: 'Serving customers across 120+ countries with localized support and culturally aware solutions.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'Continuously researching and implementing cutting-edge planning methodologies and technologies.',
    },
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Winner of multiple awards for excellence in productivity software and user experience design.',
    },
    {
      icon: TrendingUp,
      title: '500% Growth',
      description: 'Experienced exponential growth with 2M+ active users and 95% retention rate over the past 3 years.',
    },
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Built on genuine user feedback and continuous iteration to solve real planning challenges.',
    },
  ];

  const benefits = [
    {
      title: 'Our Mission',
      description:
        'We believe that effective planning should be simple, intuitive, and empowering. MicroPlanner exists to help professionals, teams, and organizations achieve their goals through smarter planning and execution.',
    },
    {
      title: 'Our Values',
      description:
        'Transparency, Innovation, and Customer Success guide everything we do. We maintain open communication with our community, continuously evolve our platform, and measure success by our customers\' achievements.',
    },
    {
      title: 'Our Commitment',
      description:
        'We are committed to sustainable growth, ethical business practices, and creating a positive impact in the planning and productivity space. Your success is our success.',
    },
  ];

  return (
    <PageTemplate
      title="About MicroPlanner"
      subtitle="Our Story"
      description="Empowering millions to plan better, achieve more, and transform their work."
      features={features}
      benefits={benefits}
      ctaText="Join Our Community"
      ctaLink="/sign-up"
    />
  );
}
