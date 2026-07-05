import axios, { AxiosInstance } from 'axios';
import { GraphQLError } from 'graphql';

const API_BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';

const STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
};

/**
 * Create an axios client that converts REST error responses into GraphQL
 * errors carrying the backend's message and a proper extensions.code, so
 * limit/permission errors reach the frontend intact instead of being
 * masked as 'Internal server error'.
 */
function createApiClient(baseURL: string, token?: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  client.interceptors.response.use(undefined, (error) => {
    const status: number | undefined = error?.response?.status;
    const body = error?.response?.data;
    const rawMessage = body?.message ?? error?.message ?? 'Request failed';
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);

    if (status && STATUS_TO_CODE[status]) {
      throw new GraphQLError(message, {
        extensions: { code: STATUS_TO_CODE[status], statusCode: status },
      });
    }
    throw error;
  });

  return client;
}

export { OnboardingAPI } from './onboarding-api';

// ==================== WAITLIST API ====================
export class WaitlistAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/waitlist`, token);
  }

  // Join waitlist
  async joinWaitlist(input: any) {
    const { data } = await this.client.post('/', input);
    return data;
  }

  // Get waitlist stats
  async getWaitlistStats() {
    const { data } = await this.client.get('/stats');
    return data;
  }

  // Get waitlist entry by email (admin)
  async getWaitlistEntry(email: string, userId: string) {
    const { data } = await this.client.get(`/entry/${email}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Get all waitlist entries (admin)
  async getWaitlistEntries(userId: string, filters: any) {
    const { data } = await this.client.get('/entries', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    return data;
  }

  // Update waitlist status (admin)
  async updateWaitlistStatus(id: string, userId: string, status: string) {
    const { data } = await this.client.put(`/${id}/status`, { status }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Send invitation (admin)
  async sendWaitlistInvitation(id: string, userId: string) {
    const { data } = await this.client.post(`/${id}/invite`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// ==================== USER API ====================
export class UserAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/users`, token);
  }

  // Sync/create user from Clerk (no REST endpoint - handled by JWT auth)
  async syncUser(input: any) {
    // Note: User sync happens automatically via JWT validation in backend
    // When a user authenticates, the Clerk strategy automatically creates/updates the user
    // This method just fetches the user to confirm they exist
    // We can't create the user directly without authentication

    // Try to get the user - this will work if they're authenticated
    // If not authenticated, this will fail with proper auth error
    try {
      const { data } = await this.client.get('/me', {
        headers: { 'x-clerk-id': input.clerkId },
      });
      return data;
    } catch (error) {
      // User doesn't exist yet - they need to authenticate first
      // The backend will create them via Clerk webhook or JWT validation
      console.warn('User sync called but user not authenticated yet. User will be created on first auth.');
      throw new Error('User must authenticate first. User will be created automatically on authentication.');
    }
  }

  // Get current user profile
  async getUser(userId: string) {
    const { data } = await this.client.get('/me', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Update user profile
  async updateUserProfile(userId: string, input: any) {
    const { data } = await this.client.put('/me', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Get user settings (preferences)
  async getUserSettings(userId: string) {
    // Settings are included in the /me response
    const user = await this.getUser(userId);
    return {
      wakeTime: user.wakeTime,
      sleepTime: user.sleepTime,
      workStartTime: user.workStartTime,
      workEndTime: user.workEndTime,
      productivityPeaks: user.productivityPeaks,
      energyPattern: user.energyPattern,
      blockedTimes: user.blockedTimes,
      language: user.language,
      pushTokens: user.pushTokens,
    };
  }

  // Update user settings (preferences)
  async updateUserSettings(userId: string, input: any) {
    const { data } = await this.client.put('/me/preferences', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Get onboarding status (handled by OnboardingAPI GraphQL)
  async getOnboardingStatus(userId: string) {
    // This is now handled by onboarding.resolver.ts via GraphQL
    // Kept for backwards compatibility, fetch from /me
    const user = await this.getUser(userId);
    return {
      completed: user.onboardingCompleted,
      currentStep: user.onboardingStep,
    };
  }

  // Complete onboarding
  async completeOnboarding(userId: string, input: any) {
    // Update onboarding status via the new /me/onboarding endpoint
    const { data } = await this.client.put('/me/onboarding', {
      onboardingCompleted: true,
      onboardingStep: 999, // Mark as completed
      ...input,
    }, {
      headers: { 'x-user-id': userId },
    });

    // Fetch and return the updated user with all fields
    return await this.getUser(userId);
  }
}

export class GoalsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/goals`, token);
  }

  async getGoal(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, goal }, extract the goal
    return data.goal || data;
  }

  async getGoals(userId: string, filters: any) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    // API returns { message, goals, ... }, extract the goals array
    return data.goals || data.data || data;
  }

  async getGoalAnalytics(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}/analytics`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createGoal(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, goal }, extract the goal
    return data.goal || data;
  }

  async updateGoal(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, goal }, extract the goal
    return data.goal || data;
  }

  async deleteGoal(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async pauseGoal(id: string, userId: string, until?: Date) {
    const { data } = await this.client.put(
      `/${id}/pause`,
      { until },
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async resumeGoal(id: string, userId: string) {
    const { data } = await this.client.put(
      `/${id}/activate`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async getGoalsByProject(projectId: string, userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { projectId },
    });
    return data;
  }
}

export class TasksAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/tasks`, token);
  }

  async getTask(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async getTasks(userId: string, args: any = {}) {
    // Check if args contains GraphQL-style nested filter/sort or direct params
    const hasNestedFilter = args.filter !== undefined;

    // Extract filter and sort if they exist (GraphQL query style)
    // Otherwise treat entire args as flat params (dashboard resolver style)
    const filterSource = hasNestedFilter ? args.filter : args;
    const { filter, sort, ...directParams } = args;

    // Start with direct params (for non-filter args like take, skip, etc.)
    const params: any = hasNestedFilter ? { ...directParams } : {};

    // Handle dateRange filter (GraphQL -> REST API conversion)
    if (filterSource?.dateRange) {
      params.startDate = filterSource.dateRange.start;
      params.endDate = filterSource.dateRange.end;
    }
    // Handle scheduledDate filter - convert DateTime to date string (YYYY-MM-DD)
    // This is used by /today page and other single-day filters
    else if (filterSource?.scheduledDate) {
      // Extract just the date part from ISO string (YYYY-MM-DD)
      const dateStr = typeof filterSource.scheduledDate === 'string'
        ? filterSource.scheduledDate.split('T')[0]
        : new Date(filterSource.scheduledDate).toISOString().split('T')[0];
      params.date = dateStr;
    }
    // Handle explicit date filter
    else if (filterSource?.date) {
      params.date = filterSource.date;
    }

    // Copy other filter fields directly
    if (filterSource?.weekStart) params.weekStart = filterSource.weekStart;
    if (filterSource?.goalId) params.goalId = filterSource.goalId;
    if (filterSource?.planId) params.planId = filterSource.planId;
    if (filterSource?.projectId) params.projectId = filterSource.projectId;
    if (filterSource?.priority !== undefined) params.priority = filterSource.priority;
    if (filterSource?.tags) params.tags = filterSource.tags;
    if (filterSource?.search) params.search = filterSource.search;
    if (filterSource?.isCompleted !== undefined) params.isCompleted = filterSource.isCompleted;
    if (filterSource?.aiGenerated !== undefined) params.aiGenerated = filterSource.aiGenerated;

    // For dashboard resolver compatibility: copy any remaining direct params
    if (!hasNestedFilter) {
      if (args.orderBy) params.orderBy = args.orderBy;
      if (args.take) params.take = args.take;
      if (args.skip) params.skip = args.skip;
    }

    // Sort: the backend returns tasks ordered by scheduledDate + startTime,
    // which is the order every current view needs; GraphQL-style sort input
    // is accepted but the default ordering is authoritative.

    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params,
    });
    // API returns { message, tasks, total, page, limit }, extract the tasks array
    return data.tasks || data.data || data;
  }

  async getTasksByGoalIds(goalIds: string[]) {
    // No /batch endpoint — fetch per goal and unwrap the { tasks } envelope
    const tasks: any[] = [];
    for (const goalId of goalIds) {
      const { data } = await this.client.get('/', {
        params: { goalId },
      });
      tasks.push(...(data.tasks || data.data || []));
    }
    return tasks;
  }

  async createTask(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async updateTask(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async deleteTask(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async completeTask(id: string, userId: string) {
    const { data } = await this.client.post(
      `/${id}/complete`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async skipTask(id: string, userId: string, reason?: string) {
    const { data } = await this.client.post(
      `/${id}/skip`,
      { reason },
      {
        headers: { 'x-user-id': userId },
      }
    );
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async uncompleteTask(id: string, userId: string) {
    // No /uncomplete endpoint — update with the whitelisted isCompleted field
    const { data } = await this.client.put(
      `/${id}`,
      { isCompleted: false },
      {
        headers: { 'x-user-id': userId },
      }
    );
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async getTasksByProject(projectId: string, userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { projectId },
    });
    // API returns { message, tasks, ... }, extract the tasks array
    return data.tasks || data.data || data;
  }

  async getTasksByPlanId(planId: string) {
    const { data } = await this.client.get('/', {
      params: { planId },
    });
    return data.tasks || data.data || [];
  }

  async getTasksByGoal(goalId: string, userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { goalId },
    });
    // API returns { message, tasks, ... }, extract the tasks array
    return data.tasks || data.data || data;
  }

  // Bulk operations. REST PATCH /tasks/bulk supports complete/skip/delete/
  // reschedule; any other field combination falls back to per-task updates.
  async bulkUpdateTasks(ids: string[], userId: string, input: any) {
    if (input?.isCompleted === true && Object.keys(input).length === 1) {
      await this.client.patch(
        '/bulk',
        { taskIds: ids, operation: 'complete' },
        { headers: { 'x-user-id': userId } }
      );
    } else if (input?.scheduledDate && Object.keys(input).every((k) => ['scheduledDate', 'startTime', 'endTime'].includes(k))) {
      await this.client.patch(
        '/bulk',
        { taskIds: ids, operation: 'reschedule', data: input },
        { headers: { 'x-user-id': userId } }
      );
    } else {
      for (const id of ids) {
        await this.updateTask(id, userId, input);
      }
    }

    // Return the updated tasks
    const tasks = [];
    for (const id of ids) {
      tasks.push(await this.getTask(id, userId));
    }
    return tasks;
  }

  async bulkDeleteTasks(ids: string[], userId: string): Promise<number> {
    const { data } = await this.client.patch(
      '/bulk',
      { taskIds: ids, operation: 'delete' },
      { headers: { 'x-user-id': userId } }
    );
    return data.success ?? ids.length;
  }

  async searchTasks(query: string, userId: string) {
    // Backend supports server-side search (title/notes, case-insensitive)
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { search: query },
    });
    return data.tasks || data.data || [];
  }

  // Task Dependencies
  async createTaskDependency(userId: string, input: any) {
    const { data } = await this.client.post('/advanced/dependencies', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteTaskDependency(id: string, userId: string) {
    await this.client.delete(`/advanced/dependencies/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async getTaskDependencies(taskId: string) {
    // REST returns TaskWithDependencies { blockingTasks, dependentTasks, ... }.
    // GraphQL Task.dependencies wants TaskDependency rows where this task is
    // the blocking side (tasks that depend on this one) — synthesize them.
    const { data } = await this.client.get(`/advanced/${taskId}/dependencies`);
    return (data.dependentTasks || []).map((t: any) => ({
      id: `${taskId}:${t.id}`,
      dependentTaskId: t.id,
      blockingTaskId: taskId,
      type: 'BLOCKS',
      createdAt: new Date().toISOString(),
    }));
  }

  async getTaskBlockers(taskId: string) {
    // Blockers = dependency rows where this task is the dependent side
    const { data } = await this.client.get(`/advanced/${taskId}/dependencies`);
    return (data.blockingTasks || []).map((t: any) => ({
      id: `${t.id}:${taskId}`,
      dependentTaskId: taskId,
      blockingTaskId: t.id,
      type: 'BLOCKED_BY',
      createdAt: new Date().toISOString(),
    }));
  }

  // Time Tracking
  async startTimer(taskId: string, userId: string) {
    const { data } = await this.client.post(
      '/advanced/timer/start',
      { taskId },
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async stopTimer(taskId: string, userId: string) {
    const { data } = await this.client.post(
      '/advanced/timer/stop',
      { taskId },
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async getTimeEntries(taskId: string) {
    // Time tracking is embedded on the Task row (single running timer), so
    // there is no per-entry history table yet. Return an empty list — never
    // throw from a field resolver.
    return [];
  }

  // Subtasks
  async createSubtask(parentId: string, userId: string, input: any) {
    const { data } = await this.client.post('/advanced/subtasks', { ...input, parentId }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getSubtasks(taskId: string) {
    const { data } = await this.client.get(`/advanced/${taskId}/subtasks`);
    return data;
  }
}

export class ProductivityAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/productivity`, token);
  }

  // ==================== WORK HOURS ====================
  async getWorkHours(userId: string) {
    const { data } = await this.client.get('/work-hours', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateWorkHours(userId: string, input: any) {
    const { data } = await this.client.put('/work-hours', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== FOCUS TIME ====================
  async getFocusTimeBlocks(userId: string) {
    const { data } = await this.client.get('/focus-time', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createFocusTime(userId: string, input: any) {
    const { data } = await this.client.post('/focus-time', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateFocusTime(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/focus-time/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteFocusTime(id: string, userId: string) {
    await this.client.delete(`/focus-time/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  // ==================== NO-MEETING DAYS ====================
  async getNoMeetingDays(userId: string) {
    const { data } = await this.client.get('/no-meeting-days', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createNoMeetingDay(userId: string, input: any) {
    const { data } = await this.client.post('/no-meeting-days', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteNoMeetingDay(id: string, userId: string) {
    await this.client.delete(`/no-meeting-days/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  // ==================== PRIORITY HOURS ====================
  async getPriorityHours(userId: string) {
    const { data } = await this.client.get('/priority-hours', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updatePriorityHours(userId: string, input: any) {
    const { data } = await this.client.put('/priority-hours', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== CALENDAR DEFENSE ====================
  async getCalendarDefense(userId: string) {
    const { data } = await this.client.get('/calendar-defense', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateCalendarDefense(userId: string, input: any) {
    const { data } = await this.client.put('/calendar-defense', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== SMART 1:1 ====================
  async getSmart1on1s(userId: string) {
    const { data } = await this.client.get('/smart-1on1', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createSmart1on1(userId: string, input: any) {
    const { data } = await this.client.post('/smart-1on1', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateSmart1on1(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/smart-1on1/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteSmart1on1(id: string, userId: string) {
    await this.client.delete(`/smart-1on1/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  // ==================== TRAVEL TIME ====================
  async calculateTravelTime(userId: string, input: any) {
    const { data } = await this.client.post('/travel-time/calculate', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== KANBAN BOARDS ====================
  async getKanbanBoards(userId: string, projectId?: string) {
    const { data } = await this.client.get('/kanban', {
      headers: { 'x-user-id': userId },
      params: projectId ? { projectId } : {},
    });
    return data;
  }

  async getKanbanBoard(id: string, userId: string) {
    const { data } = await this.client.get(`/kanban/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createKanbanBoard(userId: string, input: any) {
    const { data } = await this.client.post('/kanban', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateKanbanBoard(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/kanban/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteKanbanBoard(id: string, userId: string) {
    await this.client.delete(`/kanban/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async moveTaskInKanban(userId: string, input: any) {
    const { data } = await this.client.post('/kanban/move-task', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== PRODUCTIVITY SCORING ====================
  async getProductivityScore(userId: string, date: string) {
    const { data } = await this.client.get(`/score/daily/${date}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getProductivityScores(userId: string, startDate: string, endDate: string) {
    const { data } = await this.client.get('/score/range', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate },
    });
    return data;
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(userId: string, unreadOnly?: boolean) {
    const { data } = await this.client.get('/notifications', {
      headers: { 'x-user-id': userId },
      params: unreadOnly ? { unreadOnly: 'true' } : {},
    });
    return data;
  }

  async markNotificationAsRead(id: string, userId: string) {
    await this.client.post(`/notifications/${id}/read`, {}, {
      headers: { 'x-user-id': userId },
    });
  }

  async getNotificationPreferences(userId: string) {
    const { data } = await this.client.get('/notifications/preferences', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateNotificationPreferences(userId: string, input: any) {
    const { data } = await this.client.put('/notifications/preferences', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// Projects API
export class ProjectsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/tasks/advanced/projects`, token);
  }

  async getProject(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getProjects(userId: string, filters: any) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    return data;
  }

  async getProjectStats(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}/stats`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createProject(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateProject(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteProject(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async archiveProject(id: string, userId: string) {
    const { data } = await this.client.post(
      `/${id}/archive`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async unarchiveProject(id: string, userId: string) {
    const { data } = await this.client.post(
      `/${id}/unarchive`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }
}

// ==================== PLANS API ====================
export class PlansAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/plans`, token);
  }

  // Generate plan
  async generatePlan(userId: string, input: any) {
    const { data } = await this.client.post('/generate', input, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Get current week plan
  async getCurrentPlan(userId: string) {
    const { data } = await this.client.get('/current', {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Get plan by ID
  async getPlan(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Get all plans
  async getPlans(userId: string, filter: any = {}) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filter,
    });
    return data.plans || data.data || [];
  }

  // Create plan manually
  async createPlan(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Update plan
  async updatePlan(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Accept plan
  async acceptPlan(id: string, userId: string) {
    const { data } = await this.client.put(`/${id}/accept`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Delete plan
  async deletePlan(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  // Get plan templates
  async getPlanTemplates(args: any = {}) {
    const { data } = await this.client.get('/templates', {
      params: args,
    });
    return data.templates || data.data || [];
  }

  // Get single plan template
  async getPlanTemplate(id: string) {
    const { data } = await this.client.get(`/templates/${id}`);
    return data.template;
  }

  // Create plan template
  async createPlanTemplate(userId: string, input: any) {
    const { data } = await this.client.post('/templates', input, {
      headers: { 'x-user-id': userId },
    });
    return data.template;
  }
}

// ==================== ANALYTICS API ====================
export class AnalyticsAPI {
  private client: AxiosInstance;
  private token?: string;

  constructor(token?: string) {
    this.token = token;
    this.client = createApiClient(`${API_BASE_URL}/api/v1/analytics`, token);
  }

  async getDashboardStats(userId: string) {
    const { data } = await this.client.get('/metrics', {
      headers: { 'x-user-id': userId },
    });
    // REST wraps the payload: { message, dashboardStats }
    return data.dashboardStats || data;
  }

  async getWeeklyStats(userId: string, weekStart?: string) {
    // No dedicated /weekly endpoint — synthesize the WeeklyStats shape from
    // the dashboard metrics so every non-null schema field is present.
    const { data } = await this.client.get('/metrics', {
      headers: { 'x-user-id': userId },
      params: { weekStart },
    });
    const m = data.dashboardStats || data;

    const start = weekStart ? new Date(weekStart) : new Date();
    if (!weekStart) {
      const day = start.getDay();
      start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day)); // Monday
    }
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      totalTasks: m.weekTasks ?? 0,
      completedTasks: m.weekCompleted ?? 0,
      completionRate: m.weekCompletionRate ?? 0,
      totalHoursScheduled: 0,
      totalHoursCompleted: 0,
      focusHours: 0,
      activeGoals: m.activeGoals ?? 0,
      goalsCompletionRate: m.weekCompletionRate ?? 0,
      averageProductivityScore: null,
      bestDay: null,
      worstDay: null,
      currentStreak: m.currentStreak ?? 0,
      longestStreak: m.longestStreak ?? 0,
    };
  }

  async getProductivityScores(userId: string, startDate: string, endDate: string) {
    // Note: /score/range is in ProductivityAPI, not Analytics API
    const productivityClient = createApiClient(
      `${API_BASE_URL}/api/v1/productivity`,
      this.token
    );
    const { data } = await productivityClient.get('/score/range', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate },
    });
    return data;
  }

  async getGoalAnalyticsReport(goalId: string, userId: string) {
    // Note: Goal analytics is in GoalsAPI at /goals/:id/analytics
    const goalsClient = createApiClient(`${API_BASE_URL}/api/v1/goals`, this.token);
    const { data } = await goalsClient.get(`/${goalId}/analytics`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // commented out until implemented in the backend in analytics module
  // async getTimeTracking(userId: string, startDate: string, endDate: string) {
  //   const { data } = await this.client.get('/time-tracking', {
  //     headers: { 'x-user-id': userId },
  //     params: { startDate, endDate },
  //   });
  //   return data;
  // }

  async getInsights(userId: string, type?: string, limit?: number) {
    const { data } = await this.client.get('/insights', {
      headers: { 'x-user-id': userId },
      params: { type, limit },
    });
    return data;
  }

  // async getStreakHistory(userId: string, limit?: number) {
  //   const { data } = await this.client.get('/streaks', {
  //     headers: { 'x-user-id': userId },
  //     params: { limit },
  //   });
  //   return data;
  // }

  // async generateInsights(userId: string) {
  //   const { data } = await this.client.post('/insights/generate', {}, {
  //     headers: { 'x-user-id': userId },
  //   });
  //   return data;
  // }

  // async dismissInsight(id: string, userId: string) {
  //   const { data } = await this.client.delete(`/insights/${id}`, {
  //     headers: { 'x-user-id': userId },
  //   });
  //   return data;
  // }
}

// ==================== CALENDAR API ====================
export class CalendarAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/calendar`, token);
  }

  async getConnections(userId: string) {
    const { data } = await this.client.get('/connections', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getConnection(id: string, userId: string) {
    const { data } = await this.client.get(`/connections/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async initiateAuth(userId: string, provider: string) {
    const { data } = await this.client.post('/auth/initiate', { provider }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async connectCalendar(userId: string, input: any) {
    const { data } = await this.client.post('/connections', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async disconnectCalendar(id: string, userId: string) {
    await this.client.delete(`/connections/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async syncCalendar(id: string, userId: string) {
    const { data } = await this.client.post(`/connections/${id}/sync`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async syncAllCalendars(userId: string) {
    const { data } = await this.client.post('/sync-all', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getEvents(userId: string, startDate: string, endDate: string, calendarIds?: string[]) {
    const { data } = await this.client.get('/events', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate, calendarIds: calendarIds?.join(',') },
    });
    // REST returns { message, events: [google-shaped], total } — map to the
    // GraphQL CalendarEvent type (title/start/end/allDay/source/attendees)
    const events = data.events || data || [];
    return events.map((e: any) => ({
      id: e.id,
      title: e.summary || e.title || 'Untitled Event',
      description: e.description || null,
      start: e.start?.dateTime || e.start?.date || e.start,
      end: e.end?.dateTime || e.end?.date || e.end,
      allDay: !!e.start?.date,
      source: 'GOOGLE',
      attendees: (e.attendees || []).map((a: any) => a.email || a).filter(Boolean),
      location: e.location || null,
    }));
  }

  async getEventsByConnection(connectionId: string, startDate?: string, endDate?: string) {
    const { data } = await this.client.get(`/connections/${connectionId}/events`, {
      params: { startDate, endDate },
    });
    return data;
  }

  async getBusySlots(userId: string, startDate: string, endDate: string) {
    const { data } = await this.client.get('/busy-slots', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate },
    });
    return data;
  }

  async createEvent(userId: string, input: any) {
    const { data } = await this.client.post('/events', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateEvent(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/events/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteEvent(id: string, userId: string) {
    await this.client.delete(`/events/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }
}

// ==================== TEAMS API ====================
export class TeamsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/teams`, token);
  }

  async getTeams(userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getTeam(id: string, userId?: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: userId ? { 'x-user-id': userId } : {},
    });
    return data;
  }

  async createTeam(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateTeam(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteTeam(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async getTeamMembers(teamId: string, userId?: string) {
    const { data } = await this.client.get(`/${teamId}/members`, {
      headers: userId ? { 'x-user-id': userId } : {},
    });
    return data;
  }

  async getTeamInvitations(teamId: string, userId?: string) {
    const { data } = await this.client.get(`/${teamId}/invitations`, {
      headers: userId ? { 'x-user-id': userId } : {},
    });
    return data;
  }

  async inviteTeamMember(userId: string, input: any) {
    const { data } = await this.client.post(`/${input.teamId}/invitations`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async acceptTeamInvitation(token: string, userId: string) {
    const { data } = await this.client.post('/invitations/accept', { token }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async removeTeamMember(teamId: string, memberId: string, userId: string) {
    await this.client.delete(`/${teamId}/members/${memberId}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async updateTeamMemberRole(teamId: string, memberId: string, role: string, userId: string) {
    const { data } = await this.client.put(`/${teamId}/members/${memberId}/role`, { role }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getApiKeys(userId: string) {
    const { data } = await this.client.get('/api-keys', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getApiKey(id: string, userId: string) {
    const { data } = await this.client.get(`/api-keys/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createApiKey(userId: string, input: any) {
    const { data } = await this.client.post('/api-keys', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteApiKey(id: string, userId: string) {
    await this.client.delete(`/api-keys/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async toggleApiKey(id: string, userId: string) {
    const { data } = await this.client.put(`/api-keys/${id}/toggle`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// ==================== SCHEDULING API ====================
export class SchedulingAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/scheduling`, token);
  }

  async getSchedulingLinks(userId: string) {
    const { data } = await this.client.get('/links', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getSchedulingLink(id: string, userId?: string) {
    const { data } = await this.client.get(`/links/${id}`, {
      headers: userId ? { 'x-user-id': userId } : {},
    });
    return data;
  }

  async getSchedulingLinkBySlug(slug: string) {
    const { data } = await this.client.get(`/links/slug/${slug}`);
    return data;
  }

  async createSchedulingLink(userId: string, input: any) {
    const { data } = await this.client.post('/links', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateSchedulingLink(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/links/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteSchedulingLink(id: string, userId: string) {
    await this.client.delete(`/links/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async toggleSchedulingLink(id: string, userId: string) {
    const { data } = await this.client.put(`/links/${id}/toggle`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getBookings(userId: string, linkId?: string, status?: string) {
    const { data } = await this.client.get('/bookings', {
      headers: { 'x-user-id': userId },
      params: { linkId, status },
    });
    return data;
  }

  async getBooking(id: string, userId?: string) {
    const { data } = await this.client.get(`/bookings/${id}`, {
      headers: userId ? { 'x-user-id': userId } : {},
    });
    return data;
  }

  async getBookingsByLink(linkId: string) {
    const { data } = await this.client.get(`/links/${linkId}/bookings`);
    return data;
  }

  async getAvailableSlots(linkId: string, date: string, slug?: string) {
    // Note: Backend uses /links/slug/:slug/slots, not /links/:linkId/available-slots
    // If slug is provided, use it; otherwise fetch link first to get slug
    if (!slug) {
      const link = await this.getSchedulingLinkBySlug(linkId); // Assuming linkId might be slug
      slug = link.slug || linkId;
    }
    const { data } = await this.client.get(`/links/slug/${slug}/slots`, {
      params: { date },
    });
    return data;
  }

  async createBooking(input: any, slug?: string) {
    // Note: Backend uses /links/slug/:slug/bookings, not /bookings
    if (!slug && input.schedulingLinkId) {
      const link = await this.getSchedulingLinkBySlug(input.schedulingLinkId);
      slug = link.slug || input.schedulingLinkId;
    }
    const { data } = await this.client.post(`/links/slug/${slug}/bookings`, input);
    return data;
  }

  async confirmBooking(id: string, userId: string) {
    const { data } = await this.client.post(`/bookings/${id}/confirm`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async cancelBooking(id: string, userId: string, reason?: string) {
    const { data } = await this.client.post(`/bookings/${id}/cancel`, { reason }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// ==================== INTEGRATIONS API ====================
export class IntegrationsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/integrations`, token);
  }

  async getIntegrations(userId: string, type?: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { type },
    });
    return data;
  }

  async getIntegration(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async connectIntegration(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateIntegration(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async disconnectIntegration(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async syncIntegration(id: string, userId: string) {
    const { data } = await this.client.post(`/${id}/sync`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getWebhooks(userId: string) {
    const { data } = await this.client.get('/webhooks', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getWebhook(id: string, userId: string) {
    const { data } = await this.client.get(`/webhooks/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createWebhook(userId: string, input: any) {
    const { data } = await this.client.post('/webhooks', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateWebhook(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/webhooks/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteWebhook(id: string, userId: string) {
    await this.client.delete(`/webhooks/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async toggleWebhook(id: string, userId: string) {
    const { data } = await this.client.put(`/webhooks/${id}/toggle`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getWebhookDeliveries(webhookId: string, userId?: string, limit?: number) {
    const { data } = await this.client.get(`/webhooks/${webhookId}/deliveries`, {
      headers: userId ? { 'x-user-id': userId } : {},
      params: { limit },
    });
    return data;
  }

  async retryWebhookDelivery(deliveryId: string, userId: string) {
    const { data } = await this.client.post(`/webhooks/deliveries/${deliveryId}/retry`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// ==================== BILLING API ====================
export class BillingAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/billing`, token);
  }

  async getSubscription(userId: string) {
    const { data } = await this.client.get('/subscription', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getBillingInfo(userId: string) {
    const { data } = await this.client.get('/info', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getUsageStats(userId: string) {
    const { data } = await this.client.get('/usage', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async canUseFeature(userId: string, feature: string) {
    const { data } = await this.client.get('/can-use-feature', {
      headers: { 'x-user-id': userId },
      params: { feature },
    });
    return data.canUse;
  }

  async createCheckoutSession(userId: string, tier: string, interval: string) {
    const { data } = await this.client.post('/checkout', { tier, interval }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async upgradeSubscription(userId: string, tier: string) {
    const { data } = await this.client.post('/upgrade', { tier }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async cancelSubscription(userId: string) {
    const { data } = await this.client.post('/cancel', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async resumeSubscription(userId: string) {
    const { data } = await this.client.post('/resume', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updatePaymentMethod(userId: string, paymentMethodId: string) {
    const { data } = await this.client.put('/payment-method', { paymentMethodId }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createBillingPortalSession(userId: string) {
    const { data } = await this.client.get('/portal', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}
