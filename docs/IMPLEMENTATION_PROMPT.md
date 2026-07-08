# MicroPlanner — Full Implementation Prompt

**Use this prompt with Claude Sonnet 4.6 / Opus in Agent mode.**  
Copy everything below the `---` line into a new Cursor chat.

---

You are implementing the complete MicroPlanner product gap closure. Read `docs/GAP_ANALYSIS_2026.md` first — it is the source of truth for what exists, what's missing, and priorities.

## Project context

- **Monorepo:** `apps/web` (Next.js 15), `apps/graphql-gateway` (Apollo), `apps/api-gateway` (NestJS), `packages/database` (Prisma)
- **Auth:** Clerk JWT → GraphQL gateway → REST api-gateway. Never call REST from web directly.
- **Styling:** Match existing components in `apps/web/src/components/ui/`. Use existing hooks patterns from `use-graphql.tsx` and `use-graphql-extended.tsx`.
- **Tier system:** FREE → STARTER → PRO → PREMIUM. Limits in `apps/api-gateway/src/modules/billing/billing.constants.ts` and `apps/web/src/contexts/tier-context.tsx`.
- **Upgrade ladder:** Already fixed — use `getNextTier()` from `apps/web/src/lib/upgrade.ts`. Paid users use `upgradeSubscription`, free users use `createCheckoutSession`.

## Rules

1. **Minimize scope per PR** — one phase item at a time, but complete it end-to-end (backend wiring if needed + GraphQL + UI + types).
2. **Reuse existing hooks** — `use-graphql-extended.tsx` already has hooks for most enterprise features. Wire them to pages before writing new hooks.
3. **Don't break bounded queries** — all task fetches must pass `dateRange + take` (see `docs/PRODUCTION_READINESS.md`).
4. **Don't add refetch storms** — single-task mutations should NOT `refetchQueries: ['GetTasks']`.
5. **Match conventions** — read surrounding files before writing. No over-engineering.
6. **Run builds** after each phase item: `tsc --noEmit` in affected apps + `next build` for web.
7. **No commits** unless explicitly asked.

---

## PHASE 1 — Revenue & Retention (do first)

### 1.1 Billing management UI (`/billing` page expansion)

**Files:** `apps/web/src/app/(app)/billing/page.tsx`, `use-graphql-extended.tsx`, `operations-extended.ts`

Build a full billing page with:
- Current plan card (tier, price, status, renewal date) — use `GET_SUBSCRIPTION` query
- Usage meters (goals, plans, tasks, AI generations) — use `GET_USAGE_STATS`
- Upgrade button (already exists via `getNextTier`)
- Cancel subscription button with confirmation dialog — `useCancelSubscription`
- Resume subscription if `cancelAtPeriodEnd` — add `useResumeSubscription` hook + `RESUME_SUBSCRIPTION` mutation
- Payment method display — `GET_BILLING_INFO` query (add if missing in operations-extended)
- Invoice history list with PDF links
- "Manage in Stripe" portal button (already exists)

**GraphQL gaps to fill:**
- Add `GET_BILLING_INFO` query to `operations-extended.ts` if not present
- Add `RESUME_SUBSCRIPTION` mutation if not present
- Verify `billing.resolver.ts` maps all fields correctly

### 1.2 Google Calendar connect UI

**Files:** `apps/web/src/app/(app)/integrations/page.tsx`, `apps/web/src/components/calendar/calendar-sync-card.tsx` (if exists)

Replace "Coming soon" placeholder with:
- Connect Google Calendar button → `useInitiateCalendarAuth` or `GET /calendar/oauth/google` redirect
- Connection status card (provider, last sync, sync now button)
- Disconnect button
- Show in Settings → Integrations tab AND `/integrations` page

**Backend already has:** `calendar.controller.ts` full OAuth + sync + events CRUD. GraphQL hooks exist in `use-graphql-extended.tsx`.

### 1.3 Fix notification preferences wiring

**Files:** `apps/web/src/app/(app)/settings/page.tsx`

Problem: settings saves `updateUserSettings({ notifications: ... })` but API only persists `theme` and `energyPattern`. Real prefs are at `/productivity/notifications/preferences`.

Fix:
- Import `useNotificationPreferences` and `useUpdateNotificationPreferences` from `use-graphql-extended.tsx`
- Load notification toggles from productivity notification preferences, not user settings
- Save toggles via `updateNotificationPreferences` mutation
- Keep theme/chronotype on `updateUserSettings` as-is

### 1.4 Fix plan regenerate

**Files:** `apps/web/src/app/(app)/plans/review/page.tsx`, `operations.ts`, `use-graphql.tsx`

Problem: "Regenerate" navigates to `/plans/generate` instead of calling `POST /plans/:id/regenerate`.

Fix:
- Add `REGENERATE_PLAN` GraphQL mutation (check if exists in `plan.graphql` schema + resolver; if not, add REST proxy in `rest-api.ts` + resolver)
- Add `useRegeneratePlan` hook
- Wire regenerate button to call mutation, show loading state, redirect to review on success

