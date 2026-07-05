'use client';

import { Button } from '@/components/ui/button';
import { Book, HelpCircle, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const resources = [
    {
      title: 'Roadmap',
      description: 'See what\'s being built and when features will launch',
      link: '/roadmap',
    },
    {
      title: 'About',
      description: 'Learn about MicroPlanner and the solo founder building it',
      link: '/about',
    },
    {
      title: 'Story',
      description: 'Read why MicroPlanner is being built',
      link: '/story',
    },
    {
      title: 'Blog',
      description: 'Build-in-public updates (starting after launch)',
      link: '/blog',
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
              PRE-LAUNCH
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Help & <span className="text-gradient">Support</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              MicroPlanner is currently in pre-launch. Full help docs, tutorials, and support will be available once Phase 1 launches.
            </p>
          </div>

          {/* Pre-Launch Status */}
          <div className="mx-auto mb-12 max-w-3xl">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
                  <Rocket className="h-5 w-5 text-primary-500" />
                </div>
                <h2 className="text-xl font-bold">We're Still Building!</h2>
              </div>
              <p className="mb-4 text-muted-foreground">
                <strong className="text-foreground">Current status:</strong> Phase 0 complete (marketing site).
                Building Phase 1 (core MVP) right now.
              </p>
              <p className="mb-4 text-muted-foreground">
                <strong className="text-foreground">What this means:</strong> Help articles, tutorials, and documentation
                will be written as features are built. No point documenting features that don't exist yet.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">When you'll get help:</strong> Once Phase 1 launches (December 2025),
                you'll get full documentation, video tutorials, and email support.
              </p>
            </div>
          </div>

          {/* Available Resources */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              What's Available <span className="text-gradient">Right Now</span>
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
                      <Book className="h-5 w-5 text-muted-foreground group-hover:text-primary-600 transition-colors mt-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Real FAQs for Pre-Launch */}
          <div className="mx-auto mb-20 max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Pre-Launch <span className="text-gradient">Questions</span>
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'When will MicroPlanner launch?',
                  a: 'Phase 1 (core MVP) is planned for December 2025. You can follow progress on the roadmap and create a free account for updates.',
                },
                {
                  q: 'Can I use MicroPlanner now?',
                  a: 'Yes! Sign up for a free account to get started. Core features are available now, with more shipping during Phase 1.',
                },
                {
                  q: 'How much will it cost?',
                  a: 'Planned pricing is $8-12/month (60% cheaper than Motion\'s $34/month). There will also be a free tier to try it out. Check the pricing page for details.',
                },
                {
                  q: 'Who is building MicroPlanner?',
                  a: 'Just me, Moe Abirou - a 23-year-old developer . No team, no VC funding, just building in public. Read the full story on the About page.',
                },
                {
                  q: 'How can I follow the progress?',
                  a: 'Create a free account for email updates, follow on LinkedIn (mohamed-abirou), or check the blog after launch for weekly build logs.',
                },
                {
                  q: 'Will there be tutorials and docs?',
                  a: 'Yes! Full documentation, video tutorials, and help articles will be created as features are built during Phase 1 and beyond.',
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
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10">
                <HelpCircle className="h-8 w-8 text-primary-500" />
              </div>
            </div>
            <h2 className="mb-4 text-2xl font-bold">
              Have Questions?
            </h2>
            <p className="mb-6 text-muted-foreground">
              For pre-launch questions or feedback, reach out directly. Email support will be available after Phase 1 launches.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
