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
import { HabitService, CreateHabitDto, UpdateHabitDto } from './habit.service';
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
  constructor(
    private readonly productivityService: ProductivityService,
    private readonly habitService: HabitService,
  ) {}

  // ==================== HABITS ====================

  @Get('habits')
  async getHabits(@Request() req: any) {
    return this.habitService.getHabits(req.user.id);
  }

  @Post('habits')
  async createHabit(@Request() req: any, @Body() dto: CreateHabitDto) {
    return this.habitService.createHabit(req.user.id, dto);
  }

  @Put('habits/:id')
  async updateHabit(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateHabitDto) {
    return this.habitService.updateHabit(id, req.user.id, dto);
  }

  @Delete('habits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHabit(@Request() req: any, @Param('id') id: string) {
    await this.habitService.deleteHabit(id, req.user.id);
  }

  // ==================== WORK HOURS ====================

  @Get('work-hours')
  async getWorkHours(@Request() req: any) {
    return this.productivityService.getWorkHours(req.user.id);
  }

  @Put('work-hours')
  async updateWorkHours(@Request() req: any, @Body() updateDto: UpsertWorkHoursDto) {
    return this.productivityService.updateWorkHours(req.user.id, updateDto);
  }

  // ==================== FOCUS TIME ====================

  @Post('focus-time')
  async createFocusTime(@Request() req: any, @Body() createDto: CreateFocusTimeDto) {
    return this.productivityService.createFocusTime(req.user.id, createDto);
  }

  @Get('focus-time')
  async getFocusTimeBlocks(@Request() req: any) {
    return this.productivityService.getFocusTimeBlocks(req.user.id);
  }

  @Put('focus-time/:id')
  async updateFocusTime(
    @Request() req: any,
    @Param('id') focusTimeId: string,
    @Body() updateDto: UpdateFocusTimeDto,
  ) {
    return this.productivityService.updateFocusTime(focusTimeId, req.user.id, updateDto);
  }

  @Delete('focus-time/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFocusTime(@Request() req: any, @Param('id') focusTimeId: string) {
    await this.productivityService.deleteFocusTime(focusTimeId, req.user.id);
  }

  // ==================== NO-MEETING DAYS ====================

  @Post('no-meeting-days')
  async createNoMeetingDay(@Request() req: any, @Body() createDto: CreateNoMeetingDayDto) {
    return this.productivityService.createNoMeetingDay(req.user.id, createDto);
  }

  @Get('no-meeting-days')
  async getNoMeetingDays(@Request() req: any) {
    return this.productivityService.getNoMeetingDays(req.user.id);
  }

  @Delete('no-meeting-days/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNoMeetingDay(@Request() req: any, @Param('id') dayId: string) {
    await this.productivityService.deleteNoMeetingDay(dayId, req.user.id);
  }

  // ==================== PRIORITY HOURS ====================

  @Get('priority-hours')
  async getPriorityHours(@Request() req: any) {
    return this.productivityService.getPriorityHours(req.user.id);
  }

  @Put('priority-hours')
  async updatePriorityHours(@Request() req: any, @Body() updateDto: UpdatePriorityHoursDto) {
    return this.productivityService.updatePriorityHours(req.user.id, updateDto);
  }

  // ==================== CALENDAR DEFENSE ====================

  @Get('calendar-defense')
  async getCalendarDefense(@Request() req: any) {
    return this.productivityService.getCalendarDefense(req.user.id);
  }

  @Put('calendar-defense')
  async updateCalendarDefense(@Request() req: any, @Body() updateDto: UpdateCalendarDefenseDto) {
    return this.productivityService.updateCalendarDefense(req.user.id, updateDto);
  }

  @Get('calendar-defense/log')
  async getCalendarDefenseLog(@Request() req: any, @Query('limit') limit?: string) {
    return this.productivityService.getCalendarDefenseLog(req.user.id, limit ? Number(limit) : 20);
  }

  @Post('calendar-defense/run')
  async runCalendarDefense(@Request() req: any) {
    return this.productivityService.runCalendarDefense(req.user.id);
  }

  // ==================== SMART 1:1 SCHEDULING ====================

  @Post('smart-1on1')
  async createSmart1on1(@Request() req: any, @Body() createDto: CreateSmart1on1Dto) {
    return this.productivityService.createSmart1on1(req.user.id, createDto);
  }

  @Get('smart-1on1')
  async getSmart1on1s(@Request() req: any) {
    return this.productivityService.getSmart1on1s(req.user.id);
  }

  @Put('smart-1on1/:id')
  async updateSmart1on1(
    @Request() req: any,
    @Param('id') smart1on1Id: string,
    @Body() updateDto: UpdateSmart1on1Dto,
  ) {
    return this.productivityService.updateSmart1on1(smart1on1Id, req.user.id, updateDto);
  }

  @Delete('smart-1on1/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSmart1on1(@Request() req: any, @Param('id') smart1on1Id: string) {
    await this.productivityService.deleteSmart1on1(smart1on1Id, req.user.id);
  }

  @Post('smart-1on1/:id/schedule')
  async scheduleSmart1on1(@Request() req: any, @Param('id') smart1on1Id: string) {
    return this.productivityService.scheduleNextSmart1on1(smart1on1Id, req.user.id);
  }

  // ==================== TRAVEL TIME ====================

  @Post('travel-time/calculate')
  async calculateTravelTime(@Request() req: any, @Body() dto: CalculateTravelTimeDto) {
    return this.productivityService.calculateTravelTime(req.user.id, dto);
  }

  // ==================== KANBAN BOARDS ====================

  @Post('kanban')
  async createKanbanBoard(@Request() req: any, @Body() createDto: CreateKanbanBoardDto) {
    return this.productivityService.createKanbanBoard(req.user.id, createDto);
  }

  @Get('kanban')
  async getKanbanBoards(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.productivityService.getKanbanBoards(req.user.id, projectId);
  }

  @Get('kanban/:id')
  async getKanbanBoard(@Request() req: any, @Param('id') boardId: string) {
    return this.productivityService.getKanbanBoard(boardId, req.user.id);
  }

  @Put('kanban/:id')
  async updateKanbanBoard(
    @Request() req: any,
    @Param('id') boardId: string,
    @Body() updateDto: UpdateKanbanBoardDto,
  ) {
    return this.productivityService.updateKanbanBoard(boardId, req.user.id, updateDto);
  }

  @Delete('kanban/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKanbanBoard(@Request() req: any, @Param('id') boardId: string) {
    await this.productivityService.deleteKanbanBoard(boardId, req.user.id);
  }

  @Post('kanban/move-task')
  async moveTaskInKanban(@Request() req: any, @Body() dto: MoveTaskInKanbanDto) {
    await this.productivityService.moveTaskInKanban(req.user.id, dto);
    return { success: true };
  }

  // ==================== PRODUCTIVITY SCORING ====================

  @Get('score/daily/:date')
  async getDailyProductivityScore(@Request() req: any, @Param('date') dateStr: string) {
    const date = new Date(dateStr);
    return this.productivityService.calculateProductivityScore(req.user.id, date);
  }

  @Get('score/range')
  async getProductivityScores(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productivityService.getProductivityScores(
      req.user.id,
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
      req.user.id,
      unreadOnly === 'true',
    );
  }

  @Post('notifications/:id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markNotificationAsRead(@Request() req: any, @Param('id') notificationId: string) {
    await this.productivityService.markNotificationAsRead(notificationId, req.user.id);
  }

  @Get('notifications/preferences')
  async getNotificationPreferences(@Request() req: any) {
    return this.productivityService.getNotificationPreferences(req.user.id);
  }

  @Put('notifications/preferences')
  async updateNotificationPreferences(
    @Request() req: any,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    return this.productivityService.updateNotificationPreferences(req.user.id, updateDto);
  }
}
