'use client';

import * as React from 'react';
import { Flame, Clock, BarChart3, Pause, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface GoalCardProps {
  goal: {
    id: string;
    emoji: string;
    title: string;
    description?: string;
    color: string;
    frequencyPerWeek: number;
    durationMinutes: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    isPaused: boolean;
    isActive: boolean;
  };
  compact?: boolean;
  onPause?: (goalId: string) => void;
  onResume?: (goalId: string) => void;
}

export const GoalCard = React.memo<GoalCardProps>(function GoalCard({ goal, compact = false, onPause, onResume }) {
  if (compact) {
    return (
      <Link href={`/app/goals/${goal.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{goal.emoji}</div>
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {goal.description}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline">{goal.completionRate}%</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{goal.completionRate}%</span>
              </div>
              <Progress value={goal.completionRate} />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {goal.frequencyPerWeek}x/week • {goal.durationMinutes}min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {goal.currentStreak} day streak
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              {goal.emoji}
            </div>
            <div>
              <Link href={`/app/goals/${goal.id}`}>
                <h3 className="font-semibold text-lg hover:underline">{goal.title}</h3>
              </Link>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {goal.isPaused ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResume?.(goal.id)}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPause?.(goal.id)}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{goal.completionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">Completion Rate</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              {goal.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Current Streak</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{goal.frequencyPerWeek}x</div>
            <div className="text-xs text-muted-foreground mt-1">Per Week</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Clock className="h-5 w-5" />
              {goal.durationMinutes}m
            </div>
            <div className="text-xs text-muted-foreground mt-1">Duration</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{goal.completionRate}%</span>
          </div>
          <Progress value={goal.completionRate} className="h-2" />
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Longest streak: <span className="font-medium">{goal.longestStreak} days</span>
          </div>
          <Link href={`/app/goals/${goal.id}`}>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});
