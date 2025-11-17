'use client';

import { motion } from 'framer-motion';
import { OnboardingData } from '../onboarding-wizard';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Sparkles,
  Moon,
  Target,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface CompletionStepProps {
  data: OnboardingData;
  onComplete: () => void;
}

export function CompletionStep({ data, onComplete }: CompletionStepProps) {
  const focusAreaLabels: Record<string, string> = {
    career: 'Career',
    learning: 'Learning',
    health: 'Health & Fitness',
    creative: 'Creative Projects',
    business: 'Business',
    job_search: 'Job Search',
    family: 'Family & Relationships',
    home: 'Home & Organization',
    writing: 'Writing',
    hobbies: 'Hobbies & Fun',
  };

  const contextLabels: Record<string, string> = {
    employed_fulltime: 'Employed Full-Time',
    employed_parttime: 'Employed Part-Time',
    student: 'Student',
    freelancer: 'Freelancer',
    between_opportunities: 'Between Opportunities',
    retired: 'Retired',
    parent_caregiver: 'Parent/Caregiver',
    other: 'Other',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Success Icon */}
      <div className="text-center">
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Amazing! You're ready to plan smarter 🎉
        </motion.h2>

        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Here's your personalized productivity profile — let's start crushing those goals!
        </motion.p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Context & Focus Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-6 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-background border border-blue-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Your Profile</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Status: </span>
                  <span className="text-sm font-medium">
                    {data.context ? contextLabels[data.context] : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Focus Areas: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {focusAreaLabels[area] || area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sleep Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-background border border-indigo-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 shrink-0">
              <Moon className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Optimized Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Wake time:</span>
                  <span className="text-2xl font-bold text-indigo-500">
                    {data.wakeTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your daily plan will be optimized around your natural energy patterns
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* First Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-background border border-amber-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 shrink-0">
              <Target className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Your First Goal</h3>
              <div className="space-y-1">
                <p className="font-medium text-amber-500">{data.firstGoalTitle}</p>
                {data.firstGoalDescription && (
                  <p className="text-sm text-muted-foreground">
                    {data.firstGoalDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl p-6 bg-muted/50 border border-border"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">What's next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>We'll create your first AI-powered weekly plan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>Your schedule will adapt to your energy patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                <span>Track progress and let AI optimize your productivity</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Complete Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center pt-4"
      >
        <Button
          onClick={onComplete}
          size="lg"
          className="w-full sm:w-auto min-w-[280px] h-14 text-lg group"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Your profile has been saved automatically
        </p>
      </motion.div>
    </motion.div>
  );
}
