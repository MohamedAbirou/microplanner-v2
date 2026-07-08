import axios, { AxiosInstance } from 'axios';
import { GraphQLError } from 'graphql';
import type {
  CalculateTravelTimeInput,
  ConnectCalendarInput,
  ConnectIntegrationInput,
  CreateApiKeyInput,
  CreateBookingInput,
  CreateCalendarEventInput,
  CreateFocusTimeBlockInput,
  CreateGoalInput,
  CreateKanbanBoardInput,
  CreateNoMeetingDayInput,
  CreatePlanInput,
  CreatePlanTemplateInput,
  CreateProjectInput,
  CreateSchedulingLinkInput,
  CreateSmart1on1Input,
  CreateSubtaskInput,
  CreateTaskDependencyInput,
  CreateTaskInput,
  CreateTeamInput,
  CreateWebhookInput,
  GeneratePlanInput,
  InviteTeamMemberInput,
  MoveTaskInKanbanInput,
  QueryGoalsArgs,
  PlanFilterInput,
  QueryPlanTemplatesArgs,
  QueryProjectsArgs,
  QueryTasksArgs,
  GoogleCalendarApiEvent,
  TaskQueryFilterSource,
  RestListParams,
  RestTaskDependencySummary,
  SyncUserInput,
  Task,
  TaskInfo,
  UpdateCalendarDefenseInput,
  UpdateCalendarEventInput,
  UpdateFocusTimeBlockInput,
  UpdateGoalInput,
  UpdateIntegrationInput,
  UpdateKanbanBoardInput,
  UpdateNotificationPreferencesInput,
  UpdateOnboardingProgressInput,
  UpdatePlanInput,
  UpdatePriorityHoursInput,
  UpdateProjectInput,
  UpdateSchedulingLinkInput,
  UpdateSmart1on1Input,
  UpdateTaskInput,
  UpdateTeamInput,
  UpdateUserProfileInput,
  UpdateUserSettingsInput,
  UpdateWebhookInput,
  WorkHoursInput,
} from '../types/api-inputs';

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

