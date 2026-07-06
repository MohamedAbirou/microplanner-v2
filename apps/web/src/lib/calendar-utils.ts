/** Shared time-grid constants and helpers for day/week calendar views. */

export const CALENDAR_HOUR_START = 6;
export const CALENDAR_HOUR_END = 23;
export const CALENDAR_SLOT_HEIGHT_PX = 64;

export const CALENDAR_HOURS = Array.from(
  { length: CALENDAR_HOUR_END - CALENDAR_HOUR_START + 1 },
  (_, i) => i + CALENDAR_HOUR_START
);

export const CALENDAR_GRID_HEIGHT_PX =
  CALENDAR_HOURS.length * CALENDAR_SLOT_HEIGHT_PX;

export interface CalendarSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CalendarTaskLike {
  id: string;
  title: string;
  notes?: string | null;
  startTime: string;
  endTime: string;
  scheduledDate: string;
  durationMinutes?: number;
  isCompleted: boolean;
  priority: number;
  parentTaskId?: string | null;
  subtasks?: CalendarSubtask[];
  goal?: {
    id: string;
    emoji: string;
    title: string;
    color: string;
  } | null;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

export function getTaskDurationMinutes(task: {
  durationMinutes?: number;
  startTime?: string;
  endTime?: string;
}): number {
  if (task.durationMinutes && task.durationMinutes > 0) {
    return task.durationMinutes;
  }
  if (task.startTime && task.endTime) {
    const diff = timeToMinutes(task.endTime) - timeToMinutes(task.startTime);
    if (diff > 0) return diff;
  }
  return 30;
}

export function getTaskTopPx(startTime: string): number {
  const minutesFromGridStart =
    timeToMinutes(startTime) - CALENDAR_HOUR_START * 60;
  return (minutesFromGridStart / 60) * CALENDAR_SLOT_HEIGHT_PX;
}

export function getTaskHeightPx(durationMinutes: number): number {
  const px = (durationMinutes / 60) * CALENDAR_SLOT_HEIGHT_PX;
  // At least half a slot so short tasks remain readable
  return Math.max(CALENDAR_SLOT_HEIGHT_PX * 0.5, px);
}

/** Top-level calendar blocks only — subtasks render nested inside their parent. */
export function organizeCalendarTasks<T extends CalendarTaskLike>(
  tasks: T[]
): T[] {
  const subtasksByParent = new Map<string, CalendarSubtask[]>();

  for (const task of tasks) {
    if (task.parentTaskId) {
      const list = subtasksByParent.get(task.parentTaskId) ?? [];
      list.push({
        id: task.id,
        title: task.title,
        isCompleted: task.isCompleted,
      });
      subtasksByParent.set(task.parentTaskId, list);
    }
  }

  return tasks
    .filter((task) => !task.parentTaskId)
    .map((task) => {
      const fromFlat = subtasksByParent.get(task.id) ?? [];
      const nested = task.subtasks?.length ? task.subtasks : fromFlat;
      return { ...task, subtasks: nested };
    });
}

export function formatHourLabel(hour: number): string {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric' });
}
