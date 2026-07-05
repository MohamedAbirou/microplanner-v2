'use client';

import { Button } from '@/components/ui/button';
import {
  BarChart3,
  File,
  Lock,
  Sparkles,
  Target,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Claude Sonnet 3.5 generates personalized weekly plans based on your goals, energy patterns, and constraints.',
      link: '/features/ai-planning',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set goals with frequency, duration, and preferred times. Track completion rates and streaks.',
      link: '/features/goals',
    },
    {
      icon: File,
      title: 'Task Management',
      description: 'Master your to-do list with intelligent task management. Create, organize, and track tasks effortlessly while staying focused on what matters most.',
      link: '/features/tasks',
    },
    // {
    //   icon: Clock,
    //   title: 'Time Tracking',
    //   description: 'Automatically track time spent on tasks and goals. Understand where your time really goes.',
    //   link: '/features/time-tracking',
    // },
    // {
    //   icon: Award,
    //   title: 'Focus Time Protection',
    //   description: 'Block time for deep work and protect it from meetings and distractions.',
    //   link: '/features/focus-time',
    // },
    // {
    //   icon: Brain,
    //   title: 'Habit Formation',
    //   description: 'Build lasting habits with AI-optimized schedules and streak tracking.',
    //   link: '/features/habits',
    // },
    // {
    //   icon: Share2,
    //   title: 'Scheduling Links',
    //   description: 'Share your availability and let others book time on your calendar directly.',
    //   link: '/features/scheduling-links',
    // },
    // {
    //   icon: Zap,
    //   title: 'Plan Templates',
    //   description: 'Save and reuse plan templates. Browse community templates for any goal.',
    //   link: '#',
    // },
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
              POWERFUL CAPABILITIES
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Everything You Need to <span className="text-gradient">Plan Smarter</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              MicroPlanner is packed with intelligent features designed to transform how you manage your time and achieve your goals.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mainFeatures.map((feature, index) => (
                <Link key={index} href={feature.link}>
                  <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg hover:translate-y-[-4px] cursor-pointer">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-700/20 group-hover:from-primary-500/30 group-hover:to-primary-700/30 transition-all">
                      <feature.icon className="h-6 w-6 text-primary-500" />
                    </div>
                    <h3 className="mb-2 font-semibold group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Why Choose MicroPlanner Section */}
          <div className="mx-auto mb-20 max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Why Choose <span className="text-gradient">MicroPlanner</span>?
            </h2>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  State-of-the-Art AI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Powered by Claude Sonnet 3.5, the most advanced AI model available. Your planning engine gets smarter with every interaction.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary-700" />
                  Built for Everyone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Whether you're a student, entrepreneur, or team lead, MicroPlanner adapts to your unique workflows and goals.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-500" />
                  Built for Results
                </h3>
                <p className="text-sm text-muted-foreground">
                  Designed to help you complete more goals with AI-powered scheduling that adapts to your unique productivity patterns.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-secondary-700" />
                  Privacy First
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted, secure, and never sold. SOC 2 compliant infrastructure with GDPR compliance built in.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Experience MicroPlanner?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start with our free plan today. No credit card required.
            </p>
            <Link href="/sign-up">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
