import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  TaskDependency,
  DependencyType,
  CreateTaskDependencyDto,
  BatchDependenciesResult,
  BatchSubtasksResult,
  Subtask,
  CreateSubtaskDto,
  TimeEntry,
  StartTimerDto,
  StopTimerDto,
  LogTimeDto,
  TimeTrackingStats,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectWithStats,
  TaskWithDependencies,
} from './types/advanced-tasks.types';

/**
 * Advanced Tasks Service (Phase 17)
 *
 * Handles:
 * - Task dependencies
 * - Subtasks
 * - Time tracking
 * - Projects
 */
@Injectable()
export class AdvancedTasksService {
  private readonly logger = new Logger(AdvancedTasksService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== TASK DEPENDENCIES ====================

  /**
   * Create task dependency
   */
  async createDependency(
    userId: string,
    createDto: CreateTaskDependencyDto,
  ): Promise<TaskDependency> {
    // Verify both tasks belong to user
    const [dependentTask, blockingTask] = await Promise.all([
      this.prisma.task.findFirst({
        where: { id: createDto.dependentTaskId, userId },
      }),
      this.prisma.task.findFirst({
        where: { id: createDto.blockingTaskId, userId },
      }),
    ]);

    if (!dependentTask || !blockingTask) {
      throw new NotFoundException('One or both tasks not found');
    }

    // Check for circular dependencies
    const hasCircular = await this.hasCircularDependency(
      createDto.blockingTaskId,
      createDto.dependentTaskId,
    );

    if (hasCircular) {
      throw new BadRequestException('This would create a circular dependency');
    }

    const dependency = await this.prisma.taskDependency.create({
      data: {
        dependentTaskId: createDto.dependentTaskId,
        blockingTaskId: createDto.blockingTaskId,
        type: createDto.type || DependencyType.BLOCKS,
      },
    });

    this.logger.log(`Dependency created: ${dependency.id}`);

    return dependency as unknown as TaskDependency;
  }

  /**
   * Get task dependencies
   */
  async getTaskDependencies(taskId: string, userId: string): Promise<TaskWithDependencies> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        blockedBy: {
          include: {
            blockingTask: {
              select: { id: true, title: true, isCompleted: true },
            },
          },
        },
        dependencies: {
          include: {
            dependentTask: {
              select: { id: true, title: true, isCompleted: true },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const blockingTasks = task.blockedBy.map((dep: any) => dep.blockingTask);
    const dependentTasks = task.dependencies.map((dep: any) => dep.dependentTask);
    const isBlocked = blockingTasks.some((t: any) => !t.isCompleted);
    const canStart = !isBlocked;

    return {
      id: task.id,
      title: task.title,
      isCompleted: task.isCompleted,
      scheduledDate: task.scheduledDate,
      blockingTasks,
      dependentTasks,
      isBlocked,
      canStart,
    };
  }

  /**
   * Batch-fetch dependency edges for multiple tasks (one DB round-trip).
   * Returns every edge where either endpoint is in taskIds and both tasks
   * belong to the user.
   */
  async getDependenciesBatch(
    userId: string,
    taskIds: string[],
  ): Promise<BatchDependenciesResult> {
    const uniqueIds = [...new Set(taskIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return { edges: [] };
    }

    const edges = await this.prisma.taskDependency.findMany({
      where: {
        OR: [
          { blockingTaskId: { in: uniqueIds } },
          { dependentTaskId: { in: uniqueIds } },
        ],
        dependentTask: { userId },
        blockingTask: { userId },
      },
      select: {
        id: true,
        blockingTaskId: true,
        dependentTaskId: true,
        type: true,
        createdAt: true,
      },
    });

    return { edges };
  }

  /**
   * Batch-fetch subtasks for multiple parent tasks (one DB round-trip).
   */
  async getSubtasksBatch(
    userId: string,
    parentTaskIds: string[],
  ): Promise<BatchSubtasksResult> {
    const uniqueIds = [...new Set(parentTaskIds.filter(Boolean))];
    const byParentId: Record<string, Subtask[]> = Object.fromEntries(
      uniqueIds.map((id) => [id, []]),
    );

    if (uniqueIds.length === 0) {
      return { byParentId };
    }

    const subtasks = await this.prisma.task.findMany({
      where: {
        parentTaskId: { in: uniqueIds },
        userId,
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const row of subtasks) {
      const parentId = row.parentTaskId;
      if (!parentId) continue;
      if (!byParentId[parentId]) {
        byParentId[parentId] = [];
      }
      byParentId[parentId].push(row as unknown as Subtask);
    }

    return { byParentId };
  }

  /**
   * Delete dependency
   */
  async deleteDependency(dependencyId: string, userId: string): Promise<void> {
    const dependency = await this.prisma.taskDependency.findUnique({
      where: { id: dependencyId },
      include: { dependentTask: true },
    });

    if (!dependency) {
      throw new NotFoundException('Dependency not found');
    }

    if (dependency.dependentTask.userId !== userId) {
      throw new NotFoundException('Dependency not found');
    }

    await this.prisma.taskDependency.delete({
      where: { id: dependencyId },
    });

    this.logger.log(`Dependency deleted: ${dependencyId}`);
  }

  // ==================== SUBTASKS ====================

  /**
   * Create subtask
   */
  async createSubtask(userId: string, createDto: CreateSubtaskDto): Promise<Subtask> {
    // Verify parent task
    const parentTask = await this.prisma.task.findFirst({
      where: { id: createDto.parentTaskId, userId },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    const subtask = await this.prisma.task.create({
      data: {
        userId,
        parentTaskId: createDto.parentTaskId,
        title: createDto.title,
        durationMinutes: createDto.durationMinutes || 30,
        scheduledDate: createDto.scheduledDate || parentTask.scheduledDate,
        startTime: parentTask.startTime,
        endTime: parentTask.endTime,
        aiGenerated: false,
        manuallyAdded: true,
      },
    });

    this.logger.log(`Subtask created: ${subtask.id} under ${createDto.parentTaskId}`);

    return subtask as unknown as Subtask;
  }

  /**
   * Get subtasks
   */
  async getSubtasks(parentTaskId: string, userId: string): Promise<Subtask[]> {
    const parentTask = await this.prisma.task.findFirst({
      where: { id: parentTaskId, userId },
    });

    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    const subtasks = await this.prisma.task.findMany({
      where: { parentTaskId },
      orderBy: { createdAt: 'asc' },
    });

    return subtasks as unknown as Subtask[];
  }

  // ==================== TIME TRACKING ====================

  /**
   * Start timer for task
   */
  async startTimer(userId: string, dto: StartTimerDto): Promise<TimeEntry> {
    const task = await this.prisma.task.findFirst({
      where: { id: dto.taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.isTimerRunning) {
      throw new BadRequestException('Timer is already running for this task');
    }

    // Stop any other running timers
    await this.prisma.task.updateMany({
      where: { userId, isTimerRunning: true },
      data: {
        isTimerRunning: false,
        timerStartedAt: null,
      },
    });

    const updated = await this.prisma.task.update({
      where: { id: dto.taskId },
      data: {
        isTimerRunning: true,
        timerStartedAt: new Date(),
        actualStartTime: task.actualStartTime || new Date(),
      },
    });

    this.logger.log(`Timer started for task: ${dto.taskId}`);

    return this.getTimeEntry(updated);
  }

  /**
   * Stop timer for task
   */
  async stopTimer(userId: string, dto: StopTimerDto): Promise<TimeEntry> {
    const task = await this.prisma.task.findFirst({
      where: { id: dto.taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.isTimerRunning || !task.timerStartedAt) {
      throw new BadRequestException('Timer is not running for this task');
    }

    // Calculate elapsed time
    const elapsedMs = Date.now() - task.timerStartedAt.getTime();
    const elapsedMinutes = Math.round(elapsedMs / 60000);

    const updated = await this.prisma.task.update({
      where: { id: dto.taskId },
      data: {
        isTimerRunning: false,
        timerStartedAt: null,
        timeSpentMinutes: task.timeSpentMinutes + elapsedMinutes,
        actualEndTime: new Date(),
      },
    });

    this.logger.log(`Timer stopped for task: ${dto.taskId} (${elapsedMinutes} minutes)`);

    return this.getTimeEntry(updated);
  }

  /**
   * Log time manually
   */
  async logTime(userId: string, dto: LogTimeDto): Promise<TimeEntry> {
    const task = await this.prisma.task.findFirst({
      where: { id: dto.taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.prisma.task.update({
      where: { id: dto.taskId },
      data: {
        timeSpentMinutes: task.timeSpentMinutes + dto.minutes,
        actualStartTime: task.actualStartTime || dto.date || new Date(),
        actualEndTime: dto.date || new Date(),
      },
    });

    this.logger.log(`Time logged for task: ${dto.taskId} (${dto.minutes} minutes)`);

    return this.getTimeEntry(updated);
  }

  /**
   * Get time tracking stats
   */
  async getTimeTrackingStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TimeTrackingStats> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = startDate;
      if (endDate) where.scheduledDate.lte = endDate;
    }

    const tasks = await this.prisma.task.findMany({ where });

    const totalTrackedMinutes = tasks.reduce((sum, t) => sum + t.timeSpentMinutes, 0);
    const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const tasksWithTracking = tasks.filter((t) => t.timeSpentMinutes > 0).length;
    const tasksWithoutTracking = tasks.length - tasksWithTracking;

    const estimateAccuracy =
      totalEstimatedMinutes > 0
        ? Math.round((totalTrackedMinutes / totalEstimatedMinutes) * 100)
        : 0;

    const averageActualDuration =
      tasksWithTracking > 0 ? Math.round(totalTrackedMinutes / tasksWithTracking) : 0;

    // Most productive hours (simplified - would need actual timestamps)
    const mostProductiveHours: number[] = [];

    return {
      totalTrackedMinutes,
      totalEstimatedMinutes,
      estimateAccuracy,
      averageActualDuration,
      mostProductiveHours,
      tasksWithTracking,
      tasksWithoutTracking,
    };
  }

  // ==================== PROJECTS ====================

  private attachListStats<T extends Record<string, unknown>>(
    project: T,
    taskCount: number,
    completedTaskCount: number,
  ) {
    return {
      ...project,
      taskCount,
      completedTaskCount,
      progressPercentage:
        taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0,
    };
  }

  /**
   * Create project
   */
  async createProject(userId: string, createDto: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        userId,
        name: createDto.name,
        description: createDto.description || null,
        color: createDto.color || '#3B82F6',
        icon: createDto.icon || null,
        startDate: createDto.startDate || null,
        targetDate: createDto.targetDate || null,
      },
    });

    this.logger.log(`Project created: ${project.id} by user ${userId}`);

    return this.attachListStats(project, 0, 0) as unknown as Project;
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId: string, includeArchived = false): Promise<Project[]> {
    const where: any = { userId };
    if (!includeArchived) {
      where.isArchived = false;
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { select: { isCompleted: true } },
      },
    });

    return projects.map((project) => {
      const taskCount = project.tasks.length;
      const completedTaskCount = project.tasks.filter((t) => t.isCompleted).length;
      const { tasks, ...rest } = project;
      return this.attachListStats(rest, taskCount, completedTaskCount) as unknown as Project;
    });
  }

  /**
   * Get project with stats
   */
  async getProjectWithStats(projectId: string, userId: string): Promise<ProjectWithStats> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        tasks: true,
        goals: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const taskCount = project.tasks.length;
    const completedTaskCount = project.tasks.filter((t: any) => t.isCompleted).length;
    const totalEstimatedMinutes = project.tasks.reduce((sum: number, t: any) => sum + t.durationMinutes, 0);
    const totalTrackedMinutes = project.tasks.reduce((sum: number, t: any) => sum + t.timeSpentMinutes, 0);
    const progressPercentage = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
    const goalCount = project.goals.length;

    return {
      ...(project as any),
      tasks: undefined,
      goals: undefined,
      taskCount,
      completedTaskCount,
      totalEstimatedMinutes,
      totalTrackedMinutes,
      progressPercentage,
      goalCount,
    };
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    updateDto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: updateDto.name,
        description: updateDto.description,
        color: updateDto.color,
        icon: updateDto.icon,
        isArchived: updateDto.isArchived,
        archivedAt: updateDto.isArchived ? new Date() : null,
        startDate: updateDto.startDate,
        targetDate: updateDto.targetDate,
        completedAt: updateDto.completedAt,
      },
    });

    this.logger.log(`Project updated: ${projectId}`);

    return updated as unknown as Project;
  }

  /**
   * Archive / unarchive project
   */
  async setProjectArchived(
    projectId: string,
    userId: string,
    archived: boolean,
  ): Promise<Project> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        isArchived: archived,
        archivedAt: archived ? new Date() : null,
      },
    });

    this.logger.log(`Project ${archived ? 'archived' : 'unarchived'}: ${projectId}`);

    return updated as unknown as Project;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    this.logger.log(`Project deleted: ${projectId}`);
  }

  // ==================== HELPER METHODS ====================

  private async hasCircularDependency(
    startTaskId: string,
    targetTaskId: string,
  ): Promise<boolean> {
    // Simple BFS to detect circular dependencies
    const visited = new Set<string>();
    const queue = [startTaskId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === targetTaskId) {
        return true; // Found a cycle
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      // Get all tasks that depend on current task
      const dependencies = await this.prisma.taskDependency.findMany({
        where: { blockingTaskId: currentId },
        select: { dependentTaskId: true },
      });

      for (const dep of dependencies) {
        queue.push(dep.dependentTaskId);
      }
    }

    return false;
  }

  private getTimeEntry(task: any): TimeEntry {
    return {
      taskId: task.id,
      actualStartTime: task.actualStartTime,
      actualEndTime: task.actualEndTime,
      timeSpentMinutes: task.timeSpentMinutes,
      isTimerRunning: task.isTimerRunning,
      timerStartedAt: task.timerStartedAt,
    };
  }
}
