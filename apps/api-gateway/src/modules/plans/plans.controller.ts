import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@microplanner/database';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';

@ApiTags('plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate weekly AI plan' })
  @ApiResponse({ status: 201, description: 'Plan generated successfully' })
  @ApiResponse({ status: 400, description: 'No active goals found or planning service unavailable' })
  @ApiResponse({ status: 403, description: 'Weekly plan limit exceeded' })
  async generate(@CurrentUser() user: User, @Body() generatePlanDto: GeneratePlanDto) {
    const plan = await this.plansService.generate(user.id, generatePlanDto, user);

    return {
      message: 'Plan generated successfully',
      plan,
      metrics: {
        qualityScore: plan.qualityScore,
        generationTime: plan.generationTime,
        cost: plan.generationCost ? `$${(plan.generationCost / 100).toFixed(4)}` : null,
        aiModel: plan.aiModel,
      },
    };
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current week plan' })
  @ApiResponse({ status: 200, description: 'Current week plan retrieved' })
  @ApiResponse({ status: 404, description: 'No plan for current week' })
  async getCurrentWeek(@CurrentUser() user: User) {
    const plan = await this.plansService.getCurrentWeekPlan(user.id);

    if (!plan) {
      return {
        message: 'No plan found for current week',
        plan: null,
      };
    }

    return {
      message: 'Current week plan retrieved',
      plan,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const plan = await this.plansService.findOne(id, user.id);

    return {
      message: 'Plan retrieved successfully',
      plan,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get plan history with pagination' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@CurrentUser() user: User, @Query() query: QueryPlansDto) {
    const result = await this.plansService.findAll(user.id, query);

    return {
      message: 'Plans retrieved successfully',
      ...result,
    };
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept a generated plan' })
  @ApiResponse({ status: 200, description: 'Plan accepted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async accept(@CurrentUser() user: User, @Param('id') id: string) {
    const plan = await this.plansService.accept(id, user.id);

    return {
      message: 'Plan accepted successfully',
      plan,
    };
  }

  @Post(':id/regenerate')
  @ApiOperation({ summary: 'Regenerate plan for same week' })
  @ApiResponse({ status: 201, description: 'Plan regenerated successfully' })
  @ApiResponse({ status: 404, description: 'Original plan not found' })
  @ApiResponse({ status: 403, description: 'Weekly plan limit exceeded' })
  async regenerate(@CurrentUser() user: User, @Param('id') id: string) {
    const newPlan = await this.plansService.regenerate(id, user.id, user);

    return {
      message: 'Plan regenerated successfully',
      plan: newPlan,
      metrics: {
        qualityScore: newPlan.qualityScore,
        generationTime: newPlan.generationTime,
        cost: newPlan.generationCost ? `$${(newPlan.generationCost / 100).toFixed(4)}` : null,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive a plan' })
  @ApiResponse({ status: 204, description: 'Plan archived successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async archive(@CurrentUser() user: User, @Param('id') id: string) {
    await this.plansService.archive(id, user.id);
    // No content response
  }
}
