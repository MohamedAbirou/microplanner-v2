import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Recent updates, fixes, and new features shipped in MicroPlanner.',
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
