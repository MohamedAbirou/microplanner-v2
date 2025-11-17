import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001';

export { OnboardingAPI } from './onboarding-api';

// ==================== WAITLIST API ====================
export class WaitlistAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/waitlist`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/user`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  // Get user profile
  async getUser(userId: string) {
    const { data } = await this.client.get(`/${userId}`);
    return data;
  }

  // Update user profile
  async updateUserProfile(userId: string, input: any) {
    const { data} = await this.client.put(`/${userId}/profile`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Get user settings
  async getUserSettings(userId: string) {
    const { data } = await this.client.get(`/${userId}/settings`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Update user settings
  async updateUserSettings(userId: string, input: any) {
    const { data } = await this.client.put(`/${userId}/settings`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Get onboarding status
  async getOnboardingStatus(userId: string) {
    const { data } = await this.client.get(`/${userId}/onboarding/status`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  // Complete onboarding
  async completeOnboarding(userId: string, input: any) {
    const { data } = await this.client.post(`/${userId}/onboarding/complete`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

export class GoalsAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/goals`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getGoal(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getGoals(userId: string, filters: any) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    return data;
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
    return data;
  }

  async updateGoal(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteGoal(id: string, userId: string) {
    await this.client.delete(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async pauseGoal(id: string, userId: string, until?: Date) {
    const { data } = await this.client.post(
      `/${id}/pause`,
      { until },
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async resumeGoal(id: string, userId: string) {
    const { data } = await this.client.post(
      `/${id}/resume`,
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/tasks`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getTask(id: string, userId: string) {
    const { data } = await this.client.get(`/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getTasks(userId: string, filters: any) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: filters,
    });
    return data;
  }

  async getTasksByGoalIds(goalIds: string[]) {
    const { data } = await this.client.get('/batch', {
      params: { goalIds: goalIds.join(',') },
    });
    return data;
  }

  async createTask(userId: string, input: any) {
    const { data } = await this.client.post('/', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async updateTask(id: string, userId: string, input: any) {
    const { data } = await this.client.put(`/${id}`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
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
    return data;
  }

  async skipTask(id: string, userId: string, reason?: string) {
    const { data } = await this.client.post(
      `/${id}/skip`,
      { reason },
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async uncompleteTask(id: string, userId: string) {
    const { data } = await this.client.post(
      `/${id}/uncomplete`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async getTasksByProject(projectId: string, userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { projectId },
    });
    return data;
  }

  async getTasksByGoal(goalId: string, userId: string) {
    const { data } = await this.client.get('/', {
      headers: { 'x-user-id': userId },
      params: { goalId },
    });
    return data;
  }

  async searchTasks(query: string, userId: string) {
    const { data } = await this.client.get('/search', {
      headers: { 'x-user-id': userId },
      params: { q: query },
    });
    return data;
  }

  // Task Dependencies
  async createTaskDependency(userId: string, input: any) {
    const { data } = await this.client.post('/dependencies', input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async deleteTaskDependency(id: string, userId: string) {
    await this.client.delete(`/dependencies/${id}`, {
      headers: { 'x-user-id': userId },
    });
  }

  async getTaskDependencies(taskId: string) {
    const { data } = await this.client.get(`/${taskId}/dependencies`);
    return data;
  }

  async getTaskBlockers(taskId: string) {
    const { data } = await this.client.get(`/${taskId}/blockers`);
    return data;
  }

  // Time Tracking
  async startTimer(taskId: string, userId: string) {
    const { data } = await this.client.post(
      `/${taskId}/timer/start`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async stopTimer(taskId: string, userId: string) {
    const { data } = await this.client.post(
      `/${taskId}/timer/stop`,
      {},
      {
        headers: { 'x-user-id': userId },
      }
    );
    return data;
  }

  async getTimeEntries(taskId: string) {
    const { data } = await this.client.get(`/${taskId}/time-entries`);
    return data;
  }

  // Subtasks
  async createSubtask(parentId: string, userId: string, input: any) {
    const { data } = await this.client.post(`/${parentId}/subtasks`, input, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getSubtasks(taskId: string) {
    const { data } = await this.client.get(`/${taskId}/subtasks`);
    return data;
  }
}

export class ProductivityAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/productivity`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/projects`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/plans`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/analytics`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async getDashboardStats(userId: string) {
    const { data } = await this.client.get('/dashboard', {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getWeeklyStats(userId: string, weekStart?: string) {
    const { data } = await this.client.get('/weekly', {
      headers: { 'x-user-id': userId },
      params: { weekStart },
    });
    return data;
  }

  async getProductivityScores(userId: string, startDate: string, endDate: string) {
    const { data } = await this.client.get('/productivity-scores', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate },
    });
    return data;
  }

  async getGoalAnalytics(goalId: string, userId: string) {
    const { data } = await this.client.get(`/goals/${goalId}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async getTimeTracking(userId: string, startDate: string, endDate: string) {
    const { data } = await this.client.get('/time-tracking', {
      headers: { 'x-user-id': userId },
      params: { startDate, endDate },
    });
    return data;
  }

  async getInsights(userId: string, type?: string, limit?: number) {
    const { data } = await this.client.get('/insights', {
      headers: { 'x-user-id': userId },
      params: { type, limit },
    });
    return data;
  }

  async getStreakHistory(userId: string, limit?: number) {
    const { data } = await this.client.get('/streaks', {
      headers: { 'x-user-id': userId },
      params: { limit },
    });
    return data;
  }

  async generateInsights(userId: string) {
    const { data } = await this.client.post('/insights/generate', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }

  async dismissInsight(id: string, userId: string) {
    const { data } = await this.client.delete(`/insights/${id}`, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}

// ==================== CALENDAR API ====================
export class CalendarAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/calendar`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    return data;
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/teams`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/scheduling`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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

  async getAvailableSlots(linkId: string, date: string) {
    const { data } = await this.client.get(`/links/${linkId}/available-slots`, {
      params: { date },
    });
    return data;
  }

  async createBooking(input: any) {
    const { data } = await this.client.post('/bookings', input);
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/integrations`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/billing`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
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
    const { data } = await this.client.post('/checkout-session', { tier, interval }, {
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
    const { data } = await this.client.post('/portal-session', {}, {
      headers: { 'x-user-id': userId },
    });
    return data;
  }
}
