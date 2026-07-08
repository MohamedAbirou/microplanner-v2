/**
 * Client-side persistence for the guided daily planning ritual.
 *
 * The daily "intention" (a one-sentence focus for the day) and the end-of-day
 * "reflection" are lightweight, personal, and have no backend model yet, so we
 * store them in localStorage keyed by ISO date (yyyy-MM-dd). This keeps the
 * ritual fully functional without a schema migration; it can be promoted to a
 * backend field later without changing the calling components.
 */

const INTENTION_PREFIX = 'mp:daily-intention:';
const REFLECTION_PREFIX = 'mp:daily-reflection:';

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function read(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function write(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

export function getDailyIntention(date: Date = new Date()): string {
  return read(INTENTION_PREFIX + dateKey(date));
}

export function setDailyIntention(value: string, date: Date = new Date()): void {
  write(INTENTION_PREFIX + dateKey(date), value.trim());
}

export function getDailyReflection(date: Date = new Date()): string {
  return read(REFLECTION_PREFIX + dateKey(date));
}

export function setDailyReflection(value: string, date: Date = new Date()): void {
  write(REFLECTION_PREFIX + dateKey(date), value.trim());
}
