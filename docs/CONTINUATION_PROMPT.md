# MicroPlanner — Continuation Prompt (Session 2)

**Paste everything below the `---` line into a NEW Cursor Agent chat with Opus.**  
This continues an in-progress implementation. Do NOT restart from Phase 1.

---

You are continuing the MicroPlanner gap-closure implementation. A prior session completed **9 of 31 items** (Phase 1 fully + Phase 2.1–2.4). All changes are **uncommitted** in the working tree. Your job is to pick up at **item 2.5** and continue in strict order through the remaining 22 items.

## Read first (skim, don't re-implement)

- `docs/GAP_ANALYSIS_2026.md` — what exists vs missing
- `docs/IMPLEMENTATION_PROMPT.md` — full spec for all 31 items (items 1.1–2.4 are DONE)

## Project rules (non-negotiable)

1. Web app talks **only** to GraphQL (`apps/graphql-gateway`), never REST directly.
2. Reuse existing hooks in `use-graphql.tsx` and `use-graphql-extended.tsx` before writing new ones.
3. All task fetches must pass bounded `dateRange + take` (see `docs/PRODUCTION_READINESS.md`).
4. Single-task mutations must NOT use `refetchQueries: ['GetTasks']` — rely on Apollo entity normalization.
5. Match existing UI patterns in `apps/web/src/components/ui/`.
6. Run `tsc --noEmit` in affected apps + `next build` for web after each batch.
7. **No git commits** unless explicitly asked.

---

## ✅ COMPLETED — do not redo

### Phase 1 — Revenue & Retention (5/5 done)

| # | Item | What shipped |
|---|------|-------------|
| 1.1 | Billing UI | Rebuilt `/billing`: plan card (status, renewal/cancel date), usage meters, cancel/resume with confirm dialogs, payment method + invoice history. Added `GET_BILLING_INFO`, `RESUME_SUBSCRIPTION` ops + `useBillingInfo`, `useResumeSubscription` hooks. |
| 1.2 | Google Calendar connect | `CalendarSyncCard` component (connect/status/sync/disconnect). Wired into `/integrations` and Settings → Integrations. |
| 1.3 | Notification prefs | Settings reads/writes productivity `notification-preferences` backend (not the no-op `updateUserSettings` path). |
| 1.4 | Plan regenerate | End-to-end: schema → resolver → datasource → `REGENERATE_PLAN` op → `useRegeneratePlan` hook → review page button. Calls API, routes to new draft. |
| 1.5 | Email reminders | Fixed GraphQL ↔ Prisma field mapping bug in gateway datasource (`enable*` prefs → Prisma columns). Toggles now gate email scheduler. |

### Phase 2 — Competitive Parity (4/8 done)

| # | Item | What shipped |
|---|------|-------------|
| 2.1 | Calendar in week view | External events as read-only blocks behind tasks; "Calendar synced" badge; tier + connection gated. Files: `calendar-page.tsx`, `week-calendar-dnd.tsx`, `calendar-utils.ts`. |
| 2.2 | Productivity page | New `/productivity` route + sidebar nav. Tabs: Focus Time, Work Hours, No-Meeting Days, Calendar Defense. Added missing No-Meeting-Day/Calendar-Defense ops + hooks. |
| 2.3 | Daily auto-reschedule | Backend slot-finder (work hours, focus blocks, existing tasks) + endpoint + GraphQL `rescheduleSuggestion`. Today page: overdue banner + one-click smart reschedule. |
| 2.4 | Plan templates | New `/plans/templates` route. List/use/set-default/delete + save-current-plan. Added 4 missing GraphQL template mutations in gateway. Tier-gated STARTER+. |

### Also done (prior session, before Phase 1)

- Upgrade ladder fix: `getNextTier()` everywhere; in-place `upgradeSubscription` for paid users.
- Files: `apps/web/src/lib/upgrade.ts`, `use-upgrade-checkout.ts`, settings/sidebar/header billing CTAs.

