import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Support',
  description: 'Get help from the MicroPlanner support team.',
};

export default function ContactSupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
