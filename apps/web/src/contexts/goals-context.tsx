'use client';

import * as React from 'react';
import { useGoalsList } from '@/hooks/use-graphql';

interface GoalsContextValue {
  goals: ReturnType<typeof useGoalsList>['goals'];
  loading: boolean;
  refetch: ReturnType<typeof useGoalsList>['refetch'];
}

const GoalsContext = React.createContext<GoalsContextValue | undefined>(undefined);

/** Single app-wide goals query — layout fetches once, pages read from context. */
export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { goals, loading, refetch } = useGoalsList();

  const value = React.useMemo(
    () => ({ goals, loading, refetch }),
    [goals, loading, refetch]
  );

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

export function useAppGoals() {
  const context = React.useContext(GoalsContext);
  if (!context) {
    throw new Error('useAppGoals must be used within GoalsProvider');
  }
  return context;
}
