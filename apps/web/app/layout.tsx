import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

// Inter font for headings
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Geist Sans font for body (if you have the font files, otherwise use Inter)
// For now, we'll use Inter for both
const geistSans = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'MicroPlanner - AI-Powered Weekly Planning',
    template: '%s | MicroPlanner',
  },
  description:
    'The smartest AI weekly planner. Automatically schedule your goals, sync calendars, and crush your productivity. Better than ReclaimAI, Motion, and Clockwise.',
  keywords: [
    'productivity',
    'AI planner',
    'weekly planner',
    'calendar sync',
    'goal tracking',
    'task management',
    'ReclaimAI alternative',
    'Motion alternative',
    'time blocking',
    'smart scheduling',
  ],
  authors: [{ name: 'MicroPlanner', url: 'https://microplanner.ai' }],
  creator: 'MicroPlanner',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'MicroPlanner - AI-Powered Weekly Planning',
    description: 'The smartest AI weekly planner. Beat ReclaimAI and Motion.',
    siteName: 'MicroPlanner',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MicroPlanner - AI Weekly Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroPlanner - AI-Powered Weekly Planning',
    description: 'The smartest AI weekly planner. Beat ReclaimAI and Motion.',
    images: ['/og-image.png'],
    creator: '@microplanner',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#2563EB',
          colorBackground: '#0A0A0A',
          colorInputBackground: '#171717',
          colorInputText: '#FAFAFA',
        },
      }}
    >
      <html
        lang="en"
        className="dark"
        suppressHydrationWarning
        style={{ colorScheme: 'dark' }}
      >
        <head>
          <link rel="icon" href="/brand/logo-icon.svg" type="image/svg+xml" />
        </head>
        <body
          className={`${inter.variable} ${geistSans.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
