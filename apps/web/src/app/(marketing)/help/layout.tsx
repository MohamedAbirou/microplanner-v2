import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Guides, FAQs, and support for getting the most out of MicroPlanner.',
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
