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
 * Linear provider (GraphQL API).
 * Docs: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
 */
export class LinearProvider implements TaskProvider {
  readonly source = 'linear';

  private client(ctx: ProviderContext): AxiosInstance {
    const token = ctx.credentials?.access_token || ctx.credentials?.accessToken;
    if (!token) {
      throw new ProviderSyncError('Linear is not connected (no access token)', this.source);
    }
    return axios.create({
      baseURL: 'https://api.linear.app',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 20000,
    });
  }

  private async gql<T = any>(ctx: ProviderContext, query: string, variables?: any): Promise<T> {
    const client = this.client(ctx);
    let res;
    try {
      res = await client.post('/graphql', { query, variables });
    } catch (err: any) {
      throw this.toSyncError(err);
    }
    if (res.data?.errors?.length) {
      throw new ProviderSyncError(
        `Linear sync failed: ${res.data.errors[0]?.message || 'GraphQL error'}`,
        this.source,
      );
    }
    return res.data.data;
  }

  async fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]> {
    const teamId = ctx.config?.projectId; // optional team filter
    const tasks: ExternalTask[] = [];
    let after: string | null = null;

    // Page through the viewer's assigned, still-open issues.
    do {
      const data = await this.gql<any>(
        ctx,
        `query AssignedIssues($after: String) {
          viewer {
            assignedIssues(first: 50, after: $after, filter: { state: { type: { nin: ["completed", "canceled"] } } }) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id title description url priority dueDate completedAt
                state { type }
                team { id name }
              }
            }
          }
        }`,
        { after },
      );
      const conn = data?.viewer?.assignedIssues;
      const nodes: any[] = conn?.nodes || [];
      for (const n of nodes) {
        if (teamId && n.team?.id !== teamId) continue;
        tasks.push(this.mapIssue(n));
      }
      after = conn?.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (after);

    return tasks;
  }

  async completeTask(ctx: ProviderContext, externalId: string): Promise<void> {
    // Find the issue's team, then a workflow state of type "completed", and move it there.
    const data = await this.gql<any>(
      ctx,
      `query IssueForComplete($id: String!) {
        issue(id: $id) {
          id
          state { type }
          team { id states(filter: { type: { eq: "completed" } }) { nodes { id } } }
        }
      }`,
      { id: externalId },
    );
    const issue = data?.issue;
    if (!issue) return; // already gone
    if (issue.state?.type === 'completed') return; // already done
    const completedStateId = issue.team?.states?.nodes?.[0]?.id;
    if (!completedStateId) {
      throw new ProviderSyncError('Linear team has no completed workflow state', this.source);
    }
    await this.gql(
      ctx,
      `mutation Complete($id: String!, $stateId: String!) {
        issueUpdate(id: $id, input: { stateId: $stateId }) { success }
      }`,
      { id: externalId, stateId: completedStateId },
    );
  }

  async listResources(ctx: ProviderContext): Promise<ExternalResource[]> {
    const data = await this.gql<any>(
      ctx,
      `query Teams { teams(first: 100) { nodes { id name } } }`,
    );
    return (data?.teams?.nodes || []).map((t: any) => ({ id: t.id, name: t.name }));
  }

  parseWebhook(payload: any): WebhookTaskEvent | null {
    // Linear webhooks: { action: "create"|"update"|"remove", type: "Issue", data: {...} }
    if (payload?.type !== 'Issue' || !payload?.data?.id) return null;
    if (payload.action === 'remove') {
      return { action: 'delete', externalId: String(payload.data.id) };
    }
    return { action: 'upsert', task: this.mapIssue(payload.data) };
  }

  private mapIssue(n: any): ExternalTask {
    const completed = n.state?.type === 'completed' || Boolean(n.completedAt);
    return {
      externalId: String(n.id),
      title: n.title || 'Untitled issue',
      notes: n.description || undefined,
      dueDate: n.dueDate ? new Date(n.dueDate) : null,
      priority: this.mapPriority(n.priority),
      url: n.url,
      completed,
      projectId: n.team?.id,
      projectName: n.team?.name,
    };
  }

  /** Linear: 0 none, 1 urgent, 2 high, 3 medium, 4 low. MicroPlanner: 1 high … 3 low. */
  private mapPriority(p?: number): number {
    switch (p) {
      case 1:
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
      default:
        return 2;
    }
  }

  private toSyncError(err: any): ProviderSyncError {
    const status = err?.response?.status;
    const detail =
      err?.response?.data?.errors?.[0]?.message || err?.message || 'request failed';
    return new ProviderSyncError(`Linear sync failed: ${detail}`, this.source, status);
  }
}
