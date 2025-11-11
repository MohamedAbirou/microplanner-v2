'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence } from 'framer-motion';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { Step1Welcome } from '@/components/onboarding/step-1-welcome';
import { Step2WorkHours } from '@/components/onboarding/step-2-work-hours';
import { Step3EnergyPattern } from '@/components/onboarding/step-3-energy-pattern';
import { Step4InitialGoals } from '@/components/onboarding/step-4-initial-goals';
import { Step5Calendar } from '@/components/onboarding/step-5-calendar';
import type { OnboardingData, OnboardingStep } from '@/lib/types/onboarding';
import { useToast } from '@/lib/hooks/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Submit onboarding data to backend
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      toast({
        title: '🎉 Welcome to MicroPlanner!',
        description: 'Your account is all set up. Let\'s start planning!',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Welcome
              key="step-1"
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <Step2WorkHours
              key="step-2"
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <Step3EnergyPattern
              key="step-3"
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <Step4InitialGoals
              key="step-4"
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 5 && (
            <Step5Calendar
              key="step-5"
              data={data}
              updateData={updateData}
              onComplete={completeOnboarding}
              onBack={prevStep}
            />
          )}
        </AnimatePresence>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
            <details>
              <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
                Debug: Onboarding Data
              </summary>
              <pre className="text-white/60 text-xs mt-2 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
