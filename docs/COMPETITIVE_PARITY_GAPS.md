# MicroPlanner — Competitive Parity Gap Analysis (July 2026)

**Date:** 2026-07-08  
**Goal:** Eliminate remaining feature gaps vs Motion, Reclaim, and Sunsama — **excluding native iOS/Android apps** (web + PWA only).  
**Baseline:** Post `b69eef5` commit — 31 prior gap items shipped. This doc covers what still separates you from category leaders.

---

## Executive Summary

MicroPlanner is no longer "backend-heavy, UI-light." The core loop and most enterprise surfaces are wired. The **remaining distance** is concentrated in five areas:

| Gap area | vs Motion | vs Reclaim | vs Sunsama | Severity |
|----------|-----------|------------|------------|----------|
| PM tool imports (10–15 integrations) | ❌ Missing | ❌ Missing | ❌ Missing | **P0** |
| Full-day AI autopilot + live reschedule | ❌ Partial | ❌ Partial | N/A | **P0** |
| Focus/calendar defense **execution** | ❌ Settings only | ❌ Settings only | N/A | **P0** |
| Push notification **send pipeline** | ❌ Subscribe only | ❌ Subscribe only | N/A | **P0** |
| Outlook calendar | ❌ Missing | ✅ They have it | ✅ They have it | **P0** |
| Production battle-testing | ⚠️ Scaffolded | — | — | **P1** |
| UX polish & ritual depth | ⚠️ Good MVP | — | ⚠️ No PM import in ritual | **P1** |
| Team collaboration depth | ⚠️ Admin only | ✅ Team analytics | N/A | **P1** |
| Time tracking depth | ⚠️ Timer only | ✅ Reports | ✅ Built-in | **P2** |
| PWA install/offline reads | ⚠️ Basic | — | — | **P2** |

**Native mobile:** Explicitly out of scope. Web + PWA is the platform strategy.

**Brand/distribution:** Not a code deliverable — covered only as launch checklist items at the end.

---

## What You Already Beat Them On (Protect)

1. **Energy/chronotype-aware planning** — sleep intelligence in onboarding, energy patterns in settings
2. **Transparent AI** — "Why this slot?" on plan review
3. **Free tier with real value** — competitors are mostly trial-only
4. **4-tier pricing ladder** — granular upgrade path
5. **Subtasks + dependencies** — Motion-level structure, Sunsama lacks this
6. **Workload overcommit warnings** — Sunsama has this; Motion does not

---

## Gap 1 — PM Integrations Depth (P0)

### Current state

| Integration | OAuth backend | Real sync/import | Web UI | Verdict |
|-------------|---------------|------------------|--------|---------|
| Google Calendar | ✅ | ✅ Two-way | ✅ `calendar-sync-card.tsx` | **Complete** |
| Outbound webhooks | ✅ | ✅ Deliveries + retry | ✅ `webhooks-manager.tsx` | **Complete** |
| Slack | ✅ stub | ❌ `syncIntegration()` no-op | ⚠️ Fake "Connect" | **Stub** |
| Notion | ✅ stub | ❌ | ⚠️ Fake "Connect" | **Stub** |
| Linear | ✅ stub | ❌ | ⚠️ Fake "Connect" | **Stub** |
| GitHub | ✅ stub | ❌ | ⚠️ Fake "Connect" | **Stub** |
| Zoom | ✅ stub | ❌ | ⚠️ Fake "Connect" | **Stub** |
| Zapier | ❌ not in enum | ❌ | ⚠️ Card in UI only | **Fake** |
| **Todoist** | ❌ | ❌ | ❌ | **Missing** |
| **Jira** | ❌ | ❌ | ❌ | **Missing** |
| **Asana** | ❌ | ❌ | ❌ | **Missing** |

### Critical bug

`IntegrationsHub` calls `connectIntegration` (creates DB row) but **never initiates OAuth**. Backend has `GET /integrations/oauth/:type/authorize` and callback — UI doesn't use them. Users see "Connected" with no real auth.

