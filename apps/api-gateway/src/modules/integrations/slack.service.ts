import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';
import { IntegrationsService } from './integrations.service';

/**
 * Slack integration: a daily plan digest posted to a configured channel and a
 * `/microplanner today` slash command. Uses the bot token stored during OAuth.
 */
@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private integrationsService: IntegrationsService,
  ) {}

  private async postMessage(token: string, channel: string, text: string): Promise<void> {
    const { data } = await axios.post(
      'https://slack.com/api/chat.postMessage',
      { channel, text },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
    );
    if (!data.ok) {
      throw new Error(`Slack postMessage failed: ${data.error}`);
    }
  }

  /** Daily digest at 8am UTC to every Slack integration with a channel set. */
  @Cron('0 8 * * *', { name: 'slack-daily-digest', timeZone: 'UTC' })
  async postDailyDigests() {
    const integrations = await this.prisma.integration.findMany({
      where: { type: 'slack', isActive: true },
    });
    for (const integration of integrations) {
      const channel = (integration.config as any)?.channelId;
      if (!channel) continue;
      try {
        const creds = this.integrationsService.decryptIntegrationCredentials(integration);
        const token = creds?.access_token;
        if (!token) continue;
        const text = await this.buildTodaySummary(integration.userId);
        await this.postMessage(token, channel, text);
        this.logger.log(`Posted Slack digest for user ${integration.userId}`);
      } catch (err) {
        this.logger.warn(
          `Slack digest failed for ${integration.userId}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  private async buildTodaySummary(userId: string): Promise<string> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    const tasks = await this.prisma.task.findMany({
      where: { userId, scheduledDate: { gte: start, lte: end } },
      orderBy: [{ startTime: 'asc' }],
      take: 25,
    });
    if (tasks.length === 0) {
      return ':sunny: *Today* — no tasks scheduled. Enjoy the open space!';
    }
    const lines = tasks.map((t) => {
      const box = t.isCompleted ? ':white_check_mark:' : ':white_large_square:';
      return `${box} ${t.startTime} — ${t.title}`;
    });
    const done = tasks.filter((t) => t.isCompleted).length;
    return `:calendar: *Today's plan* (${done}/${tasks.length} done)\n${lines.join('\n')}`;
  }

  /** Verify a Slack request signature (raw body required for correctness). */
  verifySignature(rawBody: string, timestamp: string, signature: string): boolean {
    const secret = this.config.get<string>('SLACK_SIGNING_SECRET');
    if (!secret) return false;
    // Reject requests older than 5 minutes (replay protection).
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
    const base = `v0:${timestamp}:${rawBody}`;
    const hmac = 'v0=' + crypto.createHmac('sha256', secret).update(base).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * Handle `/microplanner today`. Maps the Slack workspace → the integration
   * that connected it, and returns that user's today summary.
   */
  async handleSlashCommand(body: Record<string, string>): Promise<{ response_type: string; text: string }> {
    const teamId = body.team_id;
    const integration = await this.prisma.integration.findFirst({
      where: { type: 'slack', isActive: true, config: { path: ['workspaceId'], equals: teamId } as any },
    });
    if (!integration) {
      return { response_type: 'ephemeral', text: 'This workspace is not linked to a MicroPlanner account.' };
    }
    const text = await this.buildTodaySummary(integration.userId);
    return { response_type: 'ephemeral', text };
  }
}
