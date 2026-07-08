# MicroPlanner Production-Scale Audit — FINDINGS

**Date:** 2026-07-07
**Scope:** Bounded queries, tenant isolation, rate limiting, defense in depth, from 1 → millions of users.
**Method:** Read-only discovery across web, graphql-gateway, api-gateway, Prisma schema.

---

## Auth boundary — how `userId` is derived (verified)

- Web client (`apps/web/src/lib/apollo/client.ts`) injects the **Clerk JWT** as `Authorization: Bearer` on every HTTP + WS operation.
- GraphQL gateway (`apps/graphql-gateway/src/index.ts` `verifyToken`) verifies the JWT against Clerk JWKS (`CLERK_DOMAIN`). On any failure → `user = null`. Resolvers throw `UNAUTHENTICATED` when `user` is null. **Good.**
- Gateway forwards the same JWT to the api-gateway (`createApiClient(baseURL, token)`), and *also* sets an `x-user-id` header.
- api-gateway is protected by a **global `ClerkAuthGuard`** (`app.module.ts` → `APP_GUARD`). It re-verifies the JWT via passport + JWKS and sets `req.user` from the DB user. `@CurrentUser()` reads `req.user`.
- **`x-user-id` is never read anywhere in api-gateway** (grep: 0 matches). The JWT is authoritative end-to-end. ✅ **No IDOR via `x-user-id`.**
- Row-level ownership is enforced: `findOne`, `update`, `remove`, `complete`, `skip` all use `findFirst({ where: { id, userId } })`. ✅

**Residual risk:** `x-user-id` is dead code that *looks* security-relevant — a future refactor could wire it up and reintroduce trust-the-client. Recommend removing it (P2) and adding a regression test proving cross-user reads 404.

---

## P0 — Must fix before scale

| # | Area | File | Issue | Impact |
|---|------|------|-------|--------|
| P0-1 | Rate limiting | `apps/api-gateway/src/app.module.ts:111` | `ThrottlerModule` is configured but **no `ThrottlerGuard` is registered as `APP_GUARD`** → rate limiting is not enforced at all. | Any user/IP can flood task-create, `generatePlan` (LLM $), auth routes. No 429s ever returned. |
| P0-2 | Query complexity | `apps/graphql-gateway/src/index.ts:229` | No depth or complexity limit on the Apollo schema. `GetTask`/`GetTasks` nest task→subtasks→dependencies→dependentTask→… | A single crafted query fans out to unbounded REST calls; trivial DoS + N+1 amplification. |
| P0-3 | Unbounded batch fetch | `apps/graphql-gateway/src/datasources/rest-api.ts:396` `getTasksByGoalIds` | Sequential loop, one REST call **per goal**, each with **no date bound** → loads full task history per goal. Also `getTasksByPlanId`, `getTasksByGoal`, `getTasksByProject`, `searchTasks` send no date window. | O(goals) round-trips; each pulls 5k–20k rows for heavy users. Blows the p95 targets. |
| P0-4 | In-memory pagination | `apps/api-gateway/src/modules/tasks/tasks.service.ts:97` `findAll` | Regular tasks are now DB-bounded by date ✅, but `total` and `slice(skip, skip+limit)` run **in memory** over the whole window; recurring templates loaded with no cap. No hard `limit` clamp beyond DTO max (500). | Acceptable for a 90-day window, but a wide `startDate/endDate` (client-controlled) still materializes the whole range in memory before slicing. |
| P0-5 | Unbounded background job | `apps/api-gateway/src/modules/analytics/analytics.service.ts:358` `aggregateMetrics` | `findMany` all users → per goal → per plan `findMany` all tasks. No pagination, no batching. | At 1M users this is an OOM / multi-hour job. |
| P0-6 | Refetch storms | `apps/web/src/hooks/use-graphql.tsx` | Every task mutation uses `refetchQueries: ['GetTasks']` **by name** with `awaitRefetchQueries: true` → refetches **every mounted GetTasks** (day+week+month+tasks+today+dashboard) on a single complete. | Completing one task triggers 5–8 full task queries. Violates "<20 queries / initial load" and hammers the API. |

## P1 — Should fix

