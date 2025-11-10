'use client';

import Link from 'next/link';
import { Sparkles, Target, Plus, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  variant: 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'WARNING';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap: Record<string, any> = {
  Sparkles,
  Target,
  Plus,
  Calendar,
  BarChart3,
};

const variantStyles = {
  PRIMARY: {
    bg: 'bg-gradient-brand',
    text: 'text-white',
    shadow: 'shadow-glow-brand',
    hover: 'hover:shadow-glow-brand/80',
  },
  SECONDARY: {
    bg: 'bg-dark-bg-hover',
    text: 'text-dark-text-primary',
    shadow: '',
    hover: 'hover:bg-dark-bg-tertiary',
  },
  SUCCESS: {
    bg: 'bg-success/20',
    text: 'text-success',
    shadow: '',
    hover: 'hover:bg-success/30',
  },
  WARNING: {
    bg: 'bg-warning/20',
    text: 'text-warning',
    shadow: '',
    hover: 'hover:bg-warning/30',
  },
};

export function QuickActions({ actions }: QuickActionsProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] || Sparkles;
          const styles = variantStyles[action.variant] || variantStyles.SECONDARY;

          return (
            <Link
              key={action.id}
              href={action.action}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg transition-all duration-250 active:scale-95',
                styles.bg,
                styles.text,
                styles.shadow,
                styles.hover
              )}
            >
              <div className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{action.title}</p>
                <p className={cn(
                  'text-sm truncate',
                  action.variant === 'PRIMARY' ? 'text-white/80' : 'text-dark-text-tertiary'
                )}>
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
