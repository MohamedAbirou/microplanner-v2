# MicroPlanner — Competitive Parity Implementation Prompt

**Use this prompt with Claude Opus or Sonnet in Agent mode.**  
Copy everything below the `---` line into a **new** Cursor chat.

---

You are closing the **final competitive gaps** between MicroPlanner and Motion, Reclaim, and Sunsama. Native iOS/Android apps are **explicitly out of scope** — web + PWA only.

## Read first

1. `docs/COMPETITIVE_PARITY_GAPS.md` — source of truth for remaining gaps
2. `docs/PRODUCTION_READINESS.md` — query bounds, rate limits (do not break)
3. `docs/GAP_ANALYSIS_2026.md` — what was already shipped in prior sessions

**Prior work is committed** (`b69eef5`). Billing, calendar connect UI, productivity page, teams, scheduling, PWA shell, plan-day ritual, autopilot suggest (manual), and 31 earlier items are DONE. Do not redo them.

## Project rules

1. Web talks **only** to GraphQL — never REST directly.
2. Reuse hooks in `use-graphql.tsx` / `use-graphql-extended.tsx` before writing new ones.
3. Bounded task queries: always `dateRange + take`.
4. No `refetchQueries: ['GetTasks']` on single-task mutations.
5. Match existing UI in `components/ui/`.
6. Run `tsc --noEmit` + `next build` after each phase batch.
7. **No commits** unless explicitly asked.
8. **No fake features** — if OAuth isn't complete, show "Coming soon" not "Connected".
9. Every integration must have real sync logic or be gated/disabled.

---

## PHASE 1 — P0 Table Stakes (do in order)

### 1.1 Fix integration OAuth UI (2 days)

**Problem:** `IntegrationsHub` calls `connectIntegration` without OAuth — users see "Connected" with no real auth.

**Files:**
- `apps/web/src/components/integrations/integrations-hub.tsx`
- `apps/api-gateway/src/modules/integrations/integrations.controller.ts`
- `apps/graphql-gateway/src/datasources/rest-api.ts`
- `apps/graphql-gateway/src/schema/integrations.graphql`

**Tasks:**
1. Add GraphQL `initiateIntegrationOAuth(type: IntegrationType!): OAuthRedirect!` returning `{ url: String! }`
2. Wire REST `GET /integrations/oauth/:type/authorize`
3. Change "Connect" button → redirect to OAuth URL (not `connectIntegration`)
4. Add callback handler route or page to complete OAuth (backend callback already exists)
5. Remove Zapier card OR add `ZAPIER` to `IntegrationType` with real support
6. Delete dead duplicate: `apps/web/src/components/integrations/calendar-sync-card.tsx`
7. Show honest states: `Not connected` | `Connecting…` | `Connected` | `Sync error`

**Acceptance:** Connecting Linear requires OAuth redirect and returns with real token stored.

---

### 1.2 Todoist + Linear + Notion real sync (2 weeks)

**Files:**
- `apps/api-gateway/src/modules/integrations/integrations.service.ts`
- `apps/api-gateway/src/modules/integrations/integrations.types.ts`
- New: `apps/api-gateway/src/modules/integrations/providers/todoist.provider.ts`
- New: `apps/api-gateway/src/modules/integrations/providers/linear.provider.ts`
- New: `apps/api-gateway/src/modules/integrations/providers/notion.provider.ts`

**Per provider implement:**
1. OAuth/token refresh
2. `fetchTasks()` → map external items to MicroPlanner `Task` (with `externalId`, `externalSource` fields — add to schema if missing)
3. `syncToExternal()` — completing MP task marks external item done
4. `handleWebhook()` — inbound create/update (Linear/GitHub especially)
5. Replace stub `syncIntegration()` with real provider dispatch

**UI:**
- Sync button shows: items imported, last sync, errors
- Settings per integration: project/board selector, sync direction (import only / bi-directional)

**Acceptance:** Linear issue → appears as MicroPlanner task; completing in MP → Linear issue closed.

---

### 1.3 Outlook calendar provider (1 week)

