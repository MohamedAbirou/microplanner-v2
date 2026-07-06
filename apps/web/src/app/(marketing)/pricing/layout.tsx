import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, honest pricing for MicroPlanner. Start free — upgrade for AI planning, more goals, and calendar sync when you need them.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
