'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    // Wait for user to be loaded and synced
    if (isLoaded) {
      // Give UserSync component time to sync user to database
      const timer = setTimeout(() => {
        setIsSyncing(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!isLoaded || isSyncing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to MicroPlanner, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered weekly planner is ready to go
          </p>
        </div>

        {/* Quick Start Info */}
        <div className="rounded-lg border bg-card p-8 text-left space-y-6">
          <h2 className="text-2xl font-semibold">Quick Start Guide</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Create Your First Goal</h3>
                <p className="text-sm text-muted-foreground">
                  Set a meaningful goal and let our AI break it down into achievable tasks
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Generate Your Weekly Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will create a personalized weekly schedule based on your goals and preferences
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Track Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Mark tasks complete and watch your productivity soar with intelligent insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/goals"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Create First Goal
          </Link>
        </div>

        {/* Account Info */}
        <div className="pt-8 border-t text-sm text-muted-foreground">
          <p>Signed in as <span className="font-medium text-foreground">{user?.primaryEmailAddress?.emailAddress}</span></p>
          <p className="mt-1">You're on the <span className="font-medium text-foreground">Free Plan</span></p>
        </div>
      </div>
    </div>
  );
}