**File:** `apps/web/src/components/integrations/integrations-hub.tsx` (line 49: comment admits this)

### Competitor benchmark

| App | Integration count | Bi-directional task sync |
|-----|-------------------|--------------------------|
| Sunsama | 15+ (Asana, Jira, GitHub, Linear, Todoist, Slack…) | ✅ Import + complete back |
| Reclaim | 10+ (Asana, ClickUp, Todoist, Linear…) | ✅ Auto-schedule imported tasks |
| Motion | Limited (Google/Outlook calendar) | ⚠️ PM-light, calendar-heavy |
| **MicroPlanner** | 2 real + 5 stubs | ❌ |

### Work required

**Phase A — Fix the lie (1–2 days)**
- Wire OAuth redirect flow in UI for existing providers
- Add `initiateIntegrationOAuth(type)` GraphQL mutation → REST authorize URL
- OAuth callback page/route to complete handshake
- Remove Zapier card OR add backend support
- Delete duplicate dead card: `components/integrations/calendar-sync-card.tsx`

**Phase B — Todoist + Linear + Notion (1–2 weeks)**
- Add `TODOIST` to `IntegrationType` enum
- Per-provider sync service: fetch issues/tasks → map to MicroPlanner `Task` model
- Bi-directional: completing a task in MicroPlanner marks issue done in source
- Inbound webhooks for Linear/GitHub (issue opened → create task)
- Sync status UI: last sync time, error log, item count

**Phase C — Jira + Asana + Slack (1–2 weeks)**
- Jira: OAuth 2.0 + JQL fetch + issue → task mapping
- Asana: OAuth + project/task import
- Slack: slash command `/microplanner` + daily digest to channel (not just OAuth stub)

**Phase D — Import in daily ritual (3–5 days)**
- Plan-day wizard step 0: "Pull from integrations" before prioritization
- Filter by project/label, preview before import

### Acceptance criteria

- [ ] User can OAuth-connect Todoist, Linear, Notion and see real imported tasks
- [ ] Completing an imported task syncs back to source within 60s
- [ ] "Connect" button never shows success without OAuth completion
- [ ] Sync errors surface in UI with retry button
- [ ] Plan-day ritual can pull today's tasks from connected PM tools

---

## Gap 2 — Full-Day AI Autopilot (P0)

### Current state

| Capability | Status | Files |
|------------|--------|-------|
| AI weekly plan generation | ✅ | `plans.service.ts`, planner strategies |
| Calendar-aware weekly planning | ✅ Uses Google busy events | `calendar.service.ts` |
| Per-task smart reschedule | ✅ Manual one-click | `tasks.service.ts` `suggestReschedule()`, Today page |
| Weekly auto-regeneration cron | ✅ PRO/PREMIUM | `plan-automation.service.ts` |
| Workload warnings | ✅ | `workload-warning.tsx` |
| **Full-day autopilot** | ❌ | — |
| **Auto-apply on conflict** | ❌ | — |
| **Calendar change listener** | ❌ | — |
| **Reschedule uses Google busy time** | ❌ | `suggestReschedule()` uses tasks + focus blocks only |

### Competitor benchmark (Motion)

Motion's core value: add a task with deadline → AI finds slot → when a meeting appears, **entire day reshuffles automatically** without user action.

### Work required

**2.1 — Calendar change detection**
- Google Calendar push notifications (watch channel) OR poll every 5 min
- On change: enqueue `DayRescheduleJob` for affected users with autopilot enabled
- File: new `apps/api-gateway/src/modules/calendar/calendar-watch.service.ts`

**2.2 — Day-level autopilot service**
- New `AutopilotService`: for all incomplete today tasks, run slot-finder sequentially
- Include: work hours, focus blocks, Google busy events, task dependencies, priority
- Respect user toggle: `User.preferences.autopilotEnabled` (add to schema/settings)
- File: new `apps/api-gateway/src/modules/autopilot/autopilot.service.ts`

