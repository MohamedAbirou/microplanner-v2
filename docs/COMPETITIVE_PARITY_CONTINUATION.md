# MicroPlanner — Competitive Parity Continuation (Session 2)

**Paste everything below the `---` line into a NEW Cursor Agent chat with Opus.**  
Continues `docs/COMPETITIVE_PARITY_PROMPT.md`. Do NOT restart from Phase 1.

---

You are continuing the **competitive parity** implementation for MicroPlanner. Prior session completed **Phases 1.1–2.7** but left **2.5 plan-day DnD timeboxing incomplete** (shipped time inputs instead). **2.8 Slack** is also partial. All work is committed at **`8ae778c`** (user has pushed). Your job: **finish 2.5-FINISH**, then **2.8**, then **Phase 3 (3.1–3.6)** in order.

## Read first (skim only)

- `docs/COMPETITIVE_PARITY_GAPS.md` — gap analysis
- `docs/COMPETITIVE_PARITY_PROMPT.md` — full spec (items 1.1–2.7 are DONE)
- `docs/PRODUCTION_READINESS.md` — query bounds, rate limits, depth limit
- `apps/graphql-gateway/src/datasources/dataloaders.ts` — existing batch loaders
- `apps/web/src/graphql/operations.ts` — query variants (`GetTasksList`, `GetGoalsList`, etc.)
- `apps/web/src/hooks/use-graphql.tsx` — hooks + mutation refetch policy

## Performance architecture (MANDATORY — do not regress)

A prior session fixed systemic slowness: skeleton loaders lasting forever, Network tab flooded with GraphQL requests, 30–80+ REST calls behind a single page load. **Every file you touch must stay compatible with this architecture.**

### Why the app was slow

The GraphQL gateway is **not** a native GraphQL data layer — it **proxies REST**. Each nested field on a list (`task.dependencies`, `task.subtasks`, `plan.tasks`, `goal.project`) triggers separate REST calls unless explicitly batched:

```
Web → 1 GraphQL request
  → Gateway resolves N list items × M nested fields
  → N×M REST calls (N+1 storm)
  → User sees one "graphql" line in DevTools but 50+ backend round-trips
```

**Rule:** Never add nested relationship arrays to list/browse queries without a batch endpoint + DataLoader first.

### Already shipped — read before changing

**API (`apps/api-gateway`)**
- Task list bounded: `dateRange` clamped to 400 days, `take` max 500 (`QueryTasksDto`)
- Batch endpoints (gateway must use these):
  - `POST /tasks/advanced/dependencies/batch`
  - `POST /tasks/advanced/subtasks/batch`
  - `POST /tasks/batch/by-plan`
  - `POST /goals/batch`
  - `POST /tasks/advanced/projects/batch`

**Gateway (`apps/graphql-gateway`)**
- Per-request DataLoaders in `datasources/dataloaders.ts`: `taskLoader`, `goalLoader`, `projectLoader`, `taskByPlanLoader`, `taskDependencyLoader`, `subtaskLoader`, `userLoader`
- Batch calls wired in `datasources/rest-api.ts`
- Plan resolver uses DB `totalTasks`/`completedTasks` + `planJson` goals — not full `plan.tasks` on list views
- Task schema: `dependencyCount`, `blockedByCount`, `subtaskCount` for list badges (no arrays)
- Depth limit `depthLimit(8)` in `validation/depth-limit.ts`

**Web (`apps/web`)**
- **Query splitting** (`graphql/operations.ts`):
  - `GetTasks` — full deps/subtasks — **detail views only**
  - `GetTasksList` — Dashboard, Today, Tasks, Calendar, Search (no nested arrays)
  - `GetTasksAnalytics` — analytics page only
  - `GetGoalsList` / `GetPlansSummary` — layout, pickers, list pages
- **Hooks:** `useTasksList`, `useGoalsList`, `usePlansSummary` on main browse pages; layout uses `useGoalsList()` once — pages must **not** also call `useGoals()`
- **Apollo** (`lib/apollo/client.ts`): default `cache-first`; `tasks` cache `keyArgs` includes `filter`, `sort`, `take`, `skip`
- **Loading UX:** `initialQueryLoading()` in `lib/graphql-loading.ts` — skeleton only when `data === undefined` (stale-while-revalidate on revisit); `components/ui/page-loader.tsx` + `app/(app)/loading.tsx` for route transitions
- **Mutations:** `refetchQueries: 'active'` — NOT `['GetTasks', 'GetTasksList', 'GetTasksAnalytics']` and NOT `[...TASK_QUERY_NAMES]` (that triples network on every action)
- **Never** `cache-and-network` on layout-level or navigation hooks (causes refetch storm + Render rate limits)

