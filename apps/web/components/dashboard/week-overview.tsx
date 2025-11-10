'use client';

/**
 * SLEEK Week Overview Component
 * - Compact bar chart
 * - Small, readable metrics
 * - Professional visualization
 */

import { Card, CardContent, CardHeader, CardTitle } from '@microplanner/ui';
import { Progress } from '@microplanner/ui';
import { DAYS_OF_WEEK } from '@microplanner/utils';
import { motion } from 'framer-motion';

interface WeekDay {
  date: string;
  dayOfWeek: number;
  tasksScheduled: number;
  tasksCompleted: number;
  totalDuration: number;
  productivity: number;
}

interface WeekOverviewProps {
  weekData: WeekDay[];
}

export function WeekOverview({ weekData }: WeekOverviewProps) {
  if (!weekData || weekData.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Week Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weekData.map((day, index) => {
            const completionRate =
              day.tasksScheduled > 0
                ? (day.tasksCompleted / day.tasksScheduled) * 100
                : 0;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-text-secondary font-medium">
                    {DAYS_OF_WEEK[day.dayOfWeek].slice(0, 3)}
                  </span>
                  <span className="text-dark-text-tertiary">
                    {day.tasksCompleted}/{day.tasksScheduled} tasks
                  </span>
                </div>
                <Progress value={completionRate} className="h-1.5" />
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Summary */}
        <div className="mt-4 pt-4 border-t border-dark-border-primary">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-dark-text-tertiary">Scheduled</p>
              <p className="text-sm font-semibold text-dark-text-primary mt-0.5">
                {weekData.reduce((sum, day) => sum + day.tasksScheduled, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-text-tertiary">Completed</p>
              <p className="text-sm font-semibold text-success mt-0.5">
                {weekData.reduce((sum, day) => sum + day.tasksCompleted, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-text-tertiary">Rate</p>
              <p className="text-sm font-semibold text-primary-400 mt-0.5">
                {Math.round(
                  (weekData.reduce((sum, day) => sum + day.tasksCompleted, 0) /
                    Math.max(weekData.reduce((sum, day) => sum + day.tasksScheduled, 0), 1)) *
                    100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
