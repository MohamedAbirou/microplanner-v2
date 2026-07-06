import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'AI-powered weekly planning, chronotype-aware scheduling, goal tracking, and analytics — everything MicroPlanner does to plan your week for you.',
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
