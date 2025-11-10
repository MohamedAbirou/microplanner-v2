'use client';

/**
 * SLEEK Dashboard Stats Cards
 * - Small, compact cards
 * - Professional metrics
 * - Smooth animations
 */

import { Target, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@microplanner/ui';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  stats: {
    activeGoalsCount: number;
    tasksTodayCount: number;
    tasksCompletedToday: number;
    completionRate: number;
    weeklyPlansCount: number;
    productivityScore?: number;
    currentStreak: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Active Goals',
      value: stats.activeGoalsCount,
      icon: Target,
      color: 'primary',
      bgColor: 'bg-primary-600/10',
      textColor: 'text-primary-400',
    },
    {
      title: 'Tasks Today',
      value: `${stats.tasksCompletedToday}/${stats.tasksTodayCount}`,
      icon: CheckCircle2,
      color: 'accent',
      bgColor: 'bg-accent-600/10',
      textColor: 'text-accent-400',
    },
    {
      title: 'Completion',
      value: `${Math.round(stats.completionRate)}%`,
      icon: TrendingUp,
      color: 'success',
      bgColor: 'bg-success/10',
      textColor: 'text-success',
    },
    {
      title: 'Streak',
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'warning',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Card className="glass-card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-dark-text-secondary">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-dark-text-primary">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
