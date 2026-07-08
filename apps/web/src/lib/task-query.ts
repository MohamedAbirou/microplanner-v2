import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';
import type { CalendarView } from '@/components/calendar/calendar-view-switcher';

export function getCalendarTaskQuery(view: CalendarView, focusDate: Date) {
  if (view === 'day') {
    return {
      filter: { scheduledDate: startOfDay(focusDate) },
      take: 80,
    };
  }

  if (view === 'week') {
    const start = startOfWeek(focusDate, { weekStartsOn: 1 });
    const end = endOfWeek(focusDate, { weekStartsOn: 1 });
    return {
      filter: { dateRange: { start, end: endOfDay(end) } },
      take: 150,
    };
  }

  const start = startOfMonth(focusDate);
  const end = endOfMonth(focusDate);
  return {
    filter: { dateRange: { start, end: endOfDay(end) } },
    take: 400,
  };
}

/** Default window for list/search views — keeps payloads bounded. */
export function getDefaultTaskListQuery(days = 90) {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));
  return {
    filter: { dateRange: { start, end } },
    take: 250,
  };
}

/**
 * Tasks page default — past month + next two months, capped take.
 * Balances "see upcoming work" with fast first paint on Render.
 */
export function getTasksPageDefaultQuery() {
  const today = startOfDay(new Date());
  return {
    filter: {
      dateRange: {
        start: subDays(today, 30),
        end: endOfDay(addDays(today, 60)),
      },
    },
    take: 150,
  };
}
