'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { STEP_TITLES, TOTAL_STEPS, type OnboardingStep } from '@/lib/types/onboarding';

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const step = (i + 1) as OnboardingStep;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-250
                    ${
                      isCompleted
                        ? 'bg-gradient-brand border-transparent'
                        : isCurrent
                          ? 'bg-white border-white shadow-lg'
                          : 'bg-white/10 border-white/30'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-purple-600' : 'text-white/70'
                      }`}
                    >
                      {step}
                    </span>
                  )}
                </motion.div>

                {/* Step Title */}
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    isCurrent ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {STEP_TITLES[step]}
                </span>
              </div>

              {/* Connector Line */}
              {step < TOTAL_STEPS && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-250 ${
                    isCompleted ? 'bg-gradient-brand' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Current Step Title */}
      <div className="sm:hidden text-center mt-4">
        <span className="text-white font-medium">{STEP_TITLES[currentStep]}</span>
        <span className="text-white/60 ml-2">
          ({currentStep}/{TOTAL_STEPS})
        </span>
      </div>
    </div>
  );
}
