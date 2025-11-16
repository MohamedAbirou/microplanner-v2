'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GeneratingStepProps {
  selectedGoals: string[];
  preferences: any;
  onComplete: (planId: string) => void;
}

const stages = [
  { label: 'Analyzing your goals...', progress: 20 },
  { label: 'Optimizing schedule based on chronotype...', progress: 40 },
  { label: 'Creating task breakdowns...', progress: 60 },
  { label: 'Applying AI intelligence...', progress: 80 },
  { label: 'Finalizing your plan...', progress: 95 },
];

export function GeneratingStep({ selectedGoals, preferences, onComplete }: GeneratingStepProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate plan generation
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return Math.min(prev + 2, 100);
        }
        return prev;
      });
    }, 150);

    // Complete after 8 seconds
    const timeout = setTimeout(async () => {
      clearInterval(interval);
      clearInterval(progressInterval);

      try {
        // TODO: Actually call GraphQL mutation to generate plan
        // const result = await generatePlan({ selectedGoals, preferences });
        // onComplete(result.id);

        toast.success('Weekly plan generated successfully!', {
          description: 'Your optimized schedule is ready for review',
        });
        onComplete('generated-plan-id');
      } catch (error) {
        console.error('Failed to generate plan:', error);
        toast.error('Failed to generate plan', {
          description: 'Please try again or contact support if the problem persists',
        });
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

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
