'use client';

import Link from 'next/link';
import { HelpCircle, Book, MessageSquare, Video, Mail, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Learn the basics and set up your account',
      articles: [
        'Creating your first goal',
        'Setting up calendar sync',
        'Understanding the AI planner',
        'Customizing your preferences',
      ],
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      articles: [
        'Initial setup walkthrough',
        'Using the planning dashboard',
        'Tracking progress effectively',
        'Integrating with calendars',
      ],
    },
    {
      icon: HelpCircle,
      title: 'Common Questions',
      description: 'Answers to frequently asked questions',
      articles: [
        'How does AI planning work?',
        'Can I use multiple calendars?',
        'What data is private?',
        'How do I export my data?',
      ],
    },
    {
      icon: MessageSquare,
      title: 'Contact Support',
      description: 'Get help from our support team',
      articles: [
        'Email support (24-48 hours)',
        'Chat support (business hours)',
        'Priority support (Pro/Premium)',
        'Report a bug or issue',
      ],
    },
  ];

  const resources = [
    {
      title: 'API Documentation',
      description: 'For developers integrating with MicroPlanner',
      link: '/api',
    },
    {
      title: 'Glossary',
      description: 'Productivity terms and concepts explained',
      link: '/glossary',
    },
    {
      title: 'System Status',
      description: 'Check if services are running smoothly',
      link: '/status',
    },
    {
      title: 'Changelog',
      description: 'Latest features and improvements',
      link: '/changelog',
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
              HELP & SUPPORT
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              How Can We <span className="text-gradient">Help?</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Find answers, tutorials, and support to get the most out of MicroPlanner.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-xl">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="flex-1 rounded-l-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button className="rounded-l-none">Search</Button>
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg hover:translate-y-[-4px] cursor-pointer"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                  <category.icon className="h-5 w-5 text-primary-500" />
                </div>
                <h3 className="mb-1 font-semibold group-hover:text-primary-600 transition-colors">
                  {category.title}
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  {category.description}
                </p>

                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="inline-block w-1 h-1 bg-primary-500 rounded-full" />
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Popular <span className="text-gradient">Resources</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {resources.map((resource, index) => (
                <Link key={index} href={resource.link}>
                  <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary-500/30 hover:bg-accent">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="mb-1 font-semibold group-hover:text-primary-600 transition-colors">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 transition-colors mt-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mx-auto mb-20 max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'How do I reset my password?',
                  a: 'Click "Forgot password" on the login page. We\'ll send you a link to reset it. Check your spam folder if you don\'t see it.',
                },
                {
                  q: 'Can I export my data?',
                  a: 'Yes! Go to Settings > Data & Privacy > Export. You can export all your goals, plans, and analytics data in CSV format.',
                },
                {
                  q: 'How do I cancel my subscription?',
                  a: 'Go to Settings > Billing > Cancel Subscription. Your cancellation takes effect immediately. You can reactivate anytime.',
                },
                {
                  q: 'What if I lose my phone?',
                  a: 'Your data is safe. Log in from another device and your data will be there. Enable two-factor authentication for extra security.',
                },
                {
                  q: 'Can I use MicroPlanner offline?',
                  a: 'Currently, MicroPlanner requires internet to sync. We\'re working on offline support for premium users.',
                },
                {
                  q: 'Is MicroPlanner accessible to people with disabilities?',
                  a: 'Yes! We\'re committed to WCAG 2.1 AA compliance. Email accessibility@microplanner.app if you encounter issues.',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold hover:bg-accent transition-colors">
                    <span className="text-sm">{faq.q}</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Didn't find what you're looking for?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Our support team is here to help. We typically respond within 24-48 hours.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/contact">
                <Button size="lg">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" size="lg" disabled>
                <MessageSquare className="h-4 w-4" />
                Live Chat (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
