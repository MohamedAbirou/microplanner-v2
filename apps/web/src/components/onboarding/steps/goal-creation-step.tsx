'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyQuery } from '@apollo/client';
import {
  GET_GOAL_SUGGESTIONS,
  type UserContext,
  type FocusArea,
  type GoalSuggestion,
} from '@/graphql/onboarding.graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Sparkles, Wand2, Edit3 } from 'lucide-react';

interface GoalCreationStepProps {
  context: UserContext;
  focusAreas: FocusArea[];
  goalTitle?: string;
  goalDescription?: string;
  onChange: (goal: { firstGoalTitle: string; firstGoalDescription?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GoalCreationStep({
  context,
  focusAreas,
  goalTitle,
  goalDescription,
  onChange,
  onNext,
  onBack,
}: GoalCreationStepProps) {
  const [title, setTitle] = useState(goalTitle || '');
  const [description, setDescription] = useState(goalDescription || '');
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(!!goalTitle);

  const [getSuggestions] = useLazyQuery(GET_GOAL_SUGGESTIONS);

  // Fetch AI suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data } = await getSuggestions({
        variables: {
          input: {
            context,
            focusAreas,
          },
        },
      });

      if (data?.getGoalSuggestions) {
        setSuggestions(data.getGoalSuggestions);
      }
    } catch (error) {
      console.error('Failed to fetch goal suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: GoalSuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    onChange({
      firstGoalTitle: suggestion.title,
      firstGoalDescription: suggestion.description,
    });
    setShowCustomInput(true);
  };

  const handleCustomGoal = () => {
    setShowCustomInput(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onChange({
      firstGoalTitle: newTitle,
      firstGoalDescription: description,
    });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onChange({
      firstGoalTitle: title,
      firstGoalDescription: newDescription,
    });
  };

  const handleContinue = () => {
    onChange({
      firstGoalTitle: title,
      firstGoalDescription: description,
    });
    onNext();
  };

  const canProceed = title.trim().length > 0;

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
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
        >
          <Target className="w-8 h-8 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create your first goal
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Choose an AI suggestion or create your own
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!showCustomInput ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Loading State */}
            {isLoadingSuggestions && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-muted/50 animate-pulse"
                  />
                ))}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                  <Wand2 className="w-4 h-4 animate-spin" />
                  AI is crafting personalized suggestions...
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {!isLoadingSuggestions && suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI-powered suggestions based on your profile
                </div>

                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-5 rounded-xl bg-card border-2 border-border hover:border-primary/50 hover:bg-accent/50 text-left transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shrink-0 group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                        →
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Custom Goal Button */}
            <motion.button
              onClick={handleCustomGoal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 text-left transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Edit3 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">
                    Create your own goal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Write something custom that's unique to you
                  </p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="custom-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="goalTitle" className="text-base font-medium">
                Goal Title
              </Label>
              <Input
                id="goalTitle"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Learn Python Programming"
                className="text-lg h-12"
                autoFocus
              />
            </div>

            {/* Description Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="goalDescription" className="text-base font-medium">
                Description <span className="text-sm text-muted-foreground">(optional)</span>
              </Label>
              <textarea
                id="goalDescription"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Add more details about what you want to achieve..."
                className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Back to suggestions */}
            {suggestions.length > 0 && (
              <button
                onClick={() => setShowCustomInput(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                View AI suggestions again
              </button>
            )}
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
