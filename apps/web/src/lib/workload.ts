/**
 * Workload / capacity analysis for a proposed plan.
 *
 * Compares the total scheduled task time against the user's available working
 * hours (from their work-hours preferences) so we can warn before they accept
 * an overcommitted plan and suggest which low-priority tasks to trim.
 */

export interface WorkHoursDay {
  isWorkDay: boolean;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface WorkHoursSchedule {
  monday: WorkHoursDay;
  tuesday: WorkHoursDay;
  wednesday: WorkHoursDay;
  thursday: WorkHoursDay;
  friday: WorkHoursDay;
  saturday: WorkHoursDay;
  sunday: WorkHoursDay;
}

const DAY_KEYS: (keyof WorkHoursSchedule)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export interface PlanTaskLike {
  id: string;
  title: string;
  scheduledDate: string;
  durationMinutes: number;
  priority?: number;
  goal?: { title?: string; emoji?: string; color?: string } | null;
}

export interface DayLoad {
  date: string; // ISO date (yyyy-MM-dd)
  label: string;
  scheduledMinutes: number;
  capacityMinutes: number;
  utilization: number; // percent, capacity 0 => Infinity-safe (returns >100 if any work)
  overBy: number; // minutes over capacity (0 if within)
}

export interface WorkloadAnalysis {
  totalScheduledMinutes: number;
  totalCapacityMinutes: number;
  utilization: number;
  isOvercommitted: boolean;
  days: DayLoad[];
  overcommittedDays: DayLoad[];
  /** Lowest-priority tasks on overcommitted days, worst-load day first. */
  trimSuggestions: PlanTaskLike[];
}

function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : 0;
}

function dateKeyOf(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function analyzeWorkload(
  tasks: PlanTaskLike[],
  schedule?: WorkHoursSchedule | null
): WorkloadAnalysis {
  const byDate = new Map<string, PlanTaskLike[]>();
  for (const t of tasks) {
    const key = dateKeyOf(t.scheduledDate);
    const list = byDate.get(key) || [];
    list.push(t);
    byDate.set(key, list);
  }

  const days: DayLoad[] = [];
  for (const [key, dayTasks] of byDate.entries()) {
    const d = new Date(key + 'T00:00:00');
    const dayCfg = schedule ? schedule[DAY_KEYS[d.getDay()]] : undefined;
    const capacityMinutes =
      dayCfg && dayCfg.isWorkDay ? minutesBetween(dayCfg.startTime, dayCfg.endTime) : 0;
    const scheduledMinutes = dayTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);
    const utilization =
      capacityMinutes > 0
        ? Math.round((scheduledMinutes / capacityMinutes) * 100)
        : scheduledMinutes > 0
        ? 999
        : 0;
    days.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      scheduledMinutes,
      capacityMinutes,
      utilization,
      overBy: Math.max(0, scheduledMinutes - capacityMinutes),
    });
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  const totalScheduledMinutes = days.reduce((s, d) => s + d.scheduledMinutes, 0);
  const totalCapacityMinutes = days.reduce((s, d) => s + d.capacityMinutes, 0);
  const utilization =
    totalCapacityMinutes > 0
      ? Math.round((totalScheduledMinutes / totalCapacityMinutes) * 100)
      : 0;

  const overcommittedDays = days
    .filter((d) => d.overBy > 0)
    .sort((a, b) => b.overBy - a.overBy);

  // Suggest trimming the lowest-priority tasks on the most overloaded days
  // (higher priority number = lower priority; default 2/medium).
  const trimSuggestions: PlanTaskLike[] = [];
  for (const day of overcommittedDays) {
    const dayTasks = (byDate.get(day.date) || [])
      .slice()
      .sort((a, b) => (b.priority ?? 2) - (a.priority ?? 2));
    let over = day.overBy;
    for (const t of dayTasks) {
      if (over <= 0) break;
      trimSuggestions.push(t);
      over -= t.durationMinutes || 0;
    }
  }

  return {
    totalScheduledMinutes,
    totalCapacityMinutes,
    utilization,
    isOvercommitted: totalScheduledMinutes > totalCapacityMinutes && totalCapacityMinutes > 0,
    days,
    overcommittedDays,
    trimSuggestions,
  };
}

export function formatHours(minutes: number): string {
  const h = minutes / 60;
  return `${Math.round(h * 10) / 10}h`;
}
