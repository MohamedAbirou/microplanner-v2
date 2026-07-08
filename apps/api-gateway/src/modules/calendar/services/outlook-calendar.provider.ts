import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type { Task } from '@microplanner/database';
import { OutlookOAuthService } from './outlook-oauth.service';
import {
  CalendarProvider,
  CreateEventInput,
  NormalizedCalendarEvent,
  UpdateEventInput,
} from './calendar-provider.interface';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

/** Microsoft Graph implementation of the CalendarProvider interface. */
@Injectable()
export class OutlookCalendarProvider implements CalendarProvider {
  readonly provider = 'outlook' as const;
  private readonly logger = new Logger(OutlookCalendarProvider.name);

  constructor(private readonly outlookOAuthService: OutlookOAuthService) {}

  private async client(userId: string): Promise<AxiosInstance> {
    const token = await this.outlookOAuthService.getAccessToken(userId);
    return axios.create({
      baseURL: GRAPH_BASE,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'outlook.timezone="UTC"',
      },
      timeout: 20000,
    });
  }

  async listEvents(userId: string, start: Date, end: Date): Promise<NormalizedCalendarEvent[]> {
    const client = await this.client(userId);
    const events: NormalizedCalendarEvent[] = [];
    // calendarView expands recurring events into instances within the window.
    let url: string | null =
      `/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}` +
      `&$orderby=start/dateTime&$top=100`;
    while (url) {
      const { data }: any = await client.get(url);
      for (const e of data.value || []) {
        events.push(this.normalize(e));
      }
      // Graph paginates with @odata.nextLink (absolute URL).
      url = data['@odata.nextLink'] ? data['@odata.nextLink'].replace(GRAPH_BASE, '') : null;
    }
    return events;
  }

  async upsertTaskEvent(userId: string, task: Task): Promise<string> {
    const client = await this.client(userId);
    const body = this.buildEventBody(task);

    if (task.calendarEventId && task.calendarProvider === 'outlook') {
      try {
        const { data } = await client.patch(`/me/events/${task.calendarEventId}`, body);
        return data.id;
      } catch (err: any) {
        if (err?.response?.status !== 404) throw err;
        // Deleted upstream — recreate below.
      }
    }
    const { data } = await client.post('/me/events', body);
    return data.id;
  }

  async createEvent(userId: string, input: CreateEventInput): Promise<NormalizedCalendarEvent> {
    const client = await this.client(userId);
    const body: any = {
      subject: input.title,
      body: input.description ? { contentType: 'text', content: input.description } : undefined,
      location: input.location ? { displayName: input.location } : undefined,
      isAllDay: Boolean(input.allDay),
      showAs: input.busy === false ? 'free' : 'busy',
      start: this.toGraphTime(input.start, input.allDay),
      end: this.toGraphTime(input.end, input.allDay),
    };
    if (input.recurrenceDays && input.recurrenceDays.length > 0) {
      const days = input.recurrenceDays.map(
        (d) => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d],
      );
      const startDate = (input.start instanceof Date ? input.start : new Date(input.start))
        .toISOString()
        .split('T')[0];
      body.recurrence = {
        pattern: { type: 'weekly', interval: 1, daysOfWeek: days },
        range: { type: 'noEnd', startDate },
      };
    }
    if (input.attendees && input.attendees.length > 0) {
      body.attendees = input.attendees.map((email) => ({
        emailAddress: { address: email },
        type: 'required',
      }));
    }
    const { data } = await client.post('/me/events', body);
    return this.normalize(data);
  }

  async updateEvent(userId: string, eventId: string, input: UpdateEventInput): Promise<NormalizedCalendarEvent> {
    const client = await this.client(userId);
    const patch: Record<string, unknown> = {};
    if (input.title !== undefined) patch.subject = input.title;
    if (input.description !== undefined) patch.body = { contentType: 'text', content: input.description };
    if (input.location !== undefined) patch.location = { displayName: input.location };
    if (input.start) patch.start = this.toGraphTime(input.start, false);
    if (input.end) patch.end = this.toGraphTime(input.end, false);
    const { data } = await client.patch(`/me/events/${eventId}`, patch);
    return this.normalize(data);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const client = await this.client(userId);
    try {
      await client.delete(`/me/events/${eventId}`);
    } catch (err: any) {
      if (err?.response?.status === 404) return;
      throw err;
    }
  }

  async respondToEvent(userId: string, eventId: string, response: 'declined' | 'accepted' | 'tentative'): Promise<void> {
    const client = await this.client(userId);
    const action =
      response === 'declined' ? 'decline' : response === 'accepted' ? 'accept' : 'tentativelyAccept';
    try {
      await client.post(`/me/events/${eventId}/${action}`, { sendResponse: true });
    } catch (err: any) {
      // 404 = gone; 400 sometimes = organizer can't respond to own event.
      if (err?.response?.status === 404 || err?.response?.status === 400) return;
      throw err;
    }
  }

  private buildEventBody(task: Task) {
    const start = new Date(task.scheduledDate);
    const [sh, sm] = task.startTime.split(':').map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(task.scheduledDate);
    const [eh, em] = task.endTime.split(':').map(Number);
    end.setHours(eh, em, 0, 0);
    return {
      subject: task.title,
      body: { contentType: 'text', content: task.notes || 'Created by MicroPlanner' },
      start: { dateTime: start.toISOString(), timeZone: 'UTC' },
      end: { dateTime: end.toISOString(), timeZone: 'UTC' },
      showAs: 'busy',
    };
  }

  private toGraphTime(value: string | Date, allDay?: boolean) {
    const date = value instanceof Date ? value : new Date(value);
    if (allDay) {
      return { dateTime: `${date.toISOString().split('T')[0]}T00:00:00`, timeZone: 'UTC' };
    }
    return { dateTime: date.toISOString(), timeZone: 'UTC' };
  }

  private normalize(e: any): NormalizedCalendarEvent {
    // Graph returns naive datetimes in the requested (UTC) zone — append Z.
    const parse = (t: any): Date => {
      const raw = t?.dateTime;
      if (!raw) return new Date(NaN);
      return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}Z`);
    };
    const attendees = e.attendees || [];
    const responseMap: Record<string, string> = {
      accepted: 'accepted',
      declined: 'declined',
      tentativelyAccepted: 'tentative',
      notResponded: 'needsAction',
      none: 'needsAction',
      organizer: 'accepted',
    };
    return {
      id: e.id,
      title: e.subject || 'Untitled Event',
      start: parse(e.start),
      end: parse(e.end),
      isAllDay: Boolean(e.isAllDay),
      description: e.bodyPreview || null,
      location: e.location?.displayName || null,
      attendees: attendees.map((a: any) => a.emailAddress?.address || '').filter(Boolean),
      provider: 'outlook',
      isMeeting: attendees.length > 0,
      organizerSelf: Boolean(e.isOrganizer),
      selfResponse: responseMap[e.responseStatus?.response] || undefined,
    };
  }
}
