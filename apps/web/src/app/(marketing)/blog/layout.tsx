import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Productivity tips, planning strategies, and product updates from the MicroPlanner team.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
