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
  Clock,
  Crown,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { UpgradeButton } from '@/components/upgrade-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  hotkey?: string;
}

const primaryNav: NavItem[] = [
  { label: 'Today', href: '/dashboard', icon: CalendarDays, hotkey: '1' },
  { label: 'Day', href: '/day', icon: Clock, hotkey: 'D' },
  { label: 'Week', href: '/week', icon: Calendar, hotkey: '2' },
  { label: 'Month', href: '/month', icon: Calendar, hotkey: 'M' },
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
  STARTER: { color: 'bg-blue-500', icon: Zap, label: 'Starter' },
  PRO: { color: 'bg-purple-500', icon: TrendingUp, label: 'Pro' },
  PREMIUM: { color: 'bg-amber-500', icon: Crown, label: 'Premium' },
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userTier?: 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';
}

export function AppSidebar({ collapsed, onToggle, userTier = 'FREE' }: AppSidebarProps) {
  const pathname = usePathname();
  const tierInfo = tierConfig[userTier];
  const TierIcon = tierInfo.icon;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r bg-gradient-to-b from-background via-background to-muted/20 transition-all duration-300 ease-in-out z-40 flex flex-col',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo/Brand Header */}
      <div className="flex h-14 items-center border-b border-border/40 px-4 justify-between backdrop-blur-sm bg-background/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              MicroPlanner
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 hover:bg-accent/50 transition-colors "
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Tier Badge */}
      {!collapsed && (
        <div className="mx-4 my-3">
          <div className={cn(
            "relative overflow-hidden rounded-lg p-3 border border-border/50",
            "bg-gradient-to-br from-accent/50 to-accent/20"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-md", tierInfo.color)}>
                <TierIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">{tierInfo.label} Plan</p>
                <p className="text-[10px] text-muted-foreground">Active subscription</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="mb-4">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </p>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    "group-hover:scale-110"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.hotkey && (
                        <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
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
        </div>

        {/* Secondary Navigation */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tools
            </p>
          )}
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    isActive
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    "group-hover:scale-110"
                  )} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.hotkey && (
                        <kbd className="hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
                          {item.hotkey}
                        </kbd>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (userTier === 'FREE' || userTier === 'STARTER') && (
        <div className="p-4 border-t border-border/40">
          <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Upgrade to {userTier === 'FREE' ? 'Starter' : 'Pro'}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Unlock {userTier === 'FREE' ? 'more goals & plans' : 'AI Sonnet 3.5 & unlimited plans'}
              </p>
              <UpgradeButton
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
                size="sm"
                targetTier={userTier === 'FREE' ? 'STARTER' : 'PRO'}
              >
                Upgrade Now
              </UpgradeButton>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
