'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  JOIN_WAITLIST,
  type JoinWaitlistData,
  type JoinWaitlistVariables,
} from '@/lib/graphql/mutations/waitlist';
import { GET_WAITLIST_STATS, type WaitlistStatsData } from '@/lib/graphql/queries/waitlist';
import { useMutation, useQuery } from '@apollo/client';
import { ArrowRight, CheckCircle2, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // GraphQL mutations and queries
  const [joinWaitlist, { loading }] = useMutation<JoinWaitlistData, JoinWaitlistVariables>(
    JOIN_WAITLIST
  );

  const { data: statsData } = useQuery<WaitlistStatsData>(GET_WAITLIST_STATS, {
    pollInterval: 30000, // Refresh every 30 seconds
  });

  // Map role to useCase enum
  const mapRoleToUseCase = (role: string): 'PERSONAL' | 'TEAM' | 'BUSINESS' | 'OTHER' => {
    const mapping: Record<string, 'PERSONAL' | 'TEAM' | 'BUSINESS' | 'OTHER'> = {
      student: 'PERSONAL',
      professional: 'PERSONAL',
      entrepreneur: 'BUSINESS',
      'team-lead': 'TEAM',
      developer: 'PERSONAL',
      other: 'OTHER',
    };
    return mapping[role] || 'OTHER';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const { data } = await joinWaitlist({
        variables: {
          input: {
            email,
            name,
            useCase: role ? mapRoleToUseCase(role) : undefined,
          },
        },
      });

      if (data?.joinWaitlist.success) {
        setPosition(data.joinWaitlist.position);
        setSubmitted(true);
      } else {
        setErrorMessage(data?.joinWaitlist.message || 'Failed to join waitlist. Please try again.');
      }
    } catch (error: any) {
      console.error('Error joining waitlist:', error);

      // Extract the actual error message from GraphQL errors
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const graphQLError = error.graphQLErrors[0];
        setErrorMessage(graphQLError.message || 'Failed to join waitlist. Please try again.');
      } else if (error.networkError) {
        setErrorMessage('Network error. Please check your connection and try again.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 shadow-gradient-glow">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              You're <span className="text-gradient">On the List!</span>
            </h1>

            <p className="mb-8 text-base text-muted-foreground md:text-lg">
              Thanks for joining! We'll keep you updated on our progress and let you know as soon as
              MicroPlanner launches.
            </p>

            {position && (
              <div className="mb-6 rounded-xl border border-secondary-700/20 bg-secondary-700/5 p-4">
                <p className="text-sm text-muted-foreground">
                  You're <strong className="font-semibold text-foreground">#{position}</strong> on
                  the waitlist!
                </p>
              </div>
            )}

            <div className="mb-8 rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
              <p className="text-sm text-muted-foreground">
                <strong className="font-semibold text-foreground">Early access perk:</strong> As a
                waitlist member, you'll get 3 months of Pro plan for free when we launch! 🎉
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>

              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'MicroPlanner',
                      text: 'Try out this AI-powered planner!',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.info("Link copied to clipboard!");
                  }
                }}
              >
                <Sparkles className="h-4 w-4" />
                Share with Friends
              </Button>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p>Want to move up the list? Share MicroPlanner with your network!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="mb-6 inline-flex items-center justify-center">
                <Image
                  src="/logo-icon.svg"
                  alt="MicroPlanner"
                  width={96}
                  height={96}
                  priority
                  className="h-16 w-16"
                />
              </div>

              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Join the <span className="text-gradient">Waitlist</span>
              </h1>

              <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                Be the first to experience the future of AI-powered planning. Get early access and
                exclusive benefits.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">What best describes you?</Label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="student">Student</option>
                        <option value="professional">Professional</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="team-lead">Team Lead/Manager</option>
                        <option value="developer">Developer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {errorMessage && (
                      <div className="rounded-lg border border-error-500/20 bg-error-500/5 p-3">
                        <p className="text-sm text-error-500">{errorMessage}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                          Joining...
                        </>
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By joining, you agree to receive updates about MicroPlanner.
                      <br />
                      We respect your privacy and you can unsubscribe anytime.
                    </p>
                  </form>
                </div>
              </div>

              {/* Benefits */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Why Join?</h3>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                        <Sparkles className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Early Access</p>
                        <p className="text-sm text-muted-foreground">
                          Be among the first to try MicroPlanner
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-700/10">
                        <Zap className="h-4 w-4 text-secondary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Exclusive Perks</p>
                        <p className="text-sm text-muted-foreground">
                          3 months Pro plan free + lifetime discount
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
                        <Users className="h-4 w-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Shape the Product</p>
                        <p className="text-sm text-muted-foreground">
                          Your feedback helps us build better features
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-700/10">
                        <TrendingUp className="h-4 w-4 text-secondary-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Build in Public</p>
                        <p className="text-sm text-muted-foreground">
                          Follow our journey and see behind the scenes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary-500" />
                      <span className="font-semibold">
                        {statsData?.waitlistStats.total.toLocaleString() || '0'}
                      </span>
                      <span className="text-muted-foreground">people waiting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