**2.3 — Auto-apply vs suggest mode**
- Setting: "Auto-reschedule" (Motion-style) vs "Suggest only" (current behavior)
- Auto mode: apply slots, notify user "3 tasks rescheduled due to new meeting"
- Suggest mode: show banner with preview diff before apply

**2.4 — UI surfaces**
- Settings → Autopilot toggle + mode selector
- Today page: "Autopilot active" badge, reschedule history log
- Week view: visual indicator on auto-moved tasks (dotted border + tooltip)

**2.5 — Fix slot finder**
- `suggestReschedule()` must call `calendar.service.getEventsForPlanning()` for busy intervals
- File: `apps/api-gateway/src/modules/tasks/tasks.service.ts`

### Acceptance criteria

- [ ] New Google Calendar event triggers reschedule within 5 min (autopilot on)
- [ ] User can toggle autopilot on/off and choose auto-apply vs suggest
- [ ] Slot finder respects Google Calendar busy time
- [ ] Overdue tasks auto-reschedule at 9am daily if autopilot on
- [ ] User sees notification/log when autopilot moves tasks

---

## Gap 3 — Focus Time Defense Execution (P0)

### Current state

| Reclaim feature | Backend model | UI settings | **Live execution** |
|-----------------|---------------|-------------|-------------------|
| Focus time blocks | ✅ `FocusTimeBlock` | ✅ `/productivity` | ❌ Not written to Google Calendar |
| Auto-decline meetings | ✅ `CalendarDefense` toggles | ✅ | ❌ No Google API calls |
| No-meeting days | ✅ | ✅ | ❌ Not enforced on calendar |
| Habits (flexible recurring) | ❌ | ❌ | ❌ |
| Smart 1:1 scheduling | ✅ `Smart1on1` CRUD | ✅ | ❌ No scheduler |
| Travel time / buffers | Schema fields | ❌ | ❌ |

**Code comment:** `productivity.service.ts` ~line 787: *"push channels are Phase 7"*; focus block → calendar write marked as future enhancement.

### Competitor benchmark (Reclaim)

Reclaim's moat: set "15 hours focus time per week" → AI **actively defends** those blocks on Google Calendar, marks them busy, and **reschedules** them when meetings arrive.

### Work required

**3.1 — Focus block → Google Calendar writer**
- Cron job (every 15 min): for users with calendar connected, create/update "🎯 Focus Time" events from `FocusTimeBlock` rules
- Use Google Calendar API `events.insert` with `transparency: opaque`, `visibility: private`
- File: new method in `calendar.service.ts` `syncFocusBlocksToCalendar()`

**3.2 — Calendar defense executor**
- Background job: scan upcoming external meetings against `CalendarDefense` rules
- Actions per rule: `auto_decline`, `auto_reschedule`, `mark_busy`, `notify_only`
- Requires Google Calendar write scope (may need re-consent)
- File: new `apps/api-gateway/src/modules/productivity/calendar-defense.executor.ts`

**3.3 — No-meeting day enforcement**
- On no-meeting days: auto-decline new meeting invites or mark entire day busy
- Show defended hours in week view as green "protected" blocks

**3.4 — Habits (Reclaim-style flexible recurring)**
- New model: `Habit` — "Lunch 12-1pm", "Exercise 6-7pm", priority, flexible window
- Scheduler places habit events, moves them around meetings
- UI: Habits tab on `/productivity`

**3.5 — Smart 1:1 scheduler**
- Use existing `Smart1on1` + slot finder to propose next 1:1 slot
- Send calendar invite to attendee

**3.6 — Outlook calendar**
- Add Outlook OAuth (Microsoft Graph API) alongside Google
- Same sync/write/defense pipeline abstracted over provider interface
- Files: new `apps/api-gateway/src/modules/calendar/outlook-oauth.service.ts`

### Acceptance criteria

- [ ] Focus blocks appear as real events on Google Calendar
- [ ] New meeting during focus time triggers defense action per user rules
- [ ] No-meeting days block new invites
- [ ] Habits auto-schedule and move around conflicts
- [ ] Outlook connect works with same feature parity as Google

---

## Gap 4 — Push Notification Send Pipeline (P0)

