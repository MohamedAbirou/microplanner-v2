import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="MicroPlanner"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-gradient">Micro</span>Planner
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/how-it-works"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                href="/testimonials"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Testimonials
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Dense Footer - ReclaimAI Style */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Products */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Products</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/features/ai-planning" className="text-muted-foreground hover:text-foreground transition-colors">
                    AI Planning
                  </Link>
                </li>
                <li>
                  <Link href="/features/goals" className="text-muted-foreground hover:text-foreground transition-colors">
                    Goals
                  </Link>
                </li>
                <li>
                  <Link href="/features/tasks" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tasks
                  </Link>
                </li>
                <li>
                  <Link href="/features/calendar-sync" className="text-muted-foreground hover:text-foreground transition-colors">
                    Calendar Sync
                  </Link>
                </li>
                <li>
                  <Link href="/features/scheduling-links" className="text-muted-foreground hover:text-foreground transition-colors">
                    Scheduling Links
                  </Link>
                </li>
                <li>
                  <Link href="/features/time-tracking" className="text-muted-foreground hover:text-foreground transition-colors">
                    Time Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/features/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/features/focus-time" className="text-muted-foreground hover:text-foreground transition-colors">
                    Focus Time
                  </Link>
                </li>
                <li>
                  <Link href="/features/habits" className="text-muted-foreground hover:text-foreground transition-colors">
                    Habits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Use Cases</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/use-cases/individuals" className="text-muted-foreground hover:text-foreground transition-colors">
                    Individuals
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/students" className="text-muted-foreground hover:text-foreground transition-colors">
                    Students
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/teams" className="text-muted-foreground hover:text-foreground transition-colors">
                    Teams
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/product-teams" className="text-muted-foreground hover:text-foreground transition-colors">
                    Product Teams
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/engineering" className="text-muted-foreground hover:text-foreground transition-colors">
                    Engineering Teams
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/sales" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sales Teams
                  </Link>
                </li>
                <li>
                  <Link href="/use-cases/marketing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Marketing Teams
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Pricing</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/pricing/student" className="text-muted-foreground hover:text-foreground transition-colors">
                    Student Discount
                  </Link>
                </li>
                <li>
                  <Link href="/pricing/nonprofit" className="text-muted-foreground hover:text-foreground transition-colors">
                    Nonprofit Discount
                  </Link>
                </li>
                <li>
                  <Link href="/pricing/startup" className="text-muted-foreground hover:text-foreground transition-colors">
                    Startup Discount
                  </Link>
                </li>
              </ul>
              <h3 className="mb-4 mt-6 text-sm font-semibold text-foreground">Compare</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/compare/reclaim" className="text-muted-foreground hover:text-foreground transition-colors">
                    vs. ReclaimAI
                  </Link>
                </li>
                <li>
                  <Link href="/compare/motion" className="text-muted-foreground hover:text-foreground transition-colors">
                    vs. Motion
                  </Link>
                </li>
                <li>
                  <Link href="/compare/calendly" className="text-muted-foreground hover:text-foreground transition-colors">
                    vs. Calendly
                  </Link>
                </li>
              </ul>
            </div>

            {/* Integrations */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Integrations</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/integrations/google-calendar" className="text-muted-foreground hover:text-foreground transition-colors">
                    Google Calendar
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/slack" className="text-muted-foreground hover:text-foreground transition-colors">
                    Slack
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/zoom" className="text-muted-foreground hover:text-foreground transition-colors">
                    Zoom
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/notion" className="text-muted-foreground hover:text-foreground transition-colors">
                    Notion
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/todoist" className="text-muted-foreground hover:text-foreground transition-colors">
                    Todoist
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/asana" className="text-muted-foreground hover:text-foreground transition-colors">
                    Asana
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/jira" className="text-muted-foreground hover:text-foreground transition-colors">
                    Jira
                  </Link>
                </li>
                <li>
                  <Link href="/integrations/linear" className="text-muted-foreground hover:text-foreground transition-colors">
                    Linear
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/contact/sales" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Sales
                  </Link>
                </li>
                <li>
                  <Link href="/contact/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/customers" className="text-muted-foreground hover:text-foreground transition-colors">
                    Customers
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate" className="text-muted-foreground hover:text-foreground transition-colors">
                    Affiliate Program
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Docs
                  </Link>
                </li>
                <li>
                  <Link href="/webinars" className="text-muted-foreground hover:text-foreground transition-colors">
                    Webinars & Demos
                  </Link>
                </li>
                <li>
                  <Link href="/glossary" className="text-muted-foreground hover:text-foreground transition-colors">
                    Glossary
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Documentation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Link href="/legal/security" className="hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                Terms of Use
              </Link>
              <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/disclosure" className="hover:text-foreground transition-colors">
                Responsible Disclosure
              </Link>
              <Link href="/changelog" className="hover:text-foreground transition-colors">
                Changelog
              </Link>
              <Link href="/status" className="hover:text-foreground transition-colors">
                Status
              </Link>
            </div>
            <p>&copy; {new Date().getFullYear()} MicroPlanner, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
