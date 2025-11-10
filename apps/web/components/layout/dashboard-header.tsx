'use client';

/**
 * SLEEK Dashboard Header
 * - Compact height (h-14 instead of h-16)
 * - Small search bar
 * - Minimal spacing
 */

import { Search, Bell, Menu } from 'lucide-react';
import { Button, Input, Badge } from '@microplanner/ui';
import { useState } from 'react';

export function DashboardHeader() {
  const [notificationCount] = useState(3);

  return (
    <header className="flex h-14 items-center justify-between border-b border-dark-border-primary bg-dark-bg-secondary px-4">
      {/* Left - Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-text-tertiary" />
          <Input
            type="search"
            placeholder="Search goals, tasks, plans..."
            className="pl-9 h-8 text-sm bg-dark-bg-tertiary border-dark-border-primary"
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <Badge
              variant="error"
              className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* Mobile Menu */}
        <Button variant="ghost" size="icon-sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
