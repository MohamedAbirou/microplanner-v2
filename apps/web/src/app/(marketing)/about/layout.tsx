import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'What MicroPlanner is, who it is for, and the philosophy behind AI-assisted weekly planning.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
