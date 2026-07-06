'use client';

import { NotificationsCenter } from '@/components/notifications-center';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTier } from '@/contexts/tier-context';
import { useUpgradeCheckout } from '@/hooks/use-upgrade-checkout';
import { formatTierLabel } from '@/lib/upgrade';
import { getInitials } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Command, HelpCircle, LogOut, Menu, Plus, Settings as SettingsIcon, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
  onMenuClick: () => void;
  onCommandClick: () => void;
  onQuickAddClick: () => void;
}

export function AppHeader({ onMenuClick, onCommandClick, onQuickAddClick }: AppHeaderProps) {
  const { user } = useUser();
  const { tier } = useTier();
  const { upgrade, loading: upgradeLoading } = useUpgradeCheckout();

  const tierColors = {
    FREE: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    STARTER: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    PRO: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    PREMIUM: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background/80">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Menu (mobile) */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-accent/50"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Quick Add Task */}
          <Button
            variant="default"
            size="sm"
            onClick={onQuickAddClick}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>

          {/* Command Palette Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCommandClick}
            className="hidden md:flex border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
          >
            <Command className="h-4 w-4 mr-2" />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Notifications */}
          <NotificationsCenter />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                    {getInitials(user?.fullName || 'U')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`w-fit ${tierColors[tier as keyof typeof tierColors] || tierColors.FREE}`}
                  >
                    {tier} Plan
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              {(tier === 'FREE' || tier === 'STARTER') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer bg-gradient-to-r from-primary/5 to-primary/10 text-primary font-medium"
                    disabled={upgradeLoading}
                    onSelect={(e) => {
                      e.preventDefault();
                      upgrade();
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {upgradeLoading
                      ? 'Redirecting…'
                      : `Upgrade to ${formatTierLabel(tier === 'FREE' ? 'STARTER' : 'PRO')}`}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
