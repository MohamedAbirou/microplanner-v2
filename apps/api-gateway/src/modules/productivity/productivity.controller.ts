import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductivityService } from './productivity.service';
import {
  UpsertWorkHoursDto,
  CreateFocusTimeDto,
  UpdateFocusTimeDto,
  CreateNoMeetingDayDto,
  UpdatePriorityHoursDto,
  UpdateCalendarDefenseDto,
  CreateSmart1on1Dto,
  UpdateSmart1on1Dto,
  CalculateTravelTimeDto,
  CreateKanbanBoardDto,
  UpdateKanbanBoardDto,
  MoveTaskInKanbanDto,
  UpdateNotificationPreferencesDto,
} from './types/productivity.types';

/**
 * Productivity Controller (Phase 18)
 *
 * Complete feature parity + surpass ReclaimAI, Motion, Clockwise
 */
@Controller('productivity')
export class ProductivityController {
  constructor(private readonly productivityService: ProductivityService) {}

  // ==================== WORK HOURS ====================

  @Get('work-hours')
  async getWorkHours(@Request() req: any) {
    return this.productivityService.getWorkHours(req.user.userId);
  }

  @Put('work-hours')
  async updateWorkHours(@Request() req: any, @Body() updateDto: UpsertWorkHoursDto) {
    return this.productivityService.updateWorkHours(req.user.userId, updateDto);
  }

  // ==================== FOCUS TIME ====================

  @Post('focus-time')
  async createFocusTime(@Request() req: any, @Body() createDto: CreateFocusTimeDto) {
    return this.productivityService.createFocusTime(req.user.userId, createDto);
  }

  @Get('focus-time')
  async getFocusTimeBlocks(@Request() req: any) {
    return this.productivityService.getFocusTimeBlocks(req.user.userId);
  }

  @Put('focus-time/:id')
  async updateFocusTime(
    @Request() req: any,
    @Param('id') focusTimeId: string,
    @Body() updateDto: UpdateFocusTimeDto,
  ) {
    return this.productivityService.updateFocusTime(focusTimeId, req.user.userId, updateDto);
  }

  @Delete('focus-time/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFocusTime(@Request() req: any, @Param('id') focusTimeId: string) {
    await this.productivityService.deleteFocusTime(focusTimeId, req.user.userId);
  }

  // ==================== NO-MEETING DAYS ====================

  @Post('no-meeting-days')
  async createNoMeetingDay(@Request() req: any, @Body() createDto: CreateNoMeetingDayDto) {
    return this.productivityService.createNoMeetingDay(req.user.userId, createDto);
  }

  @Get('no-meeting-days')
  async getNoMeetingDays(@Request() req: any) {
    return this.productivityService.getNoMeetingDays(req.user.userId);
  }

  @Delete('no-meeting-days/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNoMeetingDay(@Request() req: any, @Param('id') dayId: string) {
    await this.productivityService.deleteNoMeetingDay(dayId, req.user.userId);
  }

  // ==================== PRIORITY HOURS ====================

  @Get('priority-hours')
  async getPriorityHours(@Request() req: any) {
    return this.productivityService.getPriorityHours(req.user.userId);
  }

  @Put('priority-hours')
  async updatePriorityHours(@Request() req: any, @Body() updateDto: UpdatePriorityHoursDto) {
    return this.productivityService.updatePriorityHours(req.user.userId, updateDto);
  }

  // ==================== CALENDAR DEFENSE ====================

  @Get('calendar-defense')
  async getCalendarDefense(@Request() req: any) {
    return this.productivityService.getCalendarDefense(req.user.userId);
  }

  @Put('calendar-defense')
  async updateCalendarDefense(@Request() req: any, @Body() updateDto: UpdateCalendarDefenseDto) {
    return this.productivityService.updateCalendarDefense(req.user.userId, updateDto);
  }

  // ==================== SMART 1:1 SCHEDULING ====================

  @Post('smart-1on1')
  async createSmart1on1(@Request() req: any, @Body() createDto: CreateSmart1on1Dto) {
    return this.productivityService.createSmart1on1(req.user.userId, createDto);
  }

  @Get('smart-1on1')
  async getSmart1on1s(@Request() req: any) {
    return this.productivityService.getSmart1on1s(req.user.userId);
  }

  @Put('smart-1on1/:id')
  async updateSmart1on1(
    @Request() req: any,
    @Param('id') smart1on1Id: string,
    @Body() updateDto: UpdateSmart1on1Dto,
  ) {
    return this.productivityService.updateSmart1on1(smart1on1Id, req.user.userId, updateDto);
  }

  @Delete('smart-1on1/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSmart1on1(@Request() req: any, @Param('id') smart1on1Id: string) {
    await this.productivityService.deleteSmart1on1(smart1on1Id, req.user.userId);
  }

  // ==================== TRAVEL TIME ====================

  @Post('travel-time/calculate')
  async calculateTravelTime(@Request() req: any, @Body() dto: CalculateTravelTimeDto) {
    return this.productivityService.calculateTravelTime(req.user.userId, dto);
  }

  // ==================== KANBAN BOARDS ====================

  @Post('kanban')
  async createKanbanBoard(@Request() req: any, @Body() createDto: CreateKanbanBoardDto) {
    return this.productivityService.createKanbanBoard(req.user.userId, createDto);
  }

  @Get('kanban')
  async getKanbanBoards(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.productivityService.getKanbanBoards(req.user.userId, projectId);
  }

  @Put('kanban/:id')
  async updateKanbanBoard(
    @Request() req: any,
    @Param('id') boardId: string,
    @Body() updateDto: UpdateKanbanBoardDto,
  ) {
    return this.productivityService.updateKanbanBoard(boardId, req.user.userId, updateDto);
  }

  @Delete('kanban/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKanbanBoard(@Request() req: any, @Param('id') boardId: string) {
    await this.productivityService.deleteKanbanBoard(boardId, req.user.userId);
  }

  @Post('kanban/move-task')
  async moveTaskInKanban(@Request() req: any, @Body() dto: MoveTaskInKanbanDto) {
    await this.productivityService.moveTaskInKanban(req.user.userId, dto);
    return { success: true };
  }

  // ==================== PRODUCTIVITY SCORING ====================

  @Get('score/daily/:date')
  async getDailyProductivityScore(@Request() req: any, @Param('date') dateStr: string) {
    const date = new Date(dateStr);
    return this.productivityService.calculateProductivityScore(req.user.userId, date);
  }

  @Get('score/range')
  async getProductivityScores(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productivityService.getProductivityScores(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ==================== SMART NOTIFICATIONS ====================

  @Get('notifications')
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.productivityService.getNotifications(
      req.user.userId,
      unreadOnly === 'true',
    );
  }

  @Post('notifications/:id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markNotificationAsRead(@Request() req: any, @Param('id') notificationId: string) {
    await this.productivityService.markNotificationAsRead(notificationId, req.user.userId);
  }

  @Get('notifications/preferences')
  async getNotificationPreferences(@Request() req: any) {
    return this.productivityService.getNotificationPreferences(req.user.userId);
  }

  @Put('notifications/preferences')
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    return this.productivityService.updateNotificationPreferences(req.user.userId, updateDto);
  }
}
