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
import { AdvancedTasksService } from './advanced-tasks.service';
import {
  CreateTaskDependencyDto,
  BatchTaskIdsDto,
  CreateSubtaskDto,
  StartTimerDto,
  StopTimerDto,
  LogTimeDto,
  UpdateTimeEntryDto,
  CreateProjectDto,
  UpdateProjectDto,
} from './types/advanced-tasks.types';

/**
 * Advanced Tasks Controller (Phase 17)
 *
 * Handles:
 * - Task dependencies
 * - Subtasks
 * - Time tracking
 * - Projects
 */
@Controller('tasks/advanced')
export class AdvancedTasksController {
  constructor(private readonly advancedTasksService: AdvancedTasksService) {}

  // ==================== TASK DEPENDENCIES ====================

  /**
   * Create task dependency
   */
  @Post('dependencies')
  async createDependency(@Request() req: any, @Body() createDto: CreateTaskDependencyDto) {
    return this.advancedTasksService.createDependency(req.user.id, createDto);
  }

  /**
   * Batch-fetch dependency edges for many tasks
   */
  @Post('dependencies/batch')
  async getDependenciesBatch(@Request() req: any, @Body() dto: BatchTaskIdsDto) {
    return this.advancedTasksService.getDependenciesBatch(req.user.id, dto.taskIds ?? []);
  }

  /**
   * Get task dependencies
   */
  @Get(':id/dependencies')
  async getTaskDependencies(@Request() req: any, @Param('id') taskId: string) {
    return this.advancedTasksService.getTaskDependencies(taskId, req.user.id);
  }

  /**
   * Delete dependency
   */
  @Delete('dependencies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDependency(@Request() req: any, @Param('id') dependencyId: string) {
    await this.advancedTasksService.deleteDependency(dependencyId, req.user.id);
  }

  // ==================== SUBTASKS ====================

  /**
   * Create subtask
   */
  @Post('subtasks')
  async createSubtask(@Request() req: any, @Body() createDto: CreateSubtaskDto) {
    return this.advancedTasksService.createSubtask(req.user.id, createDto);
  }

  /**
   * Batch-fetch subtasks for many parent tasks
   */
  @Post('subtasks/batch')
  async getSubtasksBatch(@Request() req: any, @Body() dto: BatchTaskIdsDto) {
    return this.advancedTasksService.getSubtasksBatch(req.user.id, dto.taskIds ?? []);
  }

  /**
   * Get subtasks
   */
  @Get(':id/subtasks')
  async getSubtasks(@Request() req: any, @Param('id') parentTaskId: string) {
    return this.advancedTasksService.getSubtasks(parentTaskId, req.user.id);
  }

  // ==================== TIME TRACKING ====================

  /**
   * Start timer
   */
  @Post('timer/start')
  async startTimer(@Request() req: any, @Body() dto: StartTimerDto) {
    return this.advancedTasksService.startTimer(req.user.id, dto);
  }

  /**
   * Stop timer
   */
  @Post('timer/stop')
  async stopTimer(@Request() req: any, @Body() dto: StopTimerDto) {
    return this.advancedTasksService.stopTimer(req.user.id, dto);
  }

  /**
   * Log time manually
   */
  @Post('time/log')
  async logTime(@Request() req: any, @Body() dto: LogTimeDto) {
    return this.advancedTasksService.logTime(req.user.id, dto);
  }

  /**
   * Get time tracking stats
   */
  @Get('time/stats')
  async getTimeTrackingStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.advancedTasksService.getTimeTrackingStats(
      req.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * List a task's time entries (history) — newest first.
   */
  @Get(':taskId/time-entries')
  async listTimeEntries(
    @Request() req: any,
    @Param('taskId') taskId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.advancedTasksService.listTimeEntries(
      req.user.id,
      taskId,
      take ? parseInt(take, 10) : undefined,
      skip ? parseInt(skip, 10) : undefined,
    );
  }

  /**
   * Edit a time entry (adjusts the task's tracked total).
   */
  @Put('time-entries/:id')
  async updateTimeEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.advancedTasksService.updateTimeEntry(req.user.id, id, {
      minutes: dto.minutes,
      note: dto.note,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
    });
  }

  /**
   * Delete a time entry (adjusts the task's tracked total).
   */
  @Delete('time-entries/:id')
  async deleteTimeEntry(@Request() req: any, @Param('id') id: string) {
    return this.advancedTasksService.deleteTimeEntry(req.user.id, id);
  }

  /**
   * Date-bounded flat time report for tables / CSV export.
   */
  @Get('time/report')
  async getTimeReport(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.advancedTasksService.getTimeReport(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ==================== PROJECTS ====================

  /**
   * Create project
   */
  @Post('projects')
  async createProject(@Request() req: any, @Body() createDto: CreateProjectDto) {
    return this.advancedTasksService.createProject(req.user.id, createDto);
  }

  /**
   * Get user's projects
   */
  @Get('projects')
  async getUserProjects(
    @Request() req: any,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.advancedTasksService.getUserProjects(
      req.user.id,
      includeArchived === 'true',
    );
  }

  /**
   * Batch-fetch projects by ID (list-card fields)
   */
  @Post('projects/batch')
  async getProjectsBatch(@Request() req: any, @Body() dto: { ids?: string[] }) {
    return this.advancedTasksService.getProjectsBatch(req.user.id, dto.ids ?? []);
  }

  /**
   * Get project with stats
   */
  @Get('projects/:id')
  async getProjectWithStats(@Request() req: any, @Param('id') projectId: string) {
    return this.advancedTasksService.getProjectWithStats(projectId, req.user.id);
  }

  /**
   * Get project stats (alias used by the GraphQL gateway)
   */
  @Get('projects/:id/stats')
  async getProjectStats(@Request() req: any, @Param('id') projectId: string) {
    return this.advancedTasksService.getProjectWithStats(projectId, req.user.id);
  }

  /**
   * Archive project
   */
  @Post('projects/:id/archive')
  async archiveProject(@Request() req: any, @Param('id') projectId: string) {
    return this.advancedTasksService.setProjectArchived(projectId, req.user.id, true);
  }

  /**
   * Unarchive project
   */
  @Post('projects/:id/unarchive')
  async unarchiveProject(@Request() req: any, @Param('id') projectId: string) {
    return this.advancedTasksService.setProjectArchived(projectId, req.user.id, false);
  }

  /**
   * Update project
   */
  @Put('projects/:id')
  async updateProject(
    @Request() req: any,
    @Param('id') projectId: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    return this.advancedTasksService.updateProject(projectId, req.user.id, updateDto);
  }

  /**
   * Delete project
   */
  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Request() req: any, @Param('id') projectId: string) {
    await this.advancedTasksService.deleteProject(projectId, req.user.id);
  }
}
