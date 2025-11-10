import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Zap,
  Target,
  Brain,
  TrendingUp,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
  Star,
  PlayCircle,
  BarChart2,
  ShieldCheck,
  RefreshCw,
  CalendarCheck,
  XCircle,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronDown,
  Twitter,
  Github,
  Linkedin,
} from 'lucide-react';
import { WaitlistForm } from '@/components/marketing/waitlist-form';

export default function HomePage() {
  return (
    <main className="bg-dark-bg-primary text-dark-text-primary antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg-primary/80 backdrop-blur-xl border-b border-dark-border-primary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MicroPlanner</span>
            </div>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors">
                Testimonials
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:block px-4 py-2 text-dark-text-secondary hover:text-dark-text-primary font-medium transition-colors">
                Sign In
              </button>
              <button className="px-6 py-2.5 bg-gradient-brand text-white font-semibold rounded-lg hover:shadow-glow transition-all hover:scale-105">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-400 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI-Powered Weekly Planning</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
              You tell it your goals.
              <br />
              <span className="bg-gradient-brand bg-clip-text text-transparent">It builds your week.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-dark-text-secondary mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              Stop spending hours on planning. MicroPlanner turns your goals into a perfectly balanced weekly
              schedule in 30 seconds using AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-brand text-white text-lg font-semibold rounded-xl hover:shadow-glow transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3">
                Start Planning for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-dark-bg-secondary border border-dark-border-primary text-white text-lg font-semibold rounded-xl hover:border-dark-border-secondary transition-all flex items-center justify-center gap-3">
                <PlayCircle className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-dark-text-tertiary animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>2 minutes to first plan</span>
              </div>
            </div>
          </div>

          {/* Hero Image / Product Screenshot */}
          <div className="mt-20 animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="relative max-w-6xl mx-auto">
              {/* Glow effect behind */}
              <div className="absolute inset-0 bg-gradient-brand opacity-20 blur-3xl" />

              {/* Mock dashboard screenshot */}
              <div className="relative bg-dark-bg-secondary rounded-3xl border border-dark-border-primary overflow-hidden shadow-2xl">
                <div className="bg-dark-bg-tertiary px-6 py-4 border-b border-dark-border-secondary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                      <div key={day} className="text-center text-xs text-dark-text-tertiary font-semibold">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Monday */}
                    <div className="space-y-1">
                      <div className="bg-blue-500/20 border-l-2 border-blue-500 rounded p-2 text-xs">
                        <div className="text-blue-400 font-medium">🏋️ Gym</div>
                      </div>
                      <div className="bg-green-500/20 border-l-2 border-green-500 rounded p-2 text-xs">
                        <div className="text-green-400 font-medium">📚 Read</div>
                      </div>
                    </div>
                    {/* Tuesday */}
                    <div className="space-y-1">
                      <div className="bg-purple-500/20 border-l-2 border-purple-500 rounded p-2 text-xs">
                        <div className="text-purple-400 font-medium">💻 Code</div>
                      </div>
                    </div>
                    {/* Wednesday */}
                    <div className="space-y-1">
                      <div className="bg-blue-500/20 border-l-2 border-blue-500 rounded p-2 text-xs">
                        <div className="text-blue-400 font-medium">🏋️ Gym</div>
                      </div>
                      <div className="bg-green-500/20 border-l-2 border-green-500 rounded p-2 text-xs">
                        <div className="text-green-400 font-medium">📚 Read</div>
                      </div>
                    </div>
                    {/* Thursday */}
                    <div className="space-y-1">
                      <div className="bg-purple-500/20 border-l-2 border-purple-500 rounded p-2 text-xs">
                        <div className="text-purple-400 font-medium">💻 Code</div>
                      </div>
                    </div>
                    {/* Friday */}
                    <div className="space-y-1">
                      <div className="bg-blue-500/20 border-l-2 border-blue-500 rounded p-2 text-xs">
                        <div className="text-blue-400 font-medium">🏋️ Gym</div>
                      </div>
                      <div className="bg-green-500/20 border-l-2 border-green-500 rounded p-2 text-xs">
                        <div className="text-green-400 font-medium">📚 Read</div>
                      </div>
                    </div>
                    {/* Saturday */}
                    <div className="space-y-1">
                      <div className="bg-purple-500/20 border-l-2 border-purple-500 rounded p-2 text-xs">
                        <div className="text-purple-400 font-medium">💻 Code</div>
                      </div>
                    </div>
                    {/* Sunday */}
                    <div className="space-y-1">
                      <div className="bg-green-500/20 border-l-2 border-green-500 rounded p-2 text-xs">
                        <div className="text-green-400 font-medium">📚 Read</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 border-y border-dark-border-primary/50 bg-dark-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-dark-text-tertiary mb-8">Trusted by productivity enthusiasts worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <div className="text-2xl font-bold text-dark-text-tertiary">1,247+ Users</div>
            <div className="text-2xl font-bold text-dark-text-tertiary">18,392 Plans Generated</div>
            <div className="text-2xl font-bold text-dark-text-tertiary">4.9★ Rating</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Planning shouldn&apos;t take <span className="bg-gradient-brand bg-clip-text text-transparent">hours</span>
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              Most people spend 2+ hours every week playing calendar Tetris. Your time is too valuable for that.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Old Way */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-red-400">The Old Way</h3>
              <ul className="space-y-3 text-dark-text-secondary">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Spend hours manually planning your week</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Goals never make it to your calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Forget to schedule important tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>Always reactive, never proactive</span>
                </li>
              </ul>
            </div>

            {/* MicroPlanner Way */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-400">The MicroPlanner Way</h3>
              <ul className="space-y-3 text-dark-text-secondary">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Perfect week generated in 30 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Goals automatically become calendar blocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>AI learns your preferences over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Stay ahead with proactive planning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-dark-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              From goals to <span className="bg-gradient-brand bg-clip-text text-transparent">schedule</span> in 3
              steps
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              It&apos;s so simple, you&apos;ll wonder why you didn&apos;t start sooner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-glow">
                1
              </div>
              <div className="pt-16 bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Add Your Goals</h3>
                <p className="text-dark-text-secondary mb-4">
                  Tell us what you want to achieve. &quot;Go to gym 3x/week&quot;, &quot;Read daily&quot;, &quot;Work on side project&quot;.
                  That&apos;s it.
                </p>
                <div className="bg-dark-bg-tertiary/50 rounded-lg p-3 text-sm text-dark-text-tertiary">Takes ~1 minute</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-glow">
                2
              </div>
              <div className="pt-16 bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Generates Your Plan</h3>
                <p className="text-dark-text-secondary mb-4">
                  Our AI analyzes your calendar, energy patterns, and preferences to create a perfectly
                  balanced week.
                </p>
                <div className="bg-dark-bg-tertiary/50 rounded-lg p-3 text-sm text-dark-text-tertiary">Takes ~30 seconds</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-glow">
                3
              </div>
              <div className="pt-16 bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Execute & Achieve</h3>
                <p className="text-dark-text-secondary mb-4">
                  Review, sync to your calendar with one click, and follow your plan. Watch your goals become
                  reality.
                </p>
                <div className="bg-dark-bg-tertiary/50 rounded-lg p-3 text-sm text-dark-text-tertiary">40% more completion</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to <span className="bg-gradient-brand bg-clip-text text-transparent">stay on
                track</span>
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              Powerful features that make planning effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Intelligence</h3>
              <p className="text-dark-text-secondary">
                Smart scheduling that learns your preferences, energy patterns, and constraints to create
                optimal plans.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calendar Sync</h3>
              <p className="text-dark-text-secondary">
                Seamlessly integrates with Google Calendar. Apply your plan with one click, no manual entry
                needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Insights</h3>
              <p className="text-dark-text-secondary">
                Track your progress, see completion rates, and get AI-powered suggestions to improve your
                planning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-dark-text-secondary">
                Generate a complete weekly plan in under 30 seconds. No more hours wasted on planning.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-dark-text-secondary">
                Your data is encrypted and never used to train public models. GDPR compliant with data export
                anytime.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mb-6 group-hover:shadow-glow transition-all">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible & Adaptive</h3>
              <p className="text-dark-text-secondary">
                Not happy with the plan? Regenerate instantly with different preferences or manually adjust any
                task.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-brand text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The results speak for themselves</h2>
            <p className="text-xl opacity-90">Based on data from 1,000+ beta users</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
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
      <section id="testimonials" className="py-24 px-6 bg-dark-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by <span className="bg-gradient-brand bg-clip-text text-transparent">productivity
                enthusiasts</span>
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              See what our users are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dark-text-secondary mb-6">
                &quot;I went from spending 2 hours every Sunday planning my week to just 2 minutes. MicroPlanner is a
                game-changer for my productivity.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold">
                  SC
                </div>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-dark-text-tertiary">Product Manager @ Tech Co</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dark-text-secondary mb-6">
                &quot;Finally, a tool that actually helps me achieve my goals. The AI scheduling is incredibly smart
                and respects my energy levels.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold">
                  MR
                </div>
                <div>
                  <div className="font-semibold">Marcus Rodriguez</div>
                  <div className="text-sm text-dark-text-tertiary">Freelance Developer</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-dark-text-secondary mb-6">
                &quot;Best investment I&apos;ve made in my productivity. My gym consistency went from 40% to 95% in one
                month. Highly recommend!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold">
                  EP
                </div>
                <div>
                  <div className="font-semibold">Emily Park</div>
                  <div className="text-sm text-dark-text-tertiary">Entrepreneur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, <span className="bg-gradient-brand bg-clip-text text-transparent">transparent</span> pricing
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-3xl p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-dark-text-tertiary">/month</span>
                </div>
                <p className="text-dark-text-secondary">Perfect to get started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">2 active goals</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">5 AI plans per week</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Basic AI scheduler</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Manual calendar sync</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-dark-bg-tertiary hover:bg-dark-bg-hover text-white font-semibold rounded-xl transition-all">
                Start Free
              </button>
            </div>

            {/* Pro Tier (Most Popular) */}
            <div className="bg-gradient-brand rounded-3xl p-[2px] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-brand text-white text-sm font-semibold rounded-full">
                MOST POPULAR
              </div>
              <div className="bg-dark-bg-secondary rounded-3xl p-8 h-full">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold">$15</span>
                    <span className="text-dark-text-tertiary">/month</span>
                  </div>
                  <p className="text-dark-text-secondary">For power users</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Unlimited goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Unlimited AI plans</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Claude Sonnet 3.5 AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Auto calendar sync</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">AI learns your patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Weekly insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-text-secondary">Priority support</span>
                  </li>
                </ul>

                <button className="w-full px-6 py-3 bg-gradient-brand text-white font-semibold rounded-xl hover:shadow-glow transition-all">
                  Start 7-Day Trial
                </button>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-3xl p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold">$29</span>
                  <span className="text-dark-text-tertiary">/month</span>
                </div>
                <p className="text-dark-text-secondary">For teams & professionals</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Team workspace (5 members)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Custom AI personas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-dark-text-secondary">Dedicated support</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-dark-bg-tertiary hover:bg-dark-bg-hover text-white font-semibold rounded-xl transition-all">
                Start 14-Day Trial
              </button>
            </div>
          </div>

          <p className="text-center text-dark-text-tertiary mt-8">
            All plans include 7-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-dark-bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-xl text-dark-text-secondary">Everything you need to know about MicroPlanner</p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                How does the AI actually work?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                MicroPlanner uses advanced language models (GPT-4 and Claude) combined with scheduling algorithms to analyze your goals, calendar, energy patterns, and preferences. It then generates an optimized weekly schedule that balances all your commitments while respecting your constraints.
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Can I edit the AI-generated plans?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                Absolutely! You have full control. You can drag tasks to different times, delete tasks, add manual tasks, or regenerate the entire plan. The AI is there to assist you, not replace your judgment.
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Is my calendar data secure?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                Yes. We take security seriously. All calendar tokens are encrypted at rest, we&apos;re GDPR compliant, and your data is never used to train public AI models. You can export or delete your data at any time.
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Which calendar apps do you support?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                Currently we support Google Calendar with bi-directional sync. Apple Calendar and Outlook support are coming in the next few months. You can also export plans as ICS files for any calendar app.
              </p>
            </details>

            {/* FAQ Item 5 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                Can I cancel my subscription anytime?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                Yes. You can cancel your subscription with one click from your account settings. There are no cancellation fees, and you&apos;ll continue to have access until the end of your billing period.
              </p>
            </details>

            {/* FAQ Item 6 */}
            <details className="bg-dark-bg-secondary/50 border border-dark-border-primary rounded-lg p-6 cursor-pointer group hover:border-dark-border-secondary">
              <summary className="font-semibold text-lg flex justify-between items-center">
                What if the AI schedules something at a bad time?
                <ChevronDown className="w-5 h-5 text-dark-text-tertiary group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-dark-text-secondary">
                The AI learns from your feedback! If you reject or edit plans, it remembers your preferences for future schedules. You can also set &quot;blocked times&quot; to prevent scheduling during specific periods.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to take back your time?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join 1,247+ people who&apos;ve already automated their weekly planning
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl hover:shadow-2xl transition-all hover:scale-105">
              Get Started Free
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all">
              Book a Demo
            </button>
          </div>
          <p className="text-white/60 mt-6 text-sm">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg-primary border-t border-dark-border-primary py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">MicroPlanner</span>
              </div>
              <p className="text-dark-text-secondary text-sm">
                AI-powered weekly planning that actually works.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-dark-text-secondary">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-dark-text-secondary">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-dark-text-secondary">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-border-primary flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-text-tertiary">
              © 2025 MicroPlanner. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-dark-text-secondary hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-text-secondary hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-text-secondary hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
