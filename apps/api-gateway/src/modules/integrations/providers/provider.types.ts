/**
 * PM integration provider contracts.
 *
 * Each provider (Todoist, Linear, Notion, Jira, Asana, …) implements TaskProvider
 * to translate between its own API and MicroPlanner's normalized ExternalTask
 * shape. Providers are plain, stateless classes — all per-user state (tokens,
 * selected project) is passed in via ProviderContext so they stay easy to test.
 */

/** Normalized representation of a task/issue fetched from an external system. */
export interface ExternalTask {
  /** Stable ID in the external system. Required — used for idempotent upsert. */
  externalId: string;
  title: string;
  notes?: string;
  /** Due date if the item has one. Maps to MicroPlanner scheduledDate. */
  dueDate?: Date | null;
  /** Normalized priority: 1 = high, 2 = medium, 3 = low. */
  priority?: number;
  /** Deep link back to the item in the source app. */
  url?: string;
  /** Whether the item is already completed in the source. */
  completed: boolean;
  /** External project/board/database the item belongs to. */
  projectId?: string;
  projectName?: string;
}

/** A selectable project/board/database exposed to the settings UI. */
export interface ExternalResource {
  id: string;
  name: string;
}

/** Per-user context handed to every provider call. */
export interface ProviderContext {
  /** Decrypted OAuth credentials stored on the Integration row. */
  credentials: any;
  /** Integration.config — may carry a selected projectId, syncDirection, etc. */
  config: Record<string, any>;
}

/** Result of parsing an inbound webhook into a task change. */
export interface WebhookTaskEvent {
  action: 'upsert' | 'delete';
  task?: ExternalTask;
  externalId?: string;
}

export interface TaskProvider {
  /** Lower-case source slug, e.g. "todoist". Matches Task.externalSource. */
  readonly source: string;

  /**
   * Fetch open tasks assigned to the authenticated user. Implementations should
   * respect ctx.config.projectId when present and page through all results.
   */
  fetchTasks(ctx: ProviderContext): Promise<ExternalTask[]>;

  /**
   * Mark an external item complete (bi-directional sync-back). Must be
   * idempotent — completing an already-complete item is a no-op, not an error.
   */
  completeTask(ctx: ProviderContext, externalId: string): Promise<void>;

  /** List selectable projects/boards for the settings UI. Optional. */
  listResources?(ctx: ProviderContext): Promise<ExternalResource[]>;

  /**
   * Translate a raw inbound webhook into a task change. Returns null when the
   * event is irrelevant (e.g. a comment) and should be ignored. Optional.
   */
  parseWebhook?(payload: any, headers: Record<string, any>): WebhookTaskEvent | null;

  /**
   * For providers with short-lived tokens (Jira, Asana): refresh when near
   * expiry. Returns the new credentials object to persist, or null if the
   * current token is still valid. Implementations read their own client
   * id/secret from the environment.
   */
  refreshCredentials?(ctx: ProviderContext): Promise<any | null>;
}

/** Thrown by providers on a recoverable, user-surfaceable sync failure. */
export class ProviderSyncError extends Error {
  constructor(
    message: string,
    readonly source: string,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ProviderSyncError';
  }
}
