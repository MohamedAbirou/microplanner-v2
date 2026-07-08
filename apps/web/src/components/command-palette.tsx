'use client';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Circle,
    Plus,
    Settings,
    Sparkles,
    Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useGoals, useTasks } from '@/hooks/use-graphql';
import { subDays, endOfDay } from 'date-fns';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickAddClick?: () => void;
}

export function CommandPalette({ open, onOpenChange, onQuickAddClick }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const { goals } = useGoals();
  const { tasks } = useTasks(
    open
      ? {
          dateRange: {
            start: subDays(new Date(), 30),
            end: endOfDay(new Date()),
          },
        }
      : undefined,
    undefined,
    { take: 15, skipQuery: !open }
  );

  // Handle command selection
  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  // Keyboard shortcut effect
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Navigation commands
  const navigationCommands = [
    { icon: Calendar, label: 'Go to Today', action: () => router.push('/today'), shortcut: 'G then T' },
    { icon: Calendar, label: 'Go to Calendar (Week)', action: () => router.push('/week'), shortcut: 'W' },
    { icon: Calendar, label: 'Go to Day View', action: () => router.push('/week?view=day') },
    { icon: Calendar, label: 'Go to Month View', action: () => router.push('/week?view=month'), shortcut: 'M' },
    { icon: Target, label: 'Go to Goals', action: () => router.push('/goals'), shortcut: 'G then G' },
    { icon: Sparkles, label: 'Go to Plans', action: () => router.push('/plans'), shortcut: 'G then P' },
    { icon: BarChart3, label: 'Go to Analytics', action: () => router.push('/analytics'), shortcut: 'G then A' },
    { icon: Settings, label: 'Go to Settings', action: () => router.push('/settings'), shortcut: 'G then S' },
  ];

  // Action commands
  const actionCommands = [
    { icon: Plus, label: 'Create New Task', action: () => onQuickAddClick?.(), shortcut: 'N' },
    { icon: Target, label: 'Create New Goal', action: () => router.push('/goals/new') },
    { icon: Sparkles, label: 'Generate Weekly Plan', action: () => router.push('/plans/generate'), shortcut: 'P' },
  ];

  // Recent items — real goals and tasks from the user's data (no mock ids).
  const recentGoals = (goals ?? []).slice(0, 3).map((goal: any) => ({
    icon: Target,
    label: goal.title,
    type: 'Goal',
    action: () => router.push(`/goals/${goal.id}`),
  }));
  const recentTasks = (tasks ?? []).slice(0, 3).map((task: any) => ({
    icon: task.isCompleted ? CheckCircle2 : Circle,
    label: task.title,
    type: 'Task',
    action: () => router.push('/tasks'),
  }));
  const recentItems = [...recentGoals, ...recentTasks];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recent Items */}
        {!search && recentItems.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={index}
                    onSelect={() => runCommand(item.action)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{item.type}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navigationCommands.map((item, index) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={index}
                onSelect={() => runCommand(item.action)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          {actionCommands.map((item, index) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={index}
                onSelect={() => runCommand(item.action)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
