import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Sales',
  description: 'Talk to the MicroPlanner team about plans, teams, and custom needs.',
};

export default function ContactSalesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