// ==================== AI MEMORY API ====================
export class AiMemoryAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/ai-memory`, token);
  }

  async getMemories(userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createMemory(
    userId: string,
    input: { memoryType: string; content: unknown; confidence?: number }
  ) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteMemory(userId: string, id: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return true;
  }
}

// ==================== REFERRALS API ====================
export class ReferralsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/referrals`, token);
  }

  async getStats(userId: string) {
    const { data } = await this.client.get('/me', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async redeem(userId: string, code: string) {
    const { data } = await this.client.post(
      '/redeem',
      { code },
      { headers: { 'x-user-id': userId } }
    );
    return data?.redeemed ?? false;
  }
}

// ==================== USER API ====================
export class UserAPI {
  private client: AxiosInstance;
  private notificationsClient: AxiosInstance;
  private ritualClient: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/users`, token);
    this.notificationsClient = createApiClient(`${API_BASE_URL}/api/v1/notifications`, token);
    this.ritualClient = createApiClient(`${API_BASE_URL}/api/v1/daily-ritual`, token);
  }

  async sendTestPush(userId: string) {
    const { data } = await this.notificationsClient.post('/push/test', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getDailyRitual(userId: string, date: string) {
    const { data } = await this.ritualClient.get('/', {
      headers: { 'x-user-id': userId },
      params: { date },
    });
    return data || null;
  }

  async updateDailyRitual(userId: string, input: any) {
    const { data } = await this.ritualClient.put('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Sync/create user from Clerk (no REST endpoint - handled by JWT auth)
  async syncUser(_input: SyncUserInput) {
    // Clerk JWT on this client triggers find-or-create in the API auth layer.
    const { data } = await this.client.get('/me');
    return data;
  }

  // Get current user profile
  async getUser(userId: string) {
    const { data } = await this.client.get('/me', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Update user profile
  async updateUserProfile(userId: string, input: UpdateUserProfileInput) {
    const { data } = await this.client.put('/me', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // GDPR: permanently delete the user's account + all data (backend cascade).
  async deleteAccount(userId: string) {
    await this.client.delete('/me', {
      headers: { 'x-user-id': userId },
    });
    return true;
  }

  // GDPR: export the user's full data set as JSON.
  async exportData(userId: string) {
    const { data } = await this.client.get('/me/export', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Register a Web Push subscription
  async registerPushToken(userId: string, subscription: Record<string, unknown>) {
    await this.client.post(
      '/me/push-token',
      { subscription },
      { headers: { 'x-user-id': userId } }
    );
    return true;
  }

  // Remove a Web Push subscription (by endpoint)
  async unregisterPushToken(userId: string, endpoint: string) {
    await this.client.delete('/me/push-token', {
      headers: { 'x-user-id': userId },
      data: { endpoint },
    });
    return true;
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
  async updateUserSettings(userId: string, input: UpdateUserSettingsInput) {
    // Only forward fields the REST preferences DTO accepts.
    const payload: Pick<UpdateUserSettingsInput, 'theme' | 'energyPattern'> = {};
    if (input.theme !== undefined) payload.theme = input.theme;
    if (input.energyPattern !== undefined) payload.energyPattern = input.energyPattern;

    await this.client.put('/me/preferences', payload, {
      headers: { 'x-user-id': userId },
    });

    const user = await this.getUser(userId);
    return {
      id: user.id,
      theme: user.theme ?? input.theme ?? 'SYSTEM',
      energyPattern: user.energyPattern,
      workingHours: {
        start: user.workStartTime ?? '09:00',
        end: user.workEndTime ?? '17:00',
      },
      defaultTaskDuration: 30,
      notifications: {
        email: true,
        weeklySummary: true,
        planReminders: true,
        taskReminders: true,
        goalMilestones: true,
        productivityInsights: true,
      },
    };
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
  async completeOnboarding(userId: string, input: UpdateOnboardingProgressInput) {
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

  async getGoals(userId: string, filters: QueryGoalsArgs) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    // API returns { message, goals, ... }, extract the goals array
    return data.goals || data.data || data;
  }

  async getGoalsByIds(ids: string[], userId: string) {
    const { data } = await this.client.post(
      '/batch',
      { ids },
      { headers: { 'x-user-id': userId } },
    );
    return (data.goals || []) as unknown[];
  }

  async getGoalAnalytics(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}/analytics`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async createGoal(userId: string, input: CreateGoalInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, goal }, extract the goal
    return data.goal || data;
  }

  async updateGoal(id: string, userId: string, input: UpdateGoalInput) {
    // `isPaused` is not a column the generic PUT /goals/:id accepts (the REST
    // UpdateGoalDto whitelists CreateGoalDto fields only, so a raw `isPaused`
    // is rejected by forbidNonWhitelisted). Route pause/resume to the
    // dedicated endpoints, then apply any remaining editable fields.
    const { isPaused, ...rest } = (input ?? {}) as any;

    if (isPaused === true) {
      await this.pauseGoal(id, userId);
    } else if (isPaused === false) {
      await this.resumeGoal(id, userId);
    }

    if (Object.keys(rest).length === 0) {
      // Pause/resume only — fetch the updated goal to return.
      const { data } = await this.client.get(`/${id}`, {
        headers: { 'x-user-id': userId },
      });
      return data.goal || data;
    }

    const { data } = await this.client.put(`/${id}`, rest, {
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
    // API returns { message, goal }, extract the goal
    return data.goal || data;
  }

  async resumeGoal(id: string, userId: string) {
    const { data } = await this.client.put(
      `/${id}/activate`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    // API returns { message, goal }, extract the goal
    return data.goal || data;
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

  async getRescheduleSuggestion(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}/reschedule-suggestion`, {
      headers: { 'x-user-id': userId },
    });
    return data.suggestion ?? null;
  }

  async getTasks(userId: string, args: QueryTasksArgs = {}) {
    // Check if args contains GraphQL-style nested filter/sort or direct params
    const hasNestedFilter = args.filter !== undefined;

    // Extract filter and sort if they exist (GraphQL query style)
    // Otherwise treat entire args as flat params (dashboard resolver style)
    const filterSource = (hasNestedFilter ? args.filter : args) as TaskQueryFilterSource | undefined;
    const { filter, sort, take, skip, ...directParams } = args;

    // Start with direct params (for non-filter args). Never forward GraphQL
    // pagination names (`take`/`skip`) — REST only accepts `limit`/`page`.
    const params: RestListParams = hasNestedFilter ? { ...directParams } : {};

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

    if (take != null) params.limit = take;
    if (skip != null) {
      const pageSize = typeof params.limit === 'number' ? params.limit : 50;
      params.page = Math.floor(skip / pageSize) + 1;
    }

    // For dashboard resolver compatibility: copy any remaining direct params
    if (!hasNestedFilter) {
      if (args.orderBy) params.orderBy = args.orderBy;
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
    // No REST /batch endpoint, so we still issue one request per goal — but
    // concurrently (Promise.all) instead of sequentially, so latency is
    // O(1) round-trips rather than O(goals), and we cap each response with a
    // limit so a heavy goal can't return its entire task history. Ownership is
    // enforced server-side from the JWT; the userId is not client-supplied.
    const results = await Promise.all(
      goalIds.map((goalId) =>
        this.client
          .get('/', { params: { goalId, limit: 500 } })
          .then(({ data }) => (data.tasks || data.data || []) as Task[])
          .catch(() => [] as Task[]),
      ),
    );
    return results.flat();
  }

  async createTask(userId: string, input: CreateTaskInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    // API returns { message, task }, extract the task
    return data.task || data;
  }

  async updateTask(id: string, userId: string, input: UpdateTaskInput) {
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

  async getTasksByPlanIds(planIds: string[], userId: string) {
    const { data } = await this.client.post(
      '/batch/by-plan',
      { planIds },
      { headers: { 'x-user-id': userId } },
    );
    return (data.byPlanId || {}) as Record<string, unknown[]>;
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
  async bulkUpdateTasks(ids: string[], userId: string, input: UpdateTaskInput) {
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
  async createTaskDependency(userId: string, input: CreateTaskDependencyInput) {
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

  async getTaskDependencies(taskId: string, userId: string) {
    // REST returns TaskWithDependencies { blockingTasks, dependentTasks, ... }.
    // GraphQL Task.dependencies wants TaskDependency rows where this task is
    // the blocking side (tasks that depend on this one) — synthesize them.
    const { data } = await this.client.get(`/advanced/${taskId}/dependencies`, {
      headers: { 'x-user-id': userId },
    });
    return (data.dependentTasks || []).map((t: RestTaskDependencySummary) => ({
      id: `${taskId}:${t.id}`,
      dependentTaskId: t.id,
      blockingTaskId: taskId,
      type: 'BLOCKS',
      createdAt: new Date().toISOString(),
    }));
  }

  async getDependenciesBatch(userId: string, taskIds: string[]) {
    const { data } = await this.client.post(
      '/advanced/dependencies/batch',
      { taskIds },
      { headers: { 'x-user-id': userId } },
    );
    return data as {
      edges: Array<{
        id: string;
        blockingTaskId: string;
        dependentTaskId: string;
        type: string;
        createdAt: string;
      }>;
    };
  }

  async getTaskBlockers(taskId: string, userId: string) {
    // Blockers = dependency rows where this task is the dependent side
    const { data } = await this.client.get(`/advanced/${taskId}/dependencies`, {
      headers: { 'x-user-id': userId },
    });
    return (data.blockingTasks || []).map((t: RestTaskDependencySummary) => ({
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
  async createSubtask(parentId: string, userId: string, input: CreateSubtaskInput) {
    const { data } = await this.client.post('/advanced/subtasks', { ...input, parentId }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getSubtasks(taskId: string, userId: string) {
    const { data } = await this.client.get(`/advanced/${taskId}/subtasks`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getSubtasksBatch(userId: string, parentTaskIds: string[]) {
    const { data } = await this.client.post(
      '/advanced/subtasks/batch',
      { taskIds: parentTaskIds },
      { headers: { 'x-user-id': userId } },
    );
    return data as { byParentId: Record<string, unknown[]> };
  }
}

// The GraphQL NotificationPreferences type uses `enable*` field names, while the
// REST/Prisma layer uses shorter column names. Map between them so toggles read
// and persist correctly (the email reminder scheduler reads the Prisma columns).
const NOTIF_PREF_GQL_TO_REST: Record<string, string> = {
  enableTaskReminders: 'taskDueAlerts',
  enableWeeklyPlan: 'weeklySummary',
  enableOverbookedAlerts: 'overbookedAlerts',
  enableBreakReminders: 'breakReminders',
  enableFocusTimeAlerts: 'focusTimeAlerts',
  enableUpcomingMeetings: 'upcomingMeetingAlerts',
};

function mapNotificationPrefsToRest(input: UpdateNotificationPreferencesInput) {
  const payload: Record<string, unknown> = {};
  for (const [gqlKey, restKey] of Object.entries(NOTIF_PREF_GQL_TO_REST)) {
    const value = (input as Record<string, unknown>)[gqlKey];
    if (value !== undefined) payload[restKey] = value;
  }
  if (input.quietHoursStart !== undefined) payload.quietHoursStart = input.quietHoursStart;
  if (input.quietHoursEnd !== undefined) payload.quietHoursEnd = input.quietHoursEnd;
  return payload;
}

function mapNotificationPrefsToGraphQL(data: any) {
  if (!data) return data;
  return {
    id: data.id,
    userId: data.userId,
    enableTaskReminders: data.taskDueAlerts ?? true,
    enableGoalMilestones: true, // no dedicated column; surfaced for API completeness
    enableWeeklyPlan: data.weeklySummary ?? true,
    enableDailyReminders: data.taskDueAlerts ?? true,
    enableOverbookedAlerts: data.overbookedAlerts ?? true,
    enableBreakReminders: data.breakReminders ?? true,
    enableFocusTimeAlerts: data.focusTimeAlerts ?? true,
    enableUpcomingMeetings: data.upcomingMeetingAlerts ?? true,
    reminderMinutesBefore: data.reminderMinutesBefore ?? 30,
    quietHoursStart: data.quietHoursStart ?? null,
    quietHoursEnd: data.quietHoursEnd ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
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

  async updateWorkHours(userId: string, input: WorkHoursInput) {
    const body: Record<string, any> = {};
    if (input.timezone !== undefined) body.timezone = input.timezone;
    if (input.enforceWorkHours !== undefined) body.enforceWorkHours = input.enforceWorkHours;
    if (input.maxMeetingsPerDay !== undefined) body.maxMeetingsPerDay = input.maxMeetingsPerDay;
    if (input.maxMeetingHoursPerDay !== undefined) {
      body.maxMeetingHoursPerDay = input.maxMeetingHoursPerDay;
    }
    if (input.maxConsecutiveMeetings !== undefined) {
      body.maxConsecutiveMeetings = input.maxConsecutiveMeetings;
    }
    if (input.schedule) {
      body.schedule = input.schedule;
    }
    const { data } = await this.client.put('/work-hours', body, {
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

  async createFocusTime(userId: string, input: CreateFocusTimeBlockInput) {
    const { data } = await this.client.post('/focus-time', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateFocusTime(id: string, userId: string, input: UpdateFocusTimeBlockInput) {
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

  async createNoMeetingDay(userId: string, input: CreateNoMeetingDayInput) {
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

  async updatePriorityHours(userId: string, input: UpdatePriorityHoursInput) {
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

  async updateCalendarDefense(userId: string, input: UpdateCalendarDefenseInput) {
    const { data } = await this.client.put('/calendar-defense', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getCalendarDefenseLog(userId: string, limit?: number) {
    const { data } = await this.client.get('/calendar-defense/log', {
      headers: { 'x-user-id': userId },
      params: { limit },
    });
    return data;
  }

  // ==================== HABITS ====================
  async getHabits(userId: string) {
    const { data } = await this.client.get('/habits', { headers: { 'x-user-id': userId } });
    return data;
  }

  async createHabit(userId: string, input: any) {
    const { data } = await this.client.post('/habits', input, { headers: { 'x-user-id': userId } });
    return data;
  }

  async updateHabit(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/habits/${id}`, input, { headers: { 'x-user-id': userId } });
    return data;
  }

  async deleteHabit(id: string, userId: string) {
    await this.client.delete(`/habits/${id}`, { headers: { 'x-user-id': userId } });
    return true;
  }

  async runCalendarDefense(userId: string) {
    const { data } = await this.client.post('/calendar-defense/run', {}, {
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

  async createSmart1on1(userId: string, input: CreateSmart1on1Input) {
    const { data } = await this.client.post('/smart-1on1', this.mapSmart1on1Input(input), {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateSmart1on1(id: string, userId: string, input: UpdateSmart1on1Input) {
    const { data } = await this.client.put(`/smart-1on1/${id}`, this.mapSmart1on1Input(input), {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  /** GraphQL Smart1on1 input field names → REST DTO (personName/…) shape. */
  private mapSmart1on1Input(input: any) {
    const out: Record<string, any> = {};
    if (input.title !== undefined) out.personName = input.title;
    if (input.participantEmail !== undefined) out.personEmail = input.participantEmail;
    if (!out.personName && input.personName !== undefined) out.personName = input.personName;
    if (!out.personEmail && input.personEmail !== undefined) out.personEmail = input.personEmail;
    if (input.frequency !== undefined) out.frequency = String(input.frequency).toLowerCase();
    if (input.duration !== undefined) out.durationMinutes = input.duration;
    if (input.preferredDays !== undefined) out.preferredDays = input.preferredDays;
    if (input.preferredTimes !== undefined) out.preferredTimes = input.preferredTimes;
    if (input.isActive !== undefined) out.isActive = input.isActive;
    return out;
  }

  async deleteSmart1on1(id: string, userId: string) {
    await this.client.delete(`/smart-1on1/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async scheduleSmart1on1(id: string, userId: string) {
    const { data } = await this.client.post(`/smart-1on1/${id}/schedule`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // ==================== TRAVEL TIME ====================
  async calculateTravelTime(userId: string, input: CalculateTravelTimeInput) {
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

  async createKanbanBoard(userId: string, input: CreateKanbanBoardInput) {
    const { data } = await this.client.post('/kanban', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateKanbanBoard(id: string, userId: string, input: UpdateKanbanBoardInput) {
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

  async moveTaskInKanban(userId: string, input: MoveTaskInKanbanInput) {
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
    return mapNotificationPrefsToGraphQL(data);
  }

  async updateNotificationPreferences(userId: string, input: UpdateNotificationPreferencesInput) {
    const { data } = await this.client.put(
      '/notifications/preferences',
      mapNotificationPrefsToRest(input),
      { headers: { 'x-user-id': userId } },
    );
    return mapNotificationPrefsToGraphQL(data);
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

  async getProjectsByIds(ids: string[], userId: string) {
    const { data } = await this.client.post(
      '/batch',
      { ids },
      { headers: { 'x-user-id': userId } },
    );
    return (data || {}) as Record<string, unknown>;
  }

  async getProjects(userId: string, filters: QueryProjectsArgs) {
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

  async createProject(userId: string, input: CreateProjectInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateProject(id: string, userId: string, input: UpdateProjectInput) {
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
  async generatePlan(userId: string, input: GeneratePlanInput) {
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

  // Get all plans (filter is PlanFilterInput from the plans query resolver)
  async getPlans(userId: string, filter?: PlanFilterInput) {
    const params: Record<string, string | number> = {
      page: 1,
      limit: 50,
    };
    if (filter?.status) params.status = filter.status;

    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params,
    });
    return data.plans || data.data || [];
  }

  // Create plan manually
  async createPlan(userId: string, input: CreatePlanInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Update plan
  async updatePlan(id: string, userId: string, input: UpdatePlanInput) {
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

  // Regenerate plan for the same week (creates a new draft)
  async regeneratePlan(id: string, userId: string) {
    const { data } = await this.client.post(`/${id}/regenerate`, {}, {
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
  async getPlanTemplates(args: QueryPlanTemplatesArgs = {}) {
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
  async createPlanTemplate(userId: string, input: CreatePlanTemplateInput) {
    const { data } = await this.client.post('/templates', input, {
      headers: { 'x-user-id': userId },
    });
    return data.template;
  }

  // Save an existing plan as a template
  async saveAsPlanTemplate(planId: string, userId: string, name: string, description?: string) {
    const { data } = await this.client.post(`/${planId}/save-as-template`, { name, description }, {
      headers: { 'x-user-id': userId },
    });
    return data.template;
  }

  // Generate a plan from a template
  async generatePlanFromTemplate(userId: string, input: { templateId: string; weekStartDate: string }) {
    const { data } = await this.client.post('/generate-from-template', input, {
      headers: { 'x-user-id': userId },
    });
    return data.plan;
  }

  // Set a template as default
  async setDefaultPlanTemplate(id: string, userId: string) {
    const { data } = await this.client.put(`/templates/${id}/set-default`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data.template;
  }

  // Delete a template
  async deletePlanTemplate(id: string, userId: string) {
    await this.client.delete(`/templates/${id}`, {
      headers: { 'x-user-id': userId },
    });
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

  /**
   * AI-learned recommendation strings from pattern recognition (PRO/PREMIUM).
   * `/patterns/refresh` recomputes and returns { insights, recommendations, ... }.
   * The GraphQL `insights`/`generateInsights` fields are typed [String!]!, so we
   * surface only the recommendation strings here.
   */
  async getInsights(userId: string, _type?: string, _limit?: number): Promise<string[]> {
    const { data } = await this.client.post(
      '/patterns/refresh',
      {},
      { headers: { 'x-user-id': userId } }
    );
    return data?.recommendations ?? [];
  }

  /**
   * Structured weekly review (all tiers): completion rate, top goals,
   * productivity level, and a single recommendation. Backed by the
   * non-gated /analytics/insights endpoint.
   */
  async getWeeklyReview(userId: string) {
    const { data } = await this.client.get('/insights', {
      headers: { 'x-user-id': userId },
    });
    return data.insights;
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

  async connectCalendar(userId: string, input: ConnectCalendarInput) {
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
    return events.map((e: GoogleCalendarApiEvent) => {
      const startValue = e.start;
      const endValue = e.end;
      const startObj = typeof startValue === 'object' && startValue !== null ? startValue : undefined;
      const endObj = typeof endValue === 'object' && endValue !== null ? endValue : undefined;

      return {
        id: e.id,
        title: e.summary || e.title || 'Untitled Event',
        description: e.description || null,
        start: startObj?.dateTime || startObj?.date || (typeof startValue === 'string' ? startValue : ''),
        end: endObj?.dateTime || endObj?.date || (typeof endValue === 'string' ? endValue : ''),
        allDay: !!startObj?.date,
        source: 'GOOGLE',
        attendees: (e.attendees || []).map((a: string | { email?: string }) =>
          typeof a === 'string' ? a : a.email
        ).filter(Boolean),
        location: e.location || null,
      };
    });
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

  async createEvent(userId: string, input: CreateCalendarEventInput) {
    const { data } = await this.client.post('/events', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateEvent(id: string, userId: string, input: UpdateCalendarEventInput) {
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

  async createTeam(userId: string, input: CreateTeamInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateTeam(id: string, userId: string, input: UpdateTeamInput) {
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

  async getTeamDashboard(teamId: string, userId: string) {
    const { data } = await this.client.get(`/${teamId}/dashboard`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getTeamGoals(teamId: string, userId: string) {
    const { data } = await this.client.get(`/${teamId}/goals`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async shareGoalWithTeam(teamId: string, goalId: string, userId: string) {
    await this.client.post(`/${teamId}/goals/${goalId}/share`, {}, {
      headers: { 'x-user-id': userId },
    });
    return true;
  }

  async unshareGoalFromTeam(goalId: string, userId: string) {
    await this.client.delete(`/goals/${goalId}/share`, {
      headers: { 'x-user-id': userId },
    });
    return true;
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

  async inviteTeamMember(userId: string, input: InviteTeamMemberInput) {
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

  async createApiKey(userId: string, input: CreateApiKeyInput) {
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

  async createSchedulingLink(userId: string, input: CreateSchedulingLinkInput) {
    const { data } = await this.client.post('/links', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateSchedulingLink(id: string, userId: string, input: UpdateSchedulingLinkInput) {
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

  async getAvailableSlots(slug: string, date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const { data } = await this.client.get(`/links/slug/${slug}/slots`, {
      params: {
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
      },
    });
    const slots = Array.isArray(data) ? data : [];
    return slots.map((slot: any) => ({
      start: typeof slot.start === 'string' ? slot.start : new Date(slot.start).toISOString(),
      end: typeof slot.end === 'string' ? slot.end : new Date(slot.end).toISOString(),
    }));
  }

  async createBooking(input: CreateBookingInput & { slug?: string }) {
    const slug = input.slug;
    if (!slug) {
      throw new GraphQLError('Booking slug is required', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
    const body = {
      linkSlug: slug,
      attendeeName: input.attendeeName,
      attendeeEmail: input.attendeeEmail,
      attendeePhone: input.attendeePhone,
      startTime: input.startTime,
      timezone: input.timezone,
      customResponses: input.customResponses,
    };
    const { data } = await this.client.post(`/links/slug/${slug}/bookings`, body);
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

  async initiateOAuth(userId: string, type: string) {
    // GraphQL enum values are UPPER_SNAKE; the REST authorize route keys off the
    // provider slug (lower-kebab), matching the api-gateway IntegrationType enum.
    const slug = String(type).toLowerCase().replace(/_/g, '-');
    const { data } = await this.client.get(`/oauth/${slug}/authorize`, {
      headers: { 'x-user-id': userId },
    });
    return { url: data.url };
  }

  async getIntegrationResources(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}/resources`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getPmInbox(userId: string) {
    const { data } = await this.client.get('/pm-inbox', { headers: { 'x-user-id': userId } });
    return data;
  }

  async importPmTasks(userId: string, items: any[]) {
    const { data } = await this.client.post('/pm-import', { items }, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async connectIntegration(userId: string, input: ConnectIntegrationInput) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateIntegration(id: string, userId: string, input: UpdateIntegrationInput) {
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

  async createWebhook(userId: string, input: CreateWebhookInput) {
    const { data } = await this.client.post('/webhooks', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateWebhook(id: string, userId: string, input: UpdateWebhookInput) {
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

// ==================== AUTOPILOT API ====================
export class AutopilotAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = createApiClient(`${API_BASE_URL}/api/v1/autopilot`, token);
  }

  async getStatus(userId: string) {
    const { data } = await this.client.get('/status', { headers: { 'x-user-id': userId } });
    return data;
  }

  async updateSettings(userId: string, input: { enabled?: boolean; mode?: string }) {
    await this.client.put('/settings', input, { headers: { 'x-user-id': userId } });
    // Return the full status so the mutation can resolve AutopilotStatus.
    return this.getStatus(userId);
  }

  async run(userId: string, date?: string) {
    const { data } = await this.client.post('/run', { date }, { headers: { 'x-user-id': userId } });
    // The controller returns { moved: 0 } when there's nothing to reschedule.
    return data && data.id ? data : null;
  }

  async applyProposal(userId: string, id: string) {
    const { data } = await this.client.post(`/proposals/${id}/apply`, {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async dismissProposal(userId: string, id: string) {
    const { data } = await this.client.post(`/proposals/${id}/dismiss`, {}, {
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
