'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager at TechCorp',
      image: '👩‍💼',
      rating: 5,
      quote:
        'MicroPlanner transformed how I manage my week. The AI planning is incredibly smart—it knows when I\'m most productive and schedules accordingly. I\'ve increased my goal completion rate by 60%.',
      metrics: '+60% goals completed',
    },
    {
      name: 'Marcus Johnson',
      role: 'Freelance Developer',
      image: '👨‍💻',
      rating: 5,
      quote:
        'As a freelancer, I was drowning in tasks from multiple clients. MicroPlanner\'s intelligent scheduling has given me structure and clarity. Now I actually have time for deep work.',
      metrics: '12+ hours saved weekly',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Entrepreneur & Founder',
      image: '👩‍🚀',
      rating: 5,
      quote:
        'The calendar sync feature alone is worth it. No more scheduling conflicts. Combined with the AI planning, I\'m getting more done in 4 days than I used to in a week.',
      metrics: '3.2x productivity boost',
    },
    {
      name: 'James Park',
      role: 'Graduate Student',
      image: '👨‍🎓',
      rating: 5,
      quote:
        'As someone juggling classes, research, and teaching, I needed help with my time. MicroPlanner understands my constraints and builds realistic plans. Game changer.',
      metrics: 'Back on track with goals',
    },
    {
      name: 'Lisa Thompson',
      role: 'Executive Coach',
      image: '👩‍💼',
      rating: 5,
      quote:
        'I recommend MicroPlanner to all my clients. The way it teaches you to understand your own productivity patterns is incredibly valuable. It\'s like having a personal AI coach.',
      metrics: '93% user satisfaction',
    },
    {
      name: 'David Kim',
      role: 'Data Analyst',
      image: '👨‍💻',
      rating: 5,
      quote:
        'Love the analytics feature. Seeing hard data about where my time goes has been eye-opening. The recommendations are personalized and actually helpful.',
      metrics: 'Analytics insights',
    },
  ];

  const trustMarkers = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Goals Completed', value: '500,000+' },
    { label: 'Hours Saved', value: '1M+' },
    { label: 'Avg Rating', value: '4.8/5' },
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
              LOVED BY USERS
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              What Our Users <span className="text-gradient">Say</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Real people, real results. See how MicroPlanner is transforming productivity across different roles and industries.
            </p>
          </div>

          {/* Trust Markers */}
          <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustMarkers.map((marker, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-6 text-center">
                <div className="mb-2 text-3xl font-bold text-primary-500">{marker.value}</div>
                <p className="text-sm text-muted-foreground">{marker.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonials Grid */}
          <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary-500/30"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="mb-6 text-sm text-muted-foreground italic">
                  "{testimonial.quote}"
                </p>

                {/* User Info */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{testimonial.image}</div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 inline-block rounded-lg bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                    {testimonial.metrics}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Case Study Section */}
          <div className="mx-auto mb-20 max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Featured Success <span className="text-gradient">Stories</span>
            </h2>

            <div className="space-y-6">
              {/* Case Study 1 */}
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Startup Founder: 10x Goal Achievement</h3>
                  <div className="rounded-full bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    10x improvement
                  </div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  A startup founder was struggling to balance product development, fundraising, and team management. After using MicroPlanner for 3 months:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Increased goal completion from 30% to 90%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Saved 15+ hours per week on planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Successfully closed Series A funding</span>
                  </li>
                </ul>
              </div>

              {/* Case Study 2 */}
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Student: A+ Consistency Achieved</h3>
                  <div className="rounded-full bg-secondary-700/10 px-4 py-2 text-sm font-semibold text-secondary-700 dark:text-secondary-400">
                    Perfect semester
                  </div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  A graduate student was struggling to juggle coursework, research, and internship. After implementing MicroPlanner:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary-700 font-bold">→</span>
                    <span>Maintained 4.0 GPA while taking on additional research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary-700 font-bold">→</span>
                    <span>Published first research paper</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary-700 font-bold">→</span>
                    <span>Actually has time for social life again</span>
                  </li>
                </ul>
              </div>

              {/* Case Study 3 */}
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Manager: Team Productivity +85%</h3>
                  <div className="rounded-full bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Team boost
                  </div>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  A team manager introduced MicroPlanner to their 8-person team. Results after 2 months:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Project delivery time reduced by 35%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Improved team satisfaction and work-life balance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 font-bold">→</span>
                    <span>Better collaboration and fewer missed deadlines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Join Thousands Achieving Their Goals
            </h2>
            <p className="mb-6 text-muted-foreground">
              Be the next success story. Start your free trial today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button variant="outline" size="lg">
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
