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
  CreateSubtaskDto,
  StartTimerDto,
  StopTimerDto,
  LogTimeDto,
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
    return this.advancedTasksService.createDependency(req.user.userId, createDto);
  }

  /**
   * Get task dependencies
   */
  @Get(':id/dependencies')
  async getTaskDependencies(@Request() req: any, @Param('id') taskId: string) {
    return this.advancedTasksService.getTaskDependencies(taskId, req.user.userId);
  }

  /**
   * Delete dependency
   */
  @Delete('dependencies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDependency(@Request() req: any, @Param('id') dependencyId: string) {
    await this.advancedTasksService.deleteDependency(dependencyId, req.user.userId);
  }

  // ==================== SUBTASKS ====================

  /**
   * Create subtask
   */
  @Post('subtasks')
  async createSubtask(@Request() req: any, @Body() createDto: CreateSubtaskDto) {
    return this.advancedTasksService.createSubtask(req.user.userId, createDto);
  }

  /**
   * Get subtasks
   */
  @Get(':id/subtasks')
  async getSubtasks(@Request() req: any, @Param('id') parentTaskId: string) {
    return this.advancedTasksService.getSubtasks(parentTaskId, req.user.userId);
  }

  // ==================== TIME TRACKING ====================

  /**
   * Start timer
   */
  @Post('timer/start')
  async startTimer(@Request() req: any, @Body() dto: StartTimerDto) {
    return this.advancedTasksService.startTimer(req.user.userId, dto);
  }

  /**
   * Stop timer
   */
  @Post('timer/stop')
  async stopTimer(@Request() req: any, @Body() dto: StopTimerDto) {
    return this.advancedTasksService.stopTimer(req.user.userId, dto);
  }

  /**
   * Log time manually
   */
  @Post('time/log')
  async logTime(@Request() req: any, @Body() dto: LogTimeDto) {
    return this.advancedTasksService.logTime(req.user.userId, dto);
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
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ==================== PROJECTS ====================

  /**
   * Create project
   */
  @Post('projects')
  async createProject(@Request() req: any, @Body() createDto: CreateProjectDto) {
    return this.advancedTasksService.createProject(req.user.userId, createDto);
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
      req.user.userId,
      includeArchived === 'true',
    );
  }

  /**
   * Get project with stats
   */
  @Get('projects/:id')
  async getProjectWithStats(@Request() req: any, @Param('id') projectId: string) {
    return this.advancedTasksService.getProjectWithStats(projectId, req.user.userId);
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
    return this.advancedTasksService.updateProject(projectId, req.user.userId, updateDto);
  }

  /**
   * Delete project
   */
  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Request() req: any, @Param('id') projectId: string) {
    await this.advancedTasksService.deleteProject(projectId, req.user.userId);
  }
}