### Verification status at checkpoint

- `tsc --noEmit` passes: api-gateway, graphql-gateway, web
- `next build` succeeds (includes `/productivity` and `/plans/templates` routes)
- **No commits made**

---

## Key files created/modified (reference, don't recreate)

```
NEW:
  apps/web/src/app/(app)/productivity/page.tsx
  apps/web/src/app/(app)/plans/templates/page.tsx
  apps/web/src/components/calendar/calendar-sync-card.tsx
  apps/web/src/lib/task-query.ts
  docs/GAP_ANALYSIS_2026.md
  docs/IMPLEMENTATION_PROMPT.md

MODIFIED (major):
  apps/web/src/app/(app)/billing/page.tsx
  apps/web/src/app/(app)/integrations/page.tsx
  apps/web/src/app/(app)/settings/page.tsx
  apps/web/src/app/(app)/plans/review/page.tsx
  apps/web/src/app/(app)/today/page.tsx
  apps/web/src/components/calendar/calendar-page.tsx
  apps/web/src/components/calendar/week-calendar-dnd.tsx
  apps/web/src/components/layout/app-sidebar.tsx
  apps/web/src/graphql/operations.ts
  apps/web/src/graphql/operations-extended.ts
  apps/web/src/hooks/use-graphql.tsx
  apps/web/src/hooks/use-graphql-extended.tsx
  apps/graphql-gateway/src/datasources/rest-api.ts
  apps/graphql-gateway/src/resolvers/plan.resolver.ts
  apps/graphql-gateway/src/resolvers/task.resolver.ts
  apps/graphql-gateway/src/schema/plan.graphql
  apps/graphql-gateway/src/schema/task.graphql
  apps/api-gateway/src/modules/tasks/tasks.service.ts
  apps/api-gateway/src/modules/tasks/tasks.controller.ts
```

Note: there may be duplicate calendar sync card paths (`components/calendar/` vs `components/integrations/`). Consolidate if you touch that area.

---

## 🔜 START HERE — remaining 22 items

Continue in this exact order. One item at a time, end-to-end each.

### Phase 2 — Competitive Parity (4 remaining)

#### 2.5 Time tracking in task detail
**Files:** `apps/web/src/components/tasks/task-detail-modal.tsx`, `today/page.tsx`, `analytics/page.tsx`

- Show timer start/stop in task detail modal (`useStartTimer`, `useStopTimer` — hooks exist in `use-graphql.tsx`)
- Show accumulated time on task cards
- Weekly time report on analytics page (check `GET /tasks/advanced/time/stats` — may need GraphQL proxy + hook)

#### 2.6 Guided daily planning ritual
**Files:** `apps/web/src/app/(app)/today/page.tsx` or new `/plan-day` route

Sunsama-style ritual:
1. Review yesterday's incomplete tasks
2. Set daily intention (1 sentence)
3. Drag/prioritize today's tasks
4. Confirm schedule
5. Optional shutdown ritual (mark complete, reflect)

#### 2.7 Weekly review + AI insights
**Files:** `apps/web/src/app/(app)/analytics/page.tsx`

- "Generate Insights" button → `useGenerateInsights`
- Display `useInsights` results as cards
- Weekly review modal: completion rate, streak, top goals, AI recommendations
- Surface pattern recognition via `GET /analytics/patterns` (add GraphQL proxy if missing)

#### 2.8 Workload overcommit warnings
**Files:** `plans/review/page.tsx`, `plans/generate/page.tsx`

- Before accepting plan: total scheduled hours vs available work hours
- Warning if >100% capacity
- Suggest removing lowest-priority tasks

---

### Phase 3 — Premium Tier Value (6 items)

#### 3.1 Team workspaces
**New:** `apps/web/src/app/(app)/teams/page.tsx`, `teams/[id]/page.tsx`
- Create team, invite members, manage roles
- Hooks: `useTeams`, `useCreateTeam`, `useInviteTeamMember`, `useTeamMembers` (in `use-graphql-extended.tsx`)
- Tier-gate: PREMIUM only

