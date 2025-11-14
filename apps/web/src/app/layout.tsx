import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from './providers';
import { UserSync } from '@/components/auth/user-sync';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MicroPlanner - AI-Powered Weekly Planning',
    template: '%s | MicroPlanner',
  },
  description: 'AI-powered weekly planning that adapts to you. Crush your goals with intelligent scheduling that learns from your habits and optimizes your time.',
  keywords: [
    'productivity',
    'planning',
    'AI planner',
    'weekly planner',
    'task management',
    'goal tracking',
    'time management',
    'calendar',
    'scheduling',
  ],
  authors: [{ name: 'MicroPlanner Team' }],
  creator: 'MicroPlanner',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'MicroPlanner - AI-Powered Weekly Planning',
    description: 'AI-powered weekly planning that adapts to you',
    siteName: 'MicroPlanner',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MicroPlanner - AI-Powered Weekly Planning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroPlanner - AI-Powered Weekly Planning',
    description: 'AI-powered weekly planning that adapts to you',
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
    icon: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
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
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background font-sans antialiased">
          <Providers>
            <UserSync />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
