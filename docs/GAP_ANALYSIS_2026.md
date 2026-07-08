# MicroPlanner — Full-Stack Gap Analysis (July 2026)

**Date:** 2026-07-07  
**Scope:** Entire monorepo — web, graphql-gateway, api-gateway, database, billing, competitive positioning  
**Method:** Codebase audit (3 parallel deep scans) + competitor research (Motion, Reclaim, Sunsama, Akiflow, TickTick, Todoist)

---

## Executive Summary

MicroPlanner has a **strong core product loop** shipped end-to-end: Clerk auth → onboarding → goals → AI weekly plans → tasks → calendar views → analytics → Stripe billing. The backend is **schema-heavy** — many enterprise features exist at the API/DB layer but have **no web UI**.

The biggest product gaps vs. category leaders are:

1. **Calendar sync UI** (Google/Outlook) — backend ready, frontend says "Coming soon"
2. **Native mobile + PWA offline** — responsive web only
3. **Third-party integrations** (Todoist, Linear, Slack, etc.) — backend skeleton, no UI
4. **Auto-rescheduling / focus-time defense** — partial backend (productivity module), no user-facing controls
5. **Team collaboration** — full backend, zero frontend
6. **Billing upgrade ladder UX** — was broken for STARTER→PRO and PRO→PREMIUM (fixed in this pass)

**Trust these docs in order:** `FINDINGS.md` → `PRODUCTION_READINESS.md` → `SECURITY_CHECKLIST.md` → this doc → older `GAP_ANALYSIS.md` / `FEATURE_ROADMAP.md` / `README.md` (stale).

---

## 1. Subscription Upgrade Path (Fixed)

### Root cause (pre-fix)

Backend supports full tier ladder **FREE → STARTER → PRO → PREMIUM** with Stripe in-place upgrades (`POST /billing/upgrade`). UI was gated to FREE/STARTER only in:

| Surface | File | Problem |
|---------|------|---------|
| Settings → Billing tab | `apps/web/src/app/(app)/settings/page.tsx` | `userTier === 'FREE'` only |
| Sidebar upgrade card | `apps/web/src/components/layout/app-sidebar.tsx` | `FREE \|\| STARTER` only |
| Header dropdown | `apps/web/src/components/layout/app-header.tsx` | `FREE \|\| STARTER` only |
| `/billing` page | `apps/web/src/app/(app)/billing/page.tsx` | ✅ Correct but not linked in nav |

Additionally, all upgrade buttons called `createCheckoutSession` even for existing subscribers. Backend `upgradeSubscription` existed but was **never wired in the frontend**.

### What was fixed

- All upgrade surfaces now use `getNextTier()` — shows next tier for any non-PREMIUM user
- `use-upgrade-checkout.ts` calls `upgradeSubscription` for active paid subscribers, `createCheckoutSession` for FREE users
- GraphQL resolver normalizes in-place upgrade response to `{ sessionId: 'upgraded', url: '' }`
- Settings billing tab links to `/billing` and shows Stripe portal for paid users
- Shared helpers in `apps/web/src/lib/upgrade.ts`: `getTierPrice`, `getUpgradePitch`

### Remaining billing gaps

| Item | Backend | GraphQL | Frontend | Priority |
|------|---------|---------|----------|----------|
| `upgradeSubscription` union return type | ✅ | ⚠️ Returns `CheckoutSession!` (normalized hack) | ✅ | P2 — proper union type |
| `cancelSubscription` / `resumeSubscription` | ✅ | ✅ | ❌ No UI | P1 |
| `usageStats` / usage meters | ✅ | ✅ | ❌ No UI | P1 |
| `billingInfo` (payment method, invoices) | ✅ | ✅ | ❌ No UI | P1 |
| `GET /billing/plans` pricing page sync | ✅ | ❌ | ⚠️ Hardcoded marketing prices | P2 |
| Pricing inconsistency across codebase | — | — | ⚠️ $7/$15/$29 vs marketing $8/$12/$18 | P2 |

---

## 2. Architecture Reality

