import Link from 'next/link';

import { ArrowRight, Code, Globe, Heart, Target, Users, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
          <div className="mx-auto max-w-3xl">
            {/* Header */}

            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
                ABOUT MICROPLANNER
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Making AI Planning <span className="text-gradient">Affordable</span>
              </h1>

              <p className="text-base text-muted-foreground md:text-lg">
                One developer, one mission: Build a planning tool that doesn't cost $400/year.
              </p>
            </div>

            {/* The Reality */}

            <div className="mb-12 space-y-6 text-muted-foreground">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Honest Truth</h2>

                <p className="mb-4">
                  MicroPlanner is a <strong className="text-foreground">one-person project</strong>.
                  No VC funding, no marketing team, no "team of 50 experts." Just me, Moe, a
                  23-year-old software engineer , building something I believe in.
                </p>

                <p className="mb-4">
                  <strong className="text-foreground">Current status:</strong> Early access open.
                  Sign up free and start planning. Building Phase 1 right now.
                </p>

                <p>
                  <strong className="text-foreground">Why tell you this?</strong> Because I'm
                  building in public. That means radical transparency. No fake metrics, no inflated
                  claims, just real progress you can follow.
                </p>
              </div>

              {/* The Why */}

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Why MicroPlanner Exists</h2>

                <div className="space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                      <Code className="h-5 w-5 text-primary-500" />
                    </div>

                    <div>
                      <strong className="text-foreground">Motion is $34/month.</strong> That's
                      $408/year. For indie developers, students, and people in countries like
                      Morocco? That's not affordable.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-700/10">
                      <Zap className="h-5 w-5 text-secondary-700" />
                    </div>

                    <div>
                      <strong className="text-foreground">AI planning should be accessible.</strong>{' '}
                      Everyone deserves tools that help them be productive, not just people who can
                      afford enterprise pricing.
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                      <Heart className="h-5 w-5 text-primary-500" />
                    </div>

                    <div>
                      <strong className="text-foreground">I'm building this for me too.</strong>{' '}
                      I've tried every productivity tool. None felt right. So I'm building the one I
                      want to use.
                    </div>
                  </div>
                </div>
              </div>

              {/* The Vision */}

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">What I'm Building</h2>

                <p className="mb-4">
                  MicroPlanner is an AI-powered planning tool that helps you turn goals into
                  scheduled tasks automatically. Think Motion or ReclaimAI, but:
                </p>

                <ul className="space-y-2 rounded-xl border border-border bg-card p-6">
                  <li className="flex gap-2">
                    <span className="text-success-500 font-bold">✓</span>

                    <span>
                      <strong className="text-foreground">60% cheaper:</strong> $8-12/month instead
                      of $34
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="text-success-500 font-bold">✓</span>

                    <span>
                      <strong className="text-foreground">Modern UI:</strong> Beautiful design that
                      actually feels good to use
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="text-success-500 font-bold">✓</span>

                    <span>
                      <strong className="text-foreground">Built in public:</strong> You can watch
                      every feature being built, suggest changes, and influence the roadmap
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="text-success-500 font-bold">✓</span>

                    <span>
                      <strong className="text-foreground">Solo founder = fast decisions:</strong> No
                      bureaucracy, no board meetings, just build and ship
                    </span>
                  </li>
                </ul>
              </div>

              {/* The Founder */}

              <div className="rounded-xl border border-secondary-700/20 bg-secondary-700/5 p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">About the Founder</h2>

                <p className="mb-4">
                  I'm <strong className="text-foreground">Moe Abirou</strong>, 23 years old software engineer. I've been in the IT field for 7 years, and
                  seriously building products for the last 4-5 years. I've built ERPs, AI-powered
                  SaaS platforms, automation tools — you name it.
                </p>

                <p>
                  <strong className="text-foreground">My dream:</strong> Freedom. Freedom to work
                  from anywhere (ideally Switzerland 🇨🇭). Free to build
                  products I believe in without asking permission from a boss and live life
                  on my own terms. MicroPlanner is my first step toward that freedom.
                </p>
              </div>

              {/* The Commitment */}

              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">My Commitment to You</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary-500" />

                      <strong className="text-foreground">Build in Public</strong>
                    </div>

                    <p className="text-sm">
                      Every feature, every challenge, every win and failure - I'll share it all
                      publicly.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-success-500" />

                      <strong className="text-foreground">User-First</strong>
                    </div>

                    <p className="text-sm">
                      Your feedback directly shapes what gets built. Early users have real
                      influence.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-secondary-700" />

                      <strong className="text-foreground">Affordable Pricing</strong>
                    </div>

                    <p className="text-sm">I'll never charge $400/year. That's a promise.</p>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary-500" />

                      <strong className="text-foreground">Community-Driven</strong>
                    </div>

                    <p className="text-sm">
                      Build-in-public means building WITH the community, not just for it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}

            <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold">Want to Follow the Journey?</h2>

              <p className="mb-6 text-muted-foreground">
                Create a free account to start planning, and follow along as I build, ship, and
                (hopefully) grow MicroPlanner from 0 to something meaningful.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/sign-up">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <a
                  href="https://linkedin.com/in/mohamed-abirou-34ba39241/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    Follow on LinkedIn
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