**Files:**
- New: `apps/api-gateway/src/modules/calendar/outlook-oauth.service.ts`
- `apps/api-gateway/src/modules/calendar/calendar.service.ts` — abstract provider interface
- `apps/web/src/components/calendar/calendar-sync-card.tsx` — add Outlook option

**Tasks:**
1. Microsoft Graph OAuth (same scopes equivalent: read/write calendar)
2. Provider abstraction: `CalendarProvider` interface with Google + Outlook implementations
3. All calendar features (sync, busy slots, event write, defense) work on both providers
4. User can connect Google, Outlook, or both

**Acceptance:** Outlook user connects calendar, sees events in week view, focus blocks write to Outlook.

---

### 1.4 Day autopilot service (1.5 weeks)

**Files:**
- New: `apps/api-gateway/src/modules/autopilot/autopilot.module.ts`
- New: `apps/api-gateway/src/modules/autopilot/autopilot.service.ts`
- New: `apps/api-gateway/src/modules/autopilot/day-reschedule.job.ts`
- New: `apps/api-gateway/src/modules/calendar/calendar-watch.service.ts`
- `apps/api-gateway/src/modules/tasks/tasks.service.ts`
- `apps/web/src/app/(app)/settings/page.tsx`
- `apps/web/src/app/(app)/today/page.tsx`

**Tasks:**
1. Add `autopilotEnabled: Boolean` and `autopilotMode: 'AUTO' | 'SUGGEST'` to user preferences (Prisma + GraphQL)
2. `CalendarWatchService` — Google push notifications or 5-min poll → enqueue reschedule
3. `AutopilotService.rescheduleDay(userId, date)`:
   - Fetch incomplete tasks for date
   - Build busy intervals: work hours, focus blocks, Google/Outlook events, existing tasks
   - Run slot-finder per task (priority order, respect dependencies)
   - AUTO mode: apply; SUGGEST mode: store proposal
4. Cron: 9am daily reschedule for users with autopilot on
5. Settings UI: toggle + mode selector
6. Today UI: autopilot badge, reschedule log ("3 tasks moved due to 2pm meeting")
7. Week view: dotted border on auto-moved tasks

**Acceptance:** Adding a Google Calendar event at 2pm triggers task reschedule within 5 min.

---

### 1.5 Fix slot finder — include calendar busy time (2 days)

**File:** `apps/api-gateway/src/modules/tasks/tasks.service.ts` — `suggestReschedule()`

**Task:** Call `calendar.service.getEventsForPlanning(userId, date)` and add events to busy intervals. Currently only uses tasks + focus blocks.

**Acceptance:** Suggest reschedule avoids times with existing calendar meetings.

---

### 1.6 Focus block → Google/Outlook calendar writer (3 days)

**Files:**
- `apps/api-gateway/src/modules/calendar/calendar.service.ts`
- `apps/api-gateway/src/modules/productivity/productivity.service.ts`

**Tasks:**
1. Cron (every 15 min): `syncFocusBlocksToCalendar(userId)`
2. For each active `FocusTimeBlock`: create/update calendar event "🎯 Focus Time" with `transparency: opaque`
3. Delete calendar event when focus block deleted
4. Show sync status on productivity page

**Acceptance:** Focus block created in /productivity appears on Google Calendar within 15 min.

---

### 1.7 Calendar defense executor (1 week)

**Files:**
- New: `apps/api-gateway/src/modules/productivity/calendar-defense.executor.ts`
- `apps/api-gateway/src/modules/productivity/productivity.service.ts`

**Tasks:**
1. Background job triggered after calendar sync
2. Read `CalendarDefense` rules per user
3. For violating meetings: `auto_decline` (Google `events.patch` status=declined), `mark_busy`, `notify_only`
4. For no-meeting days: decline all new invites on that day
5. Log defense actions; show in productivity page "Defense log"
6. May require re-consent for write scopes — handle gracefully

**Acceptance:** Meeting booked during focus time gets auto-declined when defense rule is `auto_decline`.

---

### 1.8 Push notification send pipeline (4 days)

