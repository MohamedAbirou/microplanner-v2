'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SelectGoalsStep } from '@/components/plans/select-goals-step';
import { CustomizePreferencesStep } from '@/components/plans/customize-preferences-step';
import { GeneratingStep } from '@/components/plans/generating-step';

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
    aiModel: 'claude-sonnet-3.5',
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
    // Redirect to review page to see quality scores and accept/regenerate
    router.push('/app/plans/review');
  };

  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('select-goals');
    } else if (currentStep === 'select-goals') {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep === 'select-goals' ? 1 : currentStep === 'customize' ? 2 : 3} of 3
            </span>
            <span className="text-sm text-muted-foreground">{steps[currentStep].label}</span>
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
          />
        )}
      </div>
    </div>
  );
}
