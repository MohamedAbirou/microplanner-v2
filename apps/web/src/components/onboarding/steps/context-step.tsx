'use client';

import { UserContext } from '@/graphql/onboarding.graphql';
import { motion } from 'framer-motion';
import {
  Armchair,
  Briefcase,
  GraduationCap,
  Heart,
  Laptop,
  Search,
  Sparkles,
} from 'lucide-react';

interface ContextStepProps {
  value?: UserContext;
  onChange: (context: UserContext) => void;
  onNext: () => void;
}

const contexts = [
  {
    value: UserContext.EMPLOYED_FULLTIME,
    label: 'Employed Full-Time',
    description: 'Working a traditional full-time job',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: UserContext.EMPLOYED_PARTTIME,
    label: 'Employed Part-Time',
    description: 'Working part-time hours',
    icon: Briefcase,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    value: UserContext.STUDENT,
    label: 'Student',
    description: 'Currently studying or in school',
    icon: GraduationCap,
    color: 'from-purple-500 to-purple-600',
  },
  {
    value: UserContext.FREELANCER,
    label: 'Freelancer',
    description: 'Self-employed or contract work',
    icon: Laptop,
    color: 'from-green-500 to-green-600',
  },
  {
    value: UserContext.BETWEEN_OPPORTUNITIES,
    label: 'Between Opportunities',
    description: 'Looking for your next role',
    icon: Search,
    color: 'from-orange-500 to-orange-600',
  },
  {
    value: UserContext.RETIRED,
    label: 'Retired',
    description: 'Enjoying retirement',
    icon: Armchair,
    color: 'from-amber-500 to-amber-600',
  },
  {
    value: UserContext.PARENT_CAREGIVER,
    label: 'Parent/Caregiver',
    description: 'Taking care of family',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
  },
  {
    value: UserContext.OTHER,
    label: 'Other',
    description: 'Something else',
    icon: Sparkles,
    color: 'from-indigo-500 to-indigo-600',
  },
];

export function ContextStep({ value, onChange, onNext }: ContextStepProps) {
  const handleSelect = (context: UserContext) => {
    onChange(context);
    // Auto-advance after selection with a slight delay
    setTimeout(() => {
      onNext();
    }, 400);
  };

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
        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          What describes you best?
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          This helps us personalize your experience
        </motion.p>
      </div>

      {/* Context Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contexts.map((context, index) => {
          const Icon = context.icon;
          const isSelected = value === context.value;

          return (
            <motion.button
              key={context.value}
              onClick={() => handleSelect(context.value)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                    : 'border-border bg-background hover:border-primary/50 hover:bg-accent/50'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selected-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/5"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg bg-gradient-to-br ${context.color} shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {context.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {context.description}
                  </p>
                </div>

                {/* Check indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
