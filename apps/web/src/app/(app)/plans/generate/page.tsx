'use client';

import { CustomizePreferencesStep } from '@/components/plans/customize-preferences-step';
import { GeneratingStep } from '@/components/plans/generating-step';
import { SelectGoalsStep } from '@/components/plans/select-goals-step';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'select-goals' | 'customize' | 'generating';

export default function GeneratePlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('select-goals');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    weekStartDate: new Date(),
    prioritizePeakHours: true,
    avoidWeekends: false,
    bufferTime: 15,
    focusBlockDuration: 90,
    // aiModel intentionally omitted — the server selects the model by tier.
  });

  const steps = {
    'select-goals': { label: 'Select Goals', progress: 33 },
    customize: { label: 'Customize', progress: 66 },
    generating: { label: 'Generating', progress: 100 },
  };

  const handleSelectGoals = (goalIds: string[]) => {
    setSelectedGoals(goalIds);
    setCurrentStep('customize');
  };

  const handleCustomize = (prefs: typeof preferences) => {
    setPreferences(prefs);
    setCurrentStep('generating');
  };

  const handlePlanGenerated = (planId: string) => {
    router.push(`/plans/review?id=${planId}`);
  };

  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('select-goals');
    } else if (currentStep === 'select-goals') {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background mp-fade-in">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium">
              Step {currentStep === 'select-goals' ? 1 : currentStep === 'customize' ? 2 : 3} of 3
            </span>
            <span className="text-[13px] text-muted-foreground">{steps[currentStep].label}</span>
          </div>
          <Progress value={steps[currentStep].progress} />
        </div>

        {/* Step Content */}
        {currentStep === 'select-goals' && (
          <SelectGoalsStep onNext={handleSelectGoals} selectedGoals={selectedGoals} />
        )}

        {currentStep === 'customize' && (
          <CustomizePreferencesStep
            onNext={handleCustomize}
            onBack={handleBack}
            preferences={preferences}
            selectedGoals={selectedGoals}
          />
        )}

        {currentStep === 'generating' && (
          <GeneratingStep
            selectedGoals={selectedGoals}
            preferences={preferences}
            onComplete={handlePlanGenerated}
            onError={() => setCurrentStep('customize')}
          />
        )}
      </div>
    </div>
  );
}