### Rules for YOUR work (2.5, 2.8, Phase 3)

1. **List query needs related data?** Add batch REST endpoint + DataLoader, OR use scalar count fields — never nested arrays on lists.
2. **New page?** Use the correct query variant (table below). Lazy-fetch detail (`GET_TASK`, `GET_TASK_WITH_DEPENDENCIES`) only when modal opens.
3. **Every task fetch:** `dateRange + take` always. Example: `useTasksList({ dateRange: { start, end } }, undefined, { take: 80 })`.
4. **Single-entity mutations** (update, complete, DnD drag): optimistic cache / mutation response fields; `refetchQueries: 'active'` only when cache can't be patched. **No** named multi-query refetch lists.
5. **New `@FieldResolver` on a list type:** must use DataLoader from context; register per-request in `index.ts`.
6. **Before adding `useQuery` on a page:** check `(app)/layout.tsx` (goals, tier, onboarding) and command palette — avoid duplicate fetches; use `skipQuery: !panelOpen` for lazy panels.
7. **New hooks:** `fetchPolicy: 'cache-first'`, return `loading: initialQueryLoading(loading, data)`.

| Screen | Hook / query |
|--------|----------------|
| List / calendar / dashboard / search | `useTasksList` + bounded `dateRange` + `take` |
| Task detail (deps/subtasks editing) | `GET_TASK` / `GET_TASK_WITH_DEPENDENCIES` on open |
| Goal picker / sidebar / command palette | `useGoalsList` |
| Plans list | `usePlansSummary` |
| Analytics | `useTasksAnalytics` + `take: 500` max |

### Performance by continuation item

| Item | Requirement |
|------|-------------|
| **1.4-FINISH** webhooks | Debounce 10–30s/user; handler returns 200 fast, work async; no client full-list refetch |
| **2.5-FINISH** plan-day DnD | `useTasksList` for today only; optimistic `useUpdateTask` like `week-calendar-dnd.tsx` |
| **2.5b** daily ritual | `useDailyRitual` + `cache-first`; backend primary, localStorage offline cache only |
| **2.8** Slack digest | Today's tasks only (`scheduledDate` + `take: 50`), not full history |
| **3.1** time tracking | Paginated entry list; date-bounded CSV; no unbounded task load for reports |
| **3.4** activity feed | Cursor pagination (`take: 30`); no unbounded team events query |
| **3.6** AIMemory | Fetch memories once per plan generation, not per task in a loop |

### Red flags — fix before moving on

- [ ] List page uses `GET_TASKS` with `dependencies` / `subtasks` arrays
- [ ] Page calls `useGoals()` when layout already has `useGoalsList()`
- [ ] Mutation uses `refetchQueries: [...TASK_QUERY_NAMES]` or multiple named queries
- [ ] Hook uses `cache-and-network` on a navigation hook
- [ ] Resolver calls REST per row without DataLoader
- [ ] Warm-cache navigation fires 20+ `graphql` requests
- [ ] Skeleton shows 2+ seconds on **second visit** to same page

### Perf sanity check (after each batch)

Logged-in: Dashboard → Today → Tasks. Network tab filtered to `graphql`: **~4–8 ops** on warm cache (not 30+). Complete one task: **≤1** active refetch, not 3 task query variants.

## Project rules

1. Web → GraphQL only, never REST directly.
2. Reuse `use-graphql.tsx` / `use-graphql-extended.tsx` hooks before writing new ones.
3. Bounded task queries: always `dateRange + take` (see Performance architecture).
4. Single-task mutations: **no** `refetchQueries: ['GetTasks']` or `[...TASK_QUERY_NAMES]` — use `refetchQueries: 'active'` or cache updates.
5. **No fake "Connected" states** — OAuth must be real or show "Coming soon".
6. Run `tsc --noEmit` in affected apps + `next build` after each batch.
7. **No commits** unless explicitly asked.
8. **Performance architecture section above is binding** on every file you touch.

## Quality bar — NON-NEGOTIABLE

