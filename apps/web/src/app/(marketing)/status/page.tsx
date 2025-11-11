'use client';

import Link from 'next/link';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatusPage() {
  const services = [
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.99%',
      lastUpdated: '2 hours ago',
    },
    {
      name: 'API',
      status: 'operational',
      uptime: '99.98%',
      lastUpdated: '2 hours ago',
    },
    {
      name: 'Mobile Apps',
      status: 'operational',
      uptime: '99.97%',
      lastUpdated: '2 hours ago',
    },
    {
      name: 'Calendar Sync',
      status: 'operational',
      uptime: '99.95%',
      lastUpdated: '2 hours ago',
    },
    {
      name: 'Analytics Engine',
      status: 'operational',
      uptime: '99.94%',
      lastUpdated: '2 hours ago',
    },
    {
      name: 'AI Planning Service',
      status: 'operational',
      uptime: '99.92%',
      lastUpdated: '2 hours ago',
    },
  ];

  const incidents = [
    {
      date: 'November 5, 2025',
      title: 'Calendar Sync Latency',
      description: 'Some users experienced 2-3 minute delays in calendar sync. Resolved in 45 minutes.',
      status: 'resolved',
      impact: 'Minor',
    },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'operational') {
      return (
        <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Operational
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1">
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
          Degraded
        </span>
      </div>
    );
  };

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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              System <span className="text-gradient">Status</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Real-time status of MicroPlanner services and infrastructure.
            </p>
          </div>

          {/* Overall Status */}
          <div className="mx-auto mb-12 max-w-4xl">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">Overall Status</h2>
                  <p className="text-sm text-muted-foreground">
                    Last updated: Just now
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Service Status */}
          <div className="mx-auto mb-16 max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold">Service Status</h2>

            <div className="space-y-3">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary-500/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Uptime: <span className="font-medium text-foreground">{service.uptime}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Updated {service.lastUpdated}
                        </p>
                      </div>
                      <StatusBadge status={service.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History */}
          <div className="mx-auto mb-16 max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold">Recent Incidents</h2>

            {incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold">{incident.title}</h4>
                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {incident.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{incident.date}</span>
                      <span>•</span>
                      <span>Impact: {incident.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  No recent incidents. All systems running smoothly!
                </p>
              </div>
            )}
          </div>

          {/* SLA & Metrics */}
          <div className="mx-auto mb-16 max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold">SLA & Metrics</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-3xl font-bold text-primary-500">99.9%</p>
                <p className="text-xs text-muted-foreground mt-2">Uptime SLA</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-3xl font-bold text-secondary-700">&lt; 100ms</p>
                <p className="text-xs text-muted-foreground mt-2">API Response</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-3xl font-bold text-primary-500">6</p>
                <p className="text-xs text-muted-foreground mt-2">Regions</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-3xl font-bold text-secondary-700">24/7</p>
                <p className="text-xs text-muted-foreground mt-2">Monitoring</p>
              </div>
            </div>
          </div>

          {/* Notification & Support */}
          <div className="mx-auto mb-16 max-w-4xl grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-500" />
                Subscribe to Updates
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Get notified about incidents and maintenance.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-secondary-700" />
                Report an Issue
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Something not working? Let us know.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="w-full">
                  Report Issue
                </Button>
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Need More Information?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Check our help center or contact support for more details.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/help">
                <Button size="lg">
                  Help Center
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
