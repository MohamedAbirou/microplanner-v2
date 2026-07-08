import axios, { AxiosInstance } from 'axios';
import {
  ExternalResource,
  ExternalTask,
  ProviderContext,
  ProviderSyncError,
  TaskProvider,
} from './provider.types';

/**
 * Asana provider (REST API 1.0).
 * Docs: https://developers.asana.com/reference/rest-api-reference
 */
export class AsanaProvider implements TaskProvider {
  readonly source = 'asana';

  private client(ctx: ProviderContext): AxiosInstance {
    const token = ctx.credentials?.access_token;
    if (!token) throw new ProviderSyncError('Asana is not connected (no access token)', this.source);
    return axios.create({
      baseURL: 'https://app.asana.com/api/1.0',
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000,
    });
  }

  async fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]> {
    const client = this.client(ctx);
    const workspaceId = ctx.config?.workspaceId;
    const projectId = ctx.config?.projectId;
    if (!projectId && !workspaceId) {
      throw new ProviderSyncError('Asana workspace not resolved — reconnect Asana', this.source);
    }

    const params: Record<string, any> = {
      completed_since: 'now', // only incomplete tasks
      opt_fields: 'name,notes,due_on,due_at,completed,permalink_url',
      limit: 100,
    };
    if (projectId) params.project = projectId;
    else {
      params.assignee = 'me';
      params.workspace = workspaceId;
    }

    const tasks: ExternalTask[] = [];
    let offset: string | undefined;
    try {
      for (;;) {
        const { data }: any = await client.get('/tasks', {
          params: offset ? { ...params, offset } : params,
        });
        for (const t of data.data || []) tasks.push(this.mapTask(t));
        offset = data.next_page?.offset;
        if (!offset) break;
      }
    } catch (err: any) {
      throw this.toSyncError(err);
    }
    return tasks;
  }

  async completeTask(ctx: ProviderContext, externalId: string): Promise<void> {
    const client = this.client(ctx);
    try {
      await client.put(`/tasks/${externalId}`, { data: { completed: true } });
    } catch (err: any) {
      if (err?.response?.status === 404) return;
      throw this.toSyncError(err);
    }
  }

  async listResources(ctx: ProviderContext): Promise<ExternalResource[]> {
    const client = this.client(ctx);
    const workspaceId = ctx.config?.workspaceId;
    try {
      const { data } = await client.get('/projects', {
        params: { workspace: workspaceId, opt_fields: 'name', limit: 100 },
      });
      return (data.data || []).map((p: any) => ({ id: p.gid, name: p.name }));
    } catch (err: any) {
      throw this.toSyncError(err);
    }
  }

  async refreshCredentials(ctx: ProviderContext): Promise<any | null> {
    const creds = ctx.credentials || {};
    const expiresAt = creds.expires_at as number | undefined;
    if (!creds.refresh_token || !expiresAt || Date.now() < expiresAt - 60_000) return null;

    const clientId = process.env.ASANA_CLIENT_ID;
    const clientSecret = process.env.ASANA_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const { data } = await axios.post(
      'https://app.asana.com/-/oauth_token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return {
      ...creds,
      access_token: data.access_token,
      refresh_token: data.refresh_token || creds.refresh_token,
      expires_at: data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined,
    };
  }

  private mapTask(t: any): ExternalTask {
    const due = t.due_at || t.due_on;
    return {
      externalId: String(t.gid),
      title: t.name || 'Untitled task',
      notes: t.notes || undefined,
      dueDate: due ? new Date(due) : null,
      priority: 2,
      url: t.permalink_url,
      completed: Boolean(t.completed),
    };
  }

  private toSyncError(err: any): ProviderSyncError {
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.errors?.[0]?.message || err?.message || 'request failed';
    return new ProviderSyncError(`Asana sync failed: ${detail}`, this.source, status);
  }
}
