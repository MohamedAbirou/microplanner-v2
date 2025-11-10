'use client';

/**
 * Professional 5-Step Onboarding Flow
 * - Welcome & Profile Setup
 * - Energy Pattern Selection
 * - Work Hours Configuration
 * - First Goal Creation
 * - Calendar Integration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { Button } from '@microplanner/ui';
import { Card } from '@microplanner/ui';
import { Input } from '@microplanner/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@microplanner/ui';
import { Progress } from '@microplanner/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Zap,
  Clock,
  Target,
  Calendar,
  Check,
} from 'lucide-react';
import { COMPLETE_ONBOARDING } from '@/lib/graphql/mutations';
import { useToast } from '@/lib/hooks/use-toast';

const steps = [
  { id: 1, name: 'Welcome', icon: Sparkles },
  { id: 2, name: 'Energy', icon: Zap },
  { id: 3, name: 'Work Hours', icon: Clock },
  { id: 4, name: 'First Goal', icon: Target },
  { id: 5, name: 'Calendar', icon: Calendar },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    energyPattern: 'FLEXIBLE',
    workHours: {
      startTime: '09:00',
      endTime: '17:00',
    },
    firstGoal: {
      title: '',
      emoji: '🎯',
      frequencyPerWeek: 3,
      durationMinutes: 60,
    },
  });

  const [completeOnboarding, { loading }] = useMutation(COMPLETE_ONBOARDING, {
    onCompleted: () => {
      toast({
        title: 'Welcome to MicroPlanner! 🎉',
        description: 'Your account is ready. Let\\'s get productive!',
        variant: 'success',
      });
      router.push('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      completeOnboarding({
        variables: {
          input: {
            name: formData.name,
            timezone: formData.timezone,
            energyPattern: formData.energyPattern,
            workHours: formData.workHours,
            firstGoal: formData.firstGoal.title ? formData.firstGoal : null,
          },
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted
                        ? 'bg-success'
                        : isCurrent
                        ? 'bg-gradient-brand shadow-glow-brand'
                        : 'bg-dark-bg-tertiary'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isCurrent
                        ? 'text-dark-text-primary font-medium'
                        : 'text-dark-text-tertiary'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gradient mb-2">
                    Welcome to MicroPlanner!
                  </h2>
                  <p className="text-dark-text-secondary">
                    Let's set up your account in just 2 minutes
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      What's your name?
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      Timezone
                    </label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Energy Pattern */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    When are you most productive?
                  </h2>
                  <p className="text-dark-text-secondary">
                    We'll schedule important tasks during your peak hours
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      value: 'MORNING',
                      label: 'Morning Person',
                      emoji: '🌅',
                      desc: 'Most productive 6am-12pm',
                    },
                    {
                      value: 'EVENING',
                      label: 'Night Owl',
                      emoji: '🌙',
                      desc: 'Most productive 6pm-12am',
                    },
                    {
                      value: 'FLEXIBLE',
                      label: 'Flexible',
                      emoji: '⚡',
                      desc: 'Productive anytime',
                    },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`glass-card p-5 cursor-pointer transition-all ${
                        formData.energyPattern === option.value
                          ? 'ring-2 ring-primary-500 bg-primary-500/10'
                          : 'hover:bg-dark-bg-hover'
                      }`}
                      onClick={() => setFormData({ ...formData, energyPattern: option.value as any })}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{option.emoji}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{option.label}</h3>
                          <p className="text-sm text-dark-text-secondary">{option.desc}</p>
                        </div>
                        {formData.energyPattern === option.value && (
                          <Check className="w-5 h-5 text-success" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Work Hours */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Set your work hours</h2>
                  <p className="text-dark-text-secondary">
                    We'll protect your personal time and avoid scheduling outside these hours
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={formData.workHours.startTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workHours: { ...formData.workHours, startTime: e.target.value },
                        })
                      }
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={formData.workHours.endTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          workHours: { ...formData.workHours, endTime: e.target.value },
                        })
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: First Goal */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Create your first goal</h2>
                  <p className="text-dark-text-secondary">
                    What do you want to achieve? (You can skip this)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-primary mb-2">
                      Goal Title
                    </label>
                    <Input
                      placeholder="e.g., Daily Exercise, Learn Spanish"
                      value={formData.firstGoal.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstGoal: { ...formData.firstGoal, title: e.target.value },
                        })
                      }
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-text-primary mb-2">
                        Times per Week
                      </label>
                      <Select
                        value={formData.firstGoal.frequencyPerWeek.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            firstGoal: {
                              ...formData.firstGoal,
                              frequencyPerWeek: parseInt(value),
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x per week
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-text-primary mb-2">
                        Duration
                      </label>
                      <Select
                        value={formData.firstGoal.durationMinutes.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            firstGoal: {
                              ...formData.firstGoal,
                              durationMinutes: parseInt(value),
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 45, 60, 90, 120].map((mins) => (
                            <SelectItem key={mins} value={mins.toString()}>
                              {mins} min
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Calendar Integration */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Connect your calendar</h2>
                  <p className="text-dark-text-secondary">
                    Sync with Google Calendar, Outlook, or skip for now
                  </p>
                </div>

                <div className="space-y-4">
                  <Card className="glass-card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">📅</div>
                      <div>
                        <h3 className="font-semibold text-white">Google Calendar</h3>
                        <p className="text-sm text-dark-text-secondary">
                          Sync your events automatically
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Connect
                    </Button>
                  </Card>

                  <Card className="glass-card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">📧</div>
                      <div>
                        <h3 className="font-semibold text-white">Outlook Calendar</h3>
                        <p className="text-sm text-dark-text-secondary">
                          Sync with Microsoft 365
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Connect
                    </Button>
                  </Card>

                  <p className="text-center text-sm text-dark-text-tertiary mt-6">
                    You can connect calendars later in Settings
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-border-primary">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              disabled={loading || (currentStep === 1 && !formData.name)}
            >
              {currentStep === 5 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