### Current state (the Opus judgment call)

| Component | Status | File |
|-----------|--------|------|
| Client subscribe/unsubscribe | ✅ | `apps/web/src/lib/push.ts` |
| Service worker push handler | ✅ | `apps/web/public/sw.js` |
| Settings toggle UI | ✅ | `push-notifications-toggle.tsx` |
| Token storage (`User.pushTokens`) | ✅ | `users.service.ts` |
| GraphQL register/unregister | ✅ | `user.resolver.ts` |
| **VAPID keys in env** | ❌ | Not in `.env.example` |
| **Backend `web-push` send** | ❌ | No package, no service |
| **Push scheduler/cron** | ❌ | Email cron exists; no push equivalent |
| **Preference gating** | ❌ | Toggles don't gate actual sends |

**User-visible behavior today:** Toggle shows "not configured" until `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set. Even with key, **nothing sends** — no backend pipeline.

### Work required

**4.1 — VAPID key generation + env**
```bash
npx web-push generate-vapid-keys
```
Add to env:
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...  # same as VAPID_PUBLIC_KEY
```
Update `.env.example`, Render/Vercel deploy configs, `docs/PRODUCTION_READINESS.md`

**4.2 — PushNotificationService (backend)**
- Install `web-push` in api-gateway
- New `apps/api-gateway/src/modules/notifications/push-notification.service.ts`
- Methods: `sendToUser(userId, payload)`, `sendToToken(token, payload)`
- Handle 410 Gone → prune expired tokens from `User.pushTokens`
- Respect `NotificationPreferences.pushEnabled` + per-type flags

**4.3 — Push scheduler**
- Extend `reminder.scheduler.ts` OR new `push.scheduler.ts`
- Triggers: task due in 15 min, daily plan ready, autopilot rescheduled tasks, focus block starting
- Parallel to email sends — same gating logic

**4.4 — GraphQL test push mutation (admin/dev)**
- `sendTestPush` mutation for verifying pipeline in staging

**4.5 — Notification payload design**
```json
{
  "title": "Task due in 15 min",
  "body": "Review Q3 goals deck",
  "icon": "/logo-icon.svg",
  "badge": "/logo-icon.svg",
  "data": { "url": "/today?task=abc123" },
  "actions": [{ "action": "complete", "title": "Mark done" }]
}
```
- Service worker `notificationclick` → navigate to `data.url`
- Optional: `notificationclose` analytics event

### Acceptance criteria

- [ ] VAPID keys documented and deployable
- [ ] Task due in 15 min sends push to subscribed users
- [ ] Daily plan ready sends push at user's preferred time
- [ ] Expired tokens auto-pruned
- [ ] Push respects notification preference toggles
- [ ] Clicking notification opens correct page
- [ ] Works on Chrome, Firefox, Edge (document Safari/iOS PWA limitations)

---

## Gap 5 — Production Battle-Testing (P1)

### Current state

| Item | Status |
|------|--------|
| Per-user rate limiting | ✅ In-memory `UserThrottlerGuard` |
| Redis throttler (multi-instance) | ❌ Redis module exists, not wired to throttler |
| DB index migration | ⚠️ Written, **not deployed** |
| Load tests | ⚠️ `load-tests/k6-smoke.js` exists, **not in CI** |
| Observability (request IDs, p95) | ❌ Sentry only |
| CSP headers | ❌ Deferred |
| k6 at 10k concurrent | ❌ Not run |

### Work required

1. Deploy index migration per runbook in `PRODUCTION_READINESS.md`
2. Wire `@nestjs/throttler-storage-redis` to `REDIS_URL`
3. Add k6 smoke test to GitHub Actions against staging
4. Expand k6: calendar week fetch, plan generate, task bulk ops
5. Structured JSON logging with `x-request-id` in api-gateway + graphql-gateway
6. Add CSP to `next.config.js` (start with report-only mode)
7. Document load test results in `docs/PRODUCTION_READINESS.md`

### Acceptance criteria

