import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { TrackEventDto } from './dto/track-event.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
}
