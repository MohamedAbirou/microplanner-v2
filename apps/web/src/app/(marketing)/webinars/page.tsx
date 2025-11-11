'use client';

import Link from 'next/link';
import { Calendar, Users, ArrowRight, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WebinarsPage() {
  const upcomingWebinars = [
    {
      title: 'Getting Started with MicroPlanner',
      date: 'Nov 20, 2025',
      time: '2:00 PM EST',
      duration: '30 minutes',
      description: 'Learn how to set up MicroPlanner and get your first AI-powered plan. Perfect for new users.',
      speakers: ['Alex Johnson - Founder'],
      status: 'upcoming',
    },
    {
      title: 'Advanced Planning Strategies',
      date: 'Nov 27, 2025',
      time: '3:00 PM EST',
      duration: '45 minutes',
      description: 'Deep dive into planning strategies that leverage AI. Learn how to structure goals for maximum success.',
      speakers: ['Sarah Chen - Productivity Expert'],
      status: 'upcoming',
    },
    {
      title: 'AI Planning for Teams',
      date: 'Dec 4, 2025',
      time: '2:00 PM EST',
      duration: '60 minutes',
      description: 'How to use MicroPlanner for team coordination and goal alignment. Demo of team workspaces.',
      speakers: ['Marcus Johnson - Team Dynamics Coach', 'Alex Johnson - Founder'],
      status: 'upcoming',
    },
  ];

  const pastWebinars = [
    {
      title: 'Product Launch: Introducing MicroPlanner',
      date: 'Nov 1, 2025',
      duration: '30 minutes',
      description: 'We announced MicroPlanner to the world! Watch the full announcement and demo.',
      speakers: ['Alex Johnson - Founder'],
      recordingUrl: '#',
    },
    {
      title: 'Your Productivity Questions Answered',
      date: 'Oct 25, 2025',
      duration: '45 minutes',
      description: 'Live Q&A session where we answered your productivity and planning questions.',
      speakers: ['Alex Johnson - Founder', 'Sarah Chen - Productivity Expert'],
      recordingUrl: '#',
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
              WEBINARS & DEMOS
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Learn from <span className="text-gradient">Experts</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Join us for live webinars, demos, and training sessions to master MicroPlanner and improve your productivity.
            </p>

            <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-4 inline-block">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Subscribe to get notified</span> about upcoming webinars
              </p>
            </div>
          </div>

          {/* Upcoming Webinars */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold">
              Upcoming <span className="text-gradient">Webinars</span>
            </h2>

            <div className="space-y-6">
              {upcomingWebinars.map((webinar, index) => (
                <div
                  key={index}
                  className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary-500/30 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold group-hover:text-primary-600 transition-colors">
                        {webinar.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {webinar.description}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary-500" />
                          <span>{webinar.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary-500" />
                          <span>{webinar.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary-500" />
                          <span>{webinar.duration}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-semibold mb-2">Speakers:</p>
                        <div className="flex flex-wrap gap-2">
                          {webinar.speakers.map((speaker, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-full bg-primary-500/10 px-3 py-1 text-xs text-primary-600 dark:text-primary-400"
                            >
                              {speaker}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button className="shrink-0">
                      Register Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-Demand Recordings */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold">
              Watch On <span className="text-gradient">Demand</span>
            </h2>

            <div className="space-y-6">
              {pastWebinars.map((webinar, index) => (
                <div
                  key={index}
                  className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary-500/30 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold group-hover:text-primary-600 transition-colors flex items-center gap-2">
                        <span className="inline-block rounded-full bg-secondary-700/10 px-3 py-1 text-xs font-semibold text-secondary-700 dark:text-secondary-400">
                          RECORDED
                        </span>
                        {webinar.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {webinar.description}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-secondary-700" />
                          <span>{webinar.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-secondary-700" />
                          <span>{webinar.duration}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-semibold mb-2">Speakers:</p>
                        <div className="flex flex-wrap gap-2">
                          {webinar.speakers.map((speaker, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-full bg-secondary-700/10 px-3 py-1 text-xs text-secondary-700 dark:text-secondary-400"
                            >
                              {speaker}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link href={webinar.recordingUrl}>
                      <Button className="shrink-0">
                        <Play className="h-4 w-4" />
                        Watch Recording
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Resources */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Other Learning <span className="text-gradient">Resources</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="mb-2 font-semibold">Help Center</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Self-paced guides and tutorials for every feature.
                </p>
                <Link href="/help" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  Explore Help Center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="mb-2 font-semibold">Documentation</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  API docs and technical guides for developers.
                </p>
                <Link href="/api" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  View Documentation
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="mb-2 font-semibold">Community Forum</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Connect with other users and share tips.
                </p>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 opacity-50 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h4 className="mb-2 font-semibold">Templates Library</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Ready-to-use planning templates for any goal.
                </p>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 opacity-50 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Get Started with MicroPlanner
            </h2>
            <p className="mb-6 text-muted-foreground">
              Don't wait for a webinar. Start your free trial today and learn by doing.
            </p>
            <Link href="/sign-up">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