- **No partial implementations.** If a task is listed as done, every acceptance criterion must pass. If something was shipped as a shortcut (form inputs instead of DnD, stub service not registered, UI without backend send, OAuth with no-op sync, etc.), you **must finish it** before moving on.
- **No misleading UX.** If a feature only stores a token or timestamps a row, the UI must NOT behave like full sync (Zoom/GitHub today). Either implement real behavior or show honest status / remove the card.
- **Professional polish:** match Sunsama/Motion/Reclaim UX — loading, empty, error states, optimistic updates, accessibility.
- **When stuck:** use extended thinking. Read existing code and reuse patterns — do not ship a lesser alternative because it is faster.
- **Verify end-to-end:** every feature must work in the browser flow, not just compile.

---

## 🔍 SHORTCUT AUDIT — verify & fix (mandatory pass)

Prior session claimed 1.1–2.7 "done". Code review shows **most backend work is real**, but several items are shortcuts or unwired. **Before Phase 3**, audit each row. If FAIL → fix before proceeding.

| Item | Verdict | Evidence / what to fix |
|------|---------|----------------------|
| **1.1 OAuth UI** | ✅ Likely OK | `initiateIntegrationOAuth` + hub redirect; Zapier removed |
| **1.2 PM sync (Todoist/Linear/Notion)** | ✅ Real | Full providers in `integrations/providers/` with fetch/complete/webhooks |
| **1.9 Jira + Asana** | ✅ Real | `jira.provider.ts`, `asana.provider.ts` |
| **1.3 Outlook** | ✅ Real | `outlook-calendar.provider.ts`, Graph API |
| **1.4 Autopilot** | ❌ **FAIL — upgrade required** | Day reschedule logic is real (`autopilot.service.ts`) but **calendar watch is a 5-min poll** (`calendar-watch.service.ts`) — **not acceptable**. Must use **Google `events.watch` push channels** + **Microsoft Graph subscriptions** with webhooks. Poll may remain **fallback only** if push setup fails. |
| **1.5 Slot finder + busy** | ✅ Verify | `tasks.service.ts` — confirm calendar events in busy intervals |
| **1.6 Focus → calendar** | ✅ Real | `focus-calendar-sync.service.ts` registered in `productivity.module.ts` |
| **1.7 Calendar defense** | ✅ Real | `calendar-defense.executor.ts` registered + cron |
| **1.8 Push pipeline** | ⚠️ Deploy-dependent | `push-notification.service.ts` is real; **requires VAPID env** — add health check in UI; verify scheduler fires |
| **2.1 Habits** | ✅ Real | `habit.service.ts` places habits on calendar |
| **2.2 Smart 1:1** | ✅ Verify | `useScheduleSmart1on1` on productivity page — test sends invite |
| **2.3 PM import ritual** | ✅ Real | `pm-import-section.tsx` |
| **2.4 Team depth** | ✅ Mostly real | Invite email, accept page, `getTeamDashboard` — **not** full activity feed (that's 3.4) |
| **2.5 UX polish** | ❌ **FAIL** | Plan-day DnD missing — see **2.5-FINISH** |
| **2.5 Daily ritual storage** | ⚠️ Shortcut | `plan-day/page.tsx` still writes **localStorage** + backend — make **backend primary**, localStorage offline cache only |
| **2.6 Production** | ✅ Mostly | Redis throttler in `app.module.ts`, k6 CI workflow, request-id in graphql `index.ts` — **DB index migration still needs prod deploy** (ops, not code) |
| **2.7 Realtime subs** | ✅ Real | `realtime-sync.tsx` in layout |
| **2.8 Slack** | ❌ **FAIL** | `slack.service.ts` exists but **NOT in `integrations.module.ts`**, no HTTP route — see below |
| **Zoom + GitHub hub cards** | ❌ **Misleading** | OAuth works but `syncIntegration()` for non-PM is **timestamp-only** (`integrations.service.ts` ~494). User sees "Sync" with no real import. **Fix:** implement minimal sync OR honest badge "OAuth only — feature pending" OR remove cards until implemented |
| **3.1 Time depth** | ❌ Not started | Manual log only in task-detail; no entry history edit/delete, no CSV |
| **3.4 Activity feed** | ❌ Not started | Team dashboard stats exist; no chronological activity feed |
| **3.5 Referral billing** | ❌ Not started | `referral-panel.tsx` UI only |

**Rule:** Any row marked ❌ or ⚠️ Shortcut must be resolved in this session (or explicitly documented as deploy-only) before you call the competitive parity work "complete".

---

## ⚠️ 1.4-FINISH — Calendar push watch (NOT poll)

**Why this is a FAIL:** Motion/Reclaim react to calendar changes in near-real-time via provider push notifications. Current `calendar-watch.service.ts` runs a **5-minute cron** that hashes events — up to 5 min latency, wastes API calls, and is explicitly documented as a "lightweight alternative." **Replace with professional push architecture.**

### Required architecture

```
Calendar change (Google/Outlook)
  → Provider webhook POST to api-gateway (public HTTPS)
  → Verify token/signature
  → Debounce 10–30s per user
  → AutopilotService.rescheduleDay(userId, today, 'calendar_change')
  → Push notification (if enabled) summarizing moves
```

### Google Calendar — `events.watch`

**Files to create/modify:**
- `apps/api-gateway/src/modules/calendar/services/google-calendar.provider.ts` — add `watchEvents()`, `stopWatch()`
- `apps/api-gateway/src/modules/calendar/calendar-watch-channel.service.ts` (new)
- `apps/api-gateway/src/modules/calendar/calendar.controller.ts` — `POST /calendar/webhooks/google` (public)
- `packages/database/prisma/schema.prisma` — extend `CalendarToken` with watch fields

**Prisma fields (migration required):**
```prisma
watchChannelId    String?   // Google channel ID
watchResourceId   String?   // Google resource ID
watchExpiration   DateTime? // Channel expires (~7 days max)
watchSyncToken    String?   // Optional incremental sync
```

**On calendar connect / autopilot enable:**
1. Call `calendar.events.watch` on `primary` with `address: ${APP_URL}/api/v1/calendar/webhooks/google`
2. Store `id`, `resourceId`, `expiration` on `CalendarToken`
3. Set `type: web_hook`, `token` = signed user secret for verification

**Webhook handler:**
1. Receive `X-Goog-Channel-ID`, `X-Goog-Resource-ID`, `X-Goog-Resource-State` (`sync` | `exists` | `not_exists`)
2. Ignore `sync` (initial handshake)
3. On `exists` / `not_exists`: lookup user by channel → trigger autopilot (debounced)
4. Return 200 quickly; do heavy work async

**Renewal cron (daily):**
- Channels expire — renew any channel expiring within 24h
- On 404 from Google, recreate watch

### Microsoft Outlook — Graph subscriptions

**Files:**
- `outlook-calendar.provider.ts` — add `createSubscription()`, `renewSubscription()`, `deleteSubscription()`
- `calendar.controller.ts` — `POST /calendar/webhooks/outlook` (public, validates `clientState`)

**On connect:**
1. `POST /subscriptions` on Graph for `/me/events` with `changeType: created,updated,deleted`
2. `notificationUrl: ${APP_URL}/api/v1/calendar/webhooks/outlook`
3. `expirationDateTime` max ~3 days — store on `CalendarToken` (reuse watch fields or add `graphSubscriptionId`)

**Renewal cron:** PATCH subscription before expiry.

### Refactor `calendar-watch.service.ts`

- **Remove** 5-minute poll as primary path (delete cron OR gate behind `CALENDAR_WATCH_FALLBACK_POLL=true` env for dev only)
- **Delegate** to `CalendarWatchChannelService` for push setup/teardown
- On `autopilotEnabled` toggle ON → register watches for all connected providers
- On disconnect / autopilot OFF → stop channels

### Env / deploy

Add to `.env.example`:
```
APP_URL=https://api.yourdomain.com   # must be public HTTPS for webhooks
GOOGLE_CALENDAR_WEBHOOK_TOKEN=       # optional shared secret in watch token field
```

Document in `PRODUCTION_READINESS.md`: Google/Outlook webhooks require **public api-gateway URL** (not localhost). For local dev, use ngrok or fallback poll flag.

### Acceptance criteria

- [ ] New meeting on Google Calendar triggers autopilot within **30 seconds** (not 5 minutes)
- [ ] Outlook calendar change triggers same flow
- [ ] Watch channels auto-renew before expiry
- [ ] Disconnecting calendar stops watch (no orphaned channels)
- [ ] Webhook endpoints validate authenticity (Google headers / Graph clientState)
- [ ] 5-min poll removed from production path (fallback env only)
- [ ] `tsc` + `nest build` pass

**This is P0 quality — same tier as Motion. Do not ship poll as the production solution.**

---

## ✅ COMPLETED — do not redo (commit `8ae778c`)

### Phase 1 — P0 Table Stakes (9/9 done)

| # | Item | What shipped |
|---|------|-------------|
| 1.1 | Fix integration OAuth UI | `initiateIntegrationOAuth` GraphQL + redirect flow; `integrations-hub.tsx` uses OAuth; deleted duplicate `components/integrations/calendar-sync-card.tsx`; `integration-settings-dialog.tsx` for PM config |
| 1.2 | Todoist + Linear + Notion sync | Provider pattern in `integrations/providers/` (todoist, linear, notion, jira, asana); bi-directional sync; `externalId`/`externalSource` on Task; migration `20260708000000_task_pm_sync_fields` |
| 1.3 | Outlook calendar | `outlook-oauth.service.ts`, `outlook-calendar.provider.ts`, `google-calendar.provider.ts`, `calendar-provider.interface.ts`; Outlook option in `calendar-sync-card.tsx` |
| 1.4 | Day autopilot | `modules/autopilot/` (service, calendar-watch, day-reschedule job); GraphQL `autopilot.graphql` + resolver; `autopilot-settings.tsx`, `autopilot-panel.tsx`; migration `20260708010000_autopilot` |
| 1.5 | Slot finder + calendar busy | `tasks.service.ts` `suggestReschedule()` includes calendar events |
| 1.6 | Focus block → calendar | `focus-calendar-sync.service.ts`; migration `20260708020000_focus_calendar_sync` |
| 1.7 | Calendar defense executor | `calendar-defense.executor.ts`; defense log migration `20260708030000_calendar_defense_log` |
| 1.8 | Push send pipeline | `modules/notifications/` (push-notification.service, push.scheduler); `web-push` package; VAPID vars in `.env.example`; `push-notifications-toggle.tsx` updated |
| 1.9 | Jira + Asana | `jira.provider.ts`, `asana.provider.ts` in providers/ |

### Phase 2 — P1 Retention (7/8 done, 1 partial)

| # | Item | What shipped |
|---|------|-------------|
| 2.1 | Habits | `habit.service.ts`; Habits tab on `/productivity`; migration `20260708040000_habits` |
| 2.2 | Smart 1:1 scheduler | Enhanced `/productivity` page with Smart 1:1 scheduling |
| 2.3 | PM import in plan-day | `components/plan-day/pm-import-section.tsx` wired into `plan-day/page.tsx` |
| 2.4 | Team depth | Team invite emails via Resend in `premium.service.ts`; `/teams/accept/[token]/page.tsx`; shared goals (`goal.teamId` migration `20260708050000_goal_team`); teams `[id]` page enhanced |
| 2.5 | UX polish batch | **PARTIAL — see 2.5-FINISH below.** Done: daily ritual backend, morning banner, workload on generate, manual time log, Apollo 5xx toasts. **NOT done:** plan-day DnD timeboxing (spec required DnD; shipped `<input type="time">` list instead) |
| 2.6 | Production hardening | `redis-throttler.storage.ts`; `request-logger.middleware.ts`; `.github/workflows/k6-smoke.yml`; expanded `load-tests/k6-smoke.js`; `PRODUCTION_READINESS.md` updated. **Note:** DB index migration from earlier pass still needs prod deploy |
| 2.7 | Real-time subscriptions | `components/realtime/realtime-sync.tsx` mounted in `app/(app)/layout.tsx`; TASK_UPDATED + GOAL_UPDATED subscriptions |
| 2.8 | Slack integration | **PARTIAL — finish this first** |

### Also committed earlier (do not redo)

- `75e750c` — CSP fix for `*.clerk.accounts.dev` (Clerk login)
- `b69eef5` — First competitive gap batch (billing, calendar UI, productivity, teams, PWA shell, etc.)

---

## ⚠️ 2.5-FINISH — Plan-day DnD timeboxing (INCOMPLETE — do FIRST)

**Why this is partial:** `docs/COMPETITIVE_PARITY_PROMPT.md` §2.5 item 1 explicitly required:

> Plan-day: DnD timeboxing step (reuse week calendar DnD patterns)

Opus shipped Step 2 ("Prioritize & timebox") as a **flat list** with `<input type="time">` and priority buttons (`plan-day/page.tsx` lines 345–431). That is **not** Sunsama-style timeboxing and does **not** reuse the existing DnD calendar infrastructure.

**What exists to reuse (do not reinvent):**
- `apps/web/src/components/calendar/week-calendar-dnd.tsx` — `@hello-pangea/dnd`, slot-based drop, optimistic updates
- `apps/web/src/lib/calendar-utils.ts` — `CALENDAR_HOURS`, `CALENDAR_SLOT_HEIGHT_PX`, `timeToMinutes`, `getTaskHeightPx`
- `apps/web/src/components/calendar/calendar-task-block.tsx` — task block rendering

### Required implementation

Replace (or augment) Step 2 with a **single-day timeboxing view**:

1. **Unscheduled sidebar** — today's tasks with no `startTime` (or all tasks draggable from a pool)
2. **Day timeline** — one column for today (work hours from user productivity settings if available, else 7am–7pm), same slot height as week view
3. **Drag tasks onto slots** — dropping on `hour-H` slot sets `startTime` + `endTime` from drop position (reuse `WeekCalendarDnd` drop handler logic)
4. **Drag within timeline** — reschedule by dragging blocks vertically
5. **Resize duration** — optional but preferred: drag bottom edge or preset duration chips (30/60/90 min)
6. **Show conflicts** — overlapping blocks visually stacked/warned (reuse `organizeCalendarTasks`)
7. **Priority** — keep High/Med/Low toggles on blocks or sidebar items
8. **Persist via `useUpdateTask`** — optimistic UI like week calendar; `refetchQueries: 'active'` only — never `['GetTasks']` or `[...TASK_QUERY_NAMES]` storm
9. **Confirm step** — Step 3 should show the **timeline preview**, not just task count
10. **Mobile** — timeline scrollable; sidebar collapses to top "unscheduled" strip

**Suggested approach:** Extract a shared `DayTimelineDnd` component from `week-calendar-dnd.tsx` (single day mode) OR embed a narrowed `WeekCalendarDnd` locked to today only. New file: `apps/web/src/components/plan-day/day-timebox-calendar.tsx`. Load tasks via **`useTasksList`** with today's `dateRange` + `take` — not `useTasks` / `GET_TASKS`.

### Acceptance criteria

- [ ] User drags an unscheduled task onto 10:00 slot → task gets `startTime: "10:00"` and correct `endTime`
- [ ] User drags a scheduled block to 14:00 → updates without page reload
- [ ] Overlapping tasks show visual conflict indicator
- [ ] No `<input type="time">` as the primary timeboxing UX (may remain as secondary fine-tune on block click)
- [ ] Matches week calendar visual language (blocks, colors, slot grid)
- [ ] `tsc` + `next build` pass

### 2.5b Daily ritual — backend-primary (no localStorage shortcut)

**File:** `apps/web/src/app/(app)/plan-day/page.tsx`, `apps/web/src/lib/daily-ritual.ts`

- Load intention/reflection from `useDailyRitual` GraphQL on mount (already partially done).
- **Remove** `setDailyIntention` / `getDailyIntention` localStorage as source of truth; use backend only, with localStorage as offline fallback cache if PWA offline.
- Today page morning banner must read `ritual.planCompleted` from API, not localStorage.

---

## ⚠️ 2.8 Slack — partial, must finish

**Built but NOT wired end-to-end:**

| Piece | Status | File |
|-------|--------|------|
| `SlackService` (digest cron + slash handler + signature verify) | ✅ Code exists | `apps/api-gateway/src/modules/integrations/slack.service.ts` |
| Slack OAuth in integrations.service | ✅ | `getSlackOAuthUrl`, `exchangeSlackCode` |
| `SlackService` registered in module | ❌ | `integrations.module.ts` only has `IntegrationsService` |
| Slash command HTTP endpoint | ❌ | No route in `integrations.controller.ts` |
| Raw body middleware for signature verify | ❌ | Needed for Slack signing |
| `SLACK_SIGNING_SECRET` in `.env.example` | ❌ | Missing (only CLIENT_ID/SECRET exist) |
| Store `workspaceId` + `channelId` on OAuth callback | ❓ | Verify callback persists these in integration.config |
| UI: Slack channel picker in settings | ❌ | `integration-settings-dialog.tsx` is PM-only (TODOIST/LINEAR/etc.) |
| GraphQL: update Slack config (channel) | ❓ | May need mutation or extend `updateIntegration` |
| Test digest button | ❌ | Optional but useful |

### 2.8 tasks (complete in this order)

1. Register `SlackService` in `integrations.module.ts` providers
2. Add public `POST /api/v1/integrations/slack/commands` endpoint:
   - Raw body parsing for signature verification
   - Call `slackService.verifySignature()` then `handleSlashCommand()`
   - Return Slack-compatible JSON response
3. On Slack OAuth callback: persist `workspaceId` (team.id), `botToken` in encrypted credentials, default channel if possible
4. Add `SLACK_SIGNING_SECRET` to `.env.example` + document Slack app setup (slash command URL, OAuth scopes)
5. Extend `integration-settings-dialog.tsx` OR add Slack-specific settings: channel picker (list channels via Slack API)
6. Wire digest: ensure cron runs (SlackService must be instantiated — registering in module fixes this)
7. Add "Send test digest" button in integrations hub for connected Slack
8. Verify `/microplanner today` slash command end-to-end

**Acceptance:** OAuth connect Slack → pick channel → test digest posts → slash command returns today's tasks.

### 2.8c Zoom + GitHub honesty (or implement)

**Files:** `integrations-hub.tsx`, `integrations.service.ts`

Zoom/GitHub have OAuth but sync is **timestamp-only** — misleading if users click Sync expecting imports.

Either:
- **A)** Implement minimal real value (GitHub: import assigned issues; Zoom: meeting links on events), OR
- **B)** Remove from hub until implemented, OR
- **C)** Connected state with honest copy + **hide Sync button** until real sync exists.

