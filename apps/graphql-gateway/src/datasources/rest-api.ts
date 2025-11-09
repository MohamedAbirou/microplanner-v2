import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

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
