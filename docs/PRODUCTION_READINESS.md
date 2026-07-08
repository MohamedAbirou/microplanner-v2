# MicroPlanner — Production Readiness

**Audit date:** 2026-07-07
**Target scale:** 1M+ registered users, 5k–20k tasks/user, 10k+ concurrent sessions.

This document records the architecture decisions, limits, indexes, cache TTLs,
and rate limits applied during the production-scale hardening pass. Companion
docs: [`FINDINGS.md`](./FINDINGS.md) (audit), [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md).

---

## Query contracts

### Task list (`api-gateway` `TasksService.findAll`)
- **userId scoping:** required, always (`where.userId = user.id` derived from JWT). Never client-supplied.
- **Default window:** 90 days forward when no date filter is supplied.
- **Hard range cap:** client-supplied `startDate/endDate` spans are **clamped to 400 days** (`MAX_RANGE_DAYS`). A `2000..2100` request can no longer materialize an entire history.
- **Limit cap:** `limit` clamped to `[1, 500]` at the DTO (`QueryTasksDto`), default 50.
- Regular tasks are fetched **DB-bounded by date**; recurring templates are expanded in-memory only for the requested window.

### GraphQL → REST mapping (`graphql-gateway/datasources/rest-api.ts`)
- `getTasks` maps GraphQL `filter.dateRange` → REST `startDate/endDate`, `take` → `limit`, `skip` → `page`.
- `getTasksByGoalIds` (DataLoader batch) now issues per-goal calls **concurrently** (`Promise.all`) with a `limit: 500` cap each — was sequential + unbounded.

### Plans / Goals
- `PlansService.findAll`: offset pagination, `take: limit`, default 20, userId-scoped, DB-side `count`.
- `GoalsService.findAll`: `take: limit`, default 20, userId-scoped.

---

## Database indexes

Migration: `packages/database/prisma/migrations/20260707000000_task_hotpath_indexes/`
(**additive, idempotent, not yet deployed to production — see runbook below**).

| Index | Query path served |
|-------|-------------------|
| `Task(userId, scheduledDate)` *(existing)* | Calendar day/week/month reads |
| `Task(userId, isCompleted, completedAt)` *(new)* | Weekly-completed counts, streak scans (`analytics.service`) |
| `Task(goalId, scheduledDate)` *(new)* | Goal task fetch / goal analytics rollups |
| `WeeklyPlan(userId, weekStartDate)` *(existing)* | Current-week plan lookup |

### Ops runbook — applying the index migration on production
Prisma wraps migrations in a transaction, so `CREATE INDEX` locks writes for the
duration on a large table. For the production `Task` table (millions of rows):

1. **Preferred:** run the two `CREATE INDEX` statements manually with
   `CREATE INDEX CONCURRENTLY` (no `IF NOT EXISTS` needed if absent) during a
   low-traffic window, then `prisma migrate resolve --applied 20260707000000_task_hotpath_indexes`.
2. **Acceptable for smaller tables:** `prisma migrate deploy` (brief write lock).

> ⚠️ Do **not** run `prisma migrate deploy` blindly against the Render Frankfurt
> production DB without confirming table size and a maintenance window.

---

## Rate limits (`api-gateway`)

Enforced globally by `UserThrottlerGuard` (`common/guards/user-throttler.guard.ts`),
keyed by **authenticated user id** (Clerk sub → DB user), falling back to client
IP for unauthenticated/public routes. Works for both REST and GraphQL contexts.
Returns `429` + `Retry-After` natively (NestJS Throttler v5).

| Throttler | Window | Limit | Applied to |
|-----------|--------|-------|-----------|
| `default` | 60s | 300 / user | All REST + GraphQL ops (global) |
| `strict`  | 60s | 5 / user  | `POST /plans/generate` (LLM cost/latency) |
| *(skipped)* | — | — | `/health/*` probes (`@SkipThrottle`) |

- Tier quotas (FREE weekly-plan / daily-task limits in `billing.constants.ts`) are enforced **separately** in the service layer; the throttler is pure abuse/burst protection and does not change tier behavior.

**Known limitation (P1):** throttler storage is **in-memory** (per instance). On
horizontal scale (multiple Render instances) each instance keeps its own bucket,
so the effective limit is `N × limit`. Fix: add `@nestjs/throttler-storage-redis`
backed by the existing Redis. Deferred to avoid adding a dependency in this pass.

---

## GraphQL gateway safety

- **Depth limit:** custom validation rule `depthLimit(8)` (`validation/depth-limit.ts`, zero-dependency) rejects queries deeper than 8. Deepest legitimate op (`GetTask`) is ~depth 4–6. Verified: `GetTask` passes, a depth-10 crafted query is rejected.
- **Introspection:** disabled in production on both the Apollo gateway (`index.ts`) and the nested NestJS `GraphQLModule` (`app.module.ts`) — `NODE_ENV === 'production'` gates `introspection` + `playground`.
- **Persisted queries:** enabled with 15-min TTL (bounded cache).
- **DataLoaders:** per-request, batch task/goal/project/user by id (collapses N+1).

---

## Web client fetch discipline

Apollo default `fetchPolicy: cache-first` (avoids refetch storms on navigation).
All task-fetching pages pass a bounded `dateRange + take` (see FINDINGS table).

**Refetch-storm fix:** single-task mutations (`complete`, `uncomplete`, `skip`,
`update`) **no longer** `refetchQueries: ['GetTasks']`. Their responses include
`id` + changed fields, so Apollo patches the normalized `Task` entity in place
across every mounted list. Completing one task previously re-ran 5–8 full
`GetTasks` queries; now it runs **zero**. Membership-changing mutations
(`create`, `delete`, `bulk*`) still refetch active queries only.

---

## Caching (planned — P2)

Not implemented in this pass. Design for when needed:
- `dashboardStats`, user tier, goals-list summary → Redis, **user-scoped keys**
  (`stats:{userId}`), short TTL (30–60s), invalidated on task/plan/goal mutation.
- **Never** a global task cache — keys must always include `userId`.

---

## Verification (this pass)

| Check | Result |
|-------|--------|
| `tsc --noEmit` api-gateway | ✅ pass |
| `tsc --noEmit` graphql-gateway | ✅ pass |
| `tsc --noEmit` web | ✅ pass |
| `nest build` api-gateway | ✅ success |
| `tsc` build graphql-gateway | ✅ success |
| `next build` web | ✅ success |
| depth-limit rule (legit pass / deep reject) | ✅ verified |

### Not yet run (needs live DB / running services)
- Load test (k6/artillery) — 500 concurrent calendar-week requests. **Deferred (P1).**
- Stress-user (`wtm0134@gmail.com`) manual calendar/tasks payload-size checks — requires running stack + prod-like data.
- Index migration deploy — requires prod DB + maintenance window approval.
