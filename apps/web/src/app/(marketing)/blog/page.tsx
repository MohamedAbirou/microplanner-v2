'use client';

import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function BlogPage() {
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
                BUILDING IN PUBLIC
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Build Log & <span className="text-gradient">Updates</span>
              </h1>

              <p className="text-base text-muted-foreground md:text-lg">
                Weekly updates on progress, challenges, and lessons learned building MicroPlanner.
              </p>
            </div>

            {/* Coming Soon */}

            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
                <span className="text-4xl">📝</span>
              </div>

              <h2 className="mb-4 text-2xl font-bold">First Post Coming After Launch</h2>

              <p className="mb-6 text-muted-foreground">
                I'll start publishing build logs and progress updates once I launch the MVP. For
                now, you can follow along on{' '}
                <a
                  href="https://linkedin.com/in/mohamed-abirou-34ba39241/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-500 hover:text-primary-600 underline"
                >
                  LinkedIn
                </a>{' '}
                or{' '}
                <a
                  href="https://twitter.com/microplanner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-500 hover:text-primary-600 underline"
                >
                  Twitter
                </a>
                .
              </p>

              <p className="mb-8 text-sm text-muted-foreground">
                Want to be notified when I publish the first post?
              </p>

              <Link href="/sign-up">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* What to Expect */}

            <div className="mt-12">
              <h3 className="mb-6 text-center text-xl font-bold">What You'll Find Here</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <strong className="mb-2 block text-foreground">🚀 Weekly Ship Logs</strong>

                  <p className="text-sm text-muted-foreground">
                    What I built, what I shipped, what I learned each week
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <strong className="mb-2 block text-foreground">💡 Technical Deep-Dives</strong>

                  <p className="text-sm text-muted-foreground">
                    Architecture decisions, code examples, and tech stack choices
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <strong className="mb-2 block text-foreground">📊 Metrics & Growth</strong>

                  <p className="text-sm text-muted-foreground">
                    Real numbers: users, revenue, costs - complete transparency
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <strong className="mb-2 block text-foreground">🎯 Challenges & Failures</strong>

                  <p className="text-sm text-muted-foreground">
                    Things that didn't work, mistakes made, pivots taken
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
