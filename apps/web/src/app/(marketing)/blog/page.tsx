'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock blog posts - replace with CMS or database later
const blogPosts = [
  {
    id: 1,
    title: 'Why I\'m Building MicroPlanner in Public',
    excerpt: 'The story behind MicroPlanner and why I chose to build it completely transparently.',
    author: 'Mohamed Abirou',
    date: 'November 11, 2024',
    slug: 'why-building-in-public',
    category: 'Founder Story',
  },
  {
    id: 2,
    title: 'Week 1: Foundation Complete',
    excerpt: 'Built the marketing site, waitlist, and brand identity. Here\'s what I learned.',
    author: 'Mohamed Abirou',
    date: 'November 10, 2024',
    slug: 'week-1-foundation',
    category: 'Build Log',
  },
];

export default function BlogPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      </div>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
                BUILDING IN PUBLIC
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Build Log & <span className="text-gradient">Insights</span>
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow the journey from 0 to launch. Weekly updates, lessons learned, and behind-the-scenes stories.
              </p>
            </div>

            {/* Blog Posts Grid */}
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg md:p-8"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-primary-500/10 px-2 py-1 font-medium text-primary-500">
                      {post.category}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary-500 transition-colors">
                    {post.title}
                  </h2>

                  <p className="mb-4 text-muted-foreground">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>

                    <span className="text-sm font-medium text-primary-500 group-hover:gap-2 flex items-center gap-1 transition-all">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Coming Soon Note */}
            <div className="mt-12 rounded-xl border border-border bg-card p-8 text-center">
              <h3 className="mb-4 text-xl font-bold">More Posts Coming Soon</h3>
              <p className="mb-6 text-muted-foreground">
                I'll be publishing weekly build logs, technical deep-dives, and lessons learned. Want to get notified?
              </p>
              <Link href="/waitlist">
                <Button>
                  Join Waitlist for Updates
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
