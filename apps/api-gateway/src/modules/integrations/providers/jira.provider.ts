import axios, { AxiosInstance } from 'axios';
import {
  ExternalResource,
  ExternalTask,
  ProviderContext,
  ProviderSyncError,
  TaskProvider,
} from './provider.types';

/**
 * Jira provider (Atlassian Cloud REST v3, 3LO OAuth).
 * Docs: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
 */
export class JiraProvider implements TaskProvider {
  readonly source = 'jira';

  private client(ctx: ProviderContext): AxiosInstance {
    const token = ctx.credentials?.access_token;
    const cloudId = ctx.config?.cloudId;
    if (!token) throw new ProviderSyncError('Jira is not connected (no access token)', this.source);
    if (!cloudId) throw new ProviderSyncError('Jira site not resolved — reconnect Jira', this.source);
    return axios.create({
      baseURL: `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      timeout: 20000,
    });
  }

  async fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]> {
    const client = this.client(ctx);
    const siteUrl = ctx.config?.siteUrl || '';
    const projectKey = ctx.config?.projectId;
    const jql = [
      'assignee = currentUser()',
      'statusCategory != Done',
      projectKey ? `project = "${projectKey}"` : '',
    ]
      .filter(Boolean)
      .join(' AND ');

    const tasks: ExternalTask[] = [];
    let startAt = 0;
    try {
      for (;;) {
        const { data }: any = await client.get('/search', {
          params: {
            jql,
            startAt,
            maxResults: 100,
            fields: 'summary,description,duedate,priority,status',
          },
        });
        for (const issue of data.issues || []) {
          tasks.push(this.mapIssue(issue, siteUrl));
        }
        startAt += (data.issues || []).length;
        if (startAt >= (data.total || 0) || !(data.issues || []).length) break;
      }
    } catch (err: any) {
      throw this.toSyncError(err);
    }
    return tasks;
  }

  async completeTask(ctx: ProviderContext, externalId: string): Promise<void> {
    const client = this.client(ctx);
    try {
      const { data } = await client.get(`/issue/${externalId}/transitions`);
      const done = (data.transitions || []).find(
        (t: any) => t.to?.statusCategory?.key === 'done',
      );
      if (!done) {
        throw new ProviderSyncError('No "Done" transition available for this Jira issue', this.source);
      }
      await client.post(`/issue/${externalId}/transitions`, { transition: { id: done.id } });
    } catch (err: any) {
      if (err instanceof ProviderSyncError) throw err;
      if (err?.response?.status === 404) return;
      throw this.toSyncError(err);
    }
  }

  async listResources(ctx: ProviderContext): Promise<ExternalResource[]> {
    const client = this.client(ctx);
    try {
      const { data } = await client.get('/project/search', { params: { maxResults: 100 } });
      return (data.values || []).map((p: any) => ({ id: p.key, name: p.name }));
    } catch (err: any) {
      throw this.toSyncError(err);
    }
  }

  async refreshCredentials(ctx: ProviderContext): Promise<any | null> {
    const creds = ctx.credentials || {};
    const expiresAt = creds.expires_at as number | undefined;
    if (!creds.refresh_token || !expiresAt || Date.now() < expiresAt - 60_000) return null;

    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const { data } = await axios.post(
      'https://auth.atlassian.com/oauth/token',
      {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );
    return {
      ...creds,
      access_token: data.access_token,
      refresh_token: data.refresh_token || creds.refresh_token,
      expires_at: data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined,
    };
  }

  private mapIssue(issue: any, siteUrl: string): ExternalTask {
    const f = issue.fields || {};
    const done = f.status?.statusCategory?.key === 'done';
    return {
      externalId: issue.key,
      title: f.summary || 'Untitled issue',
      notes: this.adfToText(f.description) || undefined,
      dueDate: f.duedate ? new Date(f.duedate) : null,
      priority: this.mapPriority(f.priority?.name),
      url: siteUrl ? `${siteUrl}/browse/${issue.key}` : undefined,
      completed: done,
      projectId: issue.key?.split('-')[0],
    };
  }

  private mapPriority(name?: string): number {
    const n = (name || '').toLowerCase();
    if (n.includes('highest') || n.includes('high') || n.includes('urgent')) return 1;
    if (n.includes('low')) return 3;
    return 2;
  }

  /** Flatten an Atlassian Document Format body into plain text (best-effort). */
  private adfToText(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    let out = '';
    if (node.text) out += node.text;
    if (Array.isArray(node.content)) {
      for (const child of node.content) out += this.adfToText(child);
      if (['paragraph', 'heading'].includes(node.type)) out += '\n';
    }
    return out.trim();
  }

  private toSyncError(err: any): ProviderSyncError {
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.errorMessages?.[0] || err?.response?.data?.message || err?.message || 'request failed';
    return new ProviderSyncError(`Jira sync failed: ${detail}`, this.source, status);
  }
}
