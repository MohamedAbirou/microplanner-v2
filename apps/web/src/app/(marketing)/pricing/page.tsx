'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, HelpCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const { isSignedIn } = useAuth();

  // Prices are the single source of truth from billing.constants.ts
  // (STARTER $7, PRO $15, PREMIUM $29).
  const basePlans = [
    {
      name: 'Free',
      tier: 'FREE' as const,
      price: 0,
      description: 'Perfect for trying out MicroPlanner',
      features: [
        { text: '2 active goals', included: true },
        { text: '5 plans per week', included: true },
        { text: 'Rule-based planner', included: true },
        { text: 'Calendar sync', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'AI planning', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Team workspaces', included: false },
      ],
      popular: false,
    },
    {
      name: 'Starter',
      tier: 'STARTER' as const,
      price: 7,
      description: 'For individuals getting serious about goals',
      features: [
        { text: '5 active goals', included: true },
        { text: '20 plans per week', included: true },
        { text: 'GPT-4o-mini AI planner', included: true },
        { text: 'Calendar sync', included: true },
        { text: 'Habit tracking', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Team workspaces', included: false },
      ],
      popular: false,
    },
    {
      name: 'Pro',
      tier: 'PRO' as const,
      price: 15,
      description: 'Our most popular plan for power users',
      features: [
        { text: 'Unlimited goals', included: true },
        { text: 'Unlimited plans', included: true },
        { text: 'Claude Sonnet 3.5 AI', included: true },
        { text: 'Calendar sync', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'AI pattern learning', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Team workspaces', included: false },
      ],
      popular: true,
    },
    {
      name: 'Premium',
      tier: 'PREMIUM' as const,
      price: 29,
      description: 'For teams and organizations',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Team workspaces', included: true },
        { text: 'Unlimited team members', included: true },
        { text: 'API access', included: true },
        { text: 'Advanced integrations', included: true },
        { text: 'Team analytics & insights', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Custom integrations', included: true },
      ],
      popular: false,
    },
  ];

  // Authenticated visitors go straight to the in-app upgrade/checkout surface;
  // anonymous visitors sign up first.
  const plans = basePlans.map((plan) => {
    if (plan.tier === 'FREE') {
      return {
        ...plan,
        cta: isSignedIn ? 'Go to Dashboard' : 'Get Started Free',
        ctaLink: isSignedIn ? '/dashboard' : '/sign-up',
      };
    }
    return {
      ...plan,
      cta: isSignedIn ? `Upgrade to ${plan.name}` : `Start with ${plan.name}`,
      ctaLink: isSignedIn ? `/billing?upgrade=${plan.tier}` : `/sign-up?plan=${plan.tier.toLowerCase()}`,
    };
  });

  const faqs = [
    {
      q: 'Can I switch plans anytime?',
      a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle. No penalties.',
    },
    {
      q: 'Do you offer annual billing?',
      a: 'Absolutely. Annual plans come with 20% discount. That\'s 2 months free! Contact us for enterprise annual pricing.',
    },
    {
      q: 'Is there a free trial for paid plans?',
      a: 'Start with our Free plan to experience MicroPlanner. No credit card required. Upgrade anytime when ready.',
    },
    {
      q: 'Do you offer student or nonprofit discounts?',
      a: 'Yes! We offer 50% off all plans for verified students and nonprofit organizations. Email us with proof of eligibility.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and ACH transfers for annual plans.',
    },
    {
      q: 'What happens to my data if I cancel?',
      a: 'Your data stays with you. You can export it anytime. We\'ll hold your data for 30 days after cancellation in case you want to reactivate.',
    },
    {
      q: 'Is there a money-back guarantee?',
      a: 'Yes! We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund you completely.',
    },
    {
      q: 'How do I contact sales for enterprise pricing?',
      a: 'Great question! Email us at sales@microplanner.ai or use our contact form. We\'ll get back to you within 24 hours.',
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
              TRANSPARENT PRICING
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Simple, <span className="text-gradient">Honest</span> Pricing
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Choose the perfect plan for your needs. No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mb-12 flex justify-center items-center gap-4">
            <div className="relative inline-flex items-center rounded-full bg-card border border-border p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-primary-500/10 text-primary-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-primary-500/10 text-primary-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual <span className="text-xs font-bold text-primary-500 ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="mb-20 grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-xl border p-8 transition-all ${
                  plan.popular
                    ? 'border-2 border-primary-500 bg-card shadow-primary-glow'
                    : 'border-border bg-card hover:border-primary-500/30 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-700 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-xl font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    {billingPeriod === 'annual' && plan.price > 0 ? (
                      <>
                        <span className="text-4xl font-bold">${Math.round(plan.price * 12 * 0.8)}</span>
                        <span className="text-muted-foreground">/year</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    )}
                  </div>
                  {billingPeriod === 'annual' && plan.price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${plan.price}/month billed annually
                    </p>
                  )}
                </div>

                <Link href={plan.ctaLink} className="block mb-8">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="space-y-3 border-t border-border pt-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                          feature.included
                            ? 'text-primary-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground/50 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Why <span className="text-gradient">Choose MicroPlanner</span>?
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <Zap className="h-5 w-5 text-primary-500" />
                </div>
                <h4 className="mb-2 font-semibold">Money-Back Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  Not satisfied? Get a full refund within 30 days. No questions asked. We're that confident.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-700/10">
                  <HelpCircle className="h-5 w-5 text-secondary-700" />
                </div>
                <h4 className="mb-2 font-semibold">Expert Support</h4>
                <p className="text-sm text-muted-foreground">
                  Email and chat support from our team. Pro and Premium plans get priority support.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                </div>
                <h4 className="mb-2 font-semibold">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security. Your data is encrypted and never sold. GDPR compliant.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-700/10">
                  <Zap className="h-5 w-5 text-secondary-700" />
                </div>
                <h4 className="mb-2 font-semibold">Always Improving</h4>
                <p className="text-sm text-muted-foreground">
                  New features and improvements every month. Your feedback shapes our roadmap.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border bg-card overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold hover:bg-accent transition-colors">
                    <span className="text-sm">{faq.q}</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Transform Your Productivity?
            </h2>
            <p className="mb-6 text-muted-foreground">
              All plans include a 30-day money-back guarantee. Start free today.
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
