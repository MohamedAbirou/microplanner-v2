'use client';

/**
 * SLEEK Quick Actions Component
 * - Compact action cards
 * - Small, readable buttons
 * - Professional icons
 */

import { Button } from '@microplanner/ui';
import { Plus, Calendar, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  plus: Plus,
  calendar: Calendar,
  target: Target,
  zap: Zap,
};

export function QuickActions({ actions }: QuickActionsProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const Icon = iconMap[action.icon.toLowerCase()] || Plus;

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Link href={action.action}>
              <Button
                variant={action.variant === 'PRIMARY' ? 'default' : 'secondary'}
                className="w-full h-auto py-3 px-4 flex-col items-start gap-2"
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="text-xs opacity-80 font-normal">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
