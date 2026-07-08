import { Body, Controller, Headers, Post, Query, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CalendarWatchChannelService } from '../calendar/services/calendar-watch-channel.service';
import { AutopilotService } from './autopilot.service';

/**
 * Public endpoints that receive provider push notifications and drive
 * near-real-time autopilot rescheduling. Handlers return quickly and perform
 * the reschedule asynchronously, debounced per user so a burst of calendar
 * edits collapses into a single re-plan.
 */
@ApiExcludeController()
@Controller('calendar/webhooks')
export class CalendarWebhookController {
  private readonly logger = new Logger(CalendarWebhookController.name);
  private readonly DEBOUNCE_MS = 15_000;
  private readonly pending = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly watchChannels: CalendarWatchChannelService,
    private readonly autopilot: AutopilotService,
  ) {}

  // ==================== GOOGLE ====================

  @Post('google')
  @Public()
  async google(
    @Headers('x-goog-channel-id') channelId: string,
    @Headers('x-goog-resource-state') resourceState: string,
    @Headers('x-goog-channel-token') channelToken: string,
    @Res() res: Response,
  ) {
    // Always ack fast — Google retries on non-2xx and disables noisy channels.
    res.status(200).send();

    // `sync` is the initial handshake; nothing has changed yet.
    if (resourceState === 'sync' || !channelId) return;

    try {
      const owner = await this.watchChannels.resolveGoogleChannel(channelId, channelToken);
      if (owner) this.scheduleReschedule(owner.userId);
    } catch (err: any) {
      this.logger.warn(`Google webhook handling failed: ${err?.message || err}`);
    }
  }

  // ==================== OUTLOOK / MICROSOFT GRAPH ====================

  @Post('outlook')
  @Public()
  async outlook(
    @Query('validationToken') validationToken: string | undefined,
    @Body() body: any,
    @Req() _req: Request,
    @Res() res: Response,
  ) {
    // Subscription creation handshake: echo the token as text/plain within 10s.
    if (validationToken) {
      res.status(200).type('text/plain').send(validationToken);
      return;
    }

    res.status(202).send();

    const notifications: any[] = Array.isArray(body?.value) ? body.value : [];
    for (const n of notifications) {
      try {
        const owner = await this.watchChannels.resolveGraphSubscription(
          n?.subscriptionId,
          n?.clientState,
        );
        if (owner) this.scheduleReschedule(owner.userId);
      } catch (err: any) {
        this.logger.warn(`Outlook webhook handling failed: ${err?.message || err}`);
      }
    }
  }

  // ==================== DEBOUNCE ====================

  private scheduleReschedule(userId: string) {
    const existing = this.pending.get(userId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.pending.delete(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.autopilot
        .rescheduleDay(userId, today, 'calendar_change')
        .catch((err) =>
          this.logger.warn(`Autopilot reschedule after calendar change failed for ${userId}: ${err?.message || err}`),
        );
    }, this.DEBOUNCE_MS);
    // Don't keep the event loop alive purely for a pending debounce.
    if (typeof timer.unref === 'function') timer.unref();
    this.pending.set(userId, timer);
  }
}