---

## 🔜 REMAINING — Phase 3 (after 2.8)

### 3.1 Time tracking depth (4 days)

**Partial today:** Analytics has "Time" tab; `useLogTime` wired in task-detail-modal.

**Still needed:**
- Time entry history list per task (view/edit/delete entries)
- Dedicated time report with date range + **CSV export**
- Project-level time rollup on `/projects/[id]`
- GraphQL proxy for time stats if any REST endpoints missing

**Files:** `task-detail-modal.tsx`, `analytics/page.tsx`, `projects/[id]/page.tsx`, `operations-extended.ts`

---

### 3.2 PWA depth (3 days)

**Partial today:** `sw.js`, offline queue, `pwa-provider.tsx`, `offline.html`.

**Still needed:**
- `beforeinstallprompt` → install banner component (none exists yet)
- PNG icons 192×192, 512×512 in `manifest.json` (currently SVG-only)
- `apollo3-cache-persist` for offline Today reads
- Manifest `screenshots` for install UX

**Files:** `apps/web/public/manifest.json`, new `components/pwa/install-prompt.tsx`, `apollo/client.ts`

---

### 3.3 Guided weekly planning ritual (3 days)

**Partial today:** Analytics has weekly review modal.

**Still needed:**
- Step-by-step wizard: review last week → set intentions → generate plan → accept
- Entry from analytics weekly review → launch ritual flow
- Not the same as daily plan-day — this is **weekly**

