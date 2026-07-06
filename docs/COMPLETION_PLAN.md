# MicroPlanner — Completion Plan (Living Document)

**Created:** 2026-07-05 · **Status:** ACTIVE — update the Progress Tracker at the bottom after every work session.
**Goal:** Ship a fully working, sellable product. Every feature reachable from the UI must work end-to-end or be removed from the UI.

This document supersedes the November 2025 docs (`GAP_ANALYSIS.md`, `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_ROADMAP.md`) — those describe an older state of the code and contain stale findings (e.g. "resolvers commented out" — they no longer are). Read this document first when resuming work.

---

## 1. Architecture Decision: GraphQL is the product API (RESOLVED)

**The question:** GraphQL vs REST conflict — which to keep?

**The decision: keep BOTH, with clear roles. GraphQL is the only API the frontend talks to. REST is internal.**

```
Browser (Next.js 15 + Apollo Client)
   │  GraphQL only (queries/mutations/subscriptions)
   ▼
apps/graphql-gateway  (Apollo Server 4, port 4000)   ← THE product API
   │  internal REST calls (axios datasources, forwards Clerk Bearer JWT)
   ▼
apps/api-gateway      (NestJS, port 3001, routes /api/v1/*)  ← business logic
   │  Prisma
   ▼
PostgreSQL + Redis (docker-compose)
```

**Why not pure GraphQL (delete api-gateway)?** The api-gateway holds all business logic (~40 services: planning strategies, Stripe, Clerk webhooks, Google OAuth, email, cron). Webhooks (Clerk/Stripe/Google) *must* be plain HTTP endpoints anyway. Rewriting ~15k lines into the gateway is months of risk for zero user-visible gain.

**Why not pure REST (delete graphql-gateway)?** The frontend is 100% Apollo — ~90 operations in `apps/web/src/graphql/*.ts`, hooks in `use-graphql*.tsx`. There are zero direct REST calls from the web app. Rewriting the frontend data layer is equally pointless.

**Cleanup that IS required (the actual conflict):** the api-gateway *also* runs a second GraphQL server (NestJS Apollo driver in `app.module.ts`, `autoSchemaFile`) used only by `onboarding.resolver.ts` and `waitlist.resolver.ts`. The gateway's `OnboardingAPI` datasource proxies GraphQL→GraphQL to it. This double-GraphQL is the confusing part. Resolution (Phase 1): give waitlist + onboarding plain REST controllers like every other module, point the gateway datasources at them, then remove `GraphQLModule` from the api-gateway entirely. One GraphQL server, one REST server, no overlap.

---

## 2. Verified Findings (audited 2026-07-05, current code)

### F1. GraphQL↔REST contract drift (CRITICAL — many resolvers 404 at runtime)
`apps/graphql-gateway/src/datasources/rest-api.ts` (1,532 lines) calls endpoints the api-gateway does not expose. Everything *compiles*; it fails only when the resolver runs. Confirmed mismatches:

| Domain | Gateway datasource calls | api-gateway actually has | Fix |
|---|---|---|---|
| Waitlist | REST `/api/v1/waitlist/*` (6 routes) | **No controller at all** (NestJS GraphQL resolver only) | Add `waitlist.controller.ts` |
| Teams | `/api/v1/teams/*` (12 routes: CRUD, members, invitations, roles) | `premium/teams` (5 routes, different shapes) | Extend premium controller or new `teams` controller |
| API keys | `/api/v1/integrations/api-keys/*` (5 routes incl. toggle) | `premium/api-keys` (3 routes, no toggle) | Align paths + add toggle |
| Billing | `/info`, `/usage`, `/can-use-feature`, `/upgrade`, `/resume`, `/payment-method` | none of these (has plans/checkout/portal/subscription/cancel) | Add 6 endpoints to billing controller |
| Calendar | `/connections` CRUD, `/auth/initiate`, `/sync-all`, `/busy-slots`, `/events` create/update/delete, `/connections/:id/events`, `/connections/:id/sync` | Google-only: `oauth/google`, `oauth/google/callback`, `events` (GET), `sync`, `status`, `disconnect` | Build connections model endpoints wrapping the existing Google service |
| Scheduling | `GET /links/:id`, `PUT /links/:id/toggle`, `GET /bookings` (all), `GET /bookings/:id`, `POST /bookings/:id/confirm` | missing those; has `PUT bookings/:id/status` instead of confirm | Add endpoints / align |
| Plans | `POST /` (createPlan), `PUT /:id` (updatePlan) | missing (has generate/current/get/accept/regenerate/delete/templates) | Add create + update |
| Tasks | `uncompleteTask` (route TBD in rest-api.ts:367-393 block), timer/subtask paths under `/advanced/*` | `tasks/advanced` has timer start/stop, time/log, subtasks — **verify each path & payload 1:1** | Path-by-path audit in Phase 1 |
| Productivity | notifications, kanban, scores, work-hours, focus-time, etc. | Controller looks complete — **verify payload shapes** | Audit |
| Analytics | `/metrics`, `/insights`; `/time-tracking`, `/streaks`, `/insights/generate` are commented out in datasource but resolvers may reference them | metrics/insights/usage/patterns exist | Audit + implement or stub |

