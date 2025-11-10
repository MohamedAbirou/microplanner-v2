import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Zap,
  Target,
  Brain,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react';
import { WaitlistForm } from '@/components/marketing/waitlist-form';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-bg-primary text-dark-text-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-700/20 rounded-full blur-3xl" />

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <Link
              href="/blog/launching-microplanner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-bg-secondary/70 backdrop-blur-xl border border-dark-border-primary rounded-full text-sm text-dark-text-secondary hover:text-dark-text-primary hover:border-primary-600 transition-all duration-250"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Launching Early Access</span>
              <span className="text-accent-500 font-semibold">→</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <Image
              src="/brand/logo-full.svg"
              alt="MicroPlanner"
              width={280}
              height={80}
              priority
              className="h-12 w-auto"
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 animate-slide-up">
            <span className="block text-balance">
              The AI Weekly Planner
            </span>
            <span className="block text-gradient mt-2">
              That Actually Works
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-dark-text-secondary text-center max-w-3xl mx-auto mb-12 text-balance animate-slide-up">
            Automatically schedule your goals, sync calendars, and crush your productivity.
            Better than ReclaimAI, Motion, and Clockwise — <strong className="text-dark-text-primary">combined</strong>.
          </p>

          {/* Waitlist Form */}
          <div className="animate-slide-up">
            <WaitlistForm variant="hero" />
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-dark-text-tertiary animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-brand border-2 border-dark-bg-primary"
                  />
                ))}
              </div>
              <span>1,234 early adopters</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-accent-500 text-accent-500" />
              ))}
              <span className="ml-2">Loved by founders & engineers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-dark-bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stop Juggling. Start <span className="text-gradient">Achieving</span>.
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              MicroPlanner uses advanced AI to automatically plan your week, sync your calendars,
              and protect your focus time.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="feature-card p-6 animate-slide-up">
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 shadow-glow-brand">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Scheduling</h3>
              <p className="text-dark-text-secondary">
                Claude Sonnet 3.5 learns your patterns and automatically schedules tasks at your
                optimal times. No more manual planning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-700 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfect Calendar Sync</h3>
              <p className="text-dark-text-secondary">
                Bi-directional sync with Google, Outlook, and Apple Calendar. Zero duplicates,
                guaranteed. Conflicts resolved automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-600 to-primary-700 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Goal-Based Planning</h3>
              <p className="text-dark-text-secondary">
                Set your goals once. MicroPlanner breaks them down into achievable weekly tasks
                and schedules them automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Focus Time Protection</h3>
              <p className="text-dark-text-secondary">
                Automatically block deep work sessions. Decline meetings that violate your focus
                time. Stay in the zone.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-dark-text-secondary">
                Track completion rates, identify patterns, and optimize your productivity over
                time with actionable insights.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
              <p className="text-dark-text-secondary">
                Native iOS & Android apps. Plan your week on your phone, tablet, or desktop.
                Your data syncs everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="text-gradient">MicroPlanner</span>?
            </h2>
            <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
              We took the best features from ReclaimAI, Motion, and Clockwise — and made them
              better.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto glass-card p-8 rounded-2xl overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dark-border-primary">
                  <th className="pb-4 text-dark-text-secondary font-medium">Feature</th>
                  <th className="pb-4 text-center text-gradient font-semibold">MicroPlanner</th>
                  <th className="pb-4 text-center text-dark-text-tertiary">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border-primary">
                <tr>
                  <td className="py-4">AI-Powered Scheduling</td>
                  <td className="py-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                  </td>
                  <td className="py-4 text-center text-dark-text-tertiary">Limited</td>
                </tr>
                <tr>
                  <td className="py-4">Goal-Based Planning</td>
                  <td className="py-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                  </td>
                  <td className="py-4 text-center text-dark-text-tertiary">—</td>
                </tr>
                <tr>
                  <td className="py-4">Perfect Calendar Sync</td>
                  <td className="py-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                  </td>
                  <td className="py-4 text-center text-dark-text-tertiary">Buggy</td>
                </tr>
                <tr>
                  <td className="py-4">Mobile Apps</td>
                  <td className="py-4 text-center">
                    <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                  </td>
                  <td className="py-4 text-center text-dark-text-tertiary">Web Only</td>
                </tr>
                <tr>
                  <td className="py-4">Pricing</td>
                  <td className="py-4 text-center font-semibold text-primary-500">$9.99/mo</td>
                  <td className="py-4 text-center text-dark-text-tertiary">$25+/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient">10x</span> Your Productivity?
            </h2>
            <p className="text-xl text-dark-text-secondary mb-12">
              Join 1,234 early adopters and get <strong className="text-accent-500">3 months PRO free</strong>.
            </p>
            <WaitlistForm variant="hero" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-dark-border-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/brand/logo-icon.svg"
                alt="MicroPlanner"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-dark-text-secondary text-sm">
                © 2024 MicroPlanner. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-dark-text-tertiary">
              <Link href="/legal/privacy" className="hover:text-dark-text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="hover:text-dark-text-primary transition-colors">
                Terms
              </Link>
              <Link href="/about" className="hover:text-dark-text-primary transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