```
┌─────────────────────────────────────────────────────────────┐
│  apps/web (Next.js 15) — ONLY talks to GraphQL, never REST  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Apollo Client (Clerk JWT)
┌──────────────────────────▼──────────────────────────────────┐
│  apps/graphql-gateway :4000/graphql                           │
│  15 resolver groups, DataLoaders, depth limit (8)           │
└──────────┬─────────────────────────────┬────────────────────┘
           │ REST proxy                  │ NestJS GQL proxy
┌──────────▼──────────┐    ┌────────────▼────────────────────┐
│  api-gateway :3001  │    │  api-gateway onboarding resolver │
│  /api/v1/*          │    │  (embedded GraphQLModule)        │
└──────────┬──────────┘    └─────────────────────────────────┘
           │
┌──────────▼──────────┐
│  PostgreSQL + Prisma │
│  ~40 models         │
└─────────────────────┘
```

**Not in repo (README claims otherwise):** `apps/mobile/`, `planning-service/` (Python). AI planning runs in-process in NestJS.

---

## 3. Feature Matrix — End-to-End Status

| Feature | REST | GraphQL | Web UI | Status |
|---------|------|---------|--------|--------|
| Auth (Clerk) | ✅ | ✅ syncUser | ✅ | **Complete** |
| Onboarding (5 steps) | ✅ Nest GQL | ✅ | ✅ | **Complete** |
| Goals CRUD + pause | ✅ | ✅ | ✅ | **Complete** |
| Tasks CRUD + bulk + deps + subtasks | ✅ | ✅ | ✅ | **Complete** |
| Recurring tasks | ✅ expand | ✅ | ⚠️ Create only, no edit | **Partial** |
| Tags | ✅ schema | ✅ filter | ⚠️ Filter/display, no input | **Partial** |
| Time tracking (timer) | ✅ | ✅ | ⚠️ Today page only | **Partial** |
| AI weekly plans | ✅ | ✅ | ✅ generate/accept/review | **Complete** |
| Plan regenerate | ✅ `POST /plans/:id/regenerate` | ❌ | ❌ Navigates to generate page | **Broken wiring** |
| Plan templates | ✅ full CRUD | ✅ partial | ❌ No UI | **Backend only** |
| Plan automation (cron) | ✅ | ❌ | ❌ No UI | **Backend only** |
| Calendar views (day/week/month) | — | — | ✅ DnD | **Complete** |
| Google/Outlook calendar sync | ✅ | ✅ | ❌ "Coming soon" | **Backend only** |
| Busy slots / calendar-aware planning | ✅ | ✅ | ❌ | **Backend only** |
| Analytics dashboard | ✅ | ✅ dashboardStats | ✅ client charts | **Partial** |
| Pattern recognition / insights | ✅ | ✅ | ❌ | **Backend only** |
| Productivity (focus time, kanban, etc.) | ✅ | ✅ | ❌ | **Backend only** |
| In-app notifications | ✅ | ✅ | ✅ poll 5min | **Partial** |
| Email notifications (Resend) | ✅ cron | — | ⚠️ Settings toggles wrong backend | **Partial** |
| Push notifications | schema only | — | ❌ | **Missing** |
| Billing checkout + portal | ✅ | ✅ | ✅ | **Complete** |
| Billing upgrade ladder | ✅ | ✅ | ✅ (fixed) | **Complete** |
| Teams / API keys | ✅ | ✅ | ❌ | **Backend only** |
| Scheduling links (Calendly-like) | ✅ | ✅ | ❌ No `/book` route | **Backend only** |
| Integrations (Slack, Zoom, etc.) | ✅ | ✅ | ❌ placeholder page | **Backend only** |
| Projects / Kanban | ✅ | ✅ | ❌ | **Backend only** |
| Search | ✅ `?search=` | ✅ | ✅ | **Complete** |
| Command palette (⌘K) | — | — | ✅ | **Complete** |
| Keyboard shortcuts | — | — | ✅ | **Complete** |
| Data export | ✅ GDPR endpoint | — | ⚠️ Client-side only | **Partial** |
| Account deletion | ✅ GDPR cascade | — | ⚠️ Clerk only, not backend | **Partial** |
| PWA / offline | — | — | manifest only | **Missing** |
| Native mobile | — | — | ❌ | **Missing** |
| Real-time GraphQL subscriptions | — | ✅ schema | ❌ hooks exist, never mounted | **Backend only** |
| Referrals / invite codes | schema | — | ❌ | **Missing** |

