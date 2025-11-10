import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Inter font - clean and professional
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// Geist Sans for body text
const geistSans = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'MicroPlanner - AI-Powered Productivity',
    template: '%s | MicroPlanner',
  },
  description:
    'The smartest AI-powered productivity planner. Automatically schedule goals, sync calendars, and boost your productivity. Better than Motion, ReclaimAI, and Clockwise.',
  keywords: [
    'productivity',
    'AI planner',
    'weekly planner',
    'calendar sync',
    'goal tracking',
    'task management',
    'Motion alternative',
    'ReclaimAI alternative',
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
    title: 'MicroPlanner - AI-Powered Productivity',
    description: 'The smartest AI-powered productivity planner.',
    siteName: 'MicroPlanner',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MicroPlanner - AI Productivity Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MicroPlanner - AI-Powered Productivity',
    description: 'The smartest AI-powered productivity planner.',
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
          borderRadius: '0.75rem',
          fontSize: '0.875rem', // Smaller font size
        },
        elements: {
          formButtonPrimary: 'bg-gradient-brand shadow-glow-brand hover:shadow-glow-blue',
          card: 'glass-card',
          headerTitle: 'text-lg font-semibold', // Smaller header
          headerSubtitle: 'text-sm', // Smaller subtitle
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className="dark">
        <head>
          <link rel="icon" href="/brand/logo-icon.svg" type="image/svg+xml" />
        </head>
        <body
          className={`${inter.variable} ${geistSans.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
