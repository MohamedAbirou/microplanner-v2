import { WaitlistForm } from '@/components/marketing/waitlist-form';
import { Check, ChevronDown, Linkedin, PlayCircle, Sparkles, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-dark-bg-primary text-dark-text-primary antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg-primary/80 backdrop-blur-xl border-b border-dark-border-primary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-md flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MicroPlanner</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors duration-150"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors duration-150"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors duration-150"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors duration-150"
              >
                Testimonials
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="hidden sm:block px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-lg hover:shadow-glow-brand transition-all duration-250 hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">🚀 Now in Beta - Join 1,247 early users</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
              Stop planning.
              <br />
              <span className="text-gradient">Start doing.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up">
              The AI that turns your goals into a perfect weekly schedule in 30 seconds.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>50% off for early users</span>
              </div>
            </div>

            {/* CTA Form */}
            <div className="max-w-md mx-auto animate-scale-in">
              <div className="bg-card rounded-lg shadow-2xl p-6 border border-border">
                <h3 className="font-semibold text-lg mb-4">Join the waitlist</h3>
                <WaitlistForm />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Join 1,247 people on the waitlist. We&apos;re launching in 2 weeks.
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm opacity-80 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                <span>4.9/5 from beta users</span>
              </div>
              <div className="hidden md:block h-6 w-px bg-border" />
              <div className="hidden md:flex items-center gap-2">
                <span>🏆 Featured on Product Hunt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sound familiar?</h2>
            <p className="text-xl text-muted-foreground">
              You&apos;re not alone. Here&apos;s what everyone struggles with.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem 1 */}
            <div className="bg-red-500/5 border-2 border-red-500/20 rounded-md p-8">
              <div className="text-4xl mb-4">😫</div>
              <h3 className="text-xl font-bold mb-3">Goals never make it to your calendar</h3>
              <p className="text-muted-foreground">
                You have ambitious goals but they stay in your head or a random note. They never
                become concrete time blocks, so they never get done.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-red-500/5 border-2 border-red-500/20 rounded-md p-8">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3">Planning takes forever</h3>
              <p className="text-muted-foreground">
                You spend 2+ hours every Sunday playing calendar Tetris, trying to fit everything
                in. By the time you&apos;re done, you&apos;re exhausted.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-red-500/5 border-2 border-red-500/20 rounded-md p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Always reactive, never proactive</h3>
              <p className="text-muted-foreground">
                Your week is driven by what&apos;s urgent, not what&apos;s important. Important
                things get pushed week after week.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-red-500/5 border-2 border-red-500/20 rounded-md p-8">
              <div className="text-4xl mb-4">😵</div>
              <h3 className="text-xl font-bold mb-3">Context switching destroys focus</h3>
              <p className="text-muted-foreground">
                Your calendar is a mess of random tasks scattered throughout the day. You never get
                into deep work mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Introducing MicroPlanner</h2>
            <p className="text-xl text-muted-foreground">
              Your personal AI planning assistant that builds your week for you
            </p>
          </div>

          {/* Demo Video */}
          <div className="bg-card rounded-2xl shadow-2xl overflow-hidden mb-12 border border-border">
            <div className="relative aspect-video bg-gradient-hero flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-brand">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
                <p className="text-lg font-semibold">Watch 30-second demo</p>
                <p className="text-sm opacity-80 mt-1">See MicroPlanner in action</p>
              </div>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-card rounded-md p-8 shadow-lg border border-border hover:border-primary/50 transition-all text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">🎯 Set Your Goals</h3>
              <p className="text-muted-foreground">
                Tell MicroPlanner what you want to achieve: &quot;Gym 3x/week&quot;, &quot;Side
                project 10h&quot;, &quot;Learn Spanish 30min/day&quot;
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-card rounded-md p-8 shadow-lg border border-border hover:border-primary/50 transition-all text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">📅 Get Your Plan</h3>
              <p className="text-muted-foreground">
                AI analyzes your calendar, energy patterns, and preferences to build the perfect
                weekly schedule in 30 seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-card rounded-md p-8 shadow-lg border border-border hover:border-primary/50 transition-all text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">✅ Achieve More</h3>
              <p className="text-muted-foreground">
                One-click sync to Google Calendar. Follow your plan and achieve 40% more than you
                would manually planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Smart scheduling that learns</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              MicroPlanner doesn&apos;t just fill your calendar. It understands you and builds
              schedules that actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-3">AI That Learns You</h3>
              <p className="text-muted-foreground">
                Tracks what works and what doesn&apos;t. Gets smarter with every week.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-3">Energy-Based Scheduling</h3>
              <p className="text-muted-foreground">
                Morning person? Night owl? Schedules hard tasks when you&apos;re most productive.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                🔄
              </div>
              <h3 className="text-xl font-bold mb-3">Calendar Integration</h3>
              <p className="text-muted-foreground">
                Syncs perfectly with Google Calendar. No more manual copying.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                🎨
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Planning</h3>
              <p className="text-muted-foreground">
                Beautiful week view that makes it easy to see and adjust your schedule.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3">Weekly Insights</h3>
              <p className="text-muted-foreground">
                Track progress, completion rates, and get personalized recommendations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card/70 backdrop-blur border border-border rounded-md p-6 hover:border-primary/50 transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-muted-foreground">
                Your data never used to train public models. GDPR compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-brand text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The results speak for themselves</h2>
            <p className="text-xl opacity-90">Based on data from 1,000+ beta users</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">2.3hrs</div>
              <div className="text-lg opacity-80">saved per week on planning</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">40%</div>
              <div className="text-lg opacity-80">more goal completion</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">85%</div>
              <div className="text-lg opacity-80">plan acceptance rate</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-lg opacity-80">user satisfaction score</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by productive people</h2>
            <p className="text-xl text-muted-foreground">
              Here&apos;s what our beta users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card/70 rounded-md p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                &quot;I went from 2 hours of planning every Sunday to 2 minutes. This is a
                game-changer for my productivity.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  AC
                </div>
                <div>
                  <div className="font-semibold">Alex Chen</div>
                  <div className="text-sm text-muted-foreground">Founder @ StartupCo</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card/70 rounded-md p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                &quot;Finally achieved my goal of working out 4x/week. The AI knows when I have
                energy and schedules accordingly.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  SK
                </div>
                <div>
                  <div className="font-semibold">Sarah Kim</div>
                  <div className="text-sm text-muted-foreground">Product Manager</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card/70 rounded-md p-6 border border-border">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-muted-foreground mb-4 italic">
                &quot;As a freelancer juggling multiple projects, MicroPlanner keeps me organized
                and prevents burnout. Worth every penny.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  MR
                </div>
                <div>
                  <div className="font-semibold">Michael Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Freelance Designer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">
              Start free. Upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Tier */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">Perfect to get started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">2 active goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5 AI plans per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Manual calendar sync</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition">
                Start Free
              </button>
            </div>

            {/* Starter Tier */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$7</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For focused individuals</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">5 active goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">20 AI plans per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">GPT-4o-mini planner</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Auto calendar sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Weekly insights</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gradient-brand text-white rounded-lg font-semibold hover:shadow-glow-brand transition">
                Start 7-Day Trial
              </button>
            </div>

            {/* Pro Tier (Most Popular) */}
            <div className="bg-gradient-brand rounded-2xl p-[2px] relative transform lg:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                MOST POPULAR
              </div>
              <div className=" rounded-3xl p-8 h-full">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="opacity-80">/month</span>
                </div>
                <p className="opacity-90 mb-6">For power users</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Unlimited AI plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Claude 3.5 Sonnet (best)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">AI learns your patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Weekly auto-regeneration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Advanced insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition">
                  Start 7-Day Trial
                </button>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">For teams & pros</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority AI queue</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom coach personas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Team workspace (5 seats)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated support (4h SLA)</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition">
                Start 14-Day Trial
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>7-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about MicroPlanner
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                How does the AI actually work?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                MicroPlanner uses advanced language models (GPT-4 and Claude) combined with
                scheduling algorithms to analyze your goals, calendar, energy patterns, and
                preferences. It then generates an optimized weekly schedule that balances all your
                commitments while respecting your constraints.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Can I edit the AI-generated plans?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                Absolutely! You have full control. You can drag tasks to different times, delete
                tasks, add manual tasks, or regenerate the entire plan. The AI is there to assist
                you, not replace your judgment.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Is my calendar data secure?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                Yes. We take security seriously. All calendar tokens are encrypted at rest,
                we&apos;re GDPR compliant, and your data is never used to train public AI models.
                You can export or delete your data at any time.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Which calendar apps do you support?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                Currently we support Google Calendar with bi-directional sync. Apple Calendar and
                Outlook support are coming in the next few months. You can also export plans as ICS
                files for any calendar app.
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Can I cancel my subscription anytime?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                Yes. You can cancel your subscription with one click from your account settings.
                There are no cancellation fees, and you&apos;ll continue to have access until the
                end of your billing period.
              </p>
            </details>

            {/* FAQ Item 6 */}
            <details className="bg-card/70 rounded-lg p-6 cursor-pointer group border border-border hover:border-primary/50">
              <summary className="font-semibold text-lg flex justify-between items-center">
                What if the AI schedules something at a bad time?
                <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-muted-foreground">
                The AI learns from your feedback! If you reject or edit plans, it remembers your
                preferences for future schedules. You can also set &quot;blocked times&quot; to
                prevent scheduling during specific periods.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-brand text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to stop planning and start doing?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join 1,247 people who&apos;ve already transformed their productivity
          </p>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-2xl p-6 mb-8">
            <WaitlistForm />
            <p className="text-xs text-gray-500 mt-3">No credit card required. Start free.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>2,300+ hours saved by users</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>4.9/5 user rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-brand rounded-md flex items-center justify-center shadow-glow-brand">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">MicroPlanner</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                The AI that plans your life for you.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Roadmap
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 MicroPlanner. All rights reserved.</p>
            <p>Made with ❤️ for productive people</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
