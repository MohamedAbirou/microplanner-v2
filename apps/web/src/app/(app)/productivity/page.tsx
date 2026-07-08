'use client';

import * as React from 'react';
import { Focus, Clock, CalendarOff, Shield, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useFocusTimeBlocks,
  useCreateFocusBlock,
  useUpdateFocusBlock,
  useDeleteFocusBlock,
  useWorkHours,
  useUpdateWorkHours,
  useNoMeetingDays,
  useCreateNoMeetingDay,
  useDeleteNoMeetingDay,
  useCalendarDefense,
  useUpdateCalendarDefense,
} from '@/hooks/use-graphql-extended';

// dayOfWeek uses JS convention: 0 = Sunday … 6 = Saturday.
const DAYS = [
  { value: 1, label: 'Mon', full: 'monday' },
  { value: 2, label: 'Tue', full: 'tuesday' },
  { value: 3, label: 'Wed', full: 'wednesday' },
  { value: 4, label: 'Thu', full: 'thursday' },
  { value: 5, label: 'Fri', full: 'friday' },
  { value: 6, label: 'Sat', full: 'saturday' },
  { value: 0, label: 'Sun', full: 'sunday' },
] as const;

// ============================================================================
// FOCUS TIME
// ============================================================================

function FocusTimeTab() {
  const { focusBlocks, loading } = useFocusTimeBlocks();
  const { createFocusBlock, loading: creating } = useCreateFocusBlock();
  const { updateFocusBlock } = useUpdateFocusBlock();
  const { deleteFocusBlock } = useDeleteFocusBlock();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [frequency, setFrequency] = React.useState('WEEKDAYS');
  const [days, setDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = React.useState('09:00');
  const [duration, setDuration] = React.useState(90);

  const toggleDay = (value: number) => {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  };

  const handleCreate = async () => {
    const daysOfWeek =
      frequency === 'CUSTOM'
        ? days
        : frequency === 'DAILY'
          ? [0, 1, 2, 3, 4, 5, 6]
          : frequency === 'WEEKDAYS'
            ? [1, 2, 3, 4, 5]
            : [1]; // WEEKLY
    await createFocusBlock({
      variables: {
        input: {
          title: title.trim() || 'Focus block',
          frequency,
          daysOfWeek,
          startTime,
          durationMinutes: duration,
        },
      },
    });
    setOpen(false);
    setTitle('');
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-[15px]">Focus blocks</CardTitle>
          <CardDescription className="text-[13px]">
            Protected deep-work time that planning respects and calendar defense guards.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              New block
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[14px]">
            <DialogHeader>
              <DialogTitle>New focus block</DialogTitle>
              <DialogDescription>Reserve recurring deep-work time.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fb-title">Title</Label>
                <Input id="fb-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep work" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Every day</SelectItem>
                      <SelectItem value="WEEKDAYS">Weekdays</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fb-start">Start time</Label>
                  <Input id="fb-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>
              {frequency === 'CUSTOM' && (
                <div className="space-y-1.5">
                  <Label>Days</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        className={`rounded-[8px] border px-2.5 py-1 text-[13px] ${
                          days.includes(d.value)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="fb-duration">Duration (minutes)</Label>
                <Input
                  id="fb-duration"
                  type="number"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating…' : 'Create block'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Skeleton className="h-16 w-full rounded-[10px]" />
        ) : focusBlocks.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            No focus blocks yet. Create one to protect deep-work time.
          </p>
        ) : (
          focusBlocks.map((block: any) => (
            <div
              key={block.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  {block.title}
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: block.color }} />
                </div>
                <div className="text-[13px] text-muted-foreground">
                  {block.startTime ? `${block.startTime} · ` : ''}
                  {block.durationMinutes} min ·{' '}
                  {block.daysOfWeek
                    .map((dv: number) => DAYS.find((d) => d.value === dv)?.label)
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={block.isActive}
                  onCheckedChange={(checked) =>
                    updateFocusBlock({ variables: { id: block.id, input: { isActive: checked } } })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteFocusBlock({ variables: { id: block.id } })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// WORK HOURS
// ============================================================================

interface DayState {
  isWorkDay: boolean;
  startTime: string;
  endTime: string;
}

function WorkHoursTab() {
  const { workHours, loading } = useWorkHours();
  const { updateWorkHours, loading: saving } = useUpdateWorkHours();

  const [schedule, setSchedule] = React.useState<Record<string, DayState>>({});
  const [enforce, setEnforce] = React.useState(false);

  React.useEffect(() => {
    if (workHours?.schedule) {
      const next: Record<string, DayState> = {};
      for (const d of DAYS) {
        const day = workHours.schedule[d.full] || {};
        next[d.full] = {
          isWorkDay: day.isWorkDay ?? (d.value >= 1 && d.value <= 5),
          startTime: day.startTime ?? '09:00',
          endTime: day.endTime ?? '17:00',
        };
      }
      setSchedule(next);
      setEnforce(workHours.enforceWorkHours ?? false);
    }
  }, [workHours]);

  const updateDay = (full: string, patch: Partial<DayState>) => {
    setSchedule((prev) => ({ ...prev, [full]: { ...prev[full], ...patch } }));
  };

  const handleSave = async () => {
    const scheduleInput = Object.fromEntries(
      DAYS.map((d) => {
        const s = schedule[d.full];
        return [
          d.full,
          { isWorkDay: s.isWorkDay, startTime: s.startTime, endTime: s.endTime },
        ];
      })
    );
    await updateWorkHours({
      variables: { input: { schedule: scheduleInput, enforceWorkHours: enforce } },
    });
  };

  if (loading || Object.keys(schedule).length === 0) {
    return <Skeleton className="h-64 w-full rounded-[14px]" />;
  }

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px]">Working hours</CardTitle>
        <CardDescription className="text-[13px]">
          Planning schedules tasks within these hours and respects them when defending your calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {DAYS.map((d) => {
          const s = schedule[d.full];
          return (
            <div key={d.full} className="flex items-center gap-3">
              <div className="flex w-28 items-center gap-2">
                <Switch checked={s.isWorkDay} onCheckedChange={(checked) => updateDay(d.full, { isWorkDay: checked })} />
                <span className="text-[13px] font-medium">{d.label}</span>
              </div>
              <Input
                type="time"
                value={s.startTime}
                disabled={!s.isWorkDay}
                onChange={(e) => updateDay(d.full, { startTime: e.target.value })}
                className="w-32"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                value={s.endTime}
                disabled={!s.isWorkDay}
                onChange={(e) => updateDay(d.full, { endTime: e.target.value })}
                className="w-32"
              />
            </div>
          );
        })}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enforce working hours</Label>
            <p className="text-[13px] text-muted-foreground">Block scheduling outside these hours</p>
          </div>
          <Switch checked={enforce} onCheckedChange={setEnforce} />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving…' : 'Save working hours'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// NO MEETING DAYS
// ============================================================================

function NoMeetingDaysTab() {
  const { noMeetingDays, loading } = useNoMeetingDays();
  const { createNoMeetingDay } = useCreateNoMeetingDay();
  const { deleteNoMeetingDay } = useDeleteNoMeetingDay();
  const [pending, setPending] = React.useState<number | null>(null);

  const byDay = new Map<number, any>();
  noMeetingDays.forEach((n: any) => byDay.set(n.dayOfWeek, n));

  const toggle = async (dayValue: number) => {
    setPending(dayValue);
    try {
      const existing = byDay.get(dayValue);
      if (existing) {
        await deleteNoMeetingDay({ variables: { id: existing.id } });
      } else {
        await createNoMeetingDay({ variables: { input: { dayOfWeek: dayValue } } });
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px]">No-meeting days</CardTitle>
        <CardDescription className="text-[13px]">
          Days kept free of meetings so you can focus. Calendar defense auto-declines invites on these days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-full rounded-[10px]" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = byDay.has(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  disabled={pending === d.value}
                  onClick={() => toggle(d.value)}
                  className={`flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[13px] transition-colors ${
                    active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-accent/40'
                  }`}
                >
                  {pending === d.value && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {d.label}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CALENDAR DEFENSE
// ============================================================================

const DEFENSE_TOGGLES: { key: string; label: string; description: string }[] = [
  { key: 'autoDeclineDuringFocusTime', label: 'Protect focus time', description: 'Auto-decline meetings that overlap focus blocks' },
  { key: 'autoDeclineOutsideWorkHours', label: 'Guard working hours', description: 'Auto-decline invites outside your working hours' },
  { key: 'autoDeclineDoubleBookings', label: 'Prevent double-booking', description: 'Auto-decline conflicting invites' },
  { key: 'autoAcceptDuringOpenHours', label: 'Auto-accept open slots', description: 'Accept invites that fit open working hours' },
  { key: 'requireMinimumNotice', label: 'Require minimum notice', description: 'Decline last-minute invites' },
  { key: 'requireBufferBetweenMeetings', label: 'Buffer between meetings', description: 'Keep breathing room between meetings' },
  { key: 'suggestShorterMeetings', label: 'Suggest shorter meetings', description: 'Nudge long meetings shorter' },
];

const DEFENSE_NUMBERS: { key: string; label: string }[] = [
  { key: 'minimumNoticeHours', label: 'Minimum notice (hours)' },
  { key: 'bufferMinutes', label: 'Buffer (minutes)' },
  { key: 'defaultMeetingDuration', label: 'Default meeting (minutes)' },
];

function CalendarDefenseTab() {
  const { calendarDefense, loading } = useCalendarDefense();
  const { updateCalendarDefense, loading: saving } = useUpdateCalendarDefense();
  const [form, setForm] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (calendarDefense) setForm(calendarDefense);
  }, [calendarDefense]);

  const save = (patch: Record<string, any>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    updateCalendarDefense({ variables: { input: patch } });
  };

  if (loading || !form.id) {
    return <Skeleton className="h-80 w-full rounded-[14px]" />;
  }

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px]">Calendar defense</CardTitle>
        <CardDescription className="text-[13px]">
          Automatic rules that protect your time by declining or reshaping meeting invites.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DEFENSE_TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label>{t.label}</Label>
              <p className="text-[13px] text-muted-foreground">{t.description}</p>
            </div>
            <Switch checked={!!form[t.key]} onCheckedChange={(checked) => save({ [t.key]: checked })} />
          </div>
        ))}

        <Separator />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEFENSE_NUMBERS.map((n) => (
            <div key={n.key} className="space-y-1.5">
              <Label htmlFor={`cd-${n.key}`}>{n.label}</Label>
              <Input
                id={`cd-${n.key}`}
                type="number"
                min={0}
                value={form[n.key] ?? 0}
                onChange={(e) => setForm((prev) => ({ ...prev, [n.key]: parseInt(e.target.value, 10) || 0 }))}
                onBlur={(e) => save({ [n.key]: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          ))}
        </div>

        {saving && (
          <p className="text-[13px] text-muted-foreground">
            <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" />
            Saving…
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ProductivityPage() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto mp-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Productivity</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Protect focus time, set working hours, and defend your calendar.
        </p>
      </div>

      <Tabs defaultValue="focus" className="space-y-6">
        <TabsList>
          <TabsTrigger value="focus">
            <Focus className="mr-2 h-4 w-4" />
            Focus Time
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="mr-2 h-4 w-4" />
            Work Hours
          </TabsTrigger>
          <TabsTrigger value="nomeeting">
            <CalendarOff className="mr-2 h-4 w-4" />
            No-Meeting Days
          </TabsTrigger>
          <TabsTrigger value="defense">
            <Shield className="mr-2 h-4 w-4" />
            Calendar Defense
          </TabsTrigger>
        </TabsList>

        <TabsContent value="focus">
          <FocusTimeTab />
        </TabsContent>
        <TabsContent value="hours">
          <WorkHoursTab />
        </TabsContent>
        <TabsContent value="nomeeting">
          <NoMeetingDaysTab />
        </TabsContent>
        <TabsContent value="defense">
          <CalendarDefenseTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
