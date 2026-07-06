import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glossary',
  description: 'Key terms and concepts used across MicroPlanner — chronotype, focus blocks, quality score, and more.',
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
