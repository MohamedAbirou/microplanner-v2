'use client';

/**
 * Professional Marketing Layout
 * - Clean header with navigation
 * - Comprehensive footer like ReclaimAI
 * - Smooth animations
 */

import { Button } from '@microplanner/ui';
import { Menu, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const navigation = {
  products: [
    { name: 'Focus Time', href: '/features/focus-time' },
    { name: 'Goals & Habits', href: '/features/goals' },
    { name: 'Tasks', href: '/features/tasks' },
    { name: 'Smart Meetings', href: '/features/meetings' },
    { name: 'AI Weekly Planner', href: '/features/planner' },
    { name: 'Time Tracking', href: '/features/time-tracking' },
    { name: 'Kanban Boards', href: '/features/kanban' },
    { name: 'Calendar Sync', href: '/features/calendar-sync' },
    { name: 'Analytics', href: '/features/analytics' },
  ],
  useCases: [
    { name: 'Product Teams', href: '/use-cases/product' },
    { name: 'Engineering Teams', href: '/use-cases/engineering' },
    { name: 'Sales Teams', href: '/use-cases/sales' },
    { name: 'Marketing Teams', href: '/use-cases/marketing' },
    { name: 'Startups', href: '/use-cases/startups' },
    { name: 'Freelancers', href: '/use-cases/freelancers' },
  ],
  compare: [
    { name: 'vs. ReclaimAI', href: '/compare/reclaim' },
    { name: 'vs. Motion', href: '/compare/motion' },
    { name: 'vs. Clockwise', href: '/compare/clockwise' },
    { name: 'vs. Google Calendar', href: '/compare/google-calendar' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Help Docs', href: '/docs' },
    { name: 'API Reference', href: '/api-docs' },
    { name: 'Integrations', href: '/integrations' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ],
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-dark-border-primary bg-dark-bg-primary/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3" aria-label="Global">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-brand group-hover:shadow-glow-blue transition-shadow duration-250">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">MicroPlanner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            <Link
              href="/pricing"
              className="text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/integrations"
              className="text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Integrations
            </Link>
            <Link
              href="/use-cases"
              className="text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Use Cases
            </Link>
            <Link
              href="/compare"
              className="text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              Compare
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex lg:gap-x-3">
            <Link href="/sign-in">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-dark-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-dark-text-primary" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-dark-border-primary bg-dark-bg-secondary">
            <div className="space-y-1 px-4 py-4">
              <Link
                href="/pricing"
                className="block px-3 py-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover rounded-lg"
              >
                Pricing
              </Link>
              <Link
                href="/features"
                className="block px-3 py-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover rounded-lg"
              >
                Features
              </Link>
              <Link
                href="/integrations"
                className="block px-3 py-2 text-sm font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover rounded-lg"
              >
                Integrations
              </Link>
              <div className="pt-3 space-y-2">
                <Link href="/sign-in">
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-4">{children}</main>

      {/* Comprehensive Footer like ReclaimAI */}
      <footer className="border-t border-dark-border-primary bg-dark-bg-secondary mt-24">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Products */}
            <div>
              <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Products</h3>
              <ul className="space-y-2.5">
                {navigation.products.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Use Cases</h3>
              <ul className="space-y-2.5">
                {navigation.useCases.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compare */}
            <div>
              <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Compare</h3>
              <ul className="space-y-2.5">
                {navigation.compare.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Pricing</h3>
                <ul className="space-y-2.5">
                  <li>
                    <Link
                      href="/pricing"
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      Pricing & Plans
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing#student"
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      Student Discount
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing#startup"
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      Startup Discount
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Resources</h3>
              <ul className="space-y-2.5">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-dark-text-primary mb-4">Company</h3>
              <ul className="space-y-2.5">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-dark-text-secondary hover:text-primary-400 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-dark-border-primary flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-dark-text-tertiary">
              © {new Date().getFullYear()} MicroPlanner. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-xs text-dark-text-tertiary hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-dark-text-tertiary hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