**Phase 1 must finish with a scripted route audit:** extract every axios call → compare against the Nest route table → zero unmatched calls.

### F2. GraphQL subscriptions cannot work (CRITICAL — breaks UX promises)
- Frontend (`apps/web/src/lib/apollo/client.ts`) opens `graphql-ws` WebSocket to `ws://localhost:4000/graphql`.
- `apps/graphql-gateway/src/index.ts` **never creates a WS server** (no `graphql-ws`/`useServer`, not even in package.json). Resolvers publish to Redis PubSub that no one can subscribe to over the wire.
- Fix: add `graphql-ws` + `ws` `useServer` on the shared HTTP server, auth via `connectionParams`. OR (fallback if time-boxed): remove wsLink from the frontend and rely on refetch — the app already calls `refetch()` after every mutation. Decide in Phase 2. **Recommendation: implement the WS server properly; it's ~50 lines.**

### F3. Gateway "verifies" JWTs with `jwt.decode` (SECURITY)
`index.ts:60-71` decodes without signature verification (comment admits "development only!"). The REST layer does verify (Clerk JWKS via passport), so data access is safe, but:
- `user.userId` from a forged token controls **Redis PubSub channel names** → a forged token could subscribe to another user's task events once WS works.
- Resolvers make auth decisions (`if (!user) throw`) on unverified data.
- Fix: verify against Clerk JWKS in the gateway (jwks-rsa + jsonwebtoken RS256), cache keys. Also required: `x-user-id` headers sent by datasources must never be trusted by api-gateway (audit `@CurrentUser` usage — user identity must come from the verified JWT, not the header).

### F3b. Additional gateway bugs found in audit (fix in Phase 1)
- `Task.blockedBy` and `Task.timeEntries` field resolvers call `TasksAPI.getTaskBlockers`/`getTimeEntries`, which **unconditionally `throw`** (`rest-api.ts:452-467, 476-490` region). Any query selecting those fields errors. Either implement REST endpoints or return derived/empty data and trim the schema.
- `TasksAPI.searchTasks` and `getTasksByGoalIds` expect a bare array but the REST API returns `{ tasks: [...] }` → they silently return `[]` every time (breaks search + Goal.tasks dataloader).
- `TasksAPI.uncompleteTask` PUTs `{ completed: false, completedAt: null }` but `UpdateTaskDto` only accepts `isCompleted` and the global ValidationPipe uses `forbidNonWhitelisted: true` → **400 on every un-complete**. Send `{ isCompleted: false }`.
- Gateway context: resolvers read `user.userId` but a Clerk JWT payload has `sub` only → `userId` is `undefined`; PubSub channels become `TASK_UPDATED_undefined` (shared across all users). Normalize context user to `{ sub, userId }` after real JWKS verification (F3). Note REST identity is safe — api-gateway derives the user from the verified JWT via `ClerkStrategy.validate` → DB user; the `x-user-id` headers the datasources send are ignored entirely (dead weight — remove them for clarity or keep as trace headers).

### F4. Frontend documents vs gateway schema (HIGH — unknown breakage surface)
~90 operations across `operations.ts`, `operations-extended.ts`, `onboarding.graphql.ts`. Some were written against a hoped-for schema. Must validate mechanically: script that builds the gateway schema (`schema/schema.ts` merges 17 .graphql files) and runs `graphql`'s `validate()` on every frontend document. Fix every mismatch on whichever side is wrong (schema wins if backend supports it; otherwise trim the document/UI).

