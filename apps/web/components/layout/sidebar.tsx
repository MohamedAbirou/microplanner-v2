'use client';

/**
 * SLEEK Dashboard Sidebar
 * - Compact width (14rem = 224px, not 256px)
 * - Small icons and text
 * - Smooth animations
 * - Professional spacing
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Calendar,
  FolderKanban,
  BarChart3,
  Settings,
  CreditCard,
  Zap,
} from 'lucide-react';
import { cn } from '@microplanner/ui';
import { Badge } from '@microplanner/ui';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Plans',
    href: '/plans',
    icon: Calendar,
    badge: 'AI',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-56 flex-col border-r border-dark-border-primary bg-dark-bg-secondary">
      {/* Logo - Compact */}
      <div className="flex h-14 items-center px-4 border-b border-dark-border-primary">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-brand group-hover:shadow-glow-blue transition-shadow duration-250">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold font-display text-gradient">
            MicroPlanner
          </span>
        </Link>
      </div>

      {/* Navigation - Compact spacing */}
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow-brand'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="accent" className="text-xs px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation - Compact */}
      <div className="space-y-0.5 px-2 py-3 border-t border-dark-border-primary">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow-brand'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Profile - Compact */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-t border-dark-border-primary bg-dark-bg-tertiary">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8', // Smaller avatar
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-dark-text-primary truncate">User</p>
          <p className="text-xs text-dark-text-tertiary truncate">Free Plan</p>
        </div>
      </div>
    </div>
  );
}