---

## 4. API ↔ Frontend Wiring Gaps

### 4a. REST endpoints with NO frontend wiring

**High-impact (user-facing features):**

```
Plans:
  POST /plans/:id/regenerate
  POST /plans/automation/*
  GET/POST/PUT/DELETE /plans/templates/*
  POST /plans/:id/save-as-template
  POST /plans/generate-from-template

Calendar:
  GET /calendar/oauth/google (+ callback)
  POST /calendar/sync, /calendar/sync-all
  GET /calendar/busy-slots
  POST/PUT/DELETE /calendar/events
  POST /calendar/auth/initiate

Productivity (entire module):
  /productivity/work-hours, /focus-time, /no-meeting-days
  /productivity/priority-hours, /calendar-defense
  /productivity/smart-1on1, /kanban, /score/*
  /productivity/notifications/preferences

Teams:
  /teams/* (full CRUD, members, invitations, api-keys)

Scheduling:
  /scheduling/links/*, /scheduling/bookings/*

Integrations:
  /integrations/*, /integrations/webhooks/*

Projects:
  /tasks/advanced/projects/*

Analytics:
  POST /analytics/events, GET /analytics/patterns
  POST /analytics/patterns/refresh, POST /analytics/aggregate

Billing:
  POST /billing/upgrade (now wired), POST /billing/resume
  POST /billing/cancel, PUT /billing/payment-method
  GET /billing/plans, GET /billing/usage
```

**Infrastructure (expected unexposed):** health probes, webhooks, public booking endpoints.

### 4b. GraphQL operations defined but NEVER called from web

**In `operations.ts`:**
- `GET_ME`, `CREATE_PLAN`, `CONNECT_CALENDAR`, `DISCONNECT_CALENDAR`, `SYNC_CALENDAR`
- All subscriptions: `TASK_*`, `GOAL_UPDATED`, `PLAN_GENERATED`

**In `operations-extended.ts` — hooks exist in `use-graphql-extended.tsx` but pages don't import them:**
- Dashboard: `upcomingTasks`, `recentActivity`, `weekOverview`, `quickActions`
- Analytics: `weeklyStats`, `productivityScores`, `insights`, `generateInsights`
- Productivity: work hours, focus blocks, kanban, smart 1:1, notification preferences
- Calendar: connections, events, busy slots, OAuth initiate
- Teams, Scheduling, Integrations, Webhooks: all
- Billing: `subscription`, `usageStats`, `cancelSubscription`, `resumeSubscription`, `updatePaymentMethod`, `canUseFeature`
- Projects: all

### 4c. Frontend calls to non-existent endpoints

**None found.** Web only calls GraphQL; all defined operations map to schema resolvers.

### 4d. Behavioral mismatches (broken wiring)

| Issue | Location | Problem |
|-------|----------|---------|
| Plan regenerate | `plans/review/page.tsx` | Navigates to `/plans/generate` instead of calling regenerate API |
| Notification prefs | `settings/page.tsx` | Saves to `updateUserSettings.notifications` but API only persists theme/energyPattern; real prefs at `/productivity/notifications/preferences` |
| Account deletion | `settings/page.tsx` | Calls Clerk `user.delete()` — doesn't call `DELETE /users/me` GDPR cascade |
| Data export | `settings/page.tsx` | Client-side CSV/JSON from fetched data — doesn't use `GET /users/me/export` |
| Marketing pricing | `pricing/page.tsx` | Hardcoded prices, all CTAs → `/sign-up` (no authenticated checkout) |

---

