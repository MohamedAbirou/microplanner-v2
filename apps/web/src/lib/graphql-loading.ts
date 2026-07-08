/**
 * When fetchPolicy is cache-first, Apollo may set `loading: true` during a
 * background refetch. Treat loading as blocking only when there is no cached
 * data yet so navigations show stale-while-revalidate instead of skeletons.
 */
export function initialQueryLoading(loading: boolean, data: unknown): boolean {
  return Boolean(loading && data === undefined);
}