**New:** Consider `apps/web/src/app/(app)/plan-week/page.tsx` or modal wizard

---

### 3.4 Team activity feed (4 days)

**Still needed:**
- Activity feed on team dashboard: completions, plan accepts, member joins
- Backend: query recent team-scoped events or new `TeamActivity` model
- UI on `teams/[id]/page.tsx`

---

### 3.5 Referral rewards billing tie-in (3 days)

**Partial today:** `referral-panel.tsx` in settings; `referrals/` backend module from earlier commit.

**Still needed:**
- On successful referral + friend subscribes: Stripe coupon or 1-month tier credit for referrer
- Wire `referrals.service.ts` → `billing.service.ts`
- Show reward status in referral panel

---

### 3.6 AIMemory deeper planner integration (3 days)

**Partial today:** `ai-memory/` module exists; Claude planner has comment about AIMemory at line ~243.

**Still needed:**
- Auto-create AIMemory on user reschedule override (autopilot manual dismiss, smart reschedule)
- Feed memories into all planner strategies (not just Claude)
- Settings: `ai-memory-manager.tsx` — verify view/delete works end-to-end
- GraphQL ops + hooks if missing

---

## Key files reference

```
Slack (finish 2.8):
  apps/api-gateway/src/modules/integrations/slack.service.ts
  apps/api-gateway/src/modules/integrations/integrations.module.ts  ← register service
  apps/api-gateway/src/modules/integrations/integrations.controller.ts  ← add endpoint
  apps/web/src/components/integrations/integrations-hub.tsx
  apps/web/src/components/integrations/integration-settings-dialog.tsx

Phase 3:
  apps/web/src/components/settings/referral-panel.tsx
  apps/web/src/components/settings/ai-memory-manager.tsx
  apps/api-gateway/src/modules/referrals/referrals.service.ts
  apps/api-gateway/src/modules/ai-memory/ai-memory.service.ts
  apps/api-gateway/src/modules/plans/strategies/claude-sonnet-planner.service.ts

DB migrations (already committed — run on prod):
  packages/database/prisma/migrations/20260708000000_task_pm_sync_fields/
  packages/database/prisma/migrations/20260708010000_autopilot/
  packages/database/prisma/migrations/20260708020000_focus_calendar_sync/
  packages/database/prisma/migrations/20260708030000_calendar_defense_log/
  packages/database/prisma/migrations/20260708040000_habits/
  packages/database/prisma/migrations/20260708050000_goal_team/
  packages/database/prisma/migrations/20260708060000_daily_ritual/
  packages/database/prisma/migrations/20260707000000_task_hotpath_indexes/  ← earlier, still undeployed
```

