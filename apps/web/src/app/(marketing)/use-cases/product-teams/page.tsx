'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  Package,
  Map,
  Rocket,
  Eye,
  Bug,
  CheckSquare,
} from 'lucide-react';

export default function ProductTeamsPage() {
  const features = [
    {
      icon: Package,
      title: 'Feature Prioritization',
      description: 'Use data-driven frameworks to prioritize features based on user impact, effort, and business value.',
    },
    {
      icon: Map,
      title: 'Product Roadmap Planning',
      description: 'Build transparent roadmaps that align stakeholders, communicate vision, and guide development execution.',
    },
    {
      icon: Rocket,
      title: 'Release Management',
      description: 'Plan, coordinate, and track product releases with dependencies, risk assessment, and rollout schedules.',
    },
    {
      icon: Eye,
      title: 'Stakeholder Alignment',
      description: 'Keep executives, engineers, and customers informed with shared visibility into product direction and progress.',
    },
    {
      icon: Bug,
      title: 'Bug & Incident Tracking',
      description: 'Prioritize and track bug fixes alongside features to ensure quality and maintain customer satisfaction.',
    },
    {
      icon: CheckSquare,
      title: 'Requirement Management',
      description: 'Document requirements clearly, link them to design and development work, and track implementation status.',
    },
  ];

  const benefits = [
    {
      title: 'Faster Time to Market',
      description: 'Streamlined planning and clear execution paths reduce decision paralysis. Launch features faster with less rework.',
    },
    {
      title: 'Better Customer Outcomes',
      description: 'By using structured prioritization and keeping stakeholders aligned, you build features customers actually want and need.',
    },
    {
      title: 'Reduced Scope Creep',
      description: 'Clear roadmaps and documented decisions help prevent scope creep. Maintain focus on core objectives and deliver on commitments.',
    },
  ];

  return (
    <PageTemplate
      title="For Product Teams"
      subtitle="Product Planning"
      description="Build products customers love. MicroPlanner helps product teams plan strategically, align stakeholders, and execute with clarity."
      features={features}
      benefits={benefits}
    />
  );
}
