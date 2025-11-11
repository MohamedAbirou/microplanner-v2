import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import {
  Sparkles,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LaunchingSoonPage() {
  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="MicroPlanner"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-gradient">Micro</span>Planner
              </span>
            </Link>

            {/* User Button */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </header>

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/20 blur-3xl" />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 shadow-gradient-glow animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
              <Bell className="h-3 w-3" />
              Early Access • Beta Coming Soon
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              We're Building Something{' '}
              <span className="text-gradient">Amazing</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
              Thank you for joining MicroPlanner early! We're working hard to bring you the most powerful AI-powered planning experience. You're on the list for early access.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/waitlist">
                <Button size="lg">
                  <Bell className="h-4 w-4" />
                  Get Notified at Launch
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" size="lg">
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Coming Features */}
          <div className="mb-12">
            <h2 className="mb-8 text-center text-2xl font-bold">
              What's Coming Soon
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-700/20">
                  <Target className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mb-2 font-semibold">Goal Management</h3>
                <p className="text-sm text-muted-foreground">
                  Set ambitious goals and let AI break them down into actionable plans
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-secondary-700/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-700/20 to-secondary-900/20">
                  <Zap className="h-6 w-6 text-secondary-700" />
                </div>
                <h3 className="mb-2 font-semibold">AI Planning</h3>
                <p className="text-sm text-muted-foreground">
                  Get intelligent weekly plans optimized for your schedule and priorities
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-700/20">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mb-2 font-semibold">Calendar Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Seamlessly integrate with Google Calendar, Outlook, and more
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-secondary-700/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-700/20 to-secondary-900/20">
                  <Clock className="h-6 w-6 text-secondary-700" />
                </div>
                <h3 className="mb-2 font-semibold">Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically track time spent on tasks and improve your estimates
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-700/20">
                  <BarChart3 className="h-6 w-6 text-primary-500" />
                </div>
                <h3 className="mb-2 font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Deep insights into your productivity patterns and achievements
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-secondary-700/50 hover:shadow-lg">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-700/20 to-secondary-900/20">
                  <CheckCircle2 className="h-6 w-6 text-secondary-700" />
                </div>
                <h3 className="mb-2 font-semibold">Task Management</h3>
                <p className="text-sm text-muted-foreground">
                  Powerful task organization with smart scheduling and prioritization
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="mb-4 text-xl font-bold">Launch Timeline</h2>
            <p className="mb-6 text-muted-foreground">
              We're targeting <strong className="text-foreground">Q1 2025</strong> for our beta launch. As an early member, you'll be among the first to get access.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="font-medium text-foreground">
                Early Access Perk: 3 months Pro plan FREE
              </span>
            </div>
          </div>

          {/* Stay Updated */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Want updates on our progress?{' '}
              <Link
                href="/waitlist"
                className="font-medium text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline"
              >
                Join our waitlist
              </Link>{' '}
              to stay in the loop!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
