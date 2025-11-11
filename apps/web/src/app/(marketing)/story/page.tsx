import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Globe, Heart, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function StoryPage() {
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
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-500">
                BUILDING IN PUBLIC
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Why I'm Building <span className="text-gradient">MicroPlanner</span>
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                The story of a 23-year-old engineer taking on Motion and ReclaimAI
              </p>
            </div>

            {/* Story Content */}
            <div className="space-y-8 text-muted-foreground">
              {/* Introduction */}
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Hey, I'm Moe 👋</h2>
                <p className="mb-4">
                  I'm a 23-year-old software engineer. I've been in the IT field for 7 years, and
                  seriously building products for the last 4-5 years. I've built ERPs, AI-powered
                  SaaS platforms, automation tools — you name it.
                </p>
                <p>
                  But there's always been one frustration:
                  <strong className="text-foreground">planning</strong>. I've tried every
                  productivity tool out there — Motion, ReclaimAI, Todoist, Notion — and they all
                  had the same problems.
                </p>
              </div>

              {/* Market Overview */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Market Right Now</h2>
                <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
                  <p>
                    Tools like <strong className="text-foreground">Motion</strong>,{" "}
                    <strong className="text-foreground">ReclaimAI</strong>,{" "}
                    <strong className="text-foreground">Sunsama</strong>, and{" "}
                    <strong className="text-foreground">Akiflow</strong> have fundamentally changed
                    how we plan our days. They fall into two main categories:
                  </p>

                  <ul>
                    <li>
                      All-in-One AI Schedulers (Motion): A full replacement for your task manager,
                      project tracker, and calendar, relying entirely on AI to auto-schedule
                      everything.
                    </li>

                    <li>
                      Calendar Augmentation Tools (ReclaimAI, Sunsama, Akiflow): These connect to
                      your existing Google/Outlook Calendar and Task/PM apps (like Asana, Jira) to
                      pull tasks in and use time-blocking to plan your day.
                    </li>
                  </ul>

                  <p>
                    They're sophisticated, offering smart scheduling, AI-assisted calendars, and
                    deep integrations with platforms like Slack and Google Calendar. But the core
                    critique remains: they are overwhelmingly built for enterprise teams, priced for
                    companies, and designed around optimizing a high-volume, meeting-heavy corporate
                    workflow. For the average indie maker, freelancer, or student, they remain
                    complicated, expensive, and oddly disconnected from a more flexible, personal
                    life.
                  </p>
                </div>
              </div>

              {/* The Problem */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Problem</h2>
                <div className="space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
                  {/* Pricing */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">
                        They're expensive, and the price is rising.
                      </strong>
                      The sticker shock is real: Motion's Individual Plan is $34/month (or $19/month
                      annual). Sunsama is *$20/month*. While Reclaim.ai offers a generous free tier,
                      its most popular business plan is $15/month (or $12/month annual), and Akiflow
                      is a steep **$34/month** (or $19/month annual). Planning your life, without
                      even accounting for their new 'AI Employee' add-ons, shouldn't cost the price
                      of your combined Netflix, Spotify, and gym membership.
                    </div>
                  </div>
                  {/* UX / Usability */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">They feel heavy.</strong> Too many
                      buttons, too many integrations, too little joy. Motion’s all-in-one approach
                      and new AI Employees platform add significant setup complexity. ReclaimAI is
                      the most seamless integrator, but its core function is aggressive time-defense
                      for professionals, not simple daily flow. Sunsama is calm but remains a manual
                      "daily planning ritual" tool. Akiflow tries to centralize everything, which
                      can lead to cognitive overload and a cluttered inbox-style interface.
                    </div>
                  </div>
                  {/* Mobile Experience */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">Mobile is often an afterthought.</strong>
                      This has slightly improved but remains a weak point. Reclaim.ai still does not
                      have a native mobile app; users are directed to a mobile web experience, which
                      is insufficient for quick task input or reliable offline use. Motion and
                      Sunsama have decent mobile apps, but Akiflow's mobile experience, while
                      available, still lags behind the speed and functionality of its core desktop
                      app, making true on-the-go planning feel sluggish.
                    </div>
                  </div>
                  {/* AI Intelligence */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">
                        Their AI is functional, but lacks true intelligence.
                      </strong>
                      Motion's AI is based on rules, urgency, and deadlines—it is auto-scheduling,
                      not adaptive learning. It doesn't inherently understand energy patterns,
                      account for cognitive load, or provide meaningful burnout detection. It
                      schedules the task where there is a time slot, not where you are most likely
                      to be effective, which is a key distinction for personal productivity.
                    </div>
                  </div>
                  {/* Personal Fit */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">
                        They're fundamentally not built for people like me.
                      </strong>
                      Most of these apps, including the new 'AI Employee' and 'Smart Meeting'
                      features, are tuned for large teams with daily stand-ups, shared team
                      calendars, and OKRs. They over-engineer the needs of a solo builder, creator,
                      or a Moroccan engineer trying to balance deep work, client calls, sleep, and
                      life without having to fight an enterprise-grade tool.
                    </div>
                  </div>
                  {/* Collaboration */}
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">
                        Collaboration is team-centric, not project-centric.
                      </strong>
                      Motion and ReclaimAI offer team features for shared workload visibility and
                      optimized meeting booking across users, but this often focuses on optimizing
                      the calendar rather than facilitating a project. There is little focus on
                      simple, real-time shared task lists or team context outside of the main PM
                      integrations, which is overkill for a small freelance or founder team.
                    </div>
                  </div>
                </div>
              </div>

              {/* The Decision */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Decision</h2>
                <p className="mb-4">
                  So I decided to build the tool I
                  always wanted to exist.
                </p>
                <p className="mb-4">
                  Not another “AI assistant” that schedules your life into chaos. Not a corporate
                  tool disguised as a personal one. But a planner that actually understands you —
                  your energy, your flow, your limits — and adapts to{' '}
                  <strong className="text-foreground">how you really work</strong>.
                </p>
                <p className="mb-4">
                  That’s how <strong className="text-foreground">MicroPlanner</strong> was born: a
                  calm, adaptive, and beautifully minimal AI-powered planner made for humans, not
                  teams.
                </p>
                <div className="space-y-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Accessible:</strong> Priced like a tool
                      for creators, not corporations — around $8–12/month.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Effortless:</strong> No more configuring
                      20 settings before you can get started. It learns as you use it.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Human-centric:</strong> Designed to
                      respect your energy, focus, and mental space — not fill every empty slot.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Built in public:</strong> Transparent
                      journey, community-driven feedback, open to everyone who believes in better
                      tools.
                    </div>
                  </div>
                </div>
              </div>

              {/* The Dream */}
              <div className="rounded-xl border border-secondary-700/20 bg-secondary-700/5 p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Dream</h2>
                <p className="mb-4">
                  I'm not building MicroPlanner to get rich (though that would be nice 😄). I'm
                  building it because I want to be free. Free to build
                  products I believe in without asking permission from a boss.
                </p>
                <p>
                  <strong className="text-foreground">
                    This is my first step toward that freedom.
                  </strong>{" "}
                  And I'm building it in public so you can follow the journey, learn from my
                  mistakes, and maybe get inspired to chase your own dreams.
                </p>
              </div>

              {/* Join the Journey */}
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Join the Journey</h2>
                <p className="mb-6">
                  I'll be sharing everything: the wins, the failures, the code, the revenue, the
                  struggles. If you want to follow along or be among the first to try MicroPlanner:
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/waitlist">
                    <Button size="lg">
                      Join Waitlist
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a
                    href="https://linkedin.com/in/mohamed-abirou"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg">
                      Follow on LinkedIn
                    </Button>
                  </a>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center text-sm italic text-muted-foreground">
                <p>— Moe Abirou</p>
                <p>Founder, MicroPlanner</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
