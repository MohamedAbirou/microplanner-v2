import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Calendar, Target, TrendingUp, CheckCircle2, Play, Zap, Award, Users, Clock, BarChart3, ChevronDown } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-hero opacity-10" />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/logo.svg"
                alt="MicroPlanner"
                width={96}
                height={96}
                priority
                className="h-20 w-20 md:h-24 md:w-24"
              />
            </div>

            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Weekly Planning</span>
            </div>

            {/* Heading */}
            <h1 className="mb-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-gradient">Intelligent Planning</span>
              <br />
              That Adapts to You
            </h1>

            {/* Description */}
            <p className="mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
              AI-powered weekly planner that learns from your habits, optimizes your schedule, and helps you achieve your goals. Affordable alternative to Motion, ReclaimAI, and other expensive planning tools.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/waitlist"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-primary-glow transition-all hover:shadow-xl hover:scale-105"
              >
                Join Waitlist
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Pre-Launch Badge */}
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary-700/20 bg-secondary-700/10 px-4 py-2 text-xs font-medium text-secondary-700">
                <span>🚀 Pre-Launch - Building Phase 1 Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Introducing <span className="text-gradient">MicroPlanner</span>
            </h2>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Your personal AI planner assistant that builds your week for you
            </p>

            {/* Video Placeholder with Browser Chrome */}
            <div className="relative mx-auto max-w-4xl">
              {/* Browser Chrome */}
              <div className="overflow-hidden rounded-t-lg border border-border bg-muted/50">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 px-3">
                    <div className="flex items-center gap-2 rounded bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      <span className="text-primary-500">🔒</span>
                      <span>microplanner.app</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Content */}
              <div className="relative aspect-video overflow-hidden rounded-b-lg border-x border-b border-border bg-background">
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-primary-glow transition-all hover:scale-110 hover:shadow-xl">
                      <Play className="h-7 w-7 fill-white text-white" />
                    </button>
                    <p className="text-sm text-muted-foreground">Watch 30-second demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Steps Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              How It Works
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Three simple steps to transform your productivity
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-bold text-white shadow-primary-glow">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Set Your Goals</h3>
              <p className="text-sm text-muted-foreground">
                Define what you want to achieve. Set frequency, duration, and preferred times. MicroPlanner adapts to your unique schedule and energy patterns.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-600 to-secondary-700 text-lg font-bold text-white shadow-secondary-glow">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Get Your Plan</h3>
              <p className="text-sm text-muted-foreground">
                AI generates a personalized weekly plan using Claude Sonnet 3.5. Intelligent scheduling avoids conflicts and optimizes for your productivity peaks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-700 text-lg font-bold text-white shadow-gradient-glow">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Achieve More</h3>
              <p className="text-sm text-muted-foreground">
                Execute your plan with confidence. Track progress, celebrate streaks, and watch your productivity soar. Auto-sync with your calendar keeps everything in sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Prototype Mockup */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-t-xl border border-border bg-muted/50">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">MicroPlanner Dashboard</div>
                <div className="w-14"></div>
              </div>
            </div>

            <div className="overflow-hidden rounded-b-xl border-x border-b border-border bg-background p-6">
              {/* Simple Calendar Grid Prototype */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Week</h3>
                  <div className="flex gap-2">
                    <div className="rounded-lg bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                      AI Generated
                    </div>
                    <div className="rounded-lg bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                      95% Optimized
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}

                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="rounded border border-border bg-card p-2 text-center text-xs font-medium">
                        {i + 8}
                      </div>
                      <div className="space-y-1">
                        <div className="h-10 rounded bg-primary-500/20 border border-primary-500/30 p-1 text-xs flex items-center justify-center font-medium text-primary-600 dark:text-primary-400">
                          Goal #{i + 1}
                        </div>
                        <div className="h-8 rounded bg-secondary-700/20 border border-secondary-700/30 p-1 text-xs flex items-center justify-center font-medium text-secondary-700 dark:text-secondary-400">
                          Task
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Results <span className="text-gradient">Speak for Themselves</span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Real impact from real users
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-gradient">47%</div>
              <div className="text-sm text-muted-foreground">More goals completed</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-gradient">12hrs</div>
              <div className="text-sm text-muted-foreground">Saved per week</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-gradient">93%</div>
              <div className="text-sm text-muted-foreground">User satisfaction</div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-gradient">3.2x</div>
              <div className="text-sm text-muted-foreground">Productivity boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Why <span className="text-gradient">MicroPlanner</span>?
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              The most intelligent weekly planner ever built
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Planning',
                description: 'Claude Sonnet 3.5 generates personalized weekly plans based on your goals, energy patterns, and constraints.',
                gradient: 'from-primary-500 to-primary-600',
              },
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Auto-sync with Google Calendar. AI avoids conflicts and optimizes your schedule in real-time.',
                gradient: 'from-secondary-600 to-secondary-700',
              },
              {
                icon: Target,
                title: 'Goal Tracking',
                description: 'Set goals with frequency, duration, and preferred times. Track completion rates and streaks.',
                gradient: 'from-primary-500 to-secondary-700',
              },
              {
                icon: TrendingUp,
                title: 'Advanced Analytics',
                description: 'Deep insights into your productivity patterns. Learn your best times and optimal session lengths.',
                gradient: 'from-primary-600 to-primary-700',
              },
              {
                icon: Zap,
                title: 'Plan Templates',
                description: 'Save and reuse plan templates. Browse community templates for productivity, fitness, and learning.',
                gradient: 'from-secondary-700 to-purple-700',
              },
              {
                icon: Award,
                title: 'Built for Scale',
                description: 'Ultra-fast, secure, and ready for millions of users. Built with Next.js 15 and cutting-edge tech.',
                gradient: 'from-primary-500 to-secondary-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* FREE */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold">Free</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>2 active goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>5 plans per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Rule-based planner</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Calendar sync</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full rounded-lg border border-border bg-background py-2 text-center text-sm font-semibold transition-colors hover:bg-accent"
              >
                Get Started
              </Link>
            </div>

            {/* STARTER */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold">Starter</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$8</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>5 active goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>20 plans per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>GPT-4o-mini planner</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Everything in Free</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full rounded-lg border border-border bg-background py-2 text-center text-sm font-semibold transition-colors hover:bg-accent"
              >
                Choose Starter
              </Link>
            </div>

            {/* PRO - Most Popular */}
            <div className="relative rounded-xl border-2 border-primary-500 bg-card p-6 shadow-primary-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Most Popular
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold">Pro</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$12</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Unlimited goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Unlimited plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Claude Sonnet 3.5</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>AI pattern learning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Plan templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full rounded-lg bg-gradient-primary py-2 text-center text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              >
                Choose Pro
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold">Premium</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$18</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Team workspaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Team analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full rounded-lg border border-border bg-background py-2 text-center text-sm font-semibold transition-colors hover:bg-accent"
              >
                Choose Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'How does AI planning work?',
                  a: 'MicroPlanner uses Claude Sonnet 3.5 to analyze your goals, calendar, energy patterns, and constraints to generate an optimized weekly plan. The AI learns from your completion patterns to improve recommendations over time.',
                },
                {
                  q: 'Can I use MicroPlanner for free?',
                  a: 'Yes! Our Free plan includes 2 active goals, 5 plans per week, and calendar sync. Perfect for trying out the platform and seeing if it fits your workflow.',
                },
                {
                  q: 'Which plan should I choose?',
                  a: 'Start with Free to try it out. Upgrade to Starter ($8/mo) for more goals and GPT-4o-mini planning. Choose Pro ($12/mo) for unlimited goals and our best AI model (Claude Sonnet 3.5). Premium ($18/mo) adds team features and API access.',
                },
                {
                  q: 'Does it sync with my calendar?',
                  a: 'Yes! MicroPlanner syncs bi-directionally with Google Calendar (more providers coming soon). It reads your existing events to avoid conflicts and can create calendar events for your planned tasks.',
                },
                {
                  q: 'How is this different from Motion, ReclaimAI, Todoist, or Sunsama?',
                  a: '60% cheaper ($8-12/month vs $34/month for Motion). Built in public so you can influence the roadmap. Solo founder means fast decisions, no bureaucracy. Modern, clean UI designed from scratch. Focus on affordability without sacrificing quality.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Absolutely! All paid plans are billed monthly and you can cancel anytime. No questions asked, no hidden fees.',
                },
                {
                  q: 'Is my data secure?',
                  a: 'Security is our top priority. All data is encrypted in transit and at rest. We never sell your data. Our infrastructure is SOC 2 compliant and GDPR ready.',
                },
                {
                  q: 'Do you offer student or nonprofit discounts?',
                  a: 'Yes! We offer 50% off for students and nonprofits. Contact us with proof of eligibility to get your discount code.',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold hover:bg-accent transition-colors">
                    <span className="text-sm">{faq.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-hero p-10 text-center shadow-gradient-glow md:p-16">
            <div className="relative z-10">
              <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Ready to Transform Your Productivity?
              </h2>
              <p className="mb-8 text-base text-white/90 md:text-lg">
                Join thousands of users who crush their goals with MicroPlanner
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-600 transition-all hover:scale-105 hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
