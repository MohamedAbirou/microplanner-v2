/**
 * WeeklyPlan rows store title/description inside planJson, not as top-level columns.
 * GraphQL Plan.title is non-null — derive it here so list/generate queries never 500.
 */
export function resolvePlanTitle(plan: {
  title?: string | null;
  planJson?: unknown;
  weekStartDate?: string | Date | null;
}): string {
  if (plan.title) return plan.title;

  const json =
    plan.planJson && typeof plan.planJson === 'object'
      ? (plan.planJson as Record<string, unknown>)
      : null;
  if (typeof json?.title === 'string' && json.title.trim()) {
    return json.title;
  }

  if (plan.weekStartDate) {
    const start = new Date(plan.weekStartDate);
    if (!Number.isNaN(start.getTime())) {
      return `Week of ${start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })}`;
    }
  }

  return 'Weekly Plan';
}

export function resolvePlanDescription(plan: {
  description?: string | null;
  planJson?: unknown;
}): string | null {
  if (plan.description !== undefined && plan.description !== null) {
    return plan.description;
  }

  const json =
    plan.planJson && typeof plan.planJson === 'object'
      ? (plan.planJson as Record<string, unknown>)
      : null;
  if (typeof json?.description === 'string') {
    return json.description;
  }

  return null;
}
