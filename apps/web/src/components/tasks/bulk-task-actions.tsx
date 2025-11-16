'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Trash2,
  Calendar,
  Tag,
  Target,
  Flag,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BulkTaskActionsProps {
  selectedCount: number;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onDelete?: () => void;
  onReschedule?: () => void;
  onChangePriority?: (priority: number) => void;
  onChangeGoal?: () => void;
  onAddTag?: () => void;
  onClearSelection: () => void;
  className?: string;
}

export function BulkTaskActions({
  selectedCount,
  onComplete,
  onUncomplete,
  onDelete,
  onReschedule,
  onChangePriority,
  onChangeGoal,
  onAddTag,
  onClearSelection,
  className,
}: BulkTaskActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-background border rounded-lg shadow-lg p-4',
        'flex items-center gap-3 animate-in slide-in-from-bottom-5',
        className
      )}
    >
      {/* Selection Count */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {onComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden md:inline">Complete</span>
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {onComplete && (
              <DropdownMenuItem onClick={onComplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Complete
              </DropdownMenuItem>
            )}

            {onUncomplete && (
              <DropdownMenuItem onClick={onUncomplete}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Incomplete
              </DropdownMenuItem>
            )}

            {onReschedule && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onReschedule}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Reschedule
                </DropdownMenuItem>
              </>
            )}

            {onChangePriority && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onChangePriority(1)}>
                  <Flag className="mr-2 h-4 w-4 text-red-500" />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePriority(2)}>
                  <Flag className="mr-2 h-4 w-4 text-yellow-500" />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangePriority(3)}>
                  <Flag className="mr-2 h-4 w-4 text-blue-500" />
                  Low
                </DropdownMenuItem>
              </>
            )}

            {onChangeGoal && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onChangeGoal}>
                  <Target className="mr-2 h-4 w-4" />
                  Change Goal
                </DropdownMenuItem>
              </>
            )}

            {onAddTag && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onAddTag}>
                  <Tag className="mr-2 h-4 w-4" />
                  Add Tags
                </DropdownMenuItem>
              </>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
