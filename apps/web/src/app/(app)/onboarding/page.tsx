'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default function OnboardingPage() {
  const { isLoaded } = useUser();
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

  return <OnboardingWizard />;
}
