'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OnboardingData } from '@/lib/types/onboarding';

interface Step3Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ENERGY_PATTERNS = [
  {
    value: 'morning' as const,
    label: 'Morning Person',
    icon: Sun,
    description: 'I\'m most productive in the morning hours',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    value: 'evening' as const,
    label: 'Evening Person',
    icon: Moon,
    description: 'I\'m most productive in the evening hours',
    color: 'from-blue-500 to-purple-500',
  },
  {
    value: 'flexible' as const,
    label: 'Flexible',
    icon: Zap,
    description: 'My energy varies throughout the day',
    color: 'from-green-500 to-teal-500',
  },
];

export function Step3EnergyPattern({ data, updateData, onNext, onBack }: Step3Props) {
  const energyPattern = data.energyPattern || null;

  const handleSelect = (pattern: 'morning' | 'evening' | 'flexible') => {
    updateData({ energyPattern: pattern });
  };

  const handleContinue = () => {
    if (energyPattern) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="glass-card rounded-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-brand rounded-full mb-6"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            When Are You Most Productive?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Understanding your energy patterns helps us schedule your most important tasks at the
            right time.
          </p>
        </div>

        {/* Energy Pattern Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ENERGY_PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            const isSelected = energyPattern === pattern.value;

            return (
              <motion.button
                key={pattern.value}
                onClick={() => handleSelect(pattern.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                  ${
                    isSelected
                      ? 'border-white bg-white/20 shadow-2xl'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${pattern.color} mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">{pattern.label}</h3>
                <p className="text-white/70 text-sm">{pattern.description}</p>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-gradient-brand rounded-full" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4 mb-8">
          <p className="text-blue-200 text-sm">
            <strong>Pro Tip:</strong> We'll use this to schedule high-priority tasks during your
            peak productivity hours and routine tasks during lower-energy periods.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-lg border-white/20 text-white hover:bg-white/10"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!energyPattern}
            className="btn-primary flex-1 h-12 text-lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