### F5. Business-logic gaps behind working plumbing (HIGH)
Carried over from the old gap analysis, still believed true (verify each in Phase 3):
- **Quality score**: `WeeklyPlan.qualityScore` displayed in UI, never calculated. Implement in `plans.service.ts` + strategies (goal balance / peak hours / spacing / workload, 25 pts each).
- **Dashboard aggregation**: `dashboard.resolver.ts` (347 lines) computes from multiple datasource calls — verify stats (streaks, week overview) are real, not placeholder.
- **Planning strategies**: rule-based / gpt-4o-mini / claude-sonnet services exist; must verify they run, respect chronotype/work-hours/buffer-time, and degrade gracefully without API keys (rule-based fallback).
- **Calendar bidirectional sync**: Google OAuth + token encryption exist; sync loop / conflict handling incomplete.
- **Notifications**: `notifications-context.tsx` uses mock data; productivity controller has notification routes — wire them.
- **Tier limits**: `tier-context.tsx` limits vs `billing.constants.ts` vs docs disagree (2 plans/month vs 7/week). Pick the competitive-research numbers (FREE 7/wk, STARTER 15/wk, PRO unlimited), enforce server-side in one place (`tier.guard.ts` + usage-limit middleware exist but wiring unverified).

### F6. Environment/config hazards (MEDIUM)
- `.env` at repo root has placeholder values for GOOGLE_*, ENCRYPTION_KEY, SENTRY, RESEND → features must **degrade gracefully, never crash**, when keys are placeholders (esp. plan generation → fall back to rule-based; calendar → show "not configured").
- `packages/config` defaults: `apiUrl` → `localhost:3000` (wrong, that's the web app; should be 3001), `metadataBase` in web layout points at 3001 (wrong, web is 3000). Cosmetic but fix.
- CORS allowlists are hardcoded per-environment in two places; unify via env.

### F7. Hygiene (LOW)
- Uncommitted WIP in `apps/web/src/app/(app)/day/page.tsx` (typed Task interfaces + selectedTask instead of selectedTaskId — a fix for TaskDetailModal props; finish and commit it in Phase 1).
- `Performance Best Practices.txt` untracked at root → move into `docs/` or delete.
- Branch chaos: working branch is `master`, but origin default is `claude/microplanner-mvp-setup-...` and 10+ stale `claude/*` branches exist. Decide canonical branch (recommend `master`), merge/prune the rest at the end.
- Duplicate calendar components (`week-calendar.tsx` vs `draggable-week-calendar.tsx` vs `week-calendar-dnd.tsx`) — consolidate in Phase 4.
- Old planning .md files at root — archive to `docs/archive/` in Phase 6 so a buyer sees a clean repo.

---

## 3. Phases

Ordering principle: **compile → contract → boot → core loops → money → polish → package for sale.** Each phase has an exit criterion; do not advance while the previous exit criterion fails.

### Phase 0 — Baseline builds (exit: `pnpm -r build` and all typechecks green)
1. `pnpm install` (running as of doc creation).
2. `tsc --noEmit` / `nest build` / `next build` for the 3 apps + 4 packages; fix every error.
3. `prisma generate` + `prisma migrate dev` against dockerized Postgres; commit any drift as a migration.
4. Finish + commit the WIP in `day/page.tsx`.

### Phase 1 — Kill the GraphQL/REST conflict (exit: scripted audits pass with zero mismatches)
1. **Route audit script** (`scripts/audit-contracts.mjs`): parse axios calls in datasources, parse Nest decorators, diff. Wire as a repo script so a buyer can run it.
2. Fix every F1 row: add missing REST controllers/endpoints (waitlist, teams, api-keys, billing×6, calendar connections, scheduling, plans create/update); align paths where they merely differ.
3. **Schema audit script** (`scripts/audit-operations.mjs`): validate all ~90 frontend documents against the gateway schema; fix all.
4. Onboarding/waitlist: REST controllers → gateway datasources call REST → **delete `GraphQLModule` from api-gateway** (single GraphQL server remains).
5. F3 security: real JWKS verification in gateway; strip trust of `x-user-id` at api-gateway.

### Phase 2 — Boot & wire realtime (exit: both servers + web boot; login → dashboard → create goal → create task → complete task works in browser; no console/network errors)
1. docker-compose up (Postgres+Redis), seed script for a demo user with goals/tasks/plan.
2. Add graphql-ws `useServer` to the gateway (F2) with verified-JWT `connectionParams`; confirm task-completion pushes a live update. If Redis unavailable → in-memory PubSub fallback so dev boot never blocks.
3. Fix everything that breaks while walking: sign-up → onboarding (all steps) → dashboard → goals CRUD → tasks CRUD → day/week/month/today views.

### Phase 3 — Core value loop: plan generation (exit: generate → review → accept → tasks appear on calendar, on all 3 tiers, with and without AI keys)
1. Verify/complete `plans.service.ts` + 3 strategies; graceful fallback chain (claude → gpt → rule-based) on missing keys/errors.
2. Implement quality-score calculator (the four 25-pt metrics + per-metric reasoning) — it's displayed all over the review UI.
3. Buffer time, chronotype, work-hours respected by rule-based planner (it's the always-available default; it must be genuinely good).
4. Tier enforcement in one place: plans/week caps, model selection by tier, limit-exceeded → typed GraphQL error → upgrade modal on frontend.

### Phase 4 — Money & retention features (exit: Stripe test-mode checkout→webhook→tier change works; calendar sync demo-able; notifications real)
1. Billing end-to-end in Stripe test mode: checkout, portal, cancel, resume, webhook → user.tier update, usage endpoint.
2. Google Calendar: connect (OAuth), import busy slots into planning, push accepted plan tasks as events, disconnect. Bidirectional-lite is enough to sell; document the limit honestly.
3. Notifications: replace mock context with GraphQL queries against productivity notifications endpoints; in-app only (no push) — remove push UI toggles that do nothing.
4. Analytics page: wire charts to `/metrics`; hide any chart whose data source doesn't exist (no fake data in a sellable product).
5. Feature-flag OFF anything not finishable (teams, scheduling links, API keys, non-Google integrations): hide nav entries behind `ENABLE_*` flags rather than showing broken pages. **A smaller app that fully works sells; a bigger app with dead buttons doesn't.**

### Phase 5 — UX completeness pass (exit: click-through of every route/button/modal in the app finds zero dead ends)
1. Command palette (⌘K): implement search across tasks/goals + quick actions, or remove the affordance.
2. Empty states with CTAs for dashboard/goals/tasks/plans; error boundaries on all routes; loading skeletons consistent.
3. Task detail modal: subtasks, dependencies, timer, reschedule all functional (backend exists — wire and verify).
4. Bulk actions, filters (client-side is fine at this scale), drag-and-drop persistence on day/week calendars.
5. Settings page: every toggle persists via `PUT /users/me/preferences`; remove toggles with no backing field.
6. Mobile responsive pass on all core routes.

### Phase 6 — Sellable hardening (exit: fresh-clone → README steps → running app in <15 min; CI green)
1. `pnpm test` green (fix/prune broken suites); add integration tests for the 5 golden flows (auth, goal, task, plan, billing).
2. Rate limiting, helmet, input validation verified; no secrets in repo (rotate the test keys currently in `.env`, gitignore it, ship `.env.example` accurate to every consumed var).
3. README rewrite for a buyer: setup, architecture diagram, env vars table, deploy guides consolidated (one doc, delete the 8 overlapping ones into `docs/archive/`).
4. Seed/demo script + screenshots. GitHub Actions: install→build→test→audit-scripts.
5. Branch cleanup; squash-merge to the canonical branch; tag `v1.0.0`.

### Phase 7 — Deferred (documented for the buyer, NOT for now)
Native mobile apps, offline mode/PWA, template marketplace UI, Todoist/Linear/Outlook integrations, teams, scheduling links, referrals, AI memory. All have DB models and partial backends; listed in `docs/ROADMAP_FOR_BUYER.md` as expansion opportunities.

---

## 4. Verification strategy (applies to every phase)
- After each fix batch: typecheck the touched app, boot it, exercise the specific flow via GraphQL request or browser.
- The two audit scripts are the regression net for the contract seams — run them before every commit.
- Golden-flow checklist lives in Phase 2/3 exit criteria; walk it fully before declaring any phase done.

## 5. Progress Tracker (updated 2026-07-05)
| Phase | Status | Notes |
|---|---|---|
| 0 Baseline builds | ✅ DONE | all 3 apps typecheck + production-build; Prisma types now re-exported (manual copies deleted) |
| 1 Contract fixes | ✅ DONE | `audit-contracts.mjs`: 0/158 unmatched (was 60). `audit-operations.mjs`: 0/101 invalid (was 32 + schema itself was invalid SDL). JWKS verification + graphql-ws server added. Fixed `req.user.userId`→`id` (60 usages), route-shadowing bugs (plans/integrations), Stripe webhook made @Public |
| 2 Boot & core flows | ✅ DONE (API level) | docker-compose fixed (planning-service ghost dep removed; graphql-gateway service added); DATABASE_URL → local docker PG; verified with real Clerk JWT: me→goal→task→complete→dashboardStats→generatePlan(rule-based, q=80)→accept→**tasks materialize**→calendar/tasks views. Fixed: analytics locale-string date filter + Promise streaks, `me` override, taskByPlanLoader stub, Plan.goals loader, accept() materialization, DRAFT plan tasks from planJson. Web serves (landing/sign-in/dashboard) |
| 3 Plan generation | ✅ DONE | rule-based E2E (quality 80) + accept→materialize verified. Tier limits enforced live (FREE 6th plan + 3rd goal blocked, FORBIDDEN + human message via new datasource error interceptor). LLM fallback chain verified live: STARTER gpt→rule-based, PRO claude→gpt→rule-based; limits unified in billing.constants (middleware had a divergent copy). NOTE: OpenAI/Anthropic keys in .env.local are expired — with valid keys the LLM paths run; without them fallback labels the plan honestly |
| 4 Money & retention | ✅ DONE (Stripe walk verified live) | Real Stripe test mode: checkout session, paid $7 subscription, reconciliation discovered it → STARTER/ACTIVE, period-end cancel keeps access (C-1), resume, billing info (period end + visa •4242), $3 partial refund + cumulative cap, immediate cancel → FREE. Dunning (anchored grace, suspend after 3), webhook dedup + tier-from-price, lifecycle emails, admin refund/reconcile (ADMIN_EMAILS). PRO planner verified with real Claude (quality 76). Root cause fixed: packages/database/.env was shadowing all real keys |
| 5 UX completeness | CODE-COMPLETE (browser-verify pending) | QA in **[docs/PHASE5_BROWSER_QA.md](PHASE5_BROWSER_QA.md)** (P0:3 / P1:9 / P2:9 / P3:6). **Fix pass done 2026-07-06:** all P0 (null-guard `task.goal`, Sign Out, `/home` public) + all P1 (pub/sub safe facade in gateway `index.ts`, `useTaskDetailActions()` wired into all 5 task pages, week-DnD drag-ghost fix, `refetchQueries:['GetTasks']` on all task mutations, settings↔schema alignment, plan-gen redirect off resolved mutation, goal pause→dedicated REST endpoints, keyboard shortcuts registered) + all P2 code items (manifest excluded, ⌘K real recents, calendar "Coming soon", support mailto/`/help`, marketing mobile menu, mobile sidebar overlay, honest stats, Stripe `locale:'en'`, day/month click-only) + all P3 (Apollo `devtools.enabled`, per-page titles, dialog a11y, overflow guard). Also added `/goals/[id]` detail route. **Tier A/B green** (web+api+gateway `tsc` 0, `next build` 42 routes, both audits 0-mismatch). **Owner-only remainder:** prod Clerk keys, Render `REDIS_URL`, DNS — see `docs/PHASE5_DEPLOY_CHECKLIST.md`. **Tier C/D (runtime browser CRUD verify) still owner-gated** — flip to DONE after the 7-item checklist in the QA doc passes in a real signed-in browser. |
| 6 Hardening | PARTIAL | docs/BUYER_GUIDE.md written; stale root docs archived to docs/archive; .env.example updated (ADMIN_EMAILS, CLERK_DOMAIN, price IDs, ANTHROPIC_PLANNER_MODEL, APP_URL); secrets confirmed untracked. REMAINING: test suite, browser click-through, branch cleanup + v1.0.0 tag, key rotation before sale |

### How to run (verified working today)
```
docker compose up -d postgres redis
cd packages/database && pnpm prisma db push
cd apps/api-gateway && pnpm exec nest build && node dist/main.js   # :3001
cd apps/graphql-gateway && npx tsx src/index.ts                     # :4000 (dev) / pnpm build && node dist
cd apps/web && npx next dev -p 3000                                 # :3000
node scripts/audit-contracts.mjs && node scripts/audit-operations.mjs  # regression net
```