### 1.5 Email reminders

**Files:** `apps/api-gateway/src/modules/email/`, settings notifications section

- Verify `email.service.ts` + `reminder.scheduler.ts` work with `RESEND_API_KEY`
- Ensure notification preference toggles (from 1.3) gate email sends
- Add "daily digest" and "task reminder" toggles if not present
- Test with a manual trigger or cron log output

---

## PHASE 2 — Competitive Parity

### 2.1 Calendar sync in week view

**Files:** `apps/web/src/components/calendar/`, `calendar-page.tsx`

- Fetch `calendarEvents` and `busySlots` alongside tasks for the visible date range
- Render external calendar events as read-only blocks (different color from MicroPlanner tasks)
- Show "connected" badge when calendar sync is active
- Respect tier gate for calendar sync feature

### 2.2 Focus time blocking UI

**New page:** `apps/web/src/app/(app)/productivity/page.tsx` (route referenced in middleware but missing)

Build tabs:
- **Focus Time** — create/edit/delete focus blocks (`useFocusTimeBlocks`, `useCreateFocusTimeBlock`)
- **Work Hours** — set working hours per day (`useWorkHours`, `useUpdateWorkHours`)
- **No Meeting Days** — block meeting days (`useNoMeetingDays`)
- **Calendar Defense** — auto-decline rules (`useCalendarDefense`)

Use existing GraphQL hooks from `use-graphql-extended.tsx`. Add to sidebar nav under "Productivity" or within Settings.

### 2.3 Daily auto-reschedule

**Files:** `apps/api-gateway/src/modules/plans/`, `apps/web/src/app/(app)/today/page.tsx`

- When a task is overdue or calendar conflict detected, offer "Reschedule" with AI suggestion
- Backend: add endpoint or extend `tasks.service.ts` to find next available slot respecting work hours + focus blocks + calendar busy slots
- UI: show conflict indicator on Today page tasks, one-click reschedule button

### 2.4 Plan templates UI

**New pages:** `apps/web/src/app/(app)/plans/templates/page.tsx`

- List templates (`planTemplates` query)
- Create template from current plan (`saveAsPlanTemplate` mutation)
- Apply template to generate new plan (`generatePlanFromTemplate` mutation)
- Set default template
- Delete template
- Tier-gate: STARTER+ for template access

### 2.5 Time tracking in task detail

**Files:** `apps/web/src/components/tasks/task-detail-modal.tsx`, `today/page.tsx`

- Show timer start/stop in task detail modal (hooks already exist: `useStartTimer`, `useStopTimer`)
- Show accumulated time on task card
- Weekly time report on analytics page (`useTimeStats` or equivalent from advanced tasks)

### 2.6 Guided daily planning ritual

**Files:** `apps/web/src/app/(app)/today/page.tsx` or new `/plan-day` route

Inspired by Sunsama's daily ritual:
1. Review yesterday's incomplete tasks
2. Set daily intention (1 sentence, save to user preferences or task note)
3. Drag/prioritize today's tasks
4. Confirm schedule
5. Optional: shutdown ritual at end of day (mark complete, reflect)

### 2.7 Weekly review + AI insights

**Files:** `apps/web/src/app/(app)/analytics/page.tsx`

- Add "Generate Insights" button → `useGenerateInsights`
- Display `useInsights` results as cards
- Weekly review modal: completion rate, streak, top goals, AI recommendations
- Surface `pattern-recognition.service.ts` data via `GET /analytics/patterns` (add GraphQL proxy if missing)

### 2.8 Workload overcommit warnings

**Files:** `apps/web/src/app/(app)/plans/review/page.tsx`, `plans/generate/page.tsx`

- Before accepting a plan, calculate total scheduled hours vs. available work hours
- Show warning if >100% capacity: "You're overcommitted by X hours"
- Suggest removing lowest-priority tasks

---

## PHASE 3 — Premium Tier Value

### 3.1 Team workspaces

**New pages:** `apps/web/src/app/(app)/teams/page.tsx`, `teams/[id]/page.tsx`

- Create team, invite members, manage roles
- Wire: `useTeams`, `useCreateTeam`, `useInviteTeamMember`, `useTeamMembers`
- Tier-gate: PREMIUM only via `tier-gate.tsx`
- Add to sidebar for PREMIUM users

### 3.2 Scheduling links

**New pages:** `apps/web/src/app/(app)/scheduling/page.tsx`, `apps/web/src/app/book/[slug]/page.tsx` (public)

- CRUD scheduling links (duration, availability, slug)
- Public booking page (no auth required) — backend has public endpoints at `/scheduling/links/slug/:slug`
- Booking confirmation flow
- Tier-gate: PRO+ or PREMIUM

### 3.3 API keys management

**Section in:** `apps/web/src/app/(app)/settings/page.tsx` (Premium tab) or `/teams` page

- List, create, revoke API keys
- Show key secret once on creation
- Wire: `useApiKeys`, `useCreateApiKey`, `useDeleteApiKey`

