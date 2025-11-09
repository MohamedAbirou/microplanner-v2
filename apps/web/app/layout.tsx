import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MicroPlanner - AI Weekly Planner',
  description: 'Mobile-first AI weekly planner that crushes ReclaimAI',
  keywords: ['productivity', 'planner', 'AI', 'calendar', 'scheduling'],
  authors: [{ name: 'MicroPlanner Team' }],
  openGraph: {
    title: 'MicroPlanner - AI Weekly Planner',
    description: 'Mobile-first AI weekly planner that actually works',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
