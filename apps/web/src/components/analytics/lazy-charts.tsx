'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading fallback component
const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </div>
);

// Dynamically import chart components with loading states
export const WeeklyCompletionChart = dynamic(
  () => import('./charts/weekly-completion-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const GoalDistributionChart = dynamic(
  () => import('./charts/goal-distribution-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const ProductivityHoursChart = dynamic(
  () => import('./charts/productivity-hours-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const StreakChart = dynamic(() => import('./charts/streak-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
