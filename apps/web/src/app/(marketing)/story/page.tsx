import Link from 'next/link';
import { ArrowRight, Code, Rocket, Heart, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                The story of a 23-year-old engineer from Morocco taking on Motion and ReclaimAI
              </p>
            </div>

            {/* Story Content */}
            <div className="space-y-8 text-muted-foreground">
              {/* Introduction */}
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Hey, I'm Mohamed 👋</h2>
                <p className="mb-4">
                  I'm a 23-year-old software engineer from Morocco. For the past 7 years, I've been building things — from full ERPs
                  that improved team efficiency by 70%, to AI-powered SaaS platforms, to internal tools that automated 90% of
                  repetitive tasks.
                </p>
                <p>
                  But there's always been one frustration: <strong className="text-foreground">planning</strong>. I've tried every
                  productivity tool out there — Motion, ReclaimAI, Todoist, Notion — and they all had the same problems.
                </p>
              </div>

              {/* The Problem */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Problem</h2>
                <div className="space-y-4 rounded-xl border border-border bg-card p-6 md:p-8">
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">Motion is $34/month.</strong> That's $408/year for a planning tool. For
                      indie developers and students? That's a dealbreaker.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">ReclaimAI's UI is clunky.</strong> Great AI, but the interface feels like
                      it was designed in 2015. It doesn't spark joy.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-error-500 font-bold">→</span>
                    <div>
                      <strong className="text-foreground">None of them feel made for me.</strong> They're built for enterprise teams
                      or Silicon Valley types. Not for a Moroccan engineer trying to build his dream.
                    </div>
                  </div>
                </div>
              </div>

              {/* The Decision */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Decision</h2>
                <p className="mb-4">
                  So I decided to build my own. Not just for me — but for everyone who's been priced out of productivity, who wants
                  beautiful software that actually works, who believes planning shouldn't cost $400/year.
                </p>
                <p className="mb-4">
                  <strong className="text-foreground">MicroPlanner</strong> is my answer. An AI-powered planner that's:
                </p>
                <div className="space-y-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Affordable:</strong> $8-12/month, not $34.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Beautiful:</strong> Modern UI that actually feels good to use.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Powerful:</strong> AI planning that learns from you and gets smarter.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Built in public:</strong> You get to watch and influence every step.
                    </div>
                  </div>
                </div>
              </div>

              {/* My Background */}
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">My Background</h2>
                <p className="mb-4">
                  Over the past 2 years of professional work (7 years in tech total), I've:
                </p>
                <ul className="space-y-2 rounded-xl border border-border bg-card p-6">
                  <li className="flex gap-2">
                    <span className="text-secondary-700 font-bold">✓</span>
                    <span>Built 2 full ERPs from scratch (Purchasing Service + Resources Service) that improved efficiency by 60-70%</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary-700 font-bold">✓</span>
                    <span>Created an AI Art Portrait Generator (MERN stack) for a US client</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary-700 font-bold">✓</span>
                    <span>Recently shipped GreenLean: A full AI-powered health & fitness SaaS with meal plans, workouts, and gamification</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary-700 font-bold">✓</span>
                    <span>Automated internal workflows with bots that saved teams 90% of repetitive tasks</span>
                  </li>
                </ul>
              </div>

              {/* The Dream */}
              <div className="rounded-xl border border-secondary-700/20 bg-secondary-700/5 p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">The Dream</h2>
                <p className="mb-4">
                  I'm not building MicroPlanner to get rich (though that would be nice 😄). I'm building it because I want to be free.
                </p>
                <p className="mb-4">
                  Free to travel. Free to work from Switzerland (my dream country). Free to build products I believe in without asking
                  permission from a boss.
                </p>
                <p>
                  <strong className="text-foreground">This is my first step toward that freedom.</strong> And I'm building it in
                  public so you can follow the journey, learn from my mistakes, and maybe get inspired to chase your own dreams.
                </p>
              </div>

              {/* Join the Journey */}
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Join the Journey</h2>
                <p className="mb-6">
                  I'll be sharing everything: the wins, the failures, the code, the revenue, the struggles. If you want to follow
                  along or be among the first to try MicroPlanner:
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/waitlist">
                    <Button size="lg">
                      Join Waitlist
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="https://linkedin.com/in/mohamed-abirou" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg">
                      Follow on LinkedIn
                    </Button>
                  </a>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center text-sm italic text-muted-foreground">
                <p>— Mohamed Abirou</p>
                <p>Founder, MicroPlanner</p>
                <p>Building from Morocco 🇲🇦</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