---

## Env vars to know about

Already in `.env.example` from prior work:
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` (add `SLACK_SIGNING_SECRET` in 2.8)
- `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`
- Todoist/Linear/Notion/Jira/Asana OAuth vars (check `.env.example`)

---

## Verification checklist

```bash
cd apps/api-gateway && npx tsc --noEmit && npm run build
cd apps/graphql-gateway && npx tsc --noEmit
cd apps/web && npx tsc --noEmit && npm run build
```

### Regression — do not break
- [ ] Clerk login (CSP allows `*.clerk.accounts.dev`)
- [ ] Google + Outlook calendar connect
- [ ] PM integration OAuth (Todoist/Linear/Notion)
- [ ] Autopilot toggle + smart reschedule on Today
- [ ] Push subscribe (with VAPID keys set)
- [ ] Team invite email + accept page
- [ ] Real-time task updates across tabs
- [ ] `/productivity` habits + focus + defense tabs
- [ ] **Performance:** warm-cache navigation ≤8 graphql ops/page; no `cache-and-network` on layout hooks; list pages use `GetTasksList` not heavy `GetTasks`

### New in this session
- [ ] Slack OAuth → channel select → digest posts
- [ ] `/microplanner today` slash command works
- [ ] Phase 3 items per acceptance above

---

## Implementation order (strict)

```
SHORTCUT AUDIT (fix all ❌ rows) →
1.4-FINISH (calendar push watch — replace 5-min poll) →
2.5-FINISH (plan-day DnD) → 2.5b (ritual backend-primary) → 2.8 (Slack) → 2.8c (Zoom/GitHub honesty) →
3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
```

Do **not** skip **1.4-FINISH**. Poll-based watch is not production-grade.

Do **not** skip 2.5-FINISH.

---

## Your first action

1. Run `git log -1 --oneline` — confirm you're on `8ae778c` or later.
2. **Read Performance architecture section** + skim `dataloaders.ts`, `operations.ts`, `use-graphql.tsx`.
3. Read `plan-day/page.tsx` Step 2 and `week-calendar-dnd.tsx` — understand the gap.
4. Read the **SHORTCUT AUDIT** table — fix every ❌ row.
5. **Implement 1.4-FINISH: Google + Outlook calendar push webhooks** (replace 5-min poll).
6. **Implement 2.5-FINISH: plan-day DnD timeboxing** (reuse week calendar patterns).
7. **2.5b:** daily ritual backend-primary.
8. **Finish 2.8** Slack + **2.8c** Zoom/GitHub honesty.
9. Continue 3.1 → … → 3.6.
10. After every item: verification checklist + **perf sanity check** (Network tab). **Reject your own work if any acceptance criterion fails.**
11. Do not create new markdown docs unless asked. Do not commit unless asked.

**Begin with SHORTCUT AUDIT review, then 1.4-FINISH (calendar push), then 2.5-FINISH.**
