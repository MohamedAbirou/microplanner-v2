import { SubscriptionTier, SubscriptionTierType } from '@microplanner/database';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateTemplateDto,
  GenerateFromTemplateDto,
  PlanTemplate,
  QueryTemplatesDto,
  TemplateCategory,
  TemplateStats,
  TemplateTask,
  UpdateTemplateDto,
} from './types/plan-template.types';

/**
 * Plan Templates Service
 *
 * Manages plan templates for PRO/PREMIUM users:
 * - Create templates from existing plans or scratch
 * - Save/edit/delete templates
 * - Generate plans from templates
 * - Share public templates
 * - Template marketplace (public templates)
 */
@Injectable()
export class PlanTemplatesService {
  private readonly logger = new Logger(PlanTemplatesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new plan template
   * PRO/PREMIUM only
   */
  async create(
    userId: string,
    createDto: CreateTemplateDto,
    userTier: SubscriptionTierType
  ): Promise<PlanTemplate> {
    // Validate tier
    if (userTier !== SubscriptionTier.PRO && userTier !== SubscriptionTier.PREMIUM) {
      throw new ForbiddenException('Plan templates are only available for PRO/PREMIUM users');
    }

    // Validate tasks
    if (!createDto.tasks || createDto.tasks.length === 0) {
      throw new BadRequestException('Template must have at least one task');
    }

    // Calculate metadata
    const estimatedTotalHours =
      createDto.tasks.reduce((sum, task) => sum + task.durationMinutes, 0) / 60;
    const tasksPerDay = this.calculateTasksPerDay(createDto.tasks);

    // If setting as default, unset other defaults
    if (createDto.isDefault) {
      await this.prisma.planTemplate.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    this.logger.log(`Creating plan template "${createDto.name}" for user ${userId}`);

    // Create template
    const template = await this.prisma.planTemplate.create({
      data: {
        userId,
        name: createDto.name,
        description: createDto.description || null,
        category: createDto.category,
        tasks: createDto.tasks as any,
        estimatedTotalHours,
        tasksPerDay: tasksPerDay as any,
        isPublic: createDto.isPublic || false,
        isDefault: createDto.isDefault || false,
        usageCount: 0,
        tags: createDto.tags || [],
      },
    });

    this.logger.log(`Template created: ${template.id}`);

    return template as unknown as PlanTemplate;
  }

  /**
   * Create template from existing weekly plan
   */
  async createFromPlan(
    userId: string,
    planId: string,
    templateName: string,
    templateDescription?: string
  ): Promise<PlanTemplate> {
    // Fetch the plan
    const plan = await this.prisma.weeklyPlan.findFirst({
      where: { id: planId, userId },
      include: {
        tasks: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (!plan.tasks || plan.tasks.length === 0) {
      throw new BadRequestException('Plan has no tasks to convert to template');
    }

    // Convert tasks to template tasks
    const templateTasks: TemplateTask[] = plan.tasks.map(task => {
      const scheduledDate = new Date(task.scheduledDate);
      const dayOfWeek = scheduledDate.getDay();

      return {
        title: task.title,
        notes: task.notes,
        durationMinutes: task.durationMinutes,
        dayOfWeek,
        startTime: task.startTime,
        endTime: task.endTime,
        priority: 'medium',
        tags: [],
      };
    });

    // Create template
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    return this.create(
      userId,
      {
        name: templateName,
        description: templateDescription,
        category: TemplateCategory.CUSTOM,
        tasks: templateTasks,
        isPublic: false,
        tags: ['from-plan'],
      },
      user!.tier as SubscriptionTierType
    );
  }

  /**
   * Get all templates for a user (including public templates)
   */
  async findAll(
    userId: string,
    query: QueryTemplatesDto
  ): Promise<{
    templates: PlanTemplate[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      category,
      isPublic,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { userId }, // User's own templates
        { isPublic: true }, // Public templates
      ],
    };

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [templates, total] = await Promise.all([
      this.prisma.planTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.planTemplate.count({ where }),
    ]);

    return {
      templates: templates as unknown as PlanTemplate[],
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single template by ID
   */
  async findOne(templateId: string, userId: string): Promise<PlanTemplate> {
    const template = await this.prisma.planTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { userId }, // User's own template
          { isPublic: true }, // Public template
        ],
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template as unknown as PlanTemplate;
  }

  /**
   * Update a template
   */
  async update(
    templateId: string,
    userId: string,
    updateDto: UpdateTemplateDto
  ): Promise<PlanTemplate> {
    // Verify ownership
    const template = await this.prisma.planTemplate.findFirst({
      where: { id: templateId, userId }, // Only owner can update
    });

    if (!template) {
      throw new NotFoundException('Template not found or you do not have permission to update it');
    }

    // If setting as default, unset other defaults
    if (updateDto.isDefault) {
      await this.prisma.planTemplate.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Recalculate metadata if tasks changed
    let estimatedTotalHours = template.estimatedTotalHours;
    let tasksPerDay = template.tasksPerDay;

    if (updateDto.tasks) {
      estimatedTotalHours =
        updateDto.tasks.reduce((sum, task) => sum + task.durationMinutes, 0) / 60;
      tasksPerDay = this.calculateTasksPerDay(updateDto.tasks);
    }

    this.logger.log(`Updating template ${templateId}`);

    const updated = await this.prisma.planTemplate.update({
      where: { id: templateId },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.description !== undefined && { description: updateDto.description }),
        ...(updateDto.category && { category: updateDto.category }),
        ...(updateDto.tasks && {
          tasks: updateDto.tasks as any,
          estimatedTotalHours,
          tasksPerDay: tasksPerDay as any,
        }),
        ...(updateDto.isPublic !== undefined && { isPublic: updateDto.isPublic }),
        ...(updateDto.isDefault !== undefined && { isDefault: updateDto.isDefault }),
        ...(updateDto.tags && { tags: updateDto.tags }),
      },
    });

    return updated as unknown as PlanTemplate;
  }

  /**
   * Delete a template
   */
  async delete(templateId: string, userId: string): Promise<void> {
    // Verify ownership
    const template = await this.prisma.planTemplate.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Template not found or you do not have permission to delete it');
    }

    this.logger.log(`Deleting template ${templateId}`);

    await this.prisma.planTemplate.delete({
      where: { id: templateId },
    });
  }

  /**
   * Generate tasks from template for a specific week
   * Returns task definitions ready for plan creation
   */
  async generateTasksFromTemplate(
    templateId: string,
    userId: string,
    generateDto: GenerateFromTemplateDto
  ): Promise<
    Array<{
      title: string;
      notes: string | null;
      scheduledDate: Date;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      goalId: string | null;
    }>
  > {
    // Fetch template
    const template = await this.findOne(templateId, userId);

    // Increment usage count
    await this.prisma.planTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    // Parse week start date
    const weekStart = new Date(generateDto.weekStartDate);
    weekStart.setHours(0, 0, 0, 0);

    // Apply adjustments
    const scaleDuration = generateDto.adjustments?.scaleDuration || 1.0;
    const shiftDays = generateDto.adjustments?.shiftDays || 0;
    const filterDays = generateDto.adjustments?.filterDays;

    // Generate tasks
    const tasks = template.tasks
      .map((templateTask: any) => {
        let dayOfWeek = templateTask.dayOfWeek + shiftDays;

        // Handle day wrapping
        dayOfWeek = ((dayOfWeek % 7) + 7) % 7;

        // Filter days if specified
        if (filterDays && !filterDays.includes(dayOfWeek)) {
          return null;
        }

        // Calculate scheduled date
        const scheduledDate = new Date(weekStart);
        // Adjust from week start (Monday = 1) to day of week (Sunday = 0)
        const daysFromStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        scheduledDate.setDate(weekStart.getDate() + daysFromStart);

        // Scale duration
        const durationMinutes = Math.round(templateTask.durationMinutes * scaleDuration);

        // Map goal title to goal ID
        let goalId: string | null = null;
        if (templateTask.goalTitle && generateDto.goalMappings) {
          goalId = generateDto.goalMappings[templateTask.goalTitle] || null;
        }

        return {
          title: templateTask.title,
          notes: templateTask.notes || null,
          scheduledDate,
          startTime: templateTask.startTime,
          endTime: templateTask.endTime,
          durationMinutes,
          goalId,
        };
      })
      .filter(Boolean); // Remove null entries

    this.logger.log(`Generated ${tasks.length} tasks from template ${templateId}`);

    return tasks as any;
  }

  /**
   * Get user's template statistics
   */
  async getStats(userId: string): Promise<TemplateStats> {
    const templates = await this.prisma.planTemplate.findMany({
      where: { userId },
    });

    const totalTemplates = templates.length;
    const publicTemplates = templates.filter(t => t.isPublic).length;
    const privateTemplates = totalTemplates - publicTemplates;
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

    // Category counts
    const categoryCounts: Record<string, number> = {};
    for (const category of Object.values(TemplateCategory)) {
      categoryCounts[category] = templates.filter(t => t.category === category).length;
    }

    // Average tasks per template
    const averageTasksPerTemplate =
      totalTemplates > 0
        ? templates.reduce((sum, t) => sum + (t.tasks as any[]).length, 0) / totalTemplates
        : 0;

    // Most used template
    const sortedByUsage = [...templates].sort((a, b) => b.usageCount - a.usageCount);
    const mostUsedTemplate =
      sortedByUsage.length > 0
        ? {
            id: sortedByUsage[0].id,
            name: sortedByUsage[0].name,
            usageCount: sortedByUsage[0].usageCount,
          }
        : null;

    return {
      totalTemplates,
      publicTemplates,
      privateTemplates,
      totalUsage,
      categoryCounts: categoryCounts as any,
      averageTasksPerTemplate,
      mostUsedTemplate,
    };
  }

  /**
   * Get default template for user
   */
  async getDefault(userId: string): Promise<PlanTemplate | null> {
    const template = await this.prisma.planTemplate.findFirst({
      where: { userId, isDefault: true },
    });

    return template as unknown as PlanTemplate | null;
  }

  /**
   * Set template as default
   */
  async setDefault(templateId: string, userId: string): Promise<PlanTemplate> {
    // Verify ownership
    const template = await this.prisma.planTemplate.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Unset other defaults
    await this.prisma.planTemplate.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set as default
    const updated = await this.prisma.planTemplate.update({
      where: { id: templateId },
      data: { isDefault: true },
    });

    this.logger.log(`Set template ${templateId} as default for user ${userId}`);

    return updated as unknown as PlanTemplate;
  }

  /**
   * Calculate tasks per day distribution
   */
  private calculateTasksPerDay(tasks: TemplateTask[]): Record<number, number> {
    const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    for (const task of tasks) {
      distribution[task.dayOfWeek] = (distribution[task.dayOfWeek] || 0) + 1;
    }

    return distribution;
  }
}
