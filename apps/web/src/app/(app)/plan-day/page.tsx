'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import {
  Sunrise,
  Moon,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ListTodo,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTasksList, useUpdateTask } from '@/hooks/use-graphql';
import { PmImportSection } from '@/components/plan-day/pm-import-section';
import {
  DayTimeboxCalendar,
  type TimeboxUpdate,
} from '@/components/plan-day/day-timebox-calendar';
import { timeToMinutes } from '@/lib/calendar-utils';
import {
  getDailyIntention,
  setDailyIntention,
  getDailyReflection,
  setDailyReflection,
  dateKey,
} from '@/lib/daily-ritual';
import { useDailyRitual, useUpdateDailyRitual } from '@/hooks/use-graphql-extended';

const STEPS = ['Review', 'Intention', 'Timebox', 'Confirm'];

export default function PlanDayPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<'plan' | 'shutdown'>('plan');
  const [step, setStep] = React.useState(0);
  const [busy, setBusy] = React.useState(false);

  const today = React.useMemo(() => new Date(), []);
  const yesterday = React.useMemo(() => subDays(today, 1), [today]);

  const { tasks: todayTasks, loading: todayLoading, refetch: refetchToday } = useTasksList(
    { dateRange: { start: startOfDay(today), end: endOfDay(today) } },
    undefined,
    { take: 80 }
  );
  const { tasks: yesterdayTasks, loading: yLoading, refetch: refetchYesterday } = useTasksList(
    { dateRange: { start: startOfDay(yesterday), end: endOfDay(yesterday) } },
    undefined,
    { take: 80 }
  );
  const { updateTask } = useUpdateTask({ notify: false });
  const { updateDailyRitual } = useUpdateDailyRitual();
  // Backend is the source of truth for the ritual; localStorage is only an
  // offline cache used until the query resolves (and as a PWA-offline fallback).
  const { ritual, loading: ritualLoading } = useDailyRitual(dateKey(today));

  const incompleteYesterday = React.useMemo(
    () => (yesterdayTasks || []).filter((t: any) => !t.isCompleted && !t.isSkipped),
    [yesterdayTasks]
  );

  // Which of yesterday's incomplete tasks to carry over (default: all).
  const [carryOver, setCarryOver] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    setCarryOver((prev) => {
      const next = { ...prev };
      for (const t of incompleteYesterday) {
        if (next[t.id] === undefined) next[t.id] = true;
      }
      return next;
    });
  }, [incompleteYesterday]);

  const [intention, setIntention] = React.useState('');
  const [reflection, setReflection] = React.useState('');
  // Hydrate once the ritual query settles: prefer backend values, fall back to
  // the localStorage cache (offline / not-yet-synced). Runs once so it never
  // clobbers what the user is actively typing.
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current || ritualLoading) return;
    hydrated.current = true;
    setIntention(ritual?.intention || getDailyIntention(today));
    setReflection(ritual?.reflection || getDailyReflection(today));
  }, [ritual, ritualLoading, today]);

  const totalMinutes = React.useMemo(
    () => (todayTasks || []).reduce((sum: number, t: any) => sum + (t.durationMinutes || 0), 0),
    [todayTasks]
  );
  const completedToday = React.useMemo(
    () => (todayTasks || []).filter((t: any) => t.isCompleted),
    [todayTasks]
  );

  const handleCarryOver = async () => {
    const ids = incompleteYesterday.filter((t: any) => carryOver[t.id]).map((t: any) => t.id);
    if (ids.length === 0) {
      setStep(1);
      return;
    }
    setBusy(true);
    try {
      const dateStr = format(today, 'yyyy-MM-dd');
      await Promise.all(
        ids.map((id: string) =>
          updateTask({ variables: { id, input: { scheduledDate: dateStr } } })
        )
      );
      await Promise.all([refetchToday(), refetchYesterday()]);
      toast.success(`Moved ${ids.length} task${ids.length > 1 ? 's' : ''} to today`);
      setStep(1);
    } catch {
      toast.error('Failed to move some tasks');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveIntention = () => {
    setDailyIntention(intention, today);
    // Persist cross-device (best-effort).
    void updateDailyRitual({ variables: { input: { date: dateKey(today), intention } } });
    setStep(2);
  };

  // Timeboxing persistence for the DnD calendar. UPDATE_TASK returns the changed
  // scalar fields, so Apollo patches the normalized Task in place — no refetch
  // storm. The calendar keeps its own optimistic state and rolls back on throw.
  const handleTimeboxUpdate = React.useCallback(
    async (taskId: string, input: TimeboxUpdate) => {
      await updateTask({ variables: { id: taskId, input } });
    },
    [updateTask]
  );

  // Read-only ordered schedule for the confirm step preview.
  const scheduledPreview = React.useMemo(
    () =>
      (todayTasks || [])
        .filter((t: any) => !t.parentTaskId && timeToMinutes(t.startTime) >= 6 * 60)
        .slice()
        .sort((a: any, b: any) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
    [todayTasks]
  );
  const unscheduledCount = React.useMemo(
    () =>
      (todayTasks || []).filter(
        (t: any) => !t.parentTaskId && timeToMinutes(t.startTime) < 6 * 60
      ).length,
    [todayTasks]
  );

  const handleSaveReflection = () => {
    setDailyReflection(reflection, today);
    void updateDailyRitual({ variables: { input: { date: dateKey(today), reflection } } });
    toast.success('Reflection saved. Rest well!');
  };

  const handleStartDay = () => {
    void updateDailyRitual({
      variables: { input: { date: dateKey(today), intention, planCompleted: true } },
    });
    router.push('/today');
  };

  // ----- Shutdown mode -----
  if (mode === 'shutdown') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 mp-fade-in">
        <RitualHeader mode={mode} onModeChange={setMode} date={today} />
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Moon className="h-4 w-4" /> Shutdown ritual
            </CardTitle>
            <CardDescription className="text-[13px]">
              Close out the day. Review what you finished and reflect.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[10px] border border-border p-4">
              <div className="text-2xl font-bold">
                {completedToday.length}
                <span className="text-base font-normal text-muted-foreground">
                  {' '}
                  / {(todayTasks || []).length} done
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                {(todayTasks || []).length > 0 &&
                completedToday.length === (todayTasks || []).length
                  ? 'Everything scheduled is complete. Great day.'
                  : "What's left will roll into tomorrow's planning."}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Reflection
              </label>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={4}
                placeholder="What went well? What would you change tomorrow?"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push('/today')}>
                Skip
              </Button>
              <Button onClick={handleSaveReflection}>
                <Check className="mr-2 h-4 w-4" /> Save & finish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----- Plan mode (wizard) -----
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 mp-fade-in">
      <RitualHeader mode={mode} onModeChange={setMode} date={today} />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold',
                  i < step && 'bg-primary text-primary-foreground',
                  i === step && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  i > step && 'bg-muted text-muted-foreground'
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[13px] hidden sm:inline',
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 — Import from connected tools + Review yesterday */}
      {step === 0 && mode === 'plan' && (
        <PmImportSection onImported={() => refetchToday()} />
      )}
      {step === 0 && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px]">Review yesterday</CardTitle>
            <CardDescription className="text-[13px]">
              Carry unfinished tasks into today, or leave them behind.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {yLoading ? (
              <Skeleton className="h-24 w-full rounded-[10px]" />
            ) : incompleteYesterday.length === 0 ? (
              <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
                Nothing left unfinished from yesterday. Clean slate!
              </div>
            ) : (
              <div className="space-y-2">
                {incompleteYesterday.map((t: any) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 rounded-[10px] border border-border p-3 cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={!!carryOver[t.id]}
                      onCheckedChange={(v) =>
                        setCarryOver((prev) => ({ ...prev, [t.id]: !!v }))
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.durationMinutes}min
                        {t.goal ? ` · ${t.goal.emoji} ${t.goal.title}` : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleCarryOver} disabled={busy}>
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Intention */}
      {step === 1 && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Target className="h-4 w-4" /> Set your intention
            </CardTitle>
            <CardDescription className="text-[13px]">
              One sentence: what would make today a success?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              rows={3}
              placeholder="Today I will focus on…"
              autoFocus
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSaveIntention}>
                <ArrowRight className="mr-2 h-4 w-4" /> Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Timebox (drag & drop) */}
      {step === 2 && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Flag className="h-4 w-4" /> Timebox your day
            </CardTitle>
            <CardDescription className="text-[13px]">
              Drag tasks onto the timeline to give each one a slot. Drag a block to
              a new time to reschedule, or into the pool to unschedule it. Click a
              block to fine-tune duration and priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayLoading ? (
              <Skeleton className="h-64 w-full rounded-[10px]" />
            ) : (todayTasks || []).length === 0 ? (
              <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
                No tasks scheduled for today yet. Generate a plan or add tasks first.
              </div>
            ) : (
              <DayTimeboxCalendar
                date={today}
                tasks={todayTasks as any}
                onUpdate={handleTimeboxUpdate}
              />
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                <ArrowRight className="mr-2 h-4 w-4" /> Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="text-[15px] flex items-center gap-2">
              <ListTodo className="h-4 w-4" /> Confirm your day
            </CardTitle>
            <CardDescription className="text-[13px]">
              You&apos;re set. Here&apos;s the plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {intention && (
              <div className="rounded-[10px] border border-border bg-accent p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Today&apos;s intention
                </div>
                <p className="text-sm mt-1">{intention}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[10px] border border-border p-4">
                <div className="text-2xl font-bold">{(todayTasks || []).length}</div>
                <div className="text-[13px] text-muted-foreground">tasks scheduled</div>
              </div>
              <div className="rounded-[10px] border border-border p-4">
                <div className="text-2xl font-bold">
                  {Math.round((totalMinutes / 60) * 10) / 10}h
                </div>
                <div className="text-[13px] text-muted-foreground">of planned work</div>
              </div>
            </div>

            {/* Timeline preview — ordered schedule from the timebox step */}
            {scheduledPreview.length > 0 && (
              <div className="rounded-[10px] border border-border">
                <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Today&apos;s timeline
                </div>
                <div className="divide-y divide-border">
                  {scheduledPreview.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-3 px-3 py-2">
                      <span className="font-mono text-xs text-muted-foreground w-24 tabular-nums">
                        {t.startTime}–{t.endTime}
                      </span>
                      <span className="text-sm">{t.goal?.emoji ?? '📌'}</span>
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-sm',
                          t.isCompleted && 'line-through text-muted-foreground'
                        )}
                      >
                        {t.title}
                      </span>
                      {t.priority === 1 && (
                        <Badge variant="destructive" className="h-4 px-1 text-[9px]">
                          High
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {unscheduledCount > 0 && (
              <div className="rounded-[10px] border border-amber-300/60 bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
                {unscheduledCount} task{unscheduledCount > 1 ? 's are' : ' is'} still
                unscheduled. Go back to timebox {unscheduledCount > 1 ? 'them' : 'it'} for a clearer day.
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleStartDay}>
                <Check className="mr-2 h-4 w-4" /> Start my day
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RitualHeader({
  mode,
  onModeChange,
  date,
}: {
  mode: 'plan' | 'shutdown';
  onModeChange: (m: 'plan' | 'shutdown') => void;
  date: Date;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {mode === 'plan' ? (
            <Sunrise className="h-6 w-6 text-amber-500" />
          ) : (
            <Moon className="h-6 w-6 text-indigo-400" />
          )}
          {mode === 'plan' ? 'Plan your day' : 'Shut down'}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          {format(date, 'EEEE, MMMM d')}
        </p>
      </div>
      <div className="flex rounded-lg border border-border p-0.5">
        <Button
          size="sm"
          variant={mode === 'plan' ? 'secondary' : 'ghost'}
          className="h-8"
          onClick={() => onModeChange('plan')}
        >
          <Sunrise className="mr-1.5 h-3.5 w-3.5" /> Plan
        </Button>
        <Button
          size="sm"
          variant={mode === 'shutdown' ? 'secondary' : 'ghost'}
          className="h-8"
          onClick={() => onModeChange('shutdown')}
        >
          <Moon className="mr-1.5 h-3.5 w-3.5" /> Shutdown
        </Button>
      </div>
    </div>
  );
}
