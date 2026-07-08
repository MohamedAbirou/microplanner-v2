import type { Task } from '@microplanner/database';

/** Provider-agnostic calendar event shape used across the app. */
export interface NormalizedCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  description?: string | null;
  location?: string | null;
  attendees?: string[];
  provider: CalendarProviderId;
  /** True when the event has other attendees (i.e. it's a real meeting). */
  isMeeting?: boolean;
  /** True when the connected account organized the event (can't decline own). */
  organizerSelf?: boolean;
  /** The connected account's RSVP: needsAction | accepted | declined | tentative. */
  selfResponse?: string;
}

export type CalendarProviderId = 'google' | 'outlook';
export type EventResponse = 'declined' | 'accepted' | 'tentative';

export interface CreateEventInput {
  title: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  allDay?: boolean;
  location?: string;
  /** Marks the event opaque/busy vs transparent/free. Defaults to busy. */
  busy?: boolean;
  /**
   * When set, creates a weekly-recurring event on these weekdays (0=Sun..6=Sat).
   * `start`/`end` define the time-of-day and first occurrence.
   */
  recurrenceDays?: number[];
  /** Attendee emails to invite. Providers send the invitation. */
  attendees?: string[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  start?: string | Date;
  end?: string | Date;
  location?: string;
}

/**
 * A calendar backend (Google, Outlook). Implementations own token retrieval for
 * their provider and translate between the external API and NormalizedCalendarEvent.
 */
export interface CalendarProvider {
  readonly provider: CalendarProviderId;

  /** List events in [start, end]. Returns [] when the user isn't connected. */
  listEvents(userId: string, start: Date, end: Date): Promise<NormalizedCalendarEvent[]>;

  /**
   * Idempotently create/update the calendar event for a task. Uses the task's
   * stored calendarEventId when present, otherwise creates a new event. Returns
   * the provider event id.
   */
  upsertTaskEvent(userId: string, task: Task): Promise<string>;

  createEvent(userId: string, input: CreateEventInput): Promise<NormalizedCalendarEvent>;
  updateEvent(userId: string, eventId: string, input: UpdateEventInput): Promise<NormalizedCalendarEvent>;
  deleteEvent(userId: string, eventId: string): Promise<void>;

  /** RSVP to an invite (used by calendar defense to auto-decline). */
  respondToEvent(userId: string, eventId: string, response: EventResponse): Promise<void>;
}
