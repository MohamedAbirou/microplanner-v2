'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Brain, Calendar, TrendingUp, Lightbulb, Rocket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Define Your Goals',
      description: 'Start by setting the goals you want to achieve. Whether it\'s learning a new skill, completing a project, or building a habit, MicroPlanner has you covered.',
      details: [
        'Set frequency (daily, weekly, or custom)',
        'Define duration (30 min sessions, 2-hour blocks, etc.)',
        'Choose preferred times of day',
        'Set priority levels',
      ],
      icon: Target,
    },
    {
      number: 2,
      title: 'AI Analyzes Your Context',
      description: 'Our AI engine analyzes your goals, calendar, energy patterns, constraints, and historical data to understand your unique situation.',
      details: [
        'Reviews your existing calendar',
        'Learns your productivity patterns',
        'Identifies your peak energy hours',
        'Detects potential conflicts',
      ],
      icon: Brain,
    },
    {
      number: 3,
      title: 'Get Your Perfect Week',
      description: 'Receive an optimized weekly plan that fits seamlessly into your schedule. Every goal is scheduled at the perfect time for maximum success.',
      details: [
        'AI generates multiple plan options',
        'Choose or customize your preferred plan',
        'Auto-syncs with your calendar',
        'Real-time conflict resolution',
      ],
      icon: Calendar,
    },
    {
      number: 4,
      title: 'Execute and Track',
      description: 'Follow your plan, track progress, and watch as you crush your goals. MicroPlanner learns from your performance to improve recommendations.',
      details: [
        'Check off completed tasks',
        'View real-time progress',
        'Build streaks and momentum',
        'Get AI-powered insights',
      ],
      icon: TrendingUp,
    },
    {
      number: 5,
      title: 'Learn and Optimize',
      description: 'Our AI analyzes what worked and what didn\'t. Each week, your plan gets smarter and better aligned with your actual productivity patterns.',
      details: [
        'Advanced productivity analytics',
        'Pattern recognition over time',
        'Personalized recommendations',
        'Automatic plan refinement',
      ],
      icon: Lightbulb,
    },
  ];

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
              STEP BY STEP
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              How <span className="text-gradient">MicroPlanner</span> Works
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              A simple 5-step process to transform your productivity and achieve your goals with AI-powered planning.
            </p>
          </div>

          {/* Steps */}
          <div className="mx-auto mb-20 max-w-4xl">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Number */}
                  <div className="mb-6 flex items-start gap-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-2xl font-bold text-white shadow-lg">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-bold">{step.title}</h3>
                      <p className="mb-4 text-base text-muted-foreground">{step.description}</p>

                      {/* Details */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {step.details.map((detail, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-500 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 h-12 w-0.5 bg-gradient-to-b from-primary-500/30 to-primary-500/0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts */}
          <div className="mx-auto mb-20 max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Key <span className="text-gradient">Concepts</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <Zap className="h-5 w-5 text-primary-500" />
                </div>
                <h4 className="mb-2 font-semibold">AI-Powered Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Our Claude Sonnet 3.5 AI understands complex scheduling constraints and optimizes for your success.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-700/10">
                  <Brain className="h-5 w-5 text-secondary-700" />
                </div>
                <h4 className="mb-2 font-semibold">Continuous Learning</h4>
                <p className="text-sm text-muted-foreground">
                  The system learns from your actual behavior to improve future recommendations automatically.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <Calendar className="h-5 w-5 text-primary-500" />
                </div>
                <h4 className="mb-2 font-semibold">Calendar Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Bi-directional sync with Google Calendar ensures your plan is always up-to-date and conflict-free.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-700/10">
                  <TrendingUp className="h-5 w-5 text-secondary-700" />
                </div>
                <h4 className="mb-2 font-semibold">Measurable Results</h4>
                <p className="text-sm text-muted-foreground">
                  Track completion rates, streaks, and progress with detailed analytics to see your improvement over time.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="mb-6 text-muted-foreground">
              See how MicroPlanner can transform your planning in action.
            </p>
            <Link href="/waitlist">
              <Button size="lg">
                Join Waitlist
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
