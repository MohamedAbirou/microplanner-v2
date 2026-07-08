import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { IntegrationsService } from './integrations.service';

/**
 * Slack integration: a daily plan digest posted to a configured channel and a
 * `/microplanner today` slash command. The Slack Web API surface (posting,
 * building the digest, listing channels) lives on IntegrationsService so the
 * cron, the slash command, and the on-demand "Sync/Send digest" action all
 * share one implementation.
 */
@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private integrationsService: IntegrationsService,
  ) {}

  /** Daily digest at 8am UTC to every Slack integration with a channel set. */
  @Cron('0 8 * * *', { name: 'slack-daily-digest', timeZone: 'UTC' })
  async postDailyDigests() {
    const integrations = await this.prisma.integration.findMany({
      where: { type: 'slack', isActive: true },
    });
    for (const integration of integrations) {
      if (!(integration.config as any)?.channelId) continue;
      try {
        await this.integrationsService.postSlackDigest(integration as any);
        this.logger.log(`Posted Slack digest for user ${integration.userId}`);
      } catch (err) {
        this.logger.warn(
          `Slack digest failed for ${integration.userId}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
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
    const text = await this.integrationsService.buildSlackTodaySummary(integration.userId);
    return { response_type: 'ephemeral', text };
  }
}
