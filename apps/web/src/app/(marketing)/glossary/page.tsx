'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlossaryPage() {
  const terms = [
    {
      letter: 'A',
      words: [
        {
          term: 'AI Planning',
          definition: 'Using artificial intelligence to automatically generate optimized schedules and plans based on your goals and constraints.',
        },
        {
          term: 'Analytics',
          definition: 'Data-driven insights about your productivity patterns, completion rates, and time usage.',
        },
        {
          term: 'Active Goal',
          definition: 'A goal that is currently being worked on and tracked. Contrast with archived or completed goals.',
        },
      ],
    },
    {
      letter: 'B',
      words: [
        {
          term: 'Blocking',
          definition: 'Reserving calendar time for specific activities to protect focus time and prevent scheduling conflicts.',
        },
        {
          term: 'Burnout Prevention',
          definition: 'Strategies to avoid overcommitting and maintain sustainable productivity levels.',
        },
      ],
    },
    {
      letter: 'C',
      words: [
        {
          term: 'Calendar Sync',
          definition: 'Bi-directional synchronization between MicroPlanner and external calendars (Google Calendar, Outlook, etc.).',
        },
        {
          term: 'Cognitive Load',
          definition: 'The amount of mental effort required to manage tasks and information. MicroPlanner reduces this.',
        },
        {
          term: 'Completion Rate',
          definition: 'The percentage of planned goals/tasks that you actually complete. A key productivity metric.',
        },
      ],
    },
    {
      letter: 'D',
      words: [
        {
          term: 'Deep Work',
          definition: 'Focused, uninterrupted work on cognitively demanding tasks. Requires blocking and focus time protection.',
        },
        {
          term: 'Dependencies',
          definition: 'Tasks or goals that must be completed before others can start.',
        },
      ],
    },
    {
      letter: 'E',
      words: [
        {
          term: 'Energy Patterns',
          definition: 'Your personal rhythm of when you have peak energy and focus throughout the day.',
        },
        {
          term: 'Execution',
          definition: 'The act of completing planned tasks and goals as scheduled.',
        },
      ],
    },
    {
      letter: 'F',
      words: [
        {
          term: 'Focus Time',
          definition: 'Dedicated blocks of uninterrupted time for deep work, protected from meetings and distractions.',
        },
        {
          term: 'Frequency',
          definition: 'How often a goal or task should be done (daily, weekly, monthly, etc.).',
        },
      ],
    },
    {
      letter: 'G',
      words: [
        {
          term: 'Goal',
          definition: 'A desired outcome or achievement you want to reach. Goals are the foundation of planning in MicroPlanner.',
        },
        {
          term: 'Goal Stack',
          definition: 'Multiple goals that support each other and can be achieved together in a single time block.',
        },
      ],
    },
    {
      letter: 'H',
      words: [
        {
          term: 'Habit',
          definition: 'A regular behavior or action performed repeatedly until it becomes automatic.',
        },
        {
          term: 'Habit Loop',
          definition: 'The cycle of cue, routine, and reward that forms a habit.',
        },
      ],
    },
    {
      letter: 'I',
      words: [
        {
          term: 'Integration',
          definition: 'Connection between MicroPlanner and other tools (Slack, Notion, Google Calendar, etc.).',
        },
        {
          term: 'Insights',
          definition: 'AI-generated observations about your productivity patterns and recommendations for improvement.',
        },
      ],
    },
    {
      letter: 'M',
      words: [
        {
          term: 'Mindfulness',
          definition: 'Being present and aware of your current activities rather than distracted or on autopilot.',
        },
        {
          term: 'Milestones',
          definition: 'Key checkpoints or achievements within a larger goal.',
        },
      ],
    },
    {
      letter: 'O',
      words: [
        {
          term: 'Optimization',
          definition: 'Making adjustments to your schedule and plans to maximize productivity and goal completion.',
        },
        {
          term: 'Outcomes',
          definition: 'The results of your planned activities. Tracking outcomes helps you learn and improve.',
        },
      ],
    },
    {
      letter: 'P',
      words: [
        {
          term: 'Planning',
          definition: 'The process of deciding what goals to pursue and when to work on them.',
        },
        {
          term: 'Priority',
          definition: 'The relative importance of a goal or task compared to others.',
        },
        {
          term: 'Productivity',
          definition: 'The effectiveness of effort measured by the amount of useful work completed in a given time.',
        },
      ],
    },
    {
      letter: 'R',
      words: [
        {
          term: 'Recurring Goal',
          definition: 'A goal that repeats on a schedule (daily, weekly, monthly, etc.).',
        },
        {
          term: 'Review',
          definition: 'Regularly examining completed work and progress to identify patterns and improvements.',
        },
      ],
    },
    {
      letter: 'S',
      words: [
        {
          term: 'Scheduling',
          definition: 'Assigning specific times for goals and tasks to be completed.',
        },
        {
          term: 'Session',
          definition: 'A dedicated block of time for working on a specific goal or task.',
        },
        {
          term: 'Streak',
          definition: 'A continuous series of days where a goal or habit was completed successfully.',
        },
      ],
    },
    {
      letter: 'T',
      words: [
        {
          term: 'Task',
          definition: 'A specific action or work item that contributes to completing a goal.',
        },
        {
          term: 'Time Blocking',
          definition: 'Scheduling specific time blocks in your calendar for focused work on goals.',
        },
        {
          term: 'Time Tracking',
          definition: 'Recording how much time you actually spend on tasks and goals.',
        },
      ],
    },
    {
      letter: 'W',
      words: [
        {
          term: 'Weekly Plan',
          definition: 'An optimized schedule for a seven-day period generated by AI based on your goals and constraints.',
        },
        {
          term: 'Work-Life Balance',
          definition: 'Achieving equilibrium between time spent on work/goals and personal/leisure time.',
        },
      ],
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
              PRODUCTIVITY TERMS
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Productivity <span className="text-gradient">Glossary</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Understand key productivity concepts and terminology used throughout MicroPlanner.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mx-auto mb-12 max-w-4xl">
            <div className="flex flex-wrap gap-2 justify-center">
              {terms.map((section, i) => (
                <Link key={i} href={`#letter-${section.letter}`}>
                  <button className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-all hover:border-primary-500/50 hover:bg-primary-500/10">
                    {section.letter}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Glossary Terms */}
          <div className="mx-auto max-w-3xl">
            <div className="space-y-12">
              {terms.map((section, idx) => (
                <div key={idx} id={`letter-${section.letter}`}>
                  <h2 className="mb-6 text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {section.letter}
                  </h2>

                  <div className="space-y-4">
                    {section.words.map((word, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary-500/30 hover:shadow-md"
                      >
                        <h3 className="mb-2 font-semibold text-lg">
                          {word.term}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {word.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mx-auto mt-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Want to <span className="text-gradient">Learn More?</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                </div>
                <h4 className="mb-2 font-semibold">Help Center</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Detailed guides and how-to articles for every feature.
                </p>
                <Link href="/help" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  Explore Help Center
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-700/10">
                  <BookOpen className="h-5 w-5 text-secondary-700" />
                </div>
                <h4 className="mb-2 font-semibold">How It Works</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  Step-by-step explanation of MicroPlanner's planning process.
                </p>
                <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                  Learn the Process
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Master Your Productivity?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start using MicroPlanner to achieve your goals with AI-powered planning.
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