- [ ] Index migration applied to production
- [ ] Rate limits consistent across multiple Render instances
- [ ] CI fails if k6 smoke test fails on staging
- [ ] Every API request has correlation ID in logs
- [ ] Load test report: p95 < 500ms for calendar week at 500 concurrent

---

## Gap 6 — UX Polish & Ritual Depth (P1)

### Current state

Strong: 5-step onboarding, skeletons, empty states, error boundary, toasts, plan-day wizard, weekly review modal.

### Gaps vs Sunsama

| Sunsama feature | Gap | Work |
|-----------------|-----|------|
| Pull tasks from PM tools into ritual | ❌ | Depends on Gap 1 |
| Drag-to-prioritize / timebox in ritual | Button priority only | Add DnD step to plan-day |
| Intention/reflection cross-device | localStorage only | Backend `DailyRitual` model |
| Guided weekly planning ritual | Modal only | Step-by-step weekly flow |
| Morning prompt on Today | ❌ | "Start your daily ritual?" banner |
| Workload warning on generate | Review only | Add to `plans/generate` |

### Gaps vs all competitors

| Polish item | Gap | Work |
|-------------|-----|------|
| Manual time log UI | Hook exists, not wired | Task detail modal |
| Real-time task updates | Subscriptions unused | Mount `useTaskUpdatedSubscription` in layout |
| Integration false "Connected" | Misleading | Fix with Gap 1 OAuth |
| GraphQL error toasts | Console only | Apollo errorLink → toast for 5xx |
| Onboarding empty dashboard | First visit sparse | Post-onboarding guided tour |

### Acceptance criteria

- [ ] Plan-day has DnD timeboxing step
- [ ] Daily intention syncs to backend (visible on all devices)
- [ ] Morning banner prompts ritual if not done today
- [ ] Workload warning shows on plan generate AND review
- [ ] Manual time entry in task detail
- [ ] Real-time task updates across tabs

---

## Gap 7 — Team Collaboration Depth (P1)

### Current state

| Feature | Status |
|---------|--------|
| Team CRUD | ✅ |
| Members, roles, invite, remove | ✅ UI |
| API keys | ✅ |
| Scheduling links | ✅ |
| **Shared goals/plans/tasks** | ❌ Types exist, no UI |
| **Invitation emails** | ❌ Logs only, no Resend send |
| **Accept invitation page** | ❌ Backend route exists, no web page |
| **Team activity feed** | ❌ |
| **Shared calendars** | ❌ `sharedCalendars: true` in settings, not implemented |

### Work required

1. `/teams/accept/[token]` page — accept invite, join team
2. Send invitation email via Resend in `premium.service.inviteMember()`
3. Team-scoped goals: `goal.teamId` optional field, filter in goals page
4. Shared plan view: team dashboard showing aggregate completion
5. Team activity feed: recent task completions, plan accepts

### Acceptance criteria

- [ ] Invite email arrives with accept link
- [ ] Accept link adds user to team
- [ ] Team goals visible to all members
- [ ] Team dashboard shows shared progress

---

## Gap 8 — Time Tracking Depth (P2)

### Current state

Timer on Today + task cards + detail modal. Analytics shows tracked vs estimated. `logTime` mutation exists but **no UI**.

### Work required

1. Manual time entry form in task-detail-modal (duration, date, note)
2. Time entry history list per task (edit/delete)
3. Analytics → "Time" tab: weekly hours chart, export CSV
4. Project-level time rollup on `/projects/[id]`

### Acceptance criteria

- [ ] User can manually log, edit, delete time entries
- [ ] Weekly time report with CSV export
- [ ] Project page shows total tracked hours

---

## Gap 9 — PWA Depth (P2)

### Current state

Service worker, offline page, mutation queue, offline indicator. No install prompt, weak icons (SVG only), Apollo POST queries fail offline.

### Work required

1. `beforeinstallprompt` handler → install banner component
2. PNG icons 192×192, 512×512 in manifest
3. Apollo persisted cache (`apollo3-cache-persist`) for Today/tasks
4. `screenshots` in manifest for app store-like install UX

