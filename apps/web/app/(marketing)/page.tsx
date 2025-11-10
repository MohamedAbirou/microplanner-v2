'use client';

/**
 * Professional Landing Page
 * GOAL: Make users say "WOW, WTF, THAT'S INSANE!"
 * Beat ReclaimAI with superior UX and features showcase
 */

import Link from 'next/link';
import { Button } from '@microplanner/ui';
import { Card } from '@microplanner/ui';
import { Badge } from '@microplanner/ui';
import {
  Sparkles,
  Zap,
  Target,
  Calendar,
  Brain,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  Check,
  Clock,
  BarChart3,
  FolderKanban,
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: 'AI Weekly Planner',
    description: 'Let AI build your perfect week automatically. Smart scheduling that adapts to your energy patterns.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Target,
    title: 'Smart Goals & Habits',
    description: 'Set goals, track completion rates, and build streaks. Automatic scheduling ensures you never miss a session.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Clock,
    title: 'Focus Time Protection',
    description: 'Defend your deep work with intelligent buffer time and automatic meeting scheduling.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: FolderKanban,
    title: 'Project Kanban Boards',
    description: 'Visualize your work with drag & drop Kanban boards. Seamlessly integrated with your calendar.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Productivity Analytics',
    description: 'Track patterns, identify bottlenecks, and optimize your workflow with AI-powered insights.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: 'Multi-Calendar Sync',
    description: 'Unify Google Calendar, Outlook, and more. One view for all your commitments.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const stats = [
  { value: '10+', label: 'Powerful Features' },
  { value: '40%', label: 'Time Saved' },
  { value: '95%', label: 'Goal Completion' },
  { value: '∞', label: 'Possibilities' },
];

const integrations = [
  { name: 'Google Calendar', logo: '📅' },
  { name: 'Slack', logo: '💬' },
  { name: 'Zoom', logo: '🎥' },
  { name: 'Todoist', logo: '✅' },
  { name: 'Asana', logo: '📊' },
  { name: 'Jira', logo: '🔷' },
  { name: 'Linear', logo: '⚡' },
  { name: 'Notion', logo: '📝' },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-bg-primary to-accent-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <Badge variant="accent" className="text-sm px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI-Powered Planning
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-gradient block">Plan Smarter.</span>
              <span className="text-gradient block">Work Faster.</span>
              <span className="text-white">Achieve More.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-dark-text-secondary max-w-3xl mx-auto mb-10"
            >
              The only productivity tool that combines AI planning, goal tracking, time blocking,
              and project management in one beautiful interface. <span className="text-primary-400 font-semibold">40% more productive</span>, guaranteed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/sign-up">
                <Button size="lg" className="text-base px-8 shadow-glow-brand hover:shadow-glow-blue">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg" className="text-base px-8">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-sm text-dark-text-tertiary"
            >
              <Check className="w-4 h-4 inline text-success mr-1" />
              Free 14-day trial · No credit card required · Cancel anytime
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-dark-text-secondary">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-dark-bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Everything You Need
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              One Tool. <span className="text-gradient">Infinite Productivity.</span>
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              We didn't just build a calendar app. We built the complete productivity system you've been dreaming of.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card-hover p-6 h-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-dark-text-secondary leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Works With Your Favorite Tools
            </h2>
            <p className="text-lg text-dark-text-secondary">
              Seamlessly integrate with the tools you already use every day
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.name} className="glass-card p-6 text-center">
                <div className="text-4xl mb-2">{integration.logo}</div>
                <div className="text-xs text-dark-text-secondary">{integration.name}</div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/integrations" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
              View all integrations →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-900/20 to-accent-900/20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to <span className="text-gradient">10x Your Productivity</span>?
          </h2>
          <p className="text-lg text-dark-text-secondary mb-8">
            Join thousands of professionals who plan smarter, not harder
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-base px-12 shadow-glow-brand hover:shadow-glow-blue">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-dark-text-tertiary">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