**This is the incomplete work Opus flagged. UI exists; backend send does not.**

**Files:**
- New: `apps/api-gateway/src/modules/notifications/push-notification.service.ts`
- New: `apps/api-gateway/src/modules/notifications/push-notification.module.ts`
- `apps/api-gateway/src/modules/email/reminder.scheduler.ts` (extend)
- `apps/web/src/lib/push.ts` (already done)
- `.env.example`

**Tasks:**

**Step 1 — VAPID keys**
```bash
npx web-push generate-vapid-keys
```
Add to `.env.example`:
```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

**Step 2 — PushNotificationService**
- `npm install web-push` in api-gateway
- `sendToUser(userId, { title, body, url, icon })` — iterate `User.pushTokens`
- `sendToToken(token, payload)` — wrap `webpush.sendNotification()`
- On 410/404 response: remove token from `User.pushTokens`
- Gate on `NotificationPreferences.pushEnabled` + per-event type flags

**Step 3 — Push scheduler**
Extend reminder scheduler (or new `push.scheduler.ts`):
| Trigger | When |
|---------|------|
| Task due soon | 15 min before `scheduledStart` |
| Daily plan ready | After weekly plan generation |
| Autopilot reschedule | After auto-move (summary) |
| Focus block starting | 5 min before block |
| Morning ritual nudge | 8am if ritual not done |

**Step 4 — Service worker actions**
- `notificationclick` → `clients.openWindow(data.url)` (verify in `sw.js`)
- Optional action button "Mark done" → POST complete via queued mutation

**Step 5 — Test mutation**
- GraphQL `sendTestPush: Boolean!` (dev/staging only) to verify pipeline

**Step 6 — Deploy docs**
- Document VAPID setup in `PRODUCTION_READINESS.md`
- Settings toggle should show "Configured" when env var present AND backend health check passes

**Acceptance:**
- [ ] Subscribe on staging → receive test push within 5s
- [ ] Task due in 15 min → push arrives
- [ ] Disabling push in settings → no more pushes
- [ ] Expired subscription pruned automatically

---

### 1.9 Jira + Asana integration (1.5 weeks)

Same provider pattern as 1.2.

**Jira:** OAuth 2.0 (Atlassian), JQL fetch, issue → task mapping, bi-directional complete.
**Asana:** OAuth, project/task import, bi-directional complete.

**Acceptance:** Jira issue assigned to user appears in MicroPlanner tasks; completing syncs back.

---

## PHASE 2 — P1 Retention & Depth

### 2.1 Habits — flexible recurring blocks (4 days)

**Reclaim-style:** "Lunch 12-1pm" moves around meetings.

- New Prisma model `Habit` (title, preferredWindowStart, preferredWindowEnd, durationMinutes, priority, flexible)
- Scheduler places habit events, reschedules on conflict
- UI: Habits tab on `/productivity`
- Habits write to Google/Outlook calendar

---

### 2.2 Smart 1:1 scheduler (3 days)

- Use `Smart1on1` model + slot finder
- "Schedule next 1:1" button → proposes slot → sends calendar invite
- UI on productivity page Smart 1:1 tab (enhance existing CRUD)

---

### 2.3 PM import in plan-day ritual (3 days)

**File:** `apps/web/src/app/(app)/plan-day/page.tsx`

- New step 0: "Import from connected tools"
- Show Todoist/Linear/Notion tasks for today
- Checkbox select → import into today's plan
- Depends on 1.2 being complete

---

### 2.4 Team depth (1 week)

**Files:**
- New: `apps/web/src/app/(app)/teams/accept/[token]/page.tsx`
- `apps/api-gateway/src/modules/premium/premium.service.ts`

1. `inviteMember()` sends Resend email with accept link
2. Accept page: join team, redirect to team dashboard
3. `Goal.teamId` optional — team goals visible to members
4. Team dashboard: aggregate completion stats

---

### 2.5 UX polish batch (4 days)

1. Plan-day: DnD timeboxing step (reuse week calendar DnD patterns)
2. Daily intention → backend model (not localStorage) — `DailyRitual` table or user preferences JSON
3. Today page: morning banner "Start your daily ritual?" if not done by 9am
4. Workload warning on `plans/generate/page.tsx` (already on review)
5. Manual time log in `task-detail-modal.tsx` — wire `useLogTime`
6. Apollo errorLink → toast for 5xx errors

---

### 2.6 Production hardening (1 week)

1. Deploy DB index migration per `PRODUCTION_READINESS.md` runbook
2. `@nestjs/throttler-storage-redis` wired to `REDIS_URL`
3. k6 smoke test in GitHub Actions (against staging URL)
4. Expand k6: calendar week, plan generate, 500 concurrent
5. Structured JSON logging with `x-request-id` middleware in api-gateway + graphql-gateway
6. CSP in `next.config.js` (report-only first)
7. Document results in `PRODUCTION_READINESS.md`

---

### 2.7 Real-time GraphQL subscriptions (2 days)

- Mount `useTaskUpdatedSubscription`, `useGoalUpdatedSubscription` in `apps/web/src/app/(app)/layout.tsx`
- On event: Apollo cache update (not full refetch)
- Toast optional: "Task updated on another device"

---

### 2.8 Slack integration (4 days)

- OAuth (already stubbed) → real implementation
- Daily digest: post to configured channel at 8am (today's plan summary)
- Slash command `/microplanner today` → returns today's tasks
- Requires Slack app setup docs in `.env.example`

---

## PHASE 3 — P2 Polish

### 3.1 Time tracking depth (4 days)
- Manual log/edit/delete in task detail
- Time entry history per task
- Analytics "Time" tab + CSV export
- Project time rollup

### 3.2 PWA depth (3 days)
- `beforeinstallprompt` → install banner component
- PNG icons 192/512 in manifest
- `apollo3-cache-persist` for offline Today reads
- Manifest screenshots

### 3.3 Guided weekly planning ritual (3 days)
- Step-by-step flow: review last week → set intentions → generate plan → accept
- Entry point from analytics weekly review modal

### 3.4 Team activity feed (4 days)
- Recent completions, plan accepts, member joins
- Team dashboard page enhancement

### 3.5 Referral rewards (3 days)
- Wire `referral-panel.tsx` to billing: referrer gets 1 month credit
- Stripe coupon or tier extension on successful referral

### 3.6 AIMemory deeper integration (3 days)
- Feed AIMemory into Claude planner context
- Settings: view/delete memories
- Auto-create memory on user reschedule override

---

## Verification (run after each phase)

```bash
cd apps/api-gateway && npx tsc --noEmit && npm run build
cd apps/graphql-gateway && npx tsc --noEmit
cd apps/web && npx tsc --noEmit && npm run build
```

### Integration smoke tests
- [ ] OAuth connect Todoist → import tasks → complete → syncs back
- [ ] OAuth connect Linear → same
- [ ] Outlook calendar → events in week view

### Autopilot smoke tests
- [ ] Add calendar event → tasks reschedule (autopilot on)
- [ ] Slot finder avoids calendar busy times

### Defense smoke tests
- [ ] Focus block → appears on Google Calendar
- [ ] Meeting during focus → auto-declined (defense on)

### Push smoke tests
- [ ] `sendTestPush` → notification appears
- [ ] Task due → push 15 min before
- [ ] Toggle off → no push

### Do not break (regression)
- [ ] Upgrade ladder FREE→STARTER→PRO→PREMIUM
- [ ] `/billing` usage/cancel/resume
- [ ] `/productivity` tabs
- [ ] `/plans/templates` CRUD
- [ ] Plan regenerate
- [ ] Google Calendar connect (existing)

---

## Implementation order (strict)

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 →
2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 →
3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6
```

**Start with 1.1 now.** Read the files, understand current stub behavior, then implement OAuth properly before building new providers.

When blocked on external API credentials (Slack app, Jira OAuth app, VAPID keys), document required env vars in `.env.example` and implement with graceful degradation — but never fake "Connected" state.

Do not create new markdown docs unless asked.
