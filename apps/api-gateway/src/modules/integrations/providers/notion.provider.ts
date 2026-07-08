import axios, { AxiosInstance } from 'axios';
import {
  ExternalResource,
  ExternalTask,
  ProviderContext,
  ProviderSyncError,
  TaskProvider,
} from './provider.types';

const NOTION_VERSION = '2022-06-28';

/**
 * Notion provider. Tasks live as pages in a user-selected database. Because
 * Notion databases have arbitrary schemas, mapping is heuristic: the first
 * title property is the task title, the first date property is the due date,
 * and completion is read from a checkbox or a status/select property whose value
 * looks "done".
 * Docs: https://developers.notion.com/reference
 */
export class NotionProvider implements TaskProvider {
  readonly source = 'notion';

  private client(ctx: ProviderContext): AxiosInstance {
    const token = ctx.credentials?.access_token || ctx.credentials?.accessToken;
    if (!token) {
      throw new ProviderSyncError('Notion is not connected (no access token)', this.source);
    }
    return axios.create({
      baseURL: 'https://api.notion.com/v1',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });
  }

  private databaseId(ctx: ProviderContext): string {
    const id = ctx.config?.databaseId || ctx.config?.projectId;
    if (!id) {
      throw new ProviderSyncError(
        'No Notion database selected — choose one in the integration settings',
        this.source,
      );
    }
    return id;
  }

  async fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]> {
    const client = this.client(ctx);
    const databaseId = this.databaseId(ctx);
    const tasks: ExternalTask[] = [];
    let cursor: string | undefined;

    try {
      do {
        const { data } = await client.post(`/databases/${databaseId}/query`, {
          start_cursor: cursor,
          page_size: 100,
        });
        for (const page of data.results || []) {
          const task = this.mapPage(page);
          if (task) tasks.push(task);
        }
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);
    } catch (err: any) {
      throw this.toSyncError(err);
    }
    return tasks;
  }

  async completeTask(ctx: ProviderContext, externalId: string): Promise<void> {
    const client = this.client(ctx);
    try {
      const { data: page } = await client.get(`/pages/${externalId}`);
      const props = page.properties || {};

      // Preferred: a checkbox property (options are implicit — just set true).
      for (const [name, value] of Object.entries<any>(props)) {
        if (value?.type === 'checkbox') {
          await client.patch(`/pages/${externalId}`, {
            properties: { [name]: { checkbox: true } },
          });
          return;
        }
      }

      // Otherwise resolve status/select options from the database schema.
      const databaseId = page.parent?.database_id || ctx.config?.databaseId;
      if (!databaseId) return;
      const { data: db } = await client.get(`/databases/${databaseId}`);
      for (const [name, def] of Object.entries<any>(db.properties || {})) {
        if (def?.type === 'status') {
          const done = (def.status?.options || []).find((o: any) => this.looksDone(o.name));
          if (done) {
            await client.patch(`/pages/${externalId}`, {
              properties: { [name]: { status: { name: done.name } } },
            });
            return;
          }
        }
        if (def?.type === 'select') {
          const done = (def.select?.options || []).find((o: any) => this.looksDone(o.name));
          if (done) {
            await client.patch(`/pages/${externalId}`, {
              properties: { [name]: { select: { name: done.name } } },
            });
            return;
          }
        }
      }
      // No completable property — treat as a no-op rather than an error.
    } catch (err: any) {
      if (err?.response?.status === 404) return; // page gone
      throw this.toSyncError(err);
    }
  }

  async listResources(ctx: ProviderContext): Promise<ExternalResource[]> {
    const client = this.client(ctx);
    try {
      const { data } = await client.post('/search', {
        filter: { property: 'object', value: 'database' },
        page_size: 100,
      });
      return (data.results || []).map((db: any) => ({
        id: db.id,
        name: this.plainText(db.title) || 'Untitled database',
      }));
    } catch (err: any) {
      throw this.toSyncError(err);
    }
  }

  private mapPage(page: any): ExternalTask | null {
    const props = page.properties || {};
    let title = '';
    let dueDate: Date | null = null;
    let completed = false;

    for (const value of Object.values<any>(props)) {
      if (value?.type === 'title') {
        title = this.plainText(value.title);
      } else if (value?.type === 'date' && value.date?.start && !dueDate) {
        dueDate = new Date(value.date.start);
      } else if (value?.type === 'checkbox') {
        if (value.checkbox) completed = true;
      } else if (value?.type === 'status' && value.status?.name) {
        if (this.looksDone(value.status.name)) completed = true;
      } else if (value?.type === 'select' && value.select?.name) {
        if (this.looksDone(value.select.name)) completed = true;
      }
    }

    if (!title) return null; // skip untitled/blank rows
    return {
      externalId: String(page.id),
      title,
      dueDate,
      completed,
      url: page.url,
      priority: 2,
    };
  }

  private looksDone(name: string): boolean {
    return /done|complete|closed|finished|resolved/i.test(name);
  }

  private plainText(rich: any[]): string {
    if (!Array.isArray(rich)) return '';
    return rich.map((r) => r?.plain_text || '').join('').trim();
  }

  private toSyncError(err: any): ProviderSyncError {
    const status = err?.response?.status;
    const detail = err?.response?.data?.message || err?.message || 'request failed';
    return new ProviderSyncError(`Notion sync failed: ${detail}`, this.source, status);
  }
}
