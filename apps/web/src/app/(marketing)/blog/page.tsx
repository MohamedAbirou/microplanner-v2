'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/20 blur-3xl" />
      </div>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
              COMING SOON
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              MicroPlanner <span className="text-gradient">Blog</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Insights, tips, and stories about productivity, time management, and achieving your goals.
            </p>
          </div>

          {/* Placeholder Content */}
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary-500/10 p-4">
                  <BookOpen className="h-8 w-8 text-primary-500" />
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold">Blog Coming Soon</h2>

              <p className="mb-8 text-base text-muted-foreground">
                We're preparing high-quality content about productivity, time management strategies, goal setting, and more.
              </p>

              <p className="mb-8 text-base text-muted-foreground">
                Be the first to know when we launch! Subscribe to get notified when new articles are published.
              </p>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium mb-3">Get notified when blog launches</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button>Subscribe</Button>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-primary-500/10 pt-12">
                <p className="mb-6 font-semibold">In the meantime, check out:</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/how-it-works">
                    <Button variant="outline">
                      How It Works
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline">
                      Features
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="outline">
                      Help Center
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
