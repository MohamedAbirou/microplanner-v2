import axios, { AxiosInstance } from 'axios';
import {
  ExternalResource,
  ExternalTask,
  ProviderContext,
  ProviderSyncError,
  TaskProvider,
  WebhookTaskEvent,
} from './provider.types';

/**
 * Todoist provider (REST API v2).
 * Docs: https://developer.todoist.com/rest/v2/
 */
export class TodoistProvider implements TaskProvider {
  readonly source = 'todoist';

  private client(ctx: ProviderContext): AxiosInstance {
    const token = ctx.credentials?.access_token || ctx.credentials?.accessToken;
    if (!token) {
      throw new ProviderSyncError('Todoist is not connected (no access token)', this.source);
    }
    return axios.create({
      baseURL: 'https://api.todoist.com/rest/v2',
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
  }

  async fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]> {
    const client = this.client(ctx);
    const projectId = ctx.config?.projectId;
    try {
      // The v2 "active tasks" endpoint only returns open tasks, so anything it
      // omits is treated as completed by the sync engine's reconciliation.
      const { data } = await client.get('/tasks', {
        params: projectId ? { project_id: projectId } : {},
      });
      const items = Array.isArray(data) ? data : [];
      return items.map((t: any) => this.mapTask(t));
    } catch (err: any) {
      throw this.toSyncError(err);
    }
  }

  async completeTask(ctx: ProviderContext, externalId: string): Promise<void> {
    const client = this.client(ctx);
    try {
      await client.post(`/tasks/${externalId}/close`);
    } catch (err: any) {
      // A 404 means the task no longer exists in Todoist — treat as already done.
      if (err?.response?.status === 404) return;
      throw this.toSyncError(err);
    }
  }

  async listResources(ctx: ProviderContext): Promise<ExternalResource[]> {
    const client = this.client(ctx);
    try {
      const { data } = await client.get('/projects');
      const items = Array.isArray(data) ? data : [];
      return items.map((p: any) => ({ id: String(p.id), name: p.name }));
    } catch (err: any) {
      throw this.toSyncError(err);
    }
  }

  parseWebhook(payload: any): WebhookTaskEvent | null {
    // Todoist webhooks: event_name like "item:added" | "item:updated" | "item:completed" | "item:deleted".
    const event = payload?.event_name;
    const data = payload?.event_data;
    if (!event || !data?.id) return null;
    if (event === 'item:deleted') {
      return { action: 'delete', externalId: String(data.id) };
    }
    if (event.startsWith('item:')) {
      return { action: 'upsert', task: this.mapTask(data) };
    }
    return null;
  }

  private mapTask(t: any): ExternalTask {
    return {
      externalId: String(t.id),
      title: t.content || 'Untitled task',
      notes: t.description || undefined,
      dueDate: t.due?.date ? new Date(t.due.datetime || t.due.date) : null,
      priority: this.mapPriority(t.priority),
      url: t.url,
      completed: Boolean(t.is_completed ?? t.checked),
      projectId: t.project_id ? String(t.project_id) : undefined,
    };
  }

  /** Todoist: 4 = p1 (urgent) … 1 = p4 (none). MicroPlanner: 1 high … 3 low. */
  private mapPriority(p?: number): number {
    switch (p) {
      case 4:
        return 1;
      case 3:
        return 1;
      case 2:
        return 2;
      default:
        return 3;
    }
  }

  private toSyncError(err: any): ProviderSyncError {
    const status = err?.response?.status;
    const detail = err?.response?.data?.error || err?.message || 'request failed';
    return new ProviderSyncError(`Todoist sync failed: ${detail}`, this.source, status);
  }
}
