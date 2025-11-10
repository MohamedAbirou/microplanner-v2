'use client';

/**
 * Professional Pricing Page
 * GOAL: Clear, competitive pricing that beats ReclaimAI
 * - Student discount
 * - Startup discount
 * - Feature comparison table
 */

import Link from 'next/link';
import { Button } from '@microplanner/ui';
import { Card } from '@microplanner/ui';
import { Badge } from '@microplanner/ui';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for individuals getting started',
    features: [
      { name: '3 Active Goals', included: true },
      { name: 'Basic Task Management', included: true },
      { name: 'Calendar Sync (1 calendar)', included: true },
      { name: 'Mobile App', included: true },
      { name: 'AI Weekly Planner', included: false },
      { name: 'Focus Time Blocks', included: false },
      { name: 'Kanban Boards', included: false },
      { name: 'Analytics & Insights', included: false },
      { name: 'Priority Support', included: false },
    ],
    cta: 'Start Free',
    href: '/sign-up',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For professionals who want to maximize productivity',
    features: [
      { name: 'Unlimited Goals', included: true },
      { name: 'Advanced Task Management', included: true },
      { name: 'Calendar Sync (Unlimited)', included: true },
      { name: 'AI Weekly Planner', included: true },
      { name: 'Focus Time Protection', included: true },
      { name: 'Kanban Boards', included: true },
      { name: 'Analytics & Insights', included: true },
      { name: 'Time Tracking', included: true },
      { name: 'Priority Support', included: true },
    ],
    cta: 'Start Free Trial',
    href: '/sign-up?plan=pro',
    popular: true,
  },
  {
    name: 'Teams',
    price: '$10',
    period: 'per user/month',
    description: 'For teams that need collaboration and visibility',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Team Analytics', included: true },
      { name: 'Shared Projects & Boards', included: true },
      { name: 'Admin Dashboard', included: true },
      { name: 'SSO & SAML', included: true },
      { name: 'Advanced Permissions', included: true },
      { name: 'Dedicated Support', included: true },
      { name: 'Custom Integrations', included: true },
      { name: 'SLA Guarantee', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

const comparisonFeatures = [
  { category: 'Planning & Scheduling', features: [
    { name: 'AI Weekly Planner', free: false, pro: true, teams: true },
    { name: 'Smart Scheduling', free: true, pro: true, teams: true },
    { name: 'Focus Time Blocks', free: false, pro: true, teams: true },
    { name: 'Buffer Time', free: false, pro: true, teams: true },
    { name: 'Working Hours', free: true, pro: true, teams: true },
  ]},
  { category: 'Goals & Tasks', features: [
    { name: 'Active Goals', free: '3', pro: 'Unlimited', teams: 'Unlimited' },
    { name: 'Task Dependencies', free: false, pro: true, teams: true },
    { name: 'Subtasks', free: false, pro: true, teams: true },
    { name: 'Time Tracking', free: false, pro: true, teams: true },
    { name: 'Habits & Streaks', free: true, pro: true, teams: true },
  ]},
  { category: 'Projects & Collaboration', features: [
    { name: 'Kanban Boards', free: false, pro: true, teams: true },
    { name: 'Project Management', free: false, pro: true, teams: true },
    { name: 'Team Sharing', free: false, pro: false, teams: true },
    { name: 'Team Analytics', free: false, pro: false, teams: true },
  ]},
  { category: 'Integrations', features: [
    { name: 'Calendar Sync', free: '1', pro: 'Unlimited', teams: 'Unlimited' },
    { name: 'Slack Integration', free: false, pro: true, teams: true },
    { name: 'Zoom Integration', free: false, pro: true, teams: true },
    { name: 'Task Apps (Todoist, Asana)', free: false, pro: true, teams: true },
  ]},
  { category: 'Analytics & Insights', features: [
    { name: 'Productivity Score', free: false, pro: true, teams: true },
    { name: 'Pattern Recognition', free: false, pro: true, teams: true },
    { name: 'Team Analytics', free: false, pro: false, teams: true },
    { name: 'Custom Reports', free: false, pro: false, teams: true },
  ]},
];

export default function PricingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Badge variant="accent" className="mb-6">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-gradient">Productivity Level</span>
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto">
            Start free, upgrade when you're ready. All plans include 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`glass-card p-8 relative h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-dark-text-secondary mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gradient">{plan.price}</span>
                      <span className="text-sm text-dark-text-tertiary">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-dark-text-tertiary flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-dark-text-primary' : 'text-dark-text-tertiary'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      variant={plan.popular ? 'default' : 'secondary'}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discounts Section */}
      <section className="py-24 bg-dark-bg-secondary/50" id="discounts">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Special <span className="text-gradient">Discounts</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6 text-center" id="student">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Student Discount</h3>
              <p className="text-sm text-dark-text-secondary mb-4">
                50% off Pro plan with valid student email
              </p>
              <Link href="/sign-up?discount=student">
                <Button variant="secondary" size="sm" className="w-full">
                  Claim Discount
                </Button>
              </Link>
            </Card>

            <Card className="glass-card p-6 text-center" id="startup">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Startup Discount</h3>
              <p className="text-sm text-dark-text-secondary mb-4">
                First year free for YC-backed startups
              </p>
              <Link href="/contact?subject=startup">
                <Button variant="secondary" size="sm" className="w-full">
                  Apply Now
                </Button>
              </Link>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-sm text-dark-text-secondary mb-4">
                Custom pricing for teams of 50+
              </p>
              <Link href="/contact?subject=enterprise">
                <Button variant="secondary" size="sm" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Compare <span className="text-gradient">All Features</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border-primary">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-dark-text-primary">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-dark-text-primary">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-dark-text-primary">
                    Pro
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-dark-text-primary">
                    Teams
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category}>
                      <td
                        colSpan={4}
                        className="py-4 px-4 text-sm font-semibold text-primary-400 bg-dark-bg-tertiary/30"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-dark-border-primary/50">
                        <td className="py-3 px-4 text-sm text-dark-text-secondary">
                          {feature.name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-dark-text-tertiary mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-dark-text-primary">{feature.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <Check className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-dark-text-tertiary mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-dark-text-primary">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.teams === 'boolean' ? (
                            feature.teams ? (
                              <Check className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-dark-text-tertiary mx-auto" />
                            )
                          ) : (
                            <span className="text-sm text-dark-text-primary">{feature.teams}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-24 bg-gradient-to-br from-primary-900/20 to-accent-900/20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-lg text-dark-text-secondary mb-8">
            We're here to help. Check out our FAQ or talk to our team.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs">
              <Button variant="secondary" size="lg">
                View FAQ
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
