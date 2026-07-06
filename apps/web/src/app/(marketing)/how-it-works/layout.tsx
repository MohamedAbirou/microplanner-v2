import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Set goals, generate an AI-optimized week, accept it, and track progress — how MicroPlanner works, step by step.',
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
