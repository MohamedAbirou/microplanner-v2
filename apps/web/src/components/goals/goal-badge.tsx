'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GoalBadgeProps {
  goal: {
    emoji: string;
    title: string;
    color?: string;
  };
  className?: string;
}

export function GoalBadge({ goal, className }: GoalBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('flex items-center gap-1', className)}
      style={{
        borderColor: goal.color,
        color: goal.color,
      }}
    >
      <span>{goal.emoji}</span>
      <span>{goal.title}</span>
    </Badge>
  );
}
