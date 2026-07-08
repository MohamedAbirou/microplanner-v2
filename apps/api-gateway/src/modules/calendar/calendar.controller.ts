import { Controller, Get, Post, Put, Delete, Param, Query, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { OutlookOAuthService } from './services/outlook-oauth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { SyncTasksDto } from './dto/sync-tasks.dto';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly outlookOAuthService: OutlookOAuthService,
  ) {}

  @Get('oauth/outlook')
  @ApiOperation({ summary: 'Initiate Outlook Calendar OAuth flow' })
  async initiateOutlookOAuth(@CurrentUser() user: User) {
    return {
      message: 'Please visit the auth URL to connect your Outlook Calendar',
      authUrl: this.outlookOAuthService.generateAuthUrl(user.id),
    };
  }

  @Get('oauth/outlook/callback')
  @ApiOperation({ summary: 'Handle Outlook OAuth callback' })
  async outlookOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @CurrentUser() user: User,
  ) {
    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter');
    }
    const token = await this.outlookOAuthService.handleCallback(code, state, user.id);
    return {
      message: 'Outlook Calendar connected successfully',
      calendar: {
        email: token.email,
        calendarName: token.calendarName,
        provider: token.provider,
        connectedAt: token.createdAt,
      },
    };
  }

  @Get('oauth/google')
  @ApiOperation({ summary: 'Initiate Google Calendar OAuth flow' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL' })
  async initiateGoogleOAuth(@CurrentUser() user: User) {
    const authUrl = this.googleOAuthService.generateAuthUrl(user.id);

    return {
      message: 'Please visit the auth URL to connect your Google Calendar',
      authUrl,
    };
  }

  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Calendar connected successfully' })
  @ApiResponse({ status: 401, description: 'OAuth authorization failed' })
  @ApiQuery({ name: 'code', required: true, type: String })
  @ApiQuery({ name: 'state', required: true, type: String })
  async googleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @CurrentUser() user: User,
  ) {
    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter');
    }

    const token = await this.googleOAuthService.handleCallback(code, state, user.id);

    return {
      message: 'Google Calendar connected successfully',
      calendar: {
        email: token.email,
        calendarName: token.calendarName,
        provider: token.provider,
        connectedAt: token.createdAt,
      },
    };
  }

  @Get('events')
  @ApiOperation({ summary: 'Get calendar events for a date range' })
  @ApiResponse({ status: 200, description: 'Calendar events retrieved successfully' })
  @ApiResponse({ status: 401, description: 'No calendar connected' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date (YYYY-MM-DD)' })
  async getEvents(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const result = await this.calendarService.getEvents(user.id, start, end);

    return {
      message: 'Calendar events retrieved successfully',
      ...result,
    };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync tasks to Google Calendar' })
  @ApiResponse({ status: 200, description: 'Tasks synced successfully' })
  @ApiResponse({ status: 400, description: 'No tasks to sync or validation failed' })
  @ApiResponse({ status: 401, description: 'No calendar connected' })
  async syncTasks(@CurrentUser() user: User, @Body() syncTasksDto: SyncTasksDto) {
    const result = await this.calendarService.syncTasks(user.id, syncTasksDto);

    const message =
      result.failed === 0 && result.skipped === 0
        ? `Successfully synced ${result.success} tasks`
        : `Synced ${result.success} tasks, ${result.failed} failed, ${result.skipped} skipped due to conflicts`;

    return {
      message,
      ...result,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get calendar sync status' })
  @ApiResponse({ status: 200, description: 'Sync status retrieved successfully' })
  async getSyncStatus(@CurrentUser() user: User) {
    const status = await this.calendarService.getSyncStatus(user.id);

    return {
      message: status.connected ? 'Calendar connected' : 'No calendar connected',
      ...status,
    };
  }

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({ status: 200, description: 'Calendar disconnected successfully' })
  async disconnect(@CurrentUser() user: User) {
    await this.googleOAuthService.disconnect(user.id);

    return {
      message: 'Google Calendar disconnected successfully',
    };
  }

  // ============================================================
  // CONNECTIONS API — consumed by the GraphQL gateway datasource.
  // Returns bare entities (no {message,...} wrappers).
  // ============================================================

  @Get('connections')
  @ApiOperation({ summary: 'List calendar connections' })
  async listConnections(@CurrentUser() user: User) {
    return this.calendarService.listConnections(user.id);
  }

  @Post('connections')
  @ApiOperation({ summary: 'Create a connection from an OAuth code' })
  async createConnection(
    @CurrentUser() user: User,
    @Body() input: { provider: string; code: string; state?: string },
  ) {
    return this.calendarService.connectFromInput(user.id, input);
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Get a calendar connection' })
  async getConnection(@CurrentUser() user: User, @Param('id') id: string) {
    return this.calendarService.getConnection(id, user.id);
  }

  @Delete('connections/:id')
  @ApiOperation({ summary: 'Remove a calendar connection' })
  async deleteConnection(@CurrentUser() user: User, @Param('id') id: string) {
    await this.calendarService.disconnectConnection(id, user.id);
    return { success: true };
  }

  @Post('connections/:id/sync')
  @ApiOperation({ summary: 'Sync a specific calendar connection' })
  async syncConnection(@CurrentUser() user: User, @Param('id') id: string) {
    return this.calendarService.syncConnection(id, user.id);
  }

  @Get('connections/:id/events')
  @ApiOperation({ summary: 'Events for a specific connection' })
  async getConnectionEvents(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return this.calendarService.getConnectionEvents(id, user.id, start, end);
  }

  @Post('auth/initiate')
  @ApiOperation({ summary: 'Get OAuth URL for a calendar provider' })
  async initiateAuth(@CurrentUser() user: User, @Body('provider') provider: string) {
    return this.calendarService.initiateAuth(user.id, provider);
  }

  @Post('sync-all')
  @ApiOperation({ summary: 'Sync all calendar connections' })
  async syncAll(@CurrentUser() user: User) {
    return this.calendarService.syncAllConnections(user.id);
  }

  @Get('busy-slots')
  @ApiOperation({ summary: 'Busy slots across connected calendars' })
  async getBusySlots(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.calendarService.getBusySlots(user.id, new Date(startDate), new Date(endDate));
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a calendar event' })
  async createEvent(
    @CurrentUser() user: User,
    @Body()
    input: { title: string; description?: string; start: string; end: string; allDay?: boolean; location?: string },
  ) {
    return this.calendarService.createCalendarEvent(user.id, input);
  }

  @Put('events/:id')
  @ApiOperation({ summary: 'Update a calendar event' })
  async updateEvent(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body()
    input: { title?: string; description?: string; start?: string; end?: string; location?: string },
  ) {
    return this.calendarService.updateCalendarEvent(id, user.id, input);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  async deleteEvent(@CurrentUser() user: User, @Param('id') id: string) {
    await this.calendarService.deleteCalendarEvent(id, user.id);
    return { success: true };
  }
}
