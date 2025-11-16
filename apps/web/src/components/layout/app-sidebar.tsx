'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Calendar,
  Target,
  Sparkles,
  Search,
  Command,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  hotkey?: string;
}

const primaryNav: NavItem[] = [
  { label: 'Today', href: '/app/dashboard', icon: CalendarDays, hotkey: '1' },
  { label: 'Week', href: '/app/week', icon: Calendar, hotkey: '2' },
  { label: 'Goals', href: '/app/goals', icon: Target, hotkey: '3' },
  { label: 'Plans', href: '/app/plans', icon: Sparkles, hotkey: '4' },
];

const secondaryNav: NavItem[] = [
  { label: 'Search', href: '/app/search', icon: Search, hotkey: '/' },
  { label: 'Command', href: '#', icon: Command, hotkey: 'K' },
];

const tertiaryNav: NavItem[] = [
  { label: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/app/settings', icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userTier?: 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';
}

export function AppSidebar({ collapsed, onToggle, userTier = 'FREE' }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r bg-background transition-all duration-300 ease-in-out z-40',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-14 items-center border-b px-4 justify-between">
        {!collapsed && <span className="font-semibold text-lg">MicroPlanner</span>}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Primary Nav */}
      <nav className="space-y-1 p-2 mt-2">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                  isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge variant="secondary" className="h-5 min-w-[20px] justify-center p-0 px-1">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-2 my-2">
        <Separator />
      </div>

      {/* Secondary Nav */}
      <nav className="space-y-1 p-2">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                  isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-2 my-2">
        <Separator />
      </div>

      {/* Tertiary Nav */}
      <nav className="space-y-1 p-2">
        {tertiaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                  isActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA (Free/Starter users only) */}
      {!collapsed && (userTier === 'FREE' || userTier === 'STARTER') && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="border-2 border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Unlock Claude Sonnet 3.5 AI
              </p>
              <Button className="w-full" size="sm">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </aside>
  );
}
