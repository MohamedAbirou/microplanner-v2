'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyQuery } from '@apollo/client';
import {
  CALCULATE_SLEEP_RECOMMENDATION,
  type SleepRecommendation,
} from '@/graphql/onboarding.graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Moon,
  Sun,
  Brain,
  Zap,
  Clock,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface SleepIntelligenceStepProps {
  wakeTime?: string;
  timezone: string;
  onChange: (wakeTime: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SleepIntelligenceStep({
  wakeTime,
  timezone,
  onChange,
  onNext,
  onBack,
}: SleepIntelligenceStepProps) {
  const [localWakeTime, setLocalWakeTime] = useState(wakeTime || '07:00');
  const [recommendation, setRecommendation] = useState<SleepRecommendation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [calculateSleep] = useLazyQuery(CALCULATE_SLEEP_RECOMMENDATION);

  // Calculate recommendation when wake time changes
  useEffect(() => {
    if (localWakeTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(localWakeTime)) {
      const timer = setTimeout(() => {
        fetchRecommendation();
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }
  }, [localWakeTime]);

  const fetchRecommendation = async () => {
    setIsCalculating(true);
    try {
      const { data } = await calculateSleep({
        variables: {
          input: {
            wakeTime: localWakeTime,
            timezone,
          },
        },
      });

      if (data?.calculateSleepRecommendation) {
        setRecommendation(data.calculateSleepRecommendation);
      }
    } catch (error) {
      console.error('Failed to calculate sleep recommendation:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleWakeTimeChange = (time: string) => {
    setLocalWakeTime(time);
    onChange(time);
  };

  const handleContinue = () => {
    onChange(localWakeTime);
    onNext();
  };

  const canProceed = localWakeTime && recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
        >
          <Moon className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Let's optimize your schedule
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Tell us when you wake up, and we'll calculate your optimal sleep schedule
        </motion.p>
      </div>

      {/* Wake Time Input */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wakeTime" className="text-base font-medium flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            When do you typically wake up?
          </Label>
          <Input
            id="wakeTime"
            type="time"
            value={localWakeTime}
            onChange={(e) => handleWakeTimeChange(e.target.value)}
            className="text-2xl h-14 text-center font-semibold"
          />
          <p className="text-xs text-muted-foreground text-center">
            Detected timezone: {timezone}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isCalculating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Analyzing your circadian rhythm...
        </motion.div>
      )}

      {/* Recommendations */}
      <AnimatePresence mode="wait">
        {recommendation && !isCalculating && (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Recommendation Card */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Your Optimal Sleep Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-muted-foreground">Bedtime:</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {recommendation.optimalSleepTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-muted-foreground">Wake up:</span>
                      </div>
                      <span className="text-2xl font-bold">{recommendation.wakeTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      {recommendation.totalSleepHours} hours ({recommendation.cycles} complete sleep cycles)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Pattern */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl p-5 bg-card border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                    <Brain className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Your Energy Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.energyPattern.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5 bg-card border border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Peak Productivity</h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.productivityWindow.peak}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep Cycle Alternatives */}
            <div className="rounded-xl p-5 bg-card border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                Alternative Sleep Schedules
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[4, 5, 6].map((cycles) => {
                  const hours = cycles * 1.5;
                  const bedtime = new Date(`2000-01-01T${localWakeTime}:00`);
                  bedtime.setHours(bedtime.getHours() - hours);
                  const bedtimeStr = bedtime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                  const isRecommended = cycles === Math.round(recommendation.cycles);

                  return (
                    <motion.div
                      key={cycles}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: cycles * 0.05 }}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        isRecommended
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            {cycles} cycles
                          </span>
                          {isRecommended && (
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <span className="text-lg font-bold">{hours}h</span>
                        <span className="text-xs text-muted-foreground">
                          Sleep at {bedtimeStr}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Each sleep cycle is ~90 minutes. We recommend {Math.round(recommendation.cycles)} cycles for optimal rest.
              </p>
            </div>

            {/* Explanation */}
            <div className="rounded-xl p-5 bg-accent/50 border border-border">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-2">Why this works</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {recommendation.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-xl p-5 bg-card border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Benefits you'll experience
              </h4>
              <ul className="space-y-2">
                {recommendation.benefits.slice(0, 3).map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="w-32">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canProceed}
          className="w-32"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
