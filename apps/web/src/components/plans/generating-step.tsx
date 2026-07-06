'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGeneratePlan } from '@/hooks/use-graphql';

interface GeneratingStepProps {
  selectedGoals: string[];
  preferences: any;
  onComplete: (planId: string) => void;
  onError?: () => void;
}

const stages = [
  { label: 'Analyzing your goals...', progress: 20 },
  { label: 'Optimizing schedule based on chronotype...', progress: 40 },
  { label: 'Creating task breakdowns...', progress: 60 },
  { label: 'Applying AI intelligence...', progress: 80 },
  { label: 'Finalizing your plan...', progress: 95 },
];

export function GeneratingStep({ selectedGoals, preferences, onComplete, onError }: GeneratingStepProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const { generatePlan } = useGeneratePlan();

  useEffect(() => {
    let cancelled = false;

    // Advance the stage labels / progress bar as visual feedback. This is
    // purely cosmetic — the redirect is driven off the resolved mutation
    // below, NOT a fixed timer, so a fast (rule-based) or slow (LLM)
    // generation both land on the review page as soon as the plan exists.
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Creep toward 90% while we wait; the real completion snaps it to 100%.
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? Math.min(prev + 2, 90) : prev));
    }, 150);

    (async () => {
      try {
        // The server selects the AI model by tier — do not send an aiModel.
        const result = await generatePlan({
          variables: {
            input: {
              goalIds: selectedGoals,
              weekStartDate: preferences.weekStartDate,
              preferences: {
                prioritizeMornings: preferences.prioritizePeakHours,
                avoidWeekends: preferences.avoidWeekends,
                bufferTime: preferences.bufferTime,
                focusBlockDuration: preferences.focusBlockDuration,
              },
            },
          },
        });

        if (cancelled) return;

        if (result.data?.generatePlan) {
          // Finish the progress bar, then redirect off the resolved result.
          clearInterval(stageInterval);
          clearInterval(progressInterval);
          setCurrentStage(stages.length - 1);
          setProgress(100);
          onComplete(result.data.generatePlan.id);
        } else {
          throw new Error('Plan generation returned no plan');
        }
      } catch (error) {
        if (cancelled) return;
        clearInterval(stageInterval);
        clearInterval(progressInterval);
        console.error('Failed to generate plan:', error);
        toast.error('Failed to generate plan', {
          description: 'Please try again or contact support if the problem persists',
        });
        onError?.();
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [generatePlan, selectedGoals, preferences, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8">
      {/* Loading Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-background rounded-full p-8 border-2 border-primary">
          <Sparkles className="h-16 w-16 text-primary animate-pulse" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generating Your Perfect Week</h2>
        <p className="text-muted-foreground">
          Our AI is creating an optimized schedule based on your preferences
        </p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md space-y-4">
        <Progress value={progress} className="h-2" />

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 transition-opacity ${
                index <= currentStage ? 'opacity-100' : 'opacity-30'
              }`}
            >
              {index < currentStage ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : index === currentStage ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${index === currentStage ? 'font-medium' : 'text-muted-foreground'}`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="w-full max-w-md border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro Tip:</strong> The AI considers your chronotype,
            energy patterns, and goal priorities to create the most effective schedule for you.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