## 5. Competitive Analysis — What Leaders Have That We Don't

### Category: AI Calendar / Weekly Planning

| Capability | Motion | Reclaim | Sunsama | MicroPlanner |
|------------|--------|---------|---------|--------------|
| AI auto-scheduling | ✅ Core | ✅ Basic | ❌ Manual | ⚠️ Weekly plan only, not daily auto-reschedule |
| Calendar sync (Google/Outlook) | ✅ | ✅ | ✅ | ⚠️ Backend only |
| Focus time defense | ❌ | ✅ Core | Manual | ⚠️ Backend only |
| Daily planning ritual | ❌ | ❌ | ✅ Core | ⚠️ Today page, no guided ritual |
| Task import from PM tools | Limited | ✅ 10+ | ✅ 15+ | ❌ |
| Mobile app (iOS/Android) | ✅ | ✅ | ✅ | ❌ |
| Time tracking | ❌ | ✅ | ✅ | ⚠️ Timer on Today only |
| Team features | ✅ | ✅ | Limited | ⚠️ Backend only |
| Energy/chronotype aware | ❌ | ❌ | ❌ | ✅ Unique differentiator |
| Subtasks + dependencies | ✅ | ❌ | ❌ | ✅ |
| Shutdown ritual | ❌ | ❌ | ✅ | ❌ |
| Free tier | ❌ | ✅ | ❌ | ✅ |
| Price (individual) | $19-29/mo | $0-15/mo | $20-25/mo | $0-29/mo |

### Must-have to compete (table stakes)

| Feature | Priority | Our status |
|---------|----------|------------|
| Google Calendar two-way sync | P0 | Backend ✅, UI ❌ |
| Mobile-responsive (done) + native app | P0 | Responsive ✅, native ❌ |
| Daily/weekly auto-reschedule on conflict | P0 | ❌ |
| Focus time blocking | P0 | Backend only |
| At least 3 PM tool integrations (Todoist, Linear, Notion) | P1 | ❌ |
| Time tracking with reports | P1 | Partial |
| Email reminders | P1 | Backend only |
| Push notifications | P1 | ❌ |
| Plan templates UI | P1 | Backend only |
| Team workspaces (for Premium tier justification) | P1 | Backend only |

### Differentiators we already have (protect and market)

1. **Energy/chronotype-aware planning** — sleep intelligence in onboarding, energy patterns in settings
2. **AI tier ladder** — rule-based → GPT-4o-mini → Claude Sonnet by tier
3. **Goal-centric weekly planning** — not just task dumping
4. **Subtasks + dependencies** — Motion-level project structure
5. **Free tier with real value** — competitors mostly trial-only

### Differentiators to build (competitive moat)

1. **Transparent AI** — show why each task was scheduled (competitors are "black box")
2. **Workload limits / overcommit warnings** — Sunsama has this, we don't surface it
3. **Weekly review ritual** — guided retrospective with AI insights
4. **Pattern learning surfaced in UI** — backend `pattern-recognition.service.ts` exists, invisible to users

---

## 6. Production / Scale Gaps

From `FINDINGS.md` and `PRODUCTION_READINESS.md` (mostly fixed):

| Item | Status |
|------|--------|
| Rate limiting (per-user throttler) | ✅ Fixed |
| GraphQL depth limit | ✅ Fixed |
| Bounded task queries | ✅ Fixed |
| Refetch storms | ✅ Fixed |
| DB indexes | ⚠️ Migration written, not deployed |
| Redis throttler (multi-instance) | ❌ Deferred |
| CSP headers | ❌ Deferred |
| Load testing | ❌ Not run |
| Observability (request IDs, p95) | ❌ Missing |

---

## 7. Database — Schema vs Product

**40+ Prisma models.** Many are "future" entities with no service or UI:

