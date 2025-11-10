'use client';

/**
 * SLEEK Goal Card Component
 * - Compact design with small text
 * - Professional metrics display
 * - Hover animations
 */

import { Card, CardContent } from '@microplanner/ui';
import { Button } from '@microplanner/ui';
import { MoreHorizontal, Pause, Play, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@microplanner/ui';

interface Goal {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  isPaused: boolean;
  totalCompletions: number;
  totalScheduled: number;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onViewAnalytics: (id: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onPause, onResume, onViewAnalytics }: GoalCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="glass-card-hover relative overflow-hidden">
        {/* Color bar on top */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: goal.color || '#2563EB' }}
        />

        <CardContent className="p-4 pt-5">
          {/* Header with emoji, title, and actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {goal.emoji && (
                <div className="text-xl flex-shrink-0">{goal.emoji}</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-dark-text-primary truncate">
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-xs text-dark-text-tertiary line-clamp-1 mt-0.5">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewAnalytics(goal.id)}>
                  <TrendingUp className="w-3.5 h-3.5 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => goal.isPaused ? onResume(goal.id) : onPause(goal.id)}>
                  {goal.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 mr-2" />
                      Resume Goal
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-2" />
                      Pause Goal
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-error">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Goal frequency and duration */}
          <div className="flex items-center gap-3 mb-3 text-xs text-dark-text-secondary">
            <div className="flex items-center gap-1">
              <span>{goal.frequencyPerWeek}x/week</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-dark-border-secondary" />
            <div className="flex items-center gap-1">
              <span>{goal.durationMinutes} min</span>
            </div>
          </div>

          {/* Completion rate progress */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-dark-text-secondary">Completion Rate</span>
              <span className="text-dark-text-primary font-medium">
                {Math.round(goal.completionRate)}%
              </span>
            </div>
            <div className="w-full bg-dark-bg-tertiary rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goal.completionRate}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-dark-border-primary">
            <div className="text-center">
              <p className="text-xs text-dark-text-tertiary">Streak</p>
              <p className="text-sm font-semibold text-primary-400 mt-0.5">
                {goal.currentStreak} 🔥
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-text-tertiary">Best</p>
              <p className="text-sm font-semibold text-dark-text-primary mt-0.5">
                {goal.longestStreak}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-dark-text-tertiary">Done</p>
              <p className="text-sm font-semibold text-success mt-0.5">
                {goal.totalCompletions}
              </p>
            </div>
          </div>

          {/* Paused indicator */}
          {goal.isPaused && (
            <div className="mt-3 flex items-center justify-center gap-1.5 px-2 py-1 bg-warning/10 border border-warning/20 rounded-md">
              <Pause className="w-3 h-3 text-warning" />
              <span className="text-xs text-warning font-medium">Paused</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
