import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface PageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  features?: Feature[];
  benefits?: Benefit[];
  ctaText?: string;
  ctaLink?: string;
  children?: React.ReactNode;
}

export function PageTemplate({
  title,
  subtitle,
  description,
  features = [],
  benefits = [],
  ctaText = 'Get Started Free',
  ctaLink = '/sign-up',
  children,
}: PageTemplateProps) {
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
              {subtitle}
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              {description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={ctaLink}>
                <Button size="lg">
                  {ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/waitlist">
                <Button variant="outline" size="lg">
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>

          {/* Custom Content */}
          {children}

          {/* Features Grid */}
          {features.length > 0 && (
            <div className="mb-16">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-700/20">
                      <feature.icon className="h-6 w-6 text-primary-500" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits List */}
          {benefits.length > 0 && (
            <div className="mx-auto mb-16 max-w-3xl">
              <h2 className="mb-8 text-center text-2xl font-bold">
                Key Benefits
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-card p-6"
                  >
                    <h3 className="mb-2 font-semibold text-lg">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final CTA */}
          <div className="mt-16 rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Transform Your Planning?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Join thousands of professionals already using MicroPlanner
            </p>
            <Link href={ctaLink}>
              <Button size="lg">
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