| # | Area | File | Issue |
|---|------|------|-------|
| P1-1 | Missing indexes | `packages/database/prisma/schema.prisma:258` | Hot paths lack composite indexes: `Task(userId, isCompleted, completedAt)` (streaks/weekly-completed counts), `Task(goalId, scheduledDate)` (goal task fetch), `Task(userId, scheduledDate, isCompleted)`. Current `Task(userId, scheduledDate)` covers calendar reads but not completion analytics. |
| P1-2 | Per-user rate limits | api-gateway | Even once P0-1 lands, throttler keys by IP by default. Need per-**user** limits (JWT sub) for `generatePlan` (expensive) and per-IP on auth-adjacent routes. |
| P1-3 | Introspection | `apps/graphql-gateway/src/index.ts:249` | Introspection disabled in prod ✅. But the **nested api-gateway** `GraphQLModule` (`app.module.ts:78`) has `introspection: true` + `playground: true` unconditionally. Confirm it isn't publicly exposed; disable in prod. |
| P1-4 | Idempotency | plans / billing | `acceptPlan` materializes tasks; it's idempotent via `existingTaskCount` check ✅. Stripe/Clerk webhooks need signature verification + idempotency keys (audit in Phase 5). |
| P1-5 | Security headers | `apps/web` (Next.js) | No CSP / HSTS / X-Frame-Options audit yet. |
| P1-6 | Observability | all | No structured logging with request id / user hash, no p95 metrics, no slow-query log. |

## P2 — Deferrable (with estimates)

| # | Item | Effort |
|---|------|--------|
| P2-1 | Remove dead `x-user-id` header from `rest-api.ts` + add cross-user IDOR regression test | 1h |
| P2-2 | Cursor-based pagination for tasks list (replace offset) | 0.5d |
| P2-3 | `Task` partitioning strategy doc (monthly by `scheduledDate`) for 100M+ rows | 0.5d (doc only) |
| P2-4 | Redis caching for `dashboardStats`, tier, goals list (short TTL, user-scoped keys) | 1d |
| P2-5 | Virtualize long task lists / month-calendar dots | 1d |
| P2-6 | Persisted-query allowlist for prod web client | 0.5d |

---

## Web fetch discipline — current state (mostly already fixed ✅)

| Page / component | Query | Status |
|------------------|-------|--------|
| Calendar (`calendar-page.tsx`) | `getCalendarTaskQuery()` dateRange + take (80/150/400) | ✅ bounded |
| Dashboard / Today | single-day dateRange | ✅ bounded |
| Tasks page | `getDefaultTaskListQuery(90)` take 250 | ✅ bounded |
| Analytics | `dateRange` from timeRange, take 500 | ✅ bounded |
| Command palette | `skipQuery: !open`, 30-day window, take 15 | ✅ bounded |
| Search | `skipQuery: !searchQuery`, take 50 | ✅ bounded |
| Settings export | `skipQuery: true` (lazy on export) | ✅ bounded |
| App layout | no global task fetch | ✅ |

The remaining web P0 is **P0-6 (refetch storms)** and Apollo field policies (`merge` replaces whole list rather than merging by id).

---

## Resolution status (2026-07-07 pass)

| # | Status | What shipped |
|---|--------|--------------|
| P0-1 rate limiting not enforced | ✅ fixed | `UserThrottlerGuard` registered global; per-user key; `strict` on `generatePlan`; `@SkipThrottle` health. |
| P0-2 no query depth limit | ✅ fixed | `depthLimit(8)` validation rule (zero-dep). Verified pass/reject. |
| P0-3 unbounded goal-task batch | ✅ fixed | `getTasksByGoalIds` now concurrent (`Promise.all`) + `limit:500` per goal. (Single `IN` query needs a new REST batch endpoint — deferred P2.) |
| P0-4 in-memory pagination / unbounded range | ✅ fixed | 400-day range clamp in `TasksService.findAll`. |
| P0-5 unbounded aggregate job | ✅ fixed | Cursor-paginated users (500/page) + `groupBy` counts + `$transaction` update. |
| P0-6 refetch storms | ✅ fixed | Dropped `refetchQueries` on complete/uncomplete/skip/update; rely on entity normalization. |
| P1-1 missing indexes | ✅ staged | Migration written (additive); **not deployed** — needs prod maintenance window. |
| P1-2 per-user limits | ✅ fixed | Throttler keys by user id. |
| P1-3 introspection in nested module | ✅ fixed | Gated on `NODE_ENV` in `app.module.ts`. |
| P1-5 security headers | ✅ fixed | HSTS + Permissions-Policy added. CSP deferred. |
| Multi-instance throttler storage | 🟡 deferred P1 | In-memory now; Redis storage needs a dep. |

## Implementation order

1. **DB** (P1-1 indexes) — migration.
2. **API** (P0-4 clamp/enforce bounds, P0-5 batch the job, P0-1 throttler guard + P1-2 per-user).
3. **GraphQL** (P0-2 depth/complexity, P0-3 batch `getTasksByGoalIds` into one date-bounded `IN` call).
4. **Web** (P0-6 scope refetch to active queries / cache updates, Apollo merge-by-id).
5. **Security** headers, webhook verification audit.
6. **Observability** + load test.
