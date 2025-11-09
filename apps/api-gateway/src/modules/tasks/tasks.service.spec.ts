import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../database/prisma.service';
import { GoalsService } from '../goals/goals.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SyncStatus } from '@microplanner/database';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let goalsService: GoalsService;

  const mockPrismaService = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    weeklyPlan: {
      update: jest.fn(),
    },
  };

  const mockGoalsService = {
    findOne: jest.fn(),
    calculateAnalytics: jest.fn(),
  };

  const mockTask = {
    id: 'task-1',
    userId: 'user-1',
    goalId: 'goal-1',
    planId: 'plan-1',
    title: 'Test Task',
    notes: 'Test notes',
    scheduledDate: new Date('2025-01-13'),
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    isCompleted: false,
    completedAt: null,
    isSkipped: false,
    skippedReason: null,
    skippedAt: null,
    aiGenerated: false,
    manuallyAdded: true,
    manuallyMoved: false,
    aiReasoning: null,
    calendarEventId: null,
    calendarProvider: null,
    syncedAt: null,
    syncStatus: SyncStatus.PENDING,
    syncError: null,
    localId: null,
    pendingSync: false,
    offlineCreatedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GoalsService, useValue: mockGoalsService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
    goalsService = module.get<GoalsService>(GoalsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a manual task successfully', async () => {
      const createDto = {
        title: 'Test Task',
        notes: 'Test notes',
        scheduledDate: '2025-01-13',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        goalId: 'goal-1',
      };

      mockGoalsService.findOne.mockResolvedValue({ id: 'goal-1', userId: 'user-1' });
      mockPrismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create('user-1', createDto);

      expect(result).toEqual(mockTask);
      expect(mockGoalsService.findOne).toHaveBeenCalledWith('goal-1', 'user-1');
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          goalId: 'goal-1',
          title: 'Test Task',
          aiGenerated: false,
          manuallyAdded: true,
        }),
      });
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      const createDto = {
        title: 'Test Task',
        scheduledDate: '2025-01-13',
        startTime: '10:00',
        endTime: '09:00',
        durationMinutes: 60,
      };

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duration does not match time range', async () => {
      const createDto = {
        title: 'Test Task',
        scheduledDate: '2025-01-13',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 120, // Mismatch: should be 60
      };

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with filters', async () => {
      const tasks = [mockTask];
      mockPrismaService.task.findMany.mockResolvedValue(tasks);
      mockPrismaService.task.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', { page: 1, limit: 50 });

      expect(result).toEqual({
        tasks,
        total: 1,
        page: 1,
        limit: 50,
      });
    });

    it('should filter by date', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAll('user-1', { date: '2025-01-13' });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: expect.any(Object),
          }),
        })
      );
    });

    it('should filter by week', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockPrismaService.task.count.mockResolvedValue(1);

      await service.findAll('user-1', { weekStart: '2025-01-13' });

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1', 'user-1');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(service.findOne('task-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({ ...mockTask, title: 'Updated Task' });

      const result = await service.update('task-1', 'user-1', { title: 'Updated Task' });

      expect(result.title).toBe('Updated Task');
      expect(mockPrismaService.task.update).toHaveBeenCalled();
    });

    it('should mark as manually moved if date/time changed', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue(mockTask);

      await service.update('task-1', 'user-1', { scheduledDate: '2025-01-14' });

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: expect.objectContaining({
          manuallyMoved: true,
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete a task successfully', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.delete.mockResolvedValue(mockTask);

      await service.remove('task-1', 'user-1');

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      await expect(service.remove('task-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should mark task as complete and update analytics', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({ ...mockTask, isCompleted: true });
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockGoalsService.calculateAnalytics.mockResolvedValue({});
      mockPrismaService.weeklyPlan.update.mockResolvedValue({});

      const result = await service.complete('task-1', 'user-1');

      expect(result.isCompleted).toBe(true);
      expect(mockGoalsService.calculateAnalytics).toHaveBeenCalledWith('goal-1');
    });

    it('should throw ForbiddenException if task already completed', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({ ...mockTask, isCompleted: true });

      await expect(service.complete('task-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('skip', () => {
    it('should mark task as skipped with reason', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({ ...mockTask, isSkipped: true });
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockGoalsService.calculateAnalytics.mockResolvedValue({});
      mockPrismaService.weeklyPlan.update.mockResolvedValue({});

      const result = await service.skip('task-1', 'user-1', { reason: 'Too tired' });

      expect(result.isSkipped).toBe(true);
      expect(mockGoalsService.calculateAnalytics).toHaveBeenCalledWith('goal-1');
    });

    it('should throw ForbiddenException if task already skipped', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue({ ...mockTask, isSkipped: true });

      await expect(service.skip('task-1', 'user-1', {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk complete operation', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.task.update.mockResolvedValue({ ...mockTask, isCompleted: true });
      mockPrismaService.task.findMany.mockResolvedValue([mockTask]);
      mockGoalsService.calculateAnalytics.mockResolvedValue({});
      mockPrismaService.weeklyPlan.update.mockResolvedValue({});

      const result = await service.bulkOperation('user-1', {
        taskIds: ['task-1'],
        operation: 'complete' as any,
      });

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle errors gracefully in bulk operations', async () => {
      mockPrismaService.task.findFirst.mockResolvedValue(null);

      const result = await service.bulkOperation('user-1', {
        taskIds: ['task-1'],
        operation: 'complete' as any,
      });

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
    });
  });
});
