import { Controller, Post, Get, Put, Delete, Patch, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { SkipTaskDto } from './dto/skip-task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a manual task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or time validation failed' })
  @ApiResponse({ status: 403, description: 'Daily task limit exceeded' })
  async create(@CurrentUser() user: User, @Body() createTaskDto: CreateTaskDto) {
    const task = await this.tasksService.create(user.id, createTaskDto, user.tier);

    return {
      message: 'Task created successfully',
      task,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'weekStart', required: false, type: String, description: 'Filter by week start (Monday)' })
  @ApiQuery({ name: 'goalId', required: false, type: String })
  @ApiQuery({ name: 'planId', required: false, type: String })
  @ApiQuery({ name: 'isCompleted', required: false, type: Boolean })
  @ApiQuery({ name: 'aiGenerated', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@CurrentUser() user: User, @Query() query: QueryTasksDto) {
    const result = await this.tasksService.findAll(user.id, query);

    return {
      message: 'Tasks retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const task = await this.tasksService.findOne(id, user.id);

    return {
      message: 'Task retrieved successfully',
      task,
    };
  }

  @Get(':id/reschedule-suggestion')
  @ApiOperation({ summary: 'Suggest the next available slot to reschedule a task' })
  @ApiResponse({ status: 200, description: 'Suggestion returned (may be null)' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async rescheduleSuggestion(@CurrentUser() user: User, @Param('id') id: string) {
    const suggestion = await this.tasksService.suggestReschedule(id, user.id);
    return { suggestion };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Invalid input or time validation failed' })
  async update(@CurrentUser() user: User, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksService.update(id, user.id, updateTaskDto);

    return {
      message: 'Task updated successfully',
      task,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.tasksService.remove(id, user.id);
    // No content response
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark task as complete' })
  @ApiResponse({ status: 200, description: 'Task marked as complete' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Task is already completed' })
  async complete(@CurrentUser() user: User, @Param('id') id: string) {
    const task = await this.tasksService.complete(id, user.id);

    return {
      message: 'Task marked as complete',
      task,
      analytics: {
        goalAnalyticsUpdated: !!task.goalId,
        planAnalyticsUpdated: !!task.planId,
      },
    };
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Mark task as skipped with optional reason' })
  @ApiResponse({ status: 200, description: 'Task marked as skipped' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Task is already skipped' })
  async skip(@CurrentUser() user: User, @Param('id') id: string, @Body() skipTaskDto: SkipTaskDto) {
    const task = await this.tasksService.skip(id, user.id, skipTaskDto);

    return {
      message: 'Task marked as skipped',
      task,
      analytics: {
        goalAnalyticsUpdated: !!task.goalId,
        planAnalyticsUpdated: !!task.planId,
      },
    };
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on multiple tasks' })
  @ApiResponse({ status: 200, description: 'Bulk operation completed' })
  @ApiResponse({ status: 400, description: 'Invalid operation or missing data' })
  async bulkOperation(@CurrentUser() user: User, @Body() bulkOperationDto: BulkOperationDto) {
    const result = await this.tasksService.bulkOperation(user.id, bulkOperationDto);

    return {
      message: `Bulk operation completed: ${result.success} successful, ${result.failed} failed`,
      ...result,
    };
  }
}
