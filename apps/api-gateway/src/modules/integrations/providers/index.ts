import { TaskProvider } from './provider.types';
import { TodoistProvider } from './todoist.provider';
import { LinearProvider } from './linear.provider';
import { NotionProvider } from './notion.provider';
import { JiraProvider } from './jira.provider';
import { AsanaProvider } from './asana.provider';

export * from './provider.types';
export { TodoistProvider } from './todoist.provider';
export { LinearProvider } from './linear.provider';
export { NotionProvider } from './notion.provider';
export { JiraProvider } from './jira.provider';
export { AsanaProvider } from './asana.provider';

/**
 * Registry of PM task providers keyed by their source slug (which matches both
 * the api-gateway IntegrationType enum value and Task.externalSource).
 */
const REGISTRY: Record<string, TaskProvider> = {
  todoist: new TodoistProvider(),
  linear: new LinearProvider(),
  notion: new NotionProvider(),
  jira: new JiraProvider(),
  asana: new AsanaProvider(),
};

/** Returns the provider for a source slug, or null if the type has no PM sync. */
export function getTaskProvider(source: string): TaskProvider | null {
  return REGISTRY[source] ?? null;
}

/** Source slugs that support PM task sync. */
export const PM_SYNC_SOURCES = Object.keys(REGISTRY);
