'use client';

import Link from 'next/link';
import { Code2, Lock, Zap, BookOpen, ArrowRight, GitBranch, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APIPage() {
  const features = [
    {
      icon: Code2,
      title: 'RESTful API',
      description: 'Complete REST API for accessing plans, goals, analytics, and more. Built with modern standards.',
    },
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'OAuth 2.0 and API key authentication. Your data is protected with enterprise-grade security.',
    },
    {
      icon: Zap,
      title: 'Webhooks',
      description: 'Real-time webhooks for events like goal completion and plan generation. Build reactive integrations.',
    },
    {
      icon: GitBranch,
      title: 'GraphQL Support',
      description: 'Query exactly the data you need with GraphQL. More efficient than REST for complex operations.',
    },
    {
      icon: Shield,
      title: 'Rate Limiting',
      description: 'Generous rate limits. Pro and Premium plans get higher limits and priority processing.',
    },
    {
      icon: BookOpen,
      title: 'Full Documentation',
      description: 'Comprehensive docs with code examples in Python, JavaScript, Ruby, and more.',
    },
  ];

  const endpoints = [
    {
      title: 'Goals',
      description: 'Create, read, update, and delete goals',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    {
      title: 'Plans',
      description: 'Generate, retrieve, and manage weekly plans',
      methods: ['GET', 'POST', 'PATCH'],
    },
    {
      title: 'Analytics',
      description: 'Access productivity data and insights',
      methods: ['GET'],
    },
    {
      title: 'Calendar',
      description: 'Sync and manage calendar events',
      methods: ['GET', 'POST', 'PUT'],
    },
    {
      title: 'Integrations',
      description: 'Manage third-party integrations',
      methods: ['GET', 'POST', 'DELETE'],
    },
    {
      title: 'Webhooks',
      description: 'Subscribe to real-time events',
      methods: ['POST', 'DELETE'],
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
              FOR DEVELOPERS
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              API <span className="text-gradient">Documentation</span>
            </h1>
            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Build powerful integrations with the MicroPlanner API. Full-featured, well-documented, and developer-friendly.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="#docs">
                <Button>
                  Read Documentation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" disabled>
                Try in Postman (Coming Soon)
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary-500/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                  <feature.icon className="h-5 w-5 text-primary-500" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* API Endpoints */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Available <span className="text-gradient">Endpoints</span>
            </h2>

            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary-500/30"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold">{endpoint.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.methods.map((method, i) => (
                        <span
                          key={i}
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            method === 'GET'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : method === 'POST'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : method === 'PUT' || method === 'PATCH'
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Example */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Quick <span className="text-gradient">Start</span>
            </h2>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="border-b border-border bg-muted/50 px-6 py-3">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary-500" />
                  <span className="text-sm font-medium">JavaScript Example</span>
                </div>
              </div>

              <div className="overflow-x-auto p-6">
                <pre className="text-sm text-muted-foreground">
                  <code>{`// Get your API key from your dashboard
const apiKey = 'mp_sk_...';

// Create a new goal
const response = await fetch('https://api.microplanner.app/v1/goals', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Learn French',
    frequency: 'daily',
    duration: 30,
    priority: 'high',
  }),
});

const goal = await response.json();
console.log('Goal created:', goal.id);`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* SDK Support */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              SDK <span className="text-gradient">Support</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['JavaScript/TypeScript', 'Python', 'Ruby', 'PHP', 'Go', 'Java'].map((sdk, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary-500/30"
                >
                  <p className="font-semibold">{sdk}</p>
                  <p className="text-xs text-muted-foreground mt-2">Official SDK</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't see your language? Check our community SDKs or build your own with our REST API.
            </p>
          </div>

          {/* Rate Limits */}
          <div className="mx-auto mb-20 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Rate <span className="text-gradient">Limits</span>
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-primary-500">100/min</p>
                <p className="text-xs text-muted-foreground mt-2">Free Plan</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-secondary-700">1000/min</p>
                <p className="text-xs text-muted-foreground mt-2">Pro Plan</p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-2xl font-bold text-primary-500">Unlimited</p>
                <p className="text-xs text-muted-foreground mt-2">Premium Plan</p>
              </div>
            </div>
          </div>

          {/* Status & Support */}
          <div className="mx-auto mb-20 max-w-4xl grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-500" />
                99.9% Uptime SLA
              </h4>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade infrastructure with redundancy and automatic failover.
              </p>
              <Link href="/status" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                Check Status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-2 font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary-700" />
                Developer Support
              </h4>
              <p className="text-sm text-muted-foreground">
                Chat with developers, ask questions, and share integrations.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 opacity-50 cursor-not-allowed">
                Join Developer Community (Coming Soon)
              </button>
            </div>
          </div>

          {/* CTA Section */}
          <div id="docs" className="rounded-2xl border border-border bg-card p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">
              Ready to Build?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get your API key and start building integrations today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/waitlist">
                <Button size="lg">
                  Join Waitlist
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
