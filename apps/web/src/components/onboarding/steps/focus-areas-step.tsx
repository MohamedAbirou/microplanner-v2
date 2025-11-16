'use client';

import { motion } from 'framer-motion';
import { FocusArea } from '@/graphql/onboarding.graphql';
import {
  Briefcase,
  BookOpen,
  Heart,
  Palette,
  TrendingUp,
  Search,
  Users,
  Home,
  PenTool,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusAreasStepProps {
  value: FocusArea[];
  onChange: (focusAreas: FocusArea[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const focusAreas = [
  {
    value: FocusArea.CAREER,
    label: 'Career',
    description: 'Professional growth & development',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
  },
  {
    value: FocusArea.LEARNING,
    label: 'Learning',
    description: 'Education & skill development',
    icon: BookOpen,
    color: 'from-purple-500 to-purple-600',
  },
  {
    value: FocusArea.HEALTH,
    label: 'Health & Fitness',
    description: 'Physical & mental wellbeing',
    icon: Heart,
    color: 'from-red-500 to-red-600',
  },
  {
    value: FocusArea.CREATIVE,
    label: 'Creative Projects',
    description: 'Art, music, design & creativity',
    icon: Palette,
    color: 'from-pink-500 to-pink-600',
  },
  {
    value: FocusArea.BUSINESS,
    label: 'Business',
    description: 'Entrepreneurship & side hustles',
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
  },
  {
    value: FocusArea.JOB_SEARCH,
    label: 'Job Search',
    description: 'Finding your next opportunity',
    icon: Search,
    color: 'from-orange-500 to-orange-600',
  },
  {
    value: FocusArea.FAMILY,
    label: 'Family & Relationships',
    description: 'Quality time with loved ones',
    icon: Users,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    value: FocusArea.HOME,
    label: 'Home & Organization',
    description: 'Home improvement & decluttering',
    icon: Home,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    value: FocusArea.WRITING,
    label: 'Writing',
    description: 'Blogging, journaling & content',
    icon: PenTool,
    color: 'from-amber-500 to-amber-600',
  },
  {
    value: FocusArea.HOBBIES,
    label: 'Hobbies & Fun',
    description: 'Personal interests & recreation',
    icon: Gamepad2,
    color: 'from-teal-500 to-teal-600',
  },
];

export function FocusAreasStep({ value, onChange, onNext, onBack }: FocusAreasStepProps) {
  const toggleFocusArea = (area: FocusArea) => {
    if (value.includes(area)) {
      onChange(value.filter((a) => a !== area));
    } else {
      onChange([...value, area]);
    }
  };

  const canProceed = value.length > 0;

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
          What matters most to you?
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Select 2-3 areas to focus on (you can always adjust later)
        </motion.p>
        {value.length > 0 && (
          <motion.p
            className="text-sm font-medium text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {value.length === 1 && 'Great start! Add 1-2 more for balanced growth'}
            {value.length === 2 && 'Perfect! One more would be ideal 👌'}
            {value.length >= 3 && `Excellent! ${value.length} areas selected`}
          </motion.p>
        )}
      </div>

      {/* Focus Areas Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {focusAreas.map((area, index) => {
          const Icon = area.icon;
          const isSelected = value.includes(area.value);

          return (
            <motion.button
              key={area.value}
              onClick={() => toggleFocusArea(area.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                    : 'border-border bg-background hover:border-primary/30 hover:bg-accent/30'
                }
              `}
            >
              <div className="space-y-3">
                {/* Icon */}
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${area.color} w-fit`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-0.5">
                    {area.label}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {area.description}
                  </p>
                </div>

                {/* Check indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg
                      className="w-3 h-3 text-white"
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

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-32"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="w-32"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
