'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyzeWorkload, formatHours, type PlanTaskLike, type WorkHoursSchedule } from '@/lib/workload';

interface WorkloadWarningProps {
  tasks: PlanTaskLike[];
  schedule?: WorkHoursSchedule | null;
}

/**
 * Capacity check for a proposed plan: total scheduled hours vs. available
 * working hours. Warns when any day (or the week) is overcommitted and points
 * at the lowest-priority tasks to trim. Renders nothing useful until a
 * work-hours schedule is available (capacity would otherwise be zero).
 */
export function WorkloadWarning({ tasks, schedule }: WorkloadWarningProps) {
  const analysis = React.useMemo(() => analyzeWorkload(tasks, schedule), [tasks, schedule]);

  // No capacity signal yet (work hours not configured) — skip silently.
  if (analysis.totalCapacityMinutes === 0) return null;

  const overcommitted = analysis.overcommittedDays.length > 0;

  if (!overcommitted) {
    return (
      <Card className="rounded-[14px] border-emerald-300 bg-emerald-50 shadow-[var(--sh-sm)] dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-none" />
          <div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
              This plan fits your available time
            </p>
            <p className="text-[13px] text-emerald-800/80 dark:text-emerald-300/70">
              {formatHours(analysis.totalScheduledMinutes)} scheduled of{' '}
              {formatHours(analysis.totalCapacityMinutes)} available ({analysis.utilization}%
              capacity)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overMinutes = analysis.days.reduce((s, d) => s + d.overBy, 0);

  return (
    <Card className="rounded-[14px] border-amber-300 bg-amber-50 shadow-[var(--sh-sm)] dark:border-amber-900/50 dark:bg-amber-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px] text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5" />
          You&apos;re overcommitted by {formatHours(overMinutes)}
        </CardTitle>
        <CardDescription className="text-[13px] text-amber-800/80 dark:text-amber-300/70">
          {analysis.overcommittedDays.length} day
          {analysis.overcommittedDays.length === 1 ? '' : 's'} schedule more work than your working
          hours allow. Consider trimming or moving the tasks below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Per-day utilization */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {analysis.days.map((d) => (
            <div
              key={d.date}
              className="rounded-[10px] border border-amber-200 bg-background/60 p-2.5 dark:border-amber-900/40"
            >
              <div className="text-xs font-medium">{d.label}</div>
              <div className="text-[13px] text-muted-foreground">
                {formatHours(d.scheduledMinutes)} / {formatHours(d.capacityMinutes)}
              </div>
              <Badge
                variant={d.overBy > 0 ? 'destructive' : 'secondary'}
                className="mt-1 text-[11px]"
              >
                {d.utilization >= 999 ? 'no work time' : `${d.utilization}%`}
              </Badge>
            </div>
          ))}
        </div>

        {/* Trim suggestions */}
        {analysis.trimSuggestions.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-900/70 dark:text-amber-300/70 mb-1.5">
              Suggested to trim (lowest priority first)
            </div>
            <div className="space-y-1.5">
              {analysis.trimSuggestions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-[8px] border border-amber-200 bg-background/60 px-3 py-2 dark:border-amber-900/40"
                >
                  <span className="text-base">{t.goal?.emoji ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.durationMinutes}m
                      {t.goal?.title ? ` · ${t.goal.title}` : ''}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px]">
                    {t.priority === 1 ? 'High' : t.priority === 3 ? 'Low' : 'Medium'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
