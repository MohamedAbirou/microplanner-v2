import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story',
  description: 'The story behind MicroPlanner and why we built an AI that plans your week for you.',
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