| Model group | Used E2E | Backend only | Unused |
|-------------|----------|--------------|--------|
| User, Goal, Task, WeeklyPlan | ✅ | — | — |
| TaskDependency, Project | — | ✅ | — |
| PlanTemplate | — | ✅ | — |
| CalendarToken, SyncLog | — | ✅ | — |
| Team, TeamMember, ApiKey | — | ✅ | — |
| SchedulingLink, Booking | — | ✅ | — |
| Integration, Webhook | — | ✅ | — |
| WorkHours, FocusTimeBlock, KanbanBoard, etc. | — | ✅ | — |
| AIMemory | — | — | ✅ Post-MVP |
| Referral, InviteCode | — | — | ✅ |

---

## 8. Prioritized Implementation Roadmap

### Phase 1 — Revenue & Retention (2-3 weeks)

1. ✅ Fix upgrade ladder UI + in-place Stripe upgrades
2. Wire billing management UI: usage meters, cancel/resume, invoices
3. Google Calendar connect UI (OAuth flow exists in backend)
4. Fix notification preferences wiring (settings → correct backend)
5. Plan regenerate button → call API, not navigate
6. Email reminders (wire Resend + user prefs)

### Phase 2 — Competitive Parity (4-6 weeks)

7. Calendar two-way sync UI + busy-slot visualization in week view
8. Focus time blocking UI (productivity module)
9. Daily auto-reschedule on calendar conflict
10. Plan templates UI (create, save, apply, marketplace)
11. Time tracking in task detail + weekly reports
12. Guided daily planning ritual (Today page enhancement)
13. Weekly review flow with AI insights (surface pattern recognition)
14. Workload overcommit warnings

### Phase 3 — Premium Tier Value (4-6 weeks)

15. Team workspaces UI (members, invites, shared goals)
16. Scheduling links + public `/book/[slug]` pages
17. API keys management UI
18. Integrations hub (Todoist, Linear, Notion minimum)
19. Webhooks UI for Premium users
20. Projects + Kanban board UI

### Phase 4 — Scale & Mobile (6-8 weeks)

21. PWA with service worker + offline task cache
22. Push notifications (web + future native)
23. Native mobile app (Expo/React Native) — shared GraphQL client
24. Redis throttler + observability stack
25. Load test + index migration deploy
26. GDPR: wire backend delete/export from settings

### Phase 5 — Moat (ongoing)

27. Transparent AI scheduling explanations
28. AIMemory — learning from user overrides
29. Referral program
30. Marketing pricing page → authenticated checkout flow
31. Consolidate pricing across all surfaces

---

## 9. File Reference — Key Paths

```
Billing:
  apps/api-gateway/src/modules/billing/billing.service.ts
  apps/api-gateway/src/modules/billing/billing.constants.ts
  apps/web/src/lib/upgrade.ts
  apps/web/src/hooks/use-upgrade-checkout.ts
  apps/web/src/app/(app)/billing/page.tsx

Unwired hooks (enterprise):
  apps/web/src/hooks/use-graphql-extended.tsx
  apps/web/src/graphql/operations-extended.ts

Placeholder UI:
  apps/web/src/app/(app)/integrations/page.tsx

Backend-only features:
  apps/api-gateway/src/modules/calendar/
  apps/api-gateway/src/modules/productivity/
  apps/api-gateway/src/modules/scheduling/
  apps/api-gateway/src/modules/integrations/
  apps/api-gateway/src/modules/premium/
  apps/api-gateway/src/modules/plans/plan-templates.service.ts
  apps/api-gateway/src/modules/analytics/pattern-recognition.service.ts
```

---

## 10. Stale Docs to Update or Archive

| Doc | Issue |
|-----|-------|
| `README.md` | Claims mobile + Python planning-service exist |
| `docs/IMPLEMENTATION_STATUS.md` | Jan 2025, claims mobile MVP complete |
| `docs/GAP_ANALYSIS.md` | Nov 2025, says GraphQL 3/8 resolvers (now 15/15) |
| `docs/FEATURE_ROADMAP.md` | Says 35% complete — underestimate |
| `packages/config/src/index.ts` | Wrong tier prices + Stripe env var names |

---

*Generated from codebase audit on 2026-07-07. Companion doc: `IMPLEMENTATION_PROMPT.md`.*
