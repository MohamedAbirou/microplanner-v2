import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { PatternRecognitionService } from './pattern-recognition.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly patternRecognitionService: PatternRecognitionService,
  ) {}

  @Post('events')
  @ApiOperation({ summary: 'Track an analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@CurrentUser() user: User, @Body() trackEventDto: TrackEventDto) {
    const event = await this.analyticsService.trackEvent(user?.id || null, trackEventDto);

    return {
      message: 'Event tracked successfully',
      event: {
        id: event.id,
        event: event.event,
        timestamp: event.timestamp,
      },
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get user metrics for dashboard' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getUserMetrics(@CurrentUser() user: User) {
    const metrics = await this.analyticsService.getUserMetrics(user.id);

    return {
      message: 'Metrics retrieved successfully',
      metrics,
    };
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get weekly insights' })
  @ApiResponse({ status: 200, description: 'Weekly insights retrieved successfully' })
  async getWeeklyInsights(@CurrentUser() user: User) {
    const insights = await this.analyticsService.getWeeklyInsights(user.id);

    return {
      message: 'Weekly insights retrieved successfully',
      insights,
    };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get LLM usage statistics' })
  @ApiResponse({ status: 200, description: 'LLM usage statistics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to look back (default: 30)' })
  async getLLMUsage(@CurrentUser() user: User, @Query('days') days?: number) {
    const usage = await this.analyticsService.getLLMUsage(user.id, days ? parseInt(days.toString(), 10) : 30);

    return {
      message: 'LLM usage statistics retrieved successfully',
      usage,
    };
  }

  @Post('aggregate')
  @ApiOperation({ summary: 'Run analytics aggregation job (admin only)' })
  @ApiResponse({ status: 200, description: 'Aggregation job completed' })
  async aggregateMetrics() {
    const result = await this.analyticsService.aggregateMetrics();

    return {
      message: 'Analytics aggregation completed',
      ...result,
    };
  }

  /**
   * GET /analytics/patterns
   * Get AI-learned patterns and insights (PRO/PREMIUM only)
   */
  @Get('patterns')
  @ApiOperation({ summary: 'Get AI-learned pattern insights (PRO/PREMIUM)' })
  @ApiResponse({ status: 200, description: 'Pattern insights retrieved successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async getPatterns(@CurrentUser() user: User) {
    this.logger.log(`Fetching patterns for user ${user.id}`);

    // Try cached insights first
    let insights = await this.patternRecognitionService.getCachedInsights(user.id);

    // If no cache or stale (> 7 days), analyze fresh
    if (!insights || this.isStale(insights.lastUpdated)) {
      const result = await this.patternRecognitionService.analyzeUserPatterns(user.id);
      insights = result.insights;
    }

    return {
      message: 'Pattern insights retrieved successfully',
      insights,
      tier: user.tier,
    };
  }

  /**
   * POST /analytics/patterns/refresh
   * Force refresh pattern analysis (PRO/PREMIUM only)
   */
  @Post('patterns/refresh')
  @ApiOperation({ summary: 'Force refresh pattern analysis (PRO/PREMIUM)' })
  @ApiResponse({ status: 200, description: 'Pattern analysis refreshed successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async refreshPatterns(@CurrentUser() user: User) {
    this.logger.log(`Refreshing patterns for user ${user.id}`);

    const result = await this.patternRecognitionService.analyzeUserPatterns(user.id);

    return {
      message: 'Pattern analysis refreshed successfully',
      ...result,
    };
  }

  /**
   * Check if insights are stale (> 7 days old)
   */
  private isStale(lastUpdated: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(lastUpdated) < sevenDaysAgo;
  }
}
