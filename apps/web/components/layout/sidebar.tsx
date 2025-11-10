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
    <div className="flex h-full w-64 flex-col bg-neutral-950 border-r border-neutral-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
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
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="space-y-1 px-3 py-4 border-t border-neutral-800">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-neutral-800">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
            },
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">User</p>
          <p className="text-xs text-neutral-500 truncate">Free Plan</p>
        </div>
      </div>
    </div>
  );
}
