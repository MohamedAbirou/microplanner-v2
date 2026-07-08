'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  CalendarRange,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectGoalsStep } from '@/components/plans/select-goals-step';
import { CustomizePreferencesStep } from '@/components/plans/customize-preferences-step';
import { GeneratingStep } from '@/components/plans/generating-step';
import { useWeeklyReview, useUpdateDailyRitual } from '@/hooks/use-graphql-extended';
import { getDailyIntention, setDailyIntention, dateKey } from '@/lib/daily-ritual';

type Step = 'review' | 'intention' | 'select-goals' | 'customize' | 'generating';

const STEP_META: Record<Step, { index: number; label: string }> = {
  review: { index: 1, label: 'Review last week' },
  intention: { index: 2, label: 'Set intentions' },
  'select-goals': { index: 3, label: 'Choose goals' },
  customize: { index: 4, label: 'Customize' },
  generating: { index: 5, label: 'Generate' },
};

/** Monday of the coming week (or today if today is Monday). */
function upcomingWeekStart(): Date {
  const d = new Date();
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const daysUntilMonday = day === 1 ? 0 : (8 - (day === 0 ? 7 : day)) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function PlanWeekPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>('review');
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const weekStart = React.useMemo(() => upcomingWeekStart(), []);
  const [preferences, setPreferences] = React.useState({
    weekStartDate: weekStart,
    prioritizePeakHours: true,
    avoidWeekends: false,
    bufferTime: 15,
    focusBlockDuration: 90,
  });

  const { review, loading: reviewLoading } = useWeeklyReview();
  const { updateDailyRitual } = useUpdateDailyRitual();

  const [intention, setIntention] = React.useState('');
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setIntention(getDailyIntention(weekStart));
  }, [weekStart]);

  const saveIntention = () => {
    // The weekly intention is stored on the week-start DailyRitual row (backend
    // primary), with a localStorage mirror for offline. Same model as the daily
    // ritual, keyed to the Monday of the planned week.
    setDailyIntention(intention, weekStart);
    void updateDailyRitual({ variables: { input: { date: dateKey(weekStart), intention } } });
    setStep('select-goals');
  };

  const progress = (STEP_META[step].index / 5) * 100;

  return (
    <div className="mx-auto max-w-4xl p-6 mp-fade-in">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarRange className="h-6 w-6 text-primary" />
          Plan your week
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          A guided ritual: reflect on last week, set your focus, and generate an optimized plan for
          the week of {format(weekStart, 'MMM d')}.
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-medium">
            Step {STEP_META[step].index} of 5
          </span>
          <span className="text-[13px] text-muted-foreground">{STEP_META[step].label}</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step 1 — Review last week */}
      {step === 'review' && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <TrendingUp className="h-4 w-4" /> Last week in review
            </CardTitle>
            <CardDescription className="text-[13px]">
              A quick look back before you plan ahead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewLoading ? (
              <Skeleton className="h-32 w-full rounded-[10px]" />
            ) : review ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat label="Tasks completed" value={String(review.tasksCompleted ?? 0)} />
                  <Stat label="Completion rate" value={`${Math.round(review.completionRate ?? 0)}%`} />
                  <Stat label="Productivity" value={review.productivity ?? '—'} />
                </div>
                {Array.isArray(review.topGoals) && review.topGoals.length > 0 && (
                  <div className="rounded-[10px] border border-border p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Top goals
                    </div>
                    <ul className="space-y-1">
                      {review.topGoals.map((g: any, i: number) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <span className="truncate">{g.title}</span>
                          <span className="text-muted-foreground">{g.completions} done</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.recommendation && (
                  <div className="flex gap-2 rounded-[10px] border border-primary/30 bg-primary/5 p-3 text-[13px]">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-none text-primary" />
                    <span>{review.recommendation}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
                No review data yet — this is a great week to start.
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setStep('intention')}>
                <ArrowRight className="mr-2 h-4 w-4" /> Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Weekly intention */}
      {step === 'intention' && (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Target className="h-4 w-4" /> Set your intention for the week
            </CardTitle>
            <CardDescription className="text-[13px]">
              What would make this week a success? One or two sentences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              rows={3}
              placeholder="This week I want to…"
              autoFocus
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('review')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={saveIntention}>
                <ArrowRight className="mr-2 h-4 w-4" /> Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Choose goals (reused generator step) */}
      {step === 'select-goals' && (
        <SelectGoalsStep
          selectedGoals={selectedGoals}
          onNext={(ids) => {
            setSelectedGoals(ids);
            setStep('customize');
          }}
        />
      )}

      {/* Step 4 — Customize (reused generator step) */}
      {step === 'customize' && (
        <CustomizePreferencesStep
          selectedGoals={selectedGoals}
          preferences={preferences}
          onBack={() => setStep('select-goals')}
          onNext={(prefs: typeof preferences) => {
            setPreferences(prefs);
            setStep('generating');
          }}
        />
      )}

      {/* Step 5 — Generate, then hand off to the accept/review screen */}
      {step === 'generating' && (
        <GeneratingStep
          selectedGoals={selectedGoals}
          preferences={preferences}
          onComplete={(planId: string) => router.push(`/plans/review?id=${planId}`)}
          onError={() => setStep('customize')}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border p-3">
      <div className="text-xl font-bold capitalize">{value}</div>
      <div className="text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}
