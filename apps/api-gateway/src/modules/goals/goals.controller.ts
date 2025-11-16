import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { QueryGoalsDto } from './dto/query-goals.dto';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiResponse({ status: 403, description: 'Tier limit exceeded' })
  async create(@CurrentUser() user: User, @Body() createGoalDto: CreateGoalDto) {
    const goal = await this.goalsService.create(user.id, createGoalDto, user.tier);

    return {
      message: 'Goal created successfully',
      goal,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPaused', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@CurrentUser() user: User, @Query() query: QueryGoalsDto) {
    const result = await this.goalsService.findAll(user.id, query);

    return {
      message: 'Goals retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const goal = await this.goalsService.findOne(id, user.id);

    return {
      message: 'Goal retrieved successfully',
      goal,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto
  ) {
    const goal = await this.goalsService.update(id, user.id, updateGoalDto);

    return {
      message: 'Goal updated successfully',
      goal,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a goal (set inactive)' })
  @ApiResponse({ status: 204, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    await this.goalsService.remove(id, user.id);
    // No content response
  }

  @Put(':id/pause')
  @ApiOperation({ summary: 'Pause a goal' })
  @ApiResponse({ status: 200, description: 'Goal paused successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async pause(@CurrentUser() user: User, @Param('id') id: string) {
    const goal = await this.goalsService.pause(id, user.id);

    return {
      message: 'Goal paused successfully',
      goal,
    };
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate (unpause) a goal' })
  @ApiResponse({ status: 200, description: 'Goal activated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({ status: 403, description: 'Goal is not paused' })
  async activate(@CurrentUser() user: User, @Param('id') id: string) {
    const goal = await this.goalsService.activate(id, user.id);

    return {
      message: 'Goal activated successfully',
      goal,
    };
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get goal analytics and progress metrics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async getAnalytics(@CurrentUser() user: User, @Param('id') id: string) {
    // First verify ownership
    await this.goalsService.findOne(id, user.id);

    // Calculate and return analytics
    const goal = await this.goalsService.calculateAnalytics(id);

    return {
      message: 'Analytics retrieved successfully',
      analytics: {
        totalScheduled: goal.totalScheduled,
        totalCompletions: goal.totalCompletions,
        completionRate: goal.completionRate,
        currentStreak: goal.currentStreak,
        longestStreak: goal.longestStreak,
        lastCompletedAt: goal.lastCompletedAt,
      },
    };
  }
}
