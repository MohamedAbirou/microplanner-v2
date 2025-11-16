'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import {
  UPDATE_ONBOARDING_PROGRESS,
  COMPLETE_ONBOARDING,
  type UserContext,
  type FocusArea,
} from '@/graphql/onboarding.graphql';
import { ContextStep } from './steps/context-step';
import { FocusAreasStep } from './steps/focus-areas-step';
import { SleepIntelligenceStep } from './steps/sleep-intelligence-step';
import { GoalCreationStep } from './steps/goal-creation-step';
import { CompletionStep } from './steps/completion-step';

export interface OnboardingData {
  context?: UserContext;
  focusAreas: FocusArea[];
  wakeTime?: string;
  timezone: string;
  firstGoalTitle?: string;
  firstGoalDescription?: string;
}

const TOTAL_STEPS = 5;

// Time estimates for each step in seconds
const STEP_TIME_ESTIMATES = {
  1: 30, // Context selection
  2: 60, // First goal (Aha moment!)
  3: 30, // Focus areas
  4: 45, // Productivity profile
  5: 30, // Completion
};

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Onboarding data state
  const [data, setData] = useState<OnboardingData>({
    focusAreas: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect timezone
  });

  const [updateProgress] = useMutation(UPDATE_ONBOARDING_PROGRESS);
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING);

  const saveProgress = useCallback(async () => {
    try {
      await updateProgress({
        variables: {
          input: {
            step: currentStep,
            ...(data.context && { context: data.context }),
            ...(data.focusAreas.length > 0 && { focusAreas: data.focusAreas }),
            ...(data.wakeTime && { wakeTime: data.wakeTime }),
            ...(data.timezone && { timezone: data.timezone }),
          },
        },
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [currentStep, data, updateProgress]);

  // Auto-save progress when step or data changes
  useEffect(() => {
    if (currentStep > 1 && currentStep < TOTAL_STEPS) {
      saveProgress();
    }
  }, [currentStep, data, saveProgress]);

  const handleNext = async () => {
    if (currentStep === TOTAL_STEPS) {
      // Complete onboarding
      try {
        const result = await completeOnboarding({
          variables: {
            input: {
              context: data.context!,
              focusAreas: data.focusAreas,
              wakeTime: data.wakeTime!,
              timezone: data.timezone,
              firstGoalTitle: data.firstGoalTitle!,
              firstGoalDescription: data.firstGoalDescription,
            },
          },
        });

        // Check if successful
        if (result.data?.completeOnboarding?.success) {
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.error('Onboarding failed:', result.data?.completeOnboarding?.message);
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
      return;
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        setIsTransitioning(false);
      }, 300);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.context;
      case 2:
        return !!data.firstGoalTitle; // Goal creation moved to step 2
      case 3:
        return data.focusAreas.length > 0; // Focus areas moved to step 3
      case 4:
        return !!data.wakeTime; // Sleep/productivity moved to step 4
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Calculate remaining time
  const calculateRemainingTime = () => {
    let totalRemaining = 0;
    for (let i = currentStep; i <= TOTAL_STEPS; i++) {
      totalRemaining += STEP_TIME_ESTIMATES[i as keyof typeof STEP_TIME_ESTIMATES];
    }
    const minutes = Math.ceil(totalRemaining / 60);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium text-primary">
              ~{calculateRemainingTime()} remaining
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          className="bg-card rounded-2xl shadow-2xl border border-border/50 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Context Selection */}
            {currentStep === 1 && (
              <ContextStep
                key="context"
                value={data.context}
                onChange={(context) => updateData({ context })}
                onNext={handleNext}
              />
            )}

            {/* Step 2: First Goal (Aha Moment!) */}
            {currentStep === 2 && (
              <GoalCreationStep
                key="goal"
                context={data.context!}
                focusAreas={data.focusAreas}
                goalTitle={data.firstGoalTitle}
                goalDescription={data.firstGoalDescription}
                onChange={(goal) => updateData(goal)}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 3: Focus Areas */}
            {currentStep === 3 && (
              <FocusAreasStep
                key="focus-areas"
                value={data.focusAreas}
                onChange={(focusAreas) => updateData({ focusAreas })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 4: Productivity Profile (Sleep Intelligence) */}
            {currentStep === 4 && (
              <SleepIntelligenceStep
                key="sleep"
                wakeTime={data.wakeTime}
                timezone={data.timezone}
                onChange={(wakeTime) => updateData({ wakeTime })}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {/* Step 5: Completion */}
            {currentStep === 5 && (
              <CompletionStep
                key="completion"
                data={data}
                onComplete={handleNext}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation - Only show on steps 2-4 */}
        {currentStep > 1 && currentStep < TOTAL_STEPS && (
          <motion.div
            className="mt-6 flex justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleBack}
              disabled={isTransitioning}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isTransitioning}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
