'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OnboardingData } from '@/lib/types/onboarding';

interface Step4Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMOJI_SUGGESTIONS = ['🎯', '💪', '📚', '🏃', '💻', '🎨', '🧘', '🎵', '📝', '🚀'];

interface Goal {
  title: string;
  emoji: string;
  frequency: number;
}

export function Step4InitialGoals({ data, updateData, onNext, onBack }: Step4Props) {
  const [goals, setGoals] = useState<Goal[]>(
    data.goals || [
      { title: '', emoji: '🎯', frequency: 3 },
    ]
  );

  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, { title: '', emoji: '🎯', frequency: 3 }]);
    }
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setGoals(newGoals);
    updateData({ goals: newGoals });
  };

  const handleContinue = () => {
    const validGoals = goals.filter((g) => g.title.trim().length > 0);
    if (validGoals.length > 0) {
      updateData({ goals: validGoals });
      onNext();
    }
  };

  const hasValidGoals = goals.some((g) => g.title.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"
          >
            <Target className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Are Your Goals?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Add 1-5 goals you want to work on. Don't worry, you can always add more later!
          </p>
        </div>

        {/* Goals List */}
        <div className="space-y-6 mb-8">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Emoji Picker */}
                  <div className="flex-shrink-0">
                    <Label className="text-white/70 text-xs mb-2 block">Icon</Label>
                    <select
                      value={goal.emoji}
                      onChange={(e) => updateGoal(index, 'emoji', e.target.value)}
                      className="w-16 h-16 text-3xl bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:bg-white/20 transition-colors text-center"
                    >
                      {EMOJI_SUGGESTIONS.map((emoji) => (
                        <option key={emoji} value={emoji}>
                          {emoji}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Goal Details */}
                  <div className="flex-1 space-y-4">
                    {/* Title */}
                    <div>
                      <Label className="text-white/70 text-xs mb-2 block">Goal Name</Label>
                      <Input
                        placeholder="e.g., Exercise, Learn Spanish, Read Books"
                        value={goal.title}
                        onChange={(e) => updateGoal(index, 'title', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <Label className="text-white/70 text-xs mb-2 block">
                        Times per week: {goal.frequency}x
                      </Label>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={goal.frequency}
                        onChange={(e) => updateGoal(index, 'frequency', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-white/50 text-xs mt-1">
                        <span>1x</span>
                        <span>7x</span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {goals.length > 1 && (
                    <button
                      onClick={() => removeGoal(index)}
                      className="flex-shrink-0 mt-8 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Goal Button */}
        {goals.length < 5 && (
          <Button
            onClick={addGoal}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 mb-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Goal
          </Button>
        )}

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
            disabled={!hasValidGoals}
            className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
