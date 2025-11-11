'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bug, Sparkles, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';

// Mock changelog - will be real as features ship
const changelog = [
  {
    version: '0.1.0',
    date: 'November 11, 2025',
    type: 'launch',
    items: [
      { type: 'new', text: 'Marketing website with ultra-premium design' },
      { type: 'new', text: 'Email waitlist with real-time counter' },
      { type: 'new', text: 'Brand identity and design system' },
      { type: 'new', text: 'Legal pages (Terms, Privacy, Security)' },
      { type: 'new', text: 'Public roadmap and founder story' },
    ],
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'new':
      return <Sparkles className="h-4 w-4 text-success-500" />;
    case 'improvement':
      return <Zap className="h-4 w-4 text-primary-500" />;
    case 'fix':
      return <Bug className="h-4 w-4 text-warning-500" />;
    default:
      return <Wrench className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function ChangelogPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      </div>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
                WHAT'S NEW
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Product <span className="text-gradient">Changelog</span>
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                All the latest features, improvements, and fixes. Updated with every release.
              </p>
            </div>

            {/* Changelog Items */}
            <div className="space-y-8">
              {changelog.map((release, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">v{release.version}</h2>
                      <p className="text-sm text-muted-foreground">{release.date}</p>
                    </div>
                    {release.type === 'launch' && (
                      <span className="rounded-full bg-success-500/10 px-3 py-1 text-xs font-medium text-success-500">
                        🚀 Launch
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {release.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        {getIcon(item.type)}
                        <span className="text-sm text-muted-foreground">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Subscribe */}
            <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
              <h3 className="mb-4 text-xl font-bold">Get Notified of Updates</h3>
              <p className="mb-6 text-muted-foreground">
                Join the waitlist to receive notifications when we ship new features.
              </p>
              <Link href="/waitlist">
                <Button size="lg">
                  Join Waitlist
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
