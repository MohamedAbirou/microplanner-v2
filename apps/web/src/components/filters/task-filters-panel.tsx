'use client';

import * as React from 'react';
import { X, Filter, Search, Calendar, Flag, Repeat, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { TaskFilters, getActiveFilterCount, clearAllFilters } from '@/lib/filters';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskFiltersPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  goals?: Array<{ id: string; title: string; emoji?: string }>;
  availableTags?: string[];
}

export function TaskFiltersPanel({
  filters,
  onFiltersChange,
  goals = [],
  availableTags = [],
}: TaskFiltersPanelProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const activeFilterCount = getActiveFilterCount(filters);

  const handleClearAll = () => {
    onFiltersChange(clearAllFilters());
  };

  const toggleGoalFilter = (goalId: string) => {
    const currentGoals = filters.goalIds || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(id => id !== goalId)
      : [...currentGoals, goalId];

    onFiltersChange({
      ...filters,
      goalIds: newGoals.length > 0 ? newGoals : undefined,
    });
  };

  const togglePriorityFilter = (priority: number) => {
    const currentPriorities = filters.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];

    onFiltersChange({
      ...filters,
      priorities: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const toggleTagFilter = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  return (
    <>
      {/* Search Bar (always visible) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {isMobile ? (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="default" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Filter Tasks</DrawerTitle>
                <DrawerDescription>
                  Narrow down your tasks with advanced filters
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-6 px-4 pb-8 overflow-y-auto">
              {/* Active Filters Count */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleClearAll}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Completion Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Status
                </Label>
                <Select
                  value={filters.completed === undefined || filters.completed === 'all' ? 'all' : filters.completed ? 'completed' : 'incomplete'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      completed: value === 'all' ? 'all' : value === 'completed',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="incomplete">Incomplete only</SelectItem>
                    <SelectItem value="completed">Completed only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Goals Filter */}
              {goals.length > 0 && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Goals
                    </Label>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal.id}`}
                            checked={filters.goalIds?.includes(goal.id)}
                            onCheckedChange={() => toggleGoalFilter(goal.id)}
                          />
                          <label
                            htmlFor={`goal-${goal.id}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                          >
                            {goal.emoji && <span>{goal.emoji}</span>}
                            <span>{goal.title}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Priority Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'High' },
                    { value: 2, label: 'Medium' },
                    { value: 3, label: 'Low' },
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={filters.priorities?.includes(priority.value)}
                        onCheckedChange={() => togglePriorityFilter(priority.value)}
                      />
                      <label
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {priority.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recurring Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring Tasks
                </Label>
                <Select
                  value={filters.recurring === undefined || filters.recurring === 'all' ? 'all' : filters.recurring ? 'recurring' : 'one-time'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      recurring: value === 'all' ? 'all' : value === 'recurring',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="recurring">Recurring only</SelectItem>
                    <SelectItem value="one-time">One-time only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Duration Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </Label>
                <Select
                  value={filters.hasDuration === undefined || filters.hasDuration === 'all' ? 'all' : filters.hasDuration ? 'with-duration' : 'no-duration'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      hasDuration: value === 'all' ? 'all' : value === 'with-duration',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="with-duration">With duration</SelectItem>
                    <SelectItem value="no-duration">No duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="default" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Tasks</SheetTitle>
                <SheetDescription>
                  Narrow down your tasks with advanced filters
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
              {/* Active Filters Count */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleClearAll}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Completion Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Status
                </Label>
                <Select
                  value={filters.completed === undefined || filters.completed === 'all' ? 'all' : filters.completed ? 'completed' : 'incomplete'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      completed: value === 'all' ? 'all' : value === 'completed',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="incomplete">Incomplete only</SelectItem>
                    <SelectItem value="completed">Completed only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Goals Filter */}
              {goals.length > 0 && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Goals
                    </Label>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal.id}`}
                            checked={filters.goalIds?.includes(goal.id)}
                            onCheckedChange={() => toggleGoalFilter(goal.id)}
                          />
                          <label
                            htmlFor={`goal-${goal.id}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                          >
                            {goal.emoji && <span>{goal.emoji}</span>}
                            <span>{goal.title}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Priority Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'High' },
                    { value: 2, label: 'Medium' },
                    { value: 3, label: 'Low' },
                  ].map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority.value}`}
                        checked={filters.priorities?.includes(priority.value)}
                        onCheckedChange={() => togglePriorityFilter(priority.value)}
                      />
                      <label
                        htmlFor={`priority-${priority.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {priority.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recurring Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Recurring Tasks
                </Label>
                <Select
                  value={filters.recurring === undefined || filters.recurring === 'all' ? 'all' : filters.recurring ? 'recurring' : 'one-time'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      recurring: value === 'all' ? 'all' : value === 'recurring',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="recurring">Recurring only</SelectItem>
                    <SelectItem value="one-time">One-time only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Duration Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </Label>
                <Select
                  value={filters.hasDuration === undefined || filters.hasDuration === 'all' ? 'all' : filters.hasDuration ? 'with-duration' : 'no-duration'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      hasDuration: value === 'all' ? 'all' : value === 'with-duration',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tasks</SelectItem>
                    <SelectItem value="with-duration">With duration</SelectItem>
                    <SelectItem value="no-duration">No duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        )}
      </div>

      {/* Active Filter Tags (below search) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Filters:</span>

          {filters.completed !== undefined && filters.completed !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.completed ? 'Completed' : 'Incomplete'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, completed: 'all' })}
              />
            </Badge>
          )}

          {filters.goalIds?.map((goalId) => {
            const goal = goals.find(g => g.id === goalId);
            return goal ? (
              <Badge key={goalId} variant="secondary" className="gap-1">
                {goal.emoji} {goal.title}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleGoalFilter(goalId)}
                />
              </Badge>
            ) : null;
          })}

          {filters.priorities?.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => togglePriorityFilter(priority)}
              />
            </Badge>
          ))}

          {filters.recurring !== undefined && filters.recurring !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.recurring ? 'Recurring' : 'One-time'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, recurring: 'all' })}
              />
            </Badge>
          )}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleTagFilter(tag)}
              />
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </>
  );
}
