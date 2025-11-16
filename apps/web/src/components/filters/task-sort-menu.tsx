'use client';

import * as React from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskSort, SORT_PRESETS } from '@/lib/filters';

interface TaskSortMenuProps {
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
}

const SORT_OPTIONS = [
  { label: 'Date (Earliest first)', value: SORT_PRESETS.DATE_ASC, group: 'Date' },
  { label: 'Date (Latest first)', value: SORT_PRESETS.DATE_DESC, group: 'Date' },
  { label: 'Priority (High to Low)', value: SORT_PRESETS.PRIORITY_HIGH_FIRST, group: 'Priority' },
  { label: 'Priority (Low to High)', value: SORT_PRESETS.PRIORITY_LOW_FIRST, group: 'Priority' },
  { label: 'Title (A to Z)', value: SORT_PRESETS.TITLE_A_Z, group: 'Title' },
  { label: 'Title (Z to A)', value: SORT_PRESETS.TITLE_Z_A, group: 'Title' },
  { label: 'Duration (Shortest first)', value: SORT_PRESETS.DURATION_SHORTEST, group: 'Duration' },
  { label: 'Duration (Longest first)', value: SORT_PRESETS.DURATION_LONGEST, group: 'Duration' },
  { label: 'Created (Oldest first)', value: SORT_PRESETS.CREATED_OLDEST, group: 'Created' },
  { label: 'Created (Newest first)', value: SORT_PRESETS.CREATED_NEWEST, group: 'Created' },
];

export function TaskSortMenu({ sort, onSortChange }: TaskSortMenuProps) {
  const currentSort = SORT_OPTIONS.find(
    option => option.value.field === sort.field && option.value.direction === sort.direction
  );

  const groupedOptions = SORT_OPTIONS.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = [];
    }
    acc[option.group].push(option);
    return acc;
  }, {} as Record<string, typeof SORT_OPTIONS>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort: {currentSort?.label.split('(')[0].trim() || 'Default'}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(groupedOptions).map(([group, options], groupIndex) => (
          <React.Fragment key={group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            {options.map((option) => {
              const isActive =
                sort.field === option.value.field &&
                sort.direction === option.value.direction;

              return (
                <DropdownMenuItem
                  key={option.label}
                  onClick={() => onSortChange(option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {isActive && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
