import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import type { Task } from '@microplanner/database';
import { GoogleOAuthService } from './google-oauth.service';
import {
  CalendarProvider,
  CreateEventInput,
  NormalizedCalendarEvent,
  UpdateEventInput,
} from './calendar-provider.interface';

/** Google Calendar implementation of the CalendarProvider interface. */
@Injectable()
export class GoogleCalendarProvider implements CalendarProvider {
  readonly provider = 'google' as const;
  private readonly logger = new Logger(GoogleCalendarProvider.name);

  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  private async client(userId: string) {
    const authClient = await this.googleOAuthService.getAuthenticatedClient(userId);
    return google.calendar({ version: 'v3', auth: authClient });
  }

  async listEvents(userId: string, start: Date, end: Date): Promise<NormalizedCalendarEvent[]> {
    const calendar = await this.client(userId);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = response.data.items || [];
    return events
      .filter((e) => e.start && e.end && e.status !== 'cancelled')
      .map((e) => this.normalize(e));
  }

  async upsertTaskEvent(userId: string, task: Task): Promise<string> {
    const calendar = await this.client(userId);
    const requestBody = this.buildEventBody(task);

    // Prefer the id stored on the task; fall back to a taskId metadata search.
    if (task.calendarEventId && task.calendarProvider === 'google') {
      try {
        const res = await calendar.events.update({
          calendarId: 'primary',
          eventId: task.calendarEventId,
          requestBody,
        });
        return res.data.id!;
      } catch (err: any) {
        if (err?.code !== 404 && err?.response?.status !== 404) throw err;
        // Event was deleted upstream — fall through to recreate.
      }
    }

    const search = await calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: [`taskId=${task.id}`],
      timeMin: new Date(new Date(task.scheduledDate).setHours(0, 0, 0, 0)).toISOString(),
      timeMax: new Date(new Date(task.scheduledDate).setHours(23, 59, 59, 999)).toISOString(),
    });
    const existing = search.data.items?.[0];
    if (existing?.id) {
      const res = await calendar.events.update({
        calendarId: 'primary',
        eventId: existing.id,
        requestBody,
      });
      return res.data.id!;
    }
    const res = await calendar.events.insert({ calendarId: 'primary', requestBody });
    return res.data.id!;
  }

  async createEvent(userId: string, input: CreateEventInput): Promise<NormalizedCalendarEvent> {
    const calendar = await this.client(userId);
    const requestBody: any = {
      summary: input.title,
      description: input.description || undefined,
      location: input.location || undefined,
      transparency: input.busy === false ? 'transparent' : 'opaque',
      visibility: 'private',
      start: this.toGoogleTime(input.start, input.allDay),
      end: this.toGoogleTime(input.end, input.allDay),
    };
    if (input.recurrenceDays && input.recurrenceDays.length > 0) {
      const byday = input.recurrenceDays
        .map((d) => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][d])
        .join(',');
      requestBody.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${byday}`];
    }
    const hasAttendees = input.attendees && input.attendees.length > 0;
    if (hasAttendees) {
      requestBody.attendees = input.attendees!.map((email) => ({ email }));
    }
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody,
      sendUpdates: hasAttendees ? 'all' : 'none',
    });
    return this.normalize(res.data);
  }

  async updateEvent(userId: string, eventId: string, input: UpdateEventInput): Promise<NormalizedCalendarEvent> {
    const calendar = await this.client(userId);
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.summary = input.title;
    if (input.description !== undefined) patch.description = input.description;
    if (input.location !== undefined) patch.location = input.location;
    if (input.start) patch.start = this.toGoogleTime(input.start, false);
    if (input.end) patch.end = this.toGoogleTime(input.end, false);
    const res = await calendar.events.patch({ calendarId: 'primary', eventId, requestBody: patch });
    return this.normalize(res.data);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const calendar = await this.client(userId);
    try {
      await calendar.events.delete({ calendarId: 'primary', eventId });
    } catch (err: any) {
      if (err?.code === 404 || err?.response?.status === 404 || err?.code === 410) return;
      throw err;
    }
  }

  /**
   * Register a push channel on the user's primary calendar. Google POSTs to
   * `address` whenever events change; the channel expires (max ~30 days for
   * events, typically we request 7) and must be renewed.
   */
  async watchEvents(
    userId: string,
    address: string,
    channelId: string,
    token: string,
    ttlSeconds = 7 * 24 * 60 * 60,
  ): Promise<{ resourceId: string | null; expiration: Date | null }> {
    const calendar = await this.client(userId);
    const res = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address,
        token,
        params: { ttl: String(ttlSeconds) },
      },
    });
    const expirationMs = res.data.expiration ? Number(res.data.expiration) : null;
    return {
      resourceId: res.data.resourceId || null,
      expiration: expirationMs ? new Date(expirationMs) : null,
    };
  }

  /** Tear down a previously-registered push channel. Safe to call if already gone. */
  async stopWatch(userId: string, channelId: string, resourceId: string): Promise<void> {
    try {
      const calendar = await this.client(userId);
      await calendar.channels.stop({ requestBody: { id: channelId, resourceId } });
    } catch (err: any) {
      const status = err?.code || err?.response?.status;
      if (status === 404 || status === 410) return;
      this.logger.warn(`Failed to stop Google watch channel ${channelId}: ${err?.message || err}`);
    }
  }

  async respondToEvent(userId: string, eventId: string, response: 'declined' | 'accepted' | 'tentative'): Promise<void> {
    const calendar = await this.client(userId);
    const { data: event } = await calendar.events.get({ calendarId: 'primary', eventId });
    const attendees = event.attendees || [];
    const self = attendees.find((a: any) => a.self);
    if (!self) return; // Not an attendee (likely the organizer) — nothing to RSVP.
    self.responseStatus = response;
    await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: { attendees },
      sendUpdates: 'none',
    });
  }

  private buildEventBody(task: Task) {
    const start = new Date(task.scheduledDate);
    const [sh, sm] = task.startTime.split(':').map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(task.scheduledDate);
    const [eh, em] = task.endTime.split(':').map(Number);
    end.setHours(eh, em, 0, 0);
    return {
      summary: task.title,
      description: task.notes || 'Created by MicroPlanner',
      start: { dateTime: start.toISOString(), timeZone: 'UTC' },
      end: { dateTime: end.toISOString(), timeZone: 'UTC' },
      extendedProperties: {
        private: {
          taskId: task.id,
          goalId: task.goalId || '',
          planId: task.planId || '',
          aiGenerated: task.aiGenerated.toString(),
        },
      },
      colorId: task.goalId ? '9' : '1',
    };
  }

  private toGoogleTime(value: string | Date, allDay?: boolean) {
    if (allDay) {
      const iso = value instanceof Date ? value.toISOString() : value;
      return { date: iso.split('T')[0] };
    }
    return { dateTime: new Date(value).toISOString() };
  }

  private normalize(event: any): NormalizedCalendarEvent {
    const isAllDay = !!event.start?.date;
    const attendees = event.attendees || [];
    const self = attendees.find((a: any) => a.self);
    return {
      id: event.id || '',
      title: event.summary || 'Untitled Event',
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      isAllDay,
      description: event.description || null,
      location: event.location || null,
      attendees: attendees.map((a: any) => a.email || '').filter(Boolean),
      provider: 'google',
      isMeeting: attendees.length > 1,
      organizerSelf: Boolean(event.organizer?.self),
      selfResponse: self?.responseStatus,
    };
  }
}
