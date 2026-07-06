import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'What we are building next for MicroPlanner — upcoming features and improvements.',
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
