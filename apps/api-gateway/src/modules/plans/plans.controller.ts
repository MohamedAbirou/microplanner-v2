import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlanAutomationService } from './plan-automation.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';

@ApiTags('plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(
    private readonly plansService: PlansService,
    private readonly planAutomationService: PlanAutomationService,
  ) {}

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

  /**
   * POST /plans/automation/trigger
   * Manually trigger weekly plan auto-regeneration (admin/testing)
   */
  @Post('automation/trigger')
  @ApiOperation({ summary: 'Manually trigger weekly plan auto-regeneration (PRO/PREMIUM only)' })
  @ApiResponse({ status: 200, description: 'Auto-regeneration triggered successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async triggerAutomation(@CurrentUser() user: User) {
    this.logger.log(`Manual automation trigger by user ${user.id}`);

    const result = await this.planAutomationService.manualTrigger();

    return {
      message: 'Weekly plan auto-regeneration completed',
      ...result,
    };
  }

  /**
   * GET /plans/automation/metrics
   * Get automation metrics
   */
  @Get('automation/metrics')
  @ApiOperation({ summary: 'Get plan automation metrics' })
  @ApiResponse({ status: 200, description: 'Automation metrics retrieved' })
  async getAutomationMetrics(@CurrentUser() user: User) {
    const metrics = this.planAutomationService.getMetrics();

    return {
      message: 'Automation metrics retrieved',
      metrics,
    };
  }

  /**
   * POST /plans/automation/generate-next-week
   * Auto-generate plan for next week (PRO/PREMIUM users only)
   */
  @Post('automation/generate-next-week')
  @ApiOperation({ summary: 'Auto-generate plan for next week (PRO/PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Plan auto-generated for next week' })
  @ApiResponse({ status: 400, description: 'Plan already exists or user not eligible' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async autoGenerateNextWeek(@CurrentUser() user: User) {
    this.logger.log(`Auto-generating next week plan for user ${user.id}`);

    const result = await this.planAutomationService.generateForUser(user.id);

    if (!result.success) {
      return {
        message: result.error || 'Failed to auto-generate plan',
        success: false,
      };
    }

    return {
      message: 'Plan auto-generated for next week',
      success: true,
      planId: result.planId,
    };
  }
}
