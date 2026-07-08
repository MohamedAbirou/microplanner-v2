import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlanAutomationService } from './plan-automation.service';
import { PlanTemplatesService } from './plan-templates.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireSubscription } from '../auth/decorators/require-subscription.decorator';
import type { User } from '@microplanner/database';
import { SubscriptionTier } from '@microplanner/database';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { QueryPlansDto } from './dto/query-plans.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  QueryTemplatesDto,
  GenerateFromTemplateDto
} from './types/plan-template.types';

@ApiTags('plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  private readonly logger = new Logger(PlansController.name);

  constructor(
    private readonly plansService: PlansService,
    private readonly planAutomationService: PlanAutomationService,
    private readonly planTemplatesService: PlanTemplatesService,
  ) {}

  @Post('generate')
  // AI plan generation is the most expensive route (LLM cost + latency).
  // Cap it hard per user, independent of the tier weekly-plan quota which is
  // enforced separately in the service — this is abuse/burst protection.
  @Throttle({ strict: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate weekly AI plan' })
  @ApiResponse({ status: 201, description: 'Plan generated successfully' })
  @ApiResponse({ status: 400, description: 'No active goals found or planning service unavailable' })
  @ApiResponse({ status: 403, description: 'Weekly plan limit exceeded' })
  @ApiResponse({ status: 429, description: 'Too many plan generation requests' })
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

  @Post()
  @ApiOperation({ summary: 'Create a plan manually (empty draft, no AI)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async create(@CurrentUser() user: User, @Body() createPlanDto: CreatePlanDto) {
    const plan = await this.plansService.createManual(user.id, createPlanDto);

    return {
      message: 'Plan created successfully',
      plan,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update plan title/description/status' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto
  ) {
    const plan = await this.plansService.update(id, user.id, updatePlanDto);

    return {
      message: 'Plan updated successfully',
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
  async getAutomationMetrics(@CurrentUser() _user: User) {
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

  // ==================== PLAN TEMPLATES (PRO/PREMIUM) ====================

  /**
   * POST /plans/templates
   * Create a new plan template
   */
  @Post('templates')
  @ApiOperation({ summary: 'Create a new plan template (PRO/PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async createTemplate(@CurrentUser() user: User, @Body() createDto: CreateTemplateDto) {
    this.logger.log(`Creating template "${createDto.name}" for user ${user.id}`);

    const template = await this.planTemplatesService.create(user.id, createDto, user.tier);

    return {
      message: 'Template created successfully',
      template,
    };
  }

  /**
   * POST /plans/:id/save-as-template
   * Create template from existing plan
   */
  @Post(':id/save-as-template')
  @ApiOperation({ summary: 'Save plan as template (PRO/PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Template created from plan' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async saveAsTemplate(
    @CurrentUser() user: User,
    @Param('id') planId: string,
    @Body() body: { name: string; description?: string },
  ) {
    this.logger.log(`Saving plan ${planId} as template for user ${user.id}`);

    const template = await this.planTemplatesService.createFromPlan(
      user.id,
      planId,
      body.name,
      body.description,
    );

    return {
      message: 'Plan saved as template successfully',
      template,
    };
  }

  /**
   * GET /plans/templates
   * Get all templates (user's + public)
   */
  @Get('templates')
  @ApiOperation({ summary: 'Get all plan templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@CurrentUser() user: User, @Query() query: QueryTemplatesDto) {
    const result = await this.planTemplatesService.findAll(user.id, query);

    return {
      message: 'Templates retrieved successfully',
      ...result,
    };
  }

  /**
   * GET /plans/templates/stats
   * Get template statistics
   */
  @Get('templates/stats')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Template statistics retrieved' })
  async getTemplateStats(@CurrentUser() user: User) {
    const stats = await this.planTemplatesService.getStats(user.id);

    return {
      message: 'Template statistics retrieved',
      stats,
    };
  }

  /**
   * GET /plans/templates/default
   * Get user's default template
   */
  @Get('templates/default')
  @ApiOperation({ summary: 'Get default template' })
  @ApiResponse({ status: 200, description: 'Default template retrieved' })
  async getDefaultTemplate(@CurrentUser() user: User) {
    const template = await this.planTemplatesService.getDefault(user.id);

    if (!template) {
      return {
        message: 'No default template set',
        template: null,
      };
    }

    return {
      message: 'Default template retrieved',
      template,
    };
  }

  /**
   * GET /plans/templates/:id
   * Get single template by ID
   */
  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(@CurrentUser() user: User, @Param('id') templateId: string) {
    const template = await this.planTemplatesService.findOne(templateId, user.id);

    return {
      message: 'Template retrieved successfully',
      template,
    };
  }

  /**
   * PUT /plans/templates/:id
   * Update a template
   */
  @Put('templates/:id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async updateTemplate(
    @CurrentUser() user: User,
    @Param('id') templateId: string,
    @Body() updateDto: UpdateTemplateDto,
  ) {
    this.logger.log(`Updating template ${templateId}`);

    const template = await this.planTemplatesService.update(templateId, user.id, updateDto);

    return {
      message: 'Template updated successfully',
      template,
    };
  }

  /**
   * PUT /plans/templates/:id/set-default
   * Set template as default
   */
  @Put('templates/:id/set-default')
  @ApiOperation({ summary: 'Set template as default' })
  @ApiResponse({ status: 200, description: 'Template set as default' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async setDefaultTemplate(@CurrentUser() user: User, @Param('id') templateId: string) {
    const template = await this.planTemplatesService.setDefault(templateId, user.id);

    return {
      message: 'Template set as default',
      template,
    };
  }

  /**
   * DELETE /plans/templates/:id
   * Delete a template
   */
  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async deleteTemplate(@CurrentUser() user: User, @Param('id') templateId: string) {
    await this.planTemplatesService.delete(templateId, user.id);
    // No content response
  }

  /**
   * POST /plans/generate-from-template
   * Generate plan from template
   */
  @Post('generate-from-template')
  @ApiOperation({ summary: 'Generate plan from template (PRO/PREMIUM only)' })
  @ApiResponse({ status: 201, description: 'Plan generated from template successfully' })
  @RequireSubscription([SubscriptionTier.PRO, SubscriptionTier.PREMIUM])
  async generateFromTemplate(@CurrentUser() user: User, @Body() generateDto: GenerateFromTemplateDto) {
    this.logger.log(`Generating plan from template ${generateDto.templateId} for user ${user.id}`);

    // Generate tasks from template
    const tasks = await this.planTemplatesService.generateTasksFromTemplate(
      generateDto.templateId,
      user.id,
      generateDto,
    );

    // Create plan with generated tasks (using PlansService to save to database)
    const plan = await this.plansService.generateFromTemplate(user.id, generateDto.weekStartDate, tasks, user);

    return {
      message: 'Plan generated from template successfully',
      plan,
      metrics: {
        totalTasks: tasks.length,
        templateId: generateDto.templateId,
      },
    };
  }

  // NOTE: keep this LAST — a parameterized GET :id declared earlier would
  // shadow literal routes like GET /plans/templates and GET /plans/current.
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
}
