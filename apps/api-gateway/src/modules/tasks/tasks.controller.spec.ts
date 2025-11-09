import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SyncStatus } from '@microplanner/database';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    complete: jest.fn(),
    skip: jest.fn(),
    bulkOperation: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    clerkId: 'clerk-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    timezone: 'America/New_York',
    tier: 'FREE' as any,
    stripeCustomerId: null,
    subscriptionId: null,
    subscriptionStatus: 'ACTIVE' as any,
    wakeTime: '07:00',
    sleepTime: '23:00',
    workStartTime: '09:00',
    workEndTime: '17:00',
    productivityPeaks: ['09:00-12:00'],
    energyPattern: null,
    blockedTimes: null,
    pushTokens: [],
    onboardingCompleted: true,
    onboardingStep: 5,
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
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
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createDto = {
        title: 'Test Task',
        notes: 'Test notes',
        scheduledDate: '2025-01-13',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        goalId: 'goal-1',
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockUser, createDto);

      expect(result.message).toBe('Task created successfully');
      expect(result.task).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const paginatedResult = {
        tasks: [mockTask],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockTasksService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockUser, { page: 1, limit: 50 });

      expect(result.message).toBe('Tasks retrieved successfully');
      expect(result.tasks).toEqual([mockTask]);
      expect(result.total).toBe(1);
    });

    it('should pass query filters to service', async () => {
      mockTasksService.findAll.mockResolvedValue({
        tasks: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      const query = {
        date: '2025-01-13',
        goalId: 'goal-1',
        isCompleted: true,
        page: 1,
        limit: 50,
      };

      await controller.findAll(mockUser, query);

      expect(service.findAll).toHaveBeenCalledWith('user-1', query);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(mockUser, 'task-1');

      expect(result.message).toBe('Task retrieved successfully');
      expect(result.task).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('task-1', 'user-1');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, title: 'Updated Task' };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockUser, 'task-1', updateDto);

      expect(result.message).toBe('Task updated successfully');
      expect(result.task.title).toBe('Updated Task');
      expect(service.update).toHaveBeenCalledWith('task-1', 'user-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'task-1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('task-1', 'user-1');
    });
  });

  describe('complete', () => {
    it('should mark task as complete', async () => {
      const completedTask = { ...mockTask, isCompleted: true, completedAt: new Date() };
      mockTasksService.complete.mockResolvedValue(completedTask);

      const result = await controller.complete(mockUser, 'task-1');

      expect(result.message).toBe('Task marked as complete');
      expect(result.task.isCompleted).toBe(true);
      expect(result.analytics.goalAnalyticsUpdated).toBe(true);
      expect(result.analytics.planAnalyticsUpdated).toBe(true);
    });

    it('should indicate no goal analytics update if task not linked to goal', async () => {
      const completedTask = { ...mockTask, goalId: null, isCompleted: true };
      mockTasksService.complete.mockResolvedValue(completedTask);

      const result = await controller.complete(mockUser, 'task-1');

      expect(result.analytics.goalAnalyticsUpdated).toBe(false);
    });
  });

  describe('skip', () => {
    it('should mark task as skipped with reason', async () => {
      const skippedTask = {
        ...mockTask,
        isSkipped: true,
        skippedReason: 'Too tired',
        skippedAt: new Date(),
      };
      mockTasksService.skip.mockResolvedValue(skippedTask);

      const result = await controller.skip(mockUser, 'task-1', { reason: 'Too tired' });

      expect(result.message).toBe('Task marked as skipped');
      expect(result.task.isSkipped).toBe(true);
      expect(result.analytics.goalAnalyticsUpdated).toBe(true);
    });
  });

  describe('bulkOperation', () => {
    it('should perform bulk complete operation', async () => {
      const bulkResult = {
        success: 2,
        failed: 0,
        results: [
          { taskId: 'task-1', status: 'completed' },
          { taskId: 'task-2', status: 'completed' },
        ],
      };

      mockTasksService.bulkOperation.mockResolvedValue(bulkResult);

      const bulkDto = {
        taskIds: ['task-1', 'task-2'],
        operation: 'complete' as any,
      };

      const result = await controller.bulkOperation(mockUser, bulkDto);

      expect(result.message).toContain('2 successful, 0 failed');
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle bulk operation with failures', async () => {
      const bulkResult = {
        success: 1,
        failed: 1,
        results: [
          { taskId: 'task-1', status: 'completed' },
          { taskId: 'task-2', status: 'failed', error: 'Task not found' },
        ],
      };

      mockTasksService.bulkOperation.mockResolvedValue(bulkResult);

      const bulkDto = {
        taskIds: ['task-1', 'task-2'],
        operation: 'complete' as any,
      };

      const result = await controller.bulkOperation(mockUser, bulkDto);

      expect(result.message).toContain('1 successful, 1 failed');
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
    });
  });
});