### 3.4 Integrations hub

**Files:** `apps/web/src/app/(app)/integrations/page.tsx`

Replace placeholder with:
- Integration cards: Google Calendar (Phase 1), Todoist, Linear, Notion, Slack, Zoom
- Connect/disconnect flow via OAuth (`useIntegrations`, `useConnectIntegration`)
- Sync now button per integration
- Tier-gate per integration type

### 3.5 Webhooks UI

**Section in:** integrations page or settings

- CRUD webhooks (URL, events, secret)
- Test webhook button
- Delivery log with retry
- Wire: `useWebhooks`, `useCreateWebhook`, `useTestWebhook`, `useWebhookDeliveries`

### 3.6 Projects + Kanban

**New pages:** `apps/web/src/app/(app)/projects/page.tsx`, `projects/[id]/page.tsx`

- Project list with stats
- Kanban board view per project
- Move tasks between columns
- Wire: `useProjects`, `useKanbanBoard`, `useMoveKanbanTask`

---

## PHASE 4 — Scale, Mobile & Compliance

### 4.1 PWA offline support

**Files:** `apps/web/public/`, `apps/web/src/app/layout.tsx`

- Add service worker (next-pwa or custom)
- Cache app shell + last fetched tasks/goals
- Offline indicator in header
- Queue mutations in IndexedDB, sync on reconnect
- Schema already has `Task.localId`, `pendingSync` fields

### 4.2 Push notifications

- Web push via service worker
- Store tokens in `User.pushTokens`
- Backend: extend `productivity.service.ts` to send push (Phase 7 comment exists)
- UI: opt-in prompt, settings toggle

### 4.3 GDPR compliance wiring

**Files:** `apps/web/src/app/(app)/settings/page.tsx`

- Account deletion: call `DELETE /api/v1/users/me` (add GraphQL mutation proxy) BEFORE Clerk delete
- Data export: offer backend `GET /users/me/export` as "Full export (GDPR)" alongside existing client-side export

### 4.4 Production hardening

- Deploy DB index migration (`20260707000000_task_hotpath_indexes`)
- Add Redis throttler storage (`@nestjs/throttler-storage-redis`)
- Add CSP headers to `next.config.js`
- Add structured logging with request IDs
- Run k6 load test (500 concurrent calendar-week requests)

### 4.5 Marketing pricing page fix

**Files:** `apps/web/src/app/(marketing)/pricing/page.tsx`

- Fetch plans from `GET /billing/plans` or hardcode to match `billing.constants.ts` ($7/$15/$29)
- Authenticated users: CTA → checkout/upgrade flow
- Unauthenticated: CTA → sign-up

---

## PHASE 5 — Competitive Moat

### 5.1 Transparent AI scheduling

- After plan generation, show "Why this slot?" tooltip per task
- Store reasoning in `planJson` metadata from planner services
- Display in plan review page

### 5.2 AIMemory

- Implement `AIMemory` model usage: store user overrides (rescheduled tasks, skipped tasks, preferred times)
- Feed into planner context in `plans.service.ts`
- Privacy: user can view/delete AI memories in settings

### 5.3 Referral program

- Generate invite codes from `InviteCode` model
- Referral tracking via `Referral` model
- UI: "Invite friends" in settings, reward = 1 month free or tier upgrade

---

## Verification checklist (run after each phase)

```bash
# Type checks
cd apps/api-gateway && npx tsc --noEmit
cd apps/graphql-gateway && npx tsc --noEmit
cd apps/web && npx tsc --noEmit

# Builds
cd apps/api-gateway && npm run build
cd apps/graphql-gateway && npm run build
cd apps/web && npm run build
```

### Manual test flows

- [ ] FREE user can upgrade to STARTER via Stripe checkout
- [ ] STARTER user sees "Upgrade to Pro" in settings, sidebar, header
- [ ] STARTER user can upgrade to PRO in-place (no Stripe redirect)
- [ ] PRO user sees "Upgrade to Premium" everywhere
- [ ] PREMIUM user sees no upgrade CTAs
- [ ] Google Calendar connect → events appear in week view
- [ ] Notification toggles persist across page reload
- [ ] Plan regenerate creates new plan without re-selecting goals
- [ ] Team creation works for PREMIUM tier
- [ ] Public booking page works without auth

---

## Implementation order (strict)

Do NOT skip ahead. Each item builds on the previous:

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 →
2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 →
3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 →
4.1 → 4.2 → 4.3 → 4.4 → 4.5 →
5.1 → 5.2 → 5.3
```

Start with **1.1 Billing management UI**. Read the files listed, understand existing patterns, then implement.

When you complete a phase item, briefly note what changed and move to the next. If a GraphQL operation or resolver is missing, add it in graphql-gateway before building the UI. If a REST endpoint is missing, add it in api-gateway first.

**Do not create documentation files unless asked.** The gap analysis doc already exists at `docs/GAP_ANALYSIS_2026.md`.
