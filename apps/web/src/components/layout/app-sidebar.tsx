'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { UpgradeButton } from '@/components/upgrade-button';
import { useTier, type UserTier } from '@/contexts/tier-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  hotkey?: string;
}

const calendarPaths = ['/week', '/day', '/month'];

const primaryNav: NavItem[] = [
  { label: 'Today', href: '/dashboard', icon: CalendarDays, hotkey: '1' },
  { label: 'Week', href: '/week', icon: Calendar, hotkey: '2' },
  { label: 'Goals', href: '/goals', icon: Target, hotkey: '3' },
  { label: 'Plans', href: '/plans', icon: Sparkles, hotkey: '4' },
];

const secondaryNav: NavItem[] = [
  { label: 'Search', href: '/search', icon: Search, hotkey: '/' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const tierConfig = {
  FREE: { color: 'bg-slate-500', icon: CheckCircle2, label: 'Free' },
  STARTER: { color: 'bg-primary-500', icon: Zap, label: 'Starter' },
  PRO: { color: 'bg-secondary-600', icon: TrendingUp, label: 'Pro' },
  PREMIUM: { color: 'bg-amber-500', icon: Crown, label: 'Premium' },
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { tier: userTier } = useTier();
  const pathname = usePathname();
  const tierInfo = tierConfig[userTier];
  const TierIcon = tierInfo.icon;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-border bg-card transition-all duration-300 ease-in-out z-40 flex flex-col p-3',
        collapsed ? 'w-[72px]' : 'w-[236px]'
      )}
    >
      {/* Logo/Brand Header */}
      <div className={cn('flex items-center gap-2 px-1 pb-3.5', collapsed ? 'justify-center' : 'justify-between')}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-none rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-[15px] tracking-tight truncate">MicroPlanner</span>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 flex-none text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      {collapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 mx-auto mb-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Primary Navigation */}
      <nav className="flex flex-col gap-0.5 mt-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/week'
              ? calendarPaths.some(
                  (path) => pathname === path || pathname.startsWith(path + '/')
                )
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hotkey && (
                      <kbd className="hidden xl:inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {item.hotkey}
                      </kbd>
                    )}
                    {item.badge !== undefined && (
                      <Badge variant="secondary" className="h-5 min-w-[20px] justify-center px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}

        <div className="my-2 border-t border-border/60" />

        {secondaryNav
          .filter((item) => item.label !== 'Settings')
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5">
        <Link href="/settings">
          <div
            className={cn(
              'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
              pathname === '/settings' || pathname.startsWith('/settings/')
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            <Settings className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span className="flex-1 truncate">Settings</span>}
          </div>
        </Link>

        {/* Tier / Upgrade card */}
        {!collapsed && (userTier === 'FREE' || userTier === 'STARTER') && (
          <div className="mt-2.5 rounded-xl border border-border bg-accent p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground">
              <TierIcon className="h-3.5 w-3.5" />
              {tierInfo.label} plan
            </div>
            <p className="mt-0.5 mb-2.5 text-[11px] text-muted-foreground leading-relaxed">
              Unlock {userTier === 'FREE' ? 'more goals & plans' : 'AI Sonnet 3.5 & unlimited plans'}
            </p>
            <UpgradeButton
              className="w-full h-[30px] text-xs font-semibold"
              size="sm"
              targetTier={userTier === 'FREE' ? 'STARTER' : 'PRO'}
            >
              Upgrade
            </UpgradeButton>
          </div>
        )}
      </div>
    </aside>
  );
}
