'use client';

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
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

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
    name: 'Weekly Plans',
    href: '/plans',
    icon: Calendar,
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
    <div className="flex h-full w-64 flex-col bg-dark-bg-primary border-r border-dark-border-primary">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-dark-border-primary">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-glow-brand">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display text-gradient">
            MicroPlanner
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow-brand'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="space-y-1 px-3 py-4 border-t border-dark-border-primary">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-gradient-brand text-white shadow-glow-brand'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-dark-border-primary">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark-text-primary truncate">User</p>
          <p className="text-xs text-dark-text-tertiary truncate">Free Plan</p>
        </div>
      </div>
    </div>
  );
}
