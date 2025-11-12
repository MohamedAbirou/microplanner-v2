import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage() {
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
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-16 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
                BUILDING IN PUBLIC
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Product <span className="text-gradient">Roadmap</span>
              </h1>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                Follow our journey from idea to launch. Updated weekly as we build in public.
              </p>
            </div>

            {/* Roadmap Timeline */}
            <div className="space-y-8">
              {/* Phase 0 - Completed */}
              <div className="relative rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-500/10">
                    <CheckCircle2 className="h-6 w-6 text-success-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Phase 0: Foundation</h2>
                    <p className="text-sm text-success-500">✓ Completed - November 2025</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5" />
                    <span>Brand identity & design system</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5" />
                    <span>Marketing website with 15+ pages</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5" />
                    <span>Functional email waitlist</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5" />
                    <span>Legal pages (Terms, Privacy, Security)</span>
                  </li>
                </ul>
              </div>

              {/* Phase 1 - In Progress */}
              <div className="relative rounded-xl border border-primary-500/20 bg-primary-500/5 p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20 animate-pulse">
                    <Clock className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Phase 1: Core MVP</h2>
                    <p className="text-sm text-primary-500">🚧 In Progress - December 2025</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-primary-500 mt-0.5" />
                    <span>User authentication & onboarding</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-primary-500 mt-0.5" />
                    <span>Goal creation & management</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-primary-500 mt-0.5" />
                    <span>Task management system</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-primary-500 mt-0.5" />
                    <span>Basic dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="relative rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Phase 2: AI Planning</h2>
                    <p className="text-sm text-muted-foreground">Q1 2026</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>AI-powered weekly plan generation</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Smart scheduling algorithm</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Task priority optimization</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Calendar sync (Google, Outlook)</span>
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="relative rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Phase 3: Analytics & Insights</h2>
                    <p className="text-sm text-muted-foreground">Q2 2026</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Productivity analytics dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Time tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Weekly reports</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Focus time optimization</span>
                  </li>
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="relative rounded-xl border border-border bg-card p-6 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Phase 4: Integrations & Mobile</h2>
                    <p className="text-sm text-muted-foreground">Q3 2026</p>
                  </div>
                </div>
                <ul className="ml-13 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Slack, Notion, Todoist integrations</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>iOS & Android mobile apps</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Team collaboration features</span>
                  </li>
                  <li className="flex gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>Public API launch</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
              <h2 className="mb-4 text-2xl font-bold">Want to Influence the Roadmap?</h2>
              <p className="mb-6 text-muted-foreground">
                Join the waitlist and get early access. Your feedback will shape what we build next.
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