### Acceptance criteria

- [ ] Install prompt appears on supported browsers
- [ ] Today view readable offline (cached tasks)
- [ ] Queued mutations replay on reconnect (already works, verify)

---

## Gap 10 — Brand & Launch Checklist (Non-code)

Not implementation tasks, but required to **compete in market** not just in features:

- [ ] App Store-style screenshots for PWA install
- [ ] Comparison landing page (vs Motion, vs Reclaim, vs Sunsama)
- [ ] Help center with integration setup guides
- [ ] Status page (e.g. Instatus)
- [ ] Customer support channel (Intercom/Crisp)
- [ ] Case studies / testimonials
- [ ] SEO for "AI weekly planner", "focus time app", etc.

---

## Priority Roadmap

### Phase 1 — P0 Table Stakes (4–6 weeks)

| # | Item | Est. |
|---|------|------|
| 1.1 | Fix integration OAuth UI + remove fake connects | 2d |
| 1.2 | Todoist + Linear + Notion real sync | 2w |
| 1.3 | Outlook calendar provider | 1w |
| 1.4 | Day autopilot service + calendar change listener | 1.5w |
| 1.5 | Fix slot finder to include Google busy time | 2d |
| 1.6 | Focus block → calendar writer | 3d |
| 1.7 | Calendar defense executor | 1w |
| 1.8 | Push send pipeline + VAPID + scheduler | 4d |
| 1.9 | Jira + Asana integration | 1.5w |

### Phase 2 — P1 Retention & Depth (3–4 weeks)

| # | Item | Est. |
|---|------|------|
| 2.1 | Habits (flexible recurring blocks) | 4d |
| 2.2 | Smart 1:1 scheduler | 3d |
| 2.3 | PM import in plan-day ritual | 3d |
| 2.4 | Team invite emails + accept page + shared goals | 1w |
| 2.5 | UX polish batch (DnD ritual, morning prompt, workload on generate) | 4d |
| 2.6 | Production: indexes, Redis throttler, k6 CI, logging | 1w |
| 2.7 | Real-time GraphQL subscriptions mounted | 2d |
| 2.8 | Slack integration (digest + slash command) | 4d |

### Phase 3 — P2 Polish (2–3 weeks)

| # | Item | Est. |
|---|------|------|
| 3.1 | Time tracking depth (manual log, reports, CSV) | 4d |
| 3.2 | PWA install prompt + offline reads + PNG icons | 3d |
| 3.3 | Guided weekly planning ritual | 3d |
| 3.4 | Team activity feed + shared plan view | 4d |
| 3.5 | Referral rewards billing tie-in | 3d |
| 3.6 | AIMemory deeper planner integration | 3d |

---

## Key Files Reference

```
Integrations (stubs to fix):
  apps/api-gateway/src/modules/integrations/integrations.service.ts
  apps/web/src/components/integrations/integrations-hub.tsx

Autopilot (to build):
  apps/api-gateway/src/modules/tasks/tasks.service.ts (suggestReschedule)
  apps/api-gateway/src/modules/calendar/calendar.service.ts

Focus defense (to build):
  apps/api-gateway/src/modules/productivity/productivity.service.ts
  apps/web/src/app/(app)/productivity/page.tsx

Push (to complete):
  apps/web/src/lib/push.ts
  apps/web/src/components/settings/push-notifications-toggle.tsx
  apps/api-gateway/src/modules/email/reminder.scheduler.ts (extend)

Ritual (to deepen):
  apps/web/src/app/(app)/plan-day/page.tsx
  apps/web/src/lib/daily-ritual.ts

Teams (to deepen):
  apps/api-gateway/src/modules/premium/premium.service.ts
  apps/web/src/app/(app)/teams/

Production:
  docs/PRODUCTION_READINESS.md
  load-tests/k6-smoke.js
  packages/database/prisma/migrations/20260707000000_task_hotpath_indexes/
```

---

*Companion doc: `COMPETITIVE_PARITY_PROMPT.md` — paste into Opus/Sonnet to implement.*
