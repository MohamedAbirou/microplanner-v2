'use client';

import { cn } from '@/lib/utils';

export type CalendarView = 'day' | 'week' | 'month';

interface CalendarViewSwitcherProps {
  value: CalendarView;
  onChange: (view: CalendarView) => void;
  className?: string;
}

const views: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export function CalendarViewSwitcher({ value, onChange, className }: CalendarViewSwitcherProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-[9px] border border-border bg-card p-[3px]',
        className
      )}
      role="tablist"
      aria-label="Calendar view"
    >
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          role="tab"
          aria-selected={value === view.value}
          onClick={() => onChange(view.value)}
          className={cn(
            'h-7 rounded-md px-3 text-xs font-medium transition-colors',
            value === view.value
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
