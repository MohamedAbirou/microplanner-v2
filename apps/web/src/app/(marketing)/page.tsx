import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Calendar, Target, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-hero opacity-10" />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/logo.svg"
                alt="MicroPlanner"
                width={120}
                height={120}
                priority
                className="h-24 w-24 md:h-32 md:w-32"
              />
            </div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Weekly Planning</span>
            </div>

            {/* Heading */}
            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-gradient">Intelligent Planning</span>
              <br />
              That Adapts to You
            </h1>

            {/* Description */}
            <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              AI-powered weekly planner that learns from your habits, optimizes your schedule, and helps you crush your goals. Better than ReclaimAI and Motion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-8 py-4 text-base font-semibold text-white shadow-primary-glow transition-all hover:shadow-xl hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 py-4 text-base font-semibold transition-all hover:bg-accent"
              >
                Join Waitlist
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary-400 to-secondary-600"
                    />
                  ))}
                </div>
                <span>Join early users</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★★★★★</span>
                <span>Loved by productivity enthusiasts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why <span className="text-gradient">MicroPlanner</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              The most intelligent weekly planner ever built
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary-500/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                <Sparkles className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI-Powered Planning</h3>
              <p className="text-muted-foreground">
                Claude Sonnet 3.5 generates personalized weekly plans based on your goals, energy patterns, and constraints.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-secondary-700/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-700/10">
                <Calendar className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Auto-sync with Google Calendar. AI avoids conflicts and optimizes your schedule in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary-500/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                <Target className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Goal Tracking</h3>
              <p className="text-muted-foreground">
                Set goals with frequency, duration, and preferred times. Track completion rates and streaks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-secondary-700/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-700/10">
                <TrendingUp className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Deep insights into your productivity patterns. Learn your best times, optimal session lengths, and more.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary-500/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10">
                <Calendar className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Plan Templates</h3>
              <p className="text-muted-foreground">
                Save and reuse plan templates. Browse community templates for productivity, fitness, learning, and more.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:border-secondary-700/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-700/10">
                <Target className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Built for Scale</h3>
              <p className="text-muted-foreground">
                Ultra-fast, secure, and ready for millions of users. Built with Next.js 15, Apollo, and cutting-edge tech.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-gradient-hero p-12 text-center shadow-gradient-glow">
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to Transform Your Productivity?
              </h2>
              <p className="mb-8 text-lg text-white/90">
                Join thousands of users who crush their goals with MicroPlanner
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary-600 transition-all hover:scale-105 hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