#### 3.2 Scheduling links
**New:** `apps/web/src/app/(app)/scheduling/page.tsx`, `apps/web/src/app/book/[slug]/page.tsx` (public, no auth)
- CRUD scheduling links; public booking page uses backend public endpoints at `/scheduling/links/slug/:slug`

#### 3.3 API keys management
**In:** settings Premium tab or `/teams`
- List/create/revoke API keys; show secret once on creation
- Hooks: `useApiKeys`, `useCreateApiKey`, `useDeleteApiKey`

#### 3.4 Integrations hub
**File:** `apps/web/src/app/(app)/integrations/page.tsx`
- Expand beyond Google Calendar: Todoist, Linear, Notion, Slack, Zoom cards
- Connect/disconnect via OAuth; sync now per integration

#### 3.5 Webhooks UI
**In:** integrations page or settings
- CRUD webhooks, test button, delivery log with retry

#### 3.6 Projects + Kanban
**New:** `apps/web/src/app/(app)/projects/page.tsx`, `projects/[id]/page.tsx`
- Project list, kanban board, move tasks between columns

---

### Phase 4 — Scale, Mobile & Compliance (5 items)

#### 4.1 PWA offline support
- Service worker, cache app shell + tasks/goals, offline indicator, IndexedDB mutation queue
- Schema has `Task.localId`, `pendingSync`

#### 4.2 Push notifications
- Web push via service worker; store in `User.pushTokens`; settings opt-in toggle

#### 4.3 GDPR compliance wiring
**File:** `settings/page.tsx`
- Account deletion: call backend `DELETE /users/me` BEFORE Clerk delete (add GraphQL proxy)
- Export: offer backend `GET /users/me/export` as "Full export (GDPR)"

#### 4.4 Production hardening
- Deploy DB index migration `20260707000000_task_hotpath_indexes`
- Redis throttler storage, CSP headers, structured logging, k6 load test

#### 4.5 Marketing pricing page fix
**File:** `apps/web/src/app/(marketing)/pricing/page.tsx`
- Sync prices to `billing.constants.ts` ($7/$15/$29); authenticated CTAs → checkout/upgrade

---

### Phase 5 — Competitive Moat (3 items)

#### 5.1 Transparent AI scheduling
- "Why this slot?" tooltip per task in plan review; store reasoning in `planJson` metadata

#### 5.2 AIMemory
- Implement `AIMemory` model: store user overrides; feed into planner; view/delete in settings

#### 5.3 Referral program
- Invite codes + referral tracking; "Invite friends" in settings

---

## Verification checklist (run after each item or batch)

```bash
cd apps/api-gateway && npx tsc --noEmit
cd apps/graphql-gateway && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
cd apps/web && npm run build
```

### Manual flows to preserve (don't break)

- [ ] FREE → STARTER checkout; STARTER → PRO in-place upgrade; PRO → PREMIUM in-place
- [ ] `/billing` shows usage, cancel/resume, invoices
- [ ] Google Calendar connect → events in week view
- [ ] Notification toggles persist on reload
- [ ] Plan regenerate creates new draft
- [ ] `/productivity` tabs load and save
- [ ] `/plans/templates` CRUD works (STARTER+)
- [ ] Today page smart reschedule works

---

## Your first action

1. Run `git status` and skim the modified files listed above to understand current state.
2. Read `docs/IMPLEMENTATION_PROMPT.md` sections **2.5–2.8** for full detail.
3. Implement **2.5 Time tracking in task detail** end-to-end.
4. Continue through 2.6 → 2.7 → 2.8 → Phase 3 → 4 → 5 without stopping to ask unless blocked.
5. After every 3–4 items, run the verification checklist and report progress.
6. Do not create new markdown docs unless asked. Do not commit unless asked.

**Begin with item 2.5 now.**
