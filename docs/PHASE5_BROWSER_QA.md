# Phase 5 Browser QA — 2026-07-06

**Tester:** Fable (automated headed Microsoft Edge via Playwright, real Clerk session)
**Environment:** Production — Web on Vercel (`microplanner-web.vercel.app`), GraphQL on Render (`microplanner-graphql.onrender.com`), REST API on Render (`microplanner-v2-api.onrender.com`)
**Method:** Real browser click-through with DevTools instrumentation (console errors, failed/`graphql` network responses, page crashes captured on every route). Not curl-only.

---

## Executive summary

- **Routes tested:** 23/23 public + 17/17 app routes + onboarding (5 steps) + Stripe checkout & portal = **full matrix visited**.
- **Bug counts:** **P0: 3** · **P1: 6** · **P2: 8** · **P3: 6**
- **Product completeness verdict:** **Not yet sellable — needs a fix pass first.** The core loop (goal → generate plan → accept → tasks materialize → calendar → analytics) genuinely works end-to-end and billing is real and correct. But three P0s make the app crash or strand a real user: the Tasks/Week/Month views white-screen the moment a task exists, there is no working Sign Out button, and the logged-out marketing homepage is unreachable. These are small, well-localized fixes — the product is close, not far.
- **Owner action items (human-only):**
  1. Provision a **production Clerk instance** and set live keys on Vercel (currently dev keys in prod — usage-capped, shows "Development mode" to users).
  2. Decide Google Calendar story for launch: real OAuth or hide the connect affordances (currently a mock `authCode`).
  3. Fix DNS or remove links to `support.microplanner.com` (doesn't resolve).
  4. Confirm the fabricated marketing stats ("10K+ users", "95% satisfaction") should be replaced before sale.

---

## Test accounts used

| Account | Tier | Onboarding | Notes | Environment |
|---|---|---|---|---|
| `ethansouth321@gmail.com` | FREE → **STARTER** (upgraded via Stripe test checkout during this pass) | Completed full 5-step wizard during pass | Fresh Google account; synced to DB on first sign-in. Created 2 goals (hit FREE cap), several tasks, 2 draft plans (1 accepted). Timezone Africa/Casablanca (UTC+1). | Production |

> Note: the handoff named `abiroumohamed58@gmail.com` (FREE, onboarded) for Session 1, but the owner signed in with `ethansouth321@gmail.com` at the account picker — a brand-new user. This was actually higher-value: it exercised the **full onboarding wizard** and a **real FREE→STARTER upgrade**, which a pre-onboarded account could not.

---

## Bugs (ordered by severity)

### P0 — Blockers

- [ ] **Tasks / Week / Month views crash to error boundary whenever a task has no goal** — Routes: `/tasks`, `/week`, `/month` (and the task-detail modal on any page)
  - **Steps:** Create any task without a goal (e.g. quick-add with no goal, or a plan task) → open `/tasks`.
  - **Expected:** Task list renders.
  - **Actual:** White "Something went wrong" error boundary. Console: `TypeError: Cannot read properties of null (reading 'color')`. The page only rendered earlier because the task list was empty; the instant a task exists, `task.goal.color` dereferences a null `goal`.
  - **Root cause:** Many components read `task.goal.color` without null-guarding (`task-item.tsx:233`, `week-calendar.tsx:64`, `month-calendar.tsx:159/221/222/256/271`, `day-calendar.tsx:196/221`, `task-detail-modal.tsx:234`, `dashboard/page.tsx:219`, `search/page.tsx:194/318`, `plans/review/page.tsx:214/225`). `task-card.tsx:35` already does it right (`task.goal?.color`). A task's `goalId` is nullable in the schema, so `goal` can be null.
  - **Fix:** Make every `task.goal.color` (and `.emoji`/`.title`/`.id`) access optional-chained with a fallback color.

- [ ] **No working Sign Out** — Route: any app route, header user menu
  - **Steps:** Click avatar (top-right) → "Log out".
  - **Expected:** Session ends, redirect to sign-in.
  - **Actual:** Nothing. The `DropdownMenuItem` for "Log out" has **no `onSelect`/`onClick` handler** ([app-header.tsx:152-155](apps/web/src/components/layout/app-header.tsx#L152-L155)). Verified logout only works by calling `window.Clerk.signOut()` directly. A paying user cannot log out.
  - **Fix:** Wire the item to Clerk's `signOut()` (e.g. `const { signOut } = useClerk()` → `onSelect={() => signOut(() => router.push('/sign-in'))}`).

- [ ] **Logged-out marketing homepage is unreachable** — Route: `/` (and `/home`)
  - **Steps:** Visit `https://microplanner-web.vercel.app/` while logged out.
  - **Expected:** Marketing landing page.
  - **Actual:** `/` client-redirects guests to `/home` ([app/page.tsx:23](apps/web/src/app/page.tsx#L23)), but `/home` is **not** in the middleware's `isPublicRoute` list ([middleware.ts:7-23](apps/web/src/middleware.ts#L7-L23)), so it falls through to the default "require auth" branch and redirects to `/sign-in`. Every logged-out visitor lands on the sign-in form instead of the homepage — the top of the funnel is broken.
  - **Fix:** Add `'/home(.*)'` to `isPublicRoute`.

### P1 — Core feature broken / launch-blocking

- [ ] **Clerk running development keys in production** — every page
  - Console on every page: *"Clerk has been loaded with development keys… strict usage limits… should not be used when deploying to production."* The sign-in/sign-up widgets show an orange **"Development mode"** badge to real users. Dev instances are rate-limited and not for production. **Owner must create a production Clerk instance and set the live keys in Vercel.**

- [ ] **Settings save is completely broken (schema mismatch)** — Route: `/settings` (Profile + Notifications + Appearance tabs)
  - **Steps:** Change name/chronotype/timezone → "Save Changes"; or toggle any notification switch; or change theme.
  - **Actual:** `UpdateUserSettings` mutation rejected by the gateway — the client sends fields the input type doesn't define:
    - Profile: `Field "chronotype" is not defined by type "UpdateUserSettingsInput"` (and `timezone`).
    - Notifications: `emailNotifications`/`pushNotifications`/`weeklyPlanReminder`/`dailyTaskReminder` not defined — schema expects `planReminders`, `taskReminders`, and the fields nested differently.
    - Appearance: `Field "appearance" is not defined by type "UpdateUserSettingsInput"`.
  - Toast shows the raw GraphQL error to the user. **Nothing on the Settings page persists.** Verified name reverts to "Ethan" and timezone stays "Eastern Time (ET)" after refresh.
  - **Fix:** Align the web mutation variables + `NotificationSettingsInput` field names with the gateway schema (`UpdateUserSettingsInput`, `NotificationSettingsInput`).
  - Note: this contradicts the audit scripts passing — the audit validates *documents* against the schema, but these variable shapes are built at runtime, so a static document check doesn't catch the field mismatch.

- [ ] **Plan generation UI hangs forever on the spinner** — Route: `/plans/generate`
  - **Steps:** Select goals → customize → Generate Plan.
  - **Actual:** The "Generating Your Perfect Week" spinner runs indefinitely. Server-side the plan **is** created within ~180ms (verified: DRAFT plan, quality 81, rule-based), but the UI never advances to `/plans/review`. Root cause: `generating-step.tsx` uses a hardcoded `setTimeout(..., 8000)` then fires the mutation and calls `onComplete` only inside a fragile path; the redirect (`handlePlanGenerated`) didn't fire in testing. The mutation also carries `aiModel: 'claude-sonnet-3.5'` (a nonexistent model id) — harmless because the server falls back to rule-based, but misleading.
  - **Impact:** A user thinks generation failed and navigates away; the DRAFT plan is silently left behind. Verified the review page works if reached directly.
  - **Fix:** Drive the redirect off the mutation's resolved result (remove the 8s race), and fix the `aiModel` value.

- [ ] **`CreateTask` and `deleteTask`/`completeTask` return "Internal server error" from GraphQL despite succeeding** — Route: quick-add modal, task complete
  - **Steps:** Quick Add Task → Create Task.
  - **Actual:** Toast "Failed to create task" / GraphQL `Internal server error`. **But the task is actually created** (verified via REST `POST /api/v1/tasks` → 201, and the task appears in `tasks` query). Same pattern on `completeTask` and `deleteTask`: the mutation errors to the client but the DB write persists. REST layer is fine (201); the crash is in the **GraphQL gateway resolver's post-write path** — most likely `pubsub.publish(...)` when Redis pub/sub isn't configured on Render, since the resolver publishes `TASK_CREATED`/`TASK_UPDATED`/`TASK_DELETED` after the write (`task.resolver.ts:41,52,63`). The plan resolver, which does **not** publish, does not exhibit this.
  - **Impact:** Every task mutation shows the user a false failure and a scary error, then a stale UI (the optimistic path aborts). Combined with the P0 goal-color crash, task management appears broken even though the backend works.
  - **Fix:** Wrap `pubsub.publish` in a try/catch (or guard on `pubsub` being non-null) so a pub/sub failure never fails the mutation; confirm `REDIS_URL` is set on the Render gateway.

- [ ] **`isPaused` not accepted by `UpdateGoal` — goal pause/activate silently fails** — Route: `/goals`
  - **Steps:** Click "Pause" on a goal card.
  - **Actual:** GraphQL `property isPaused should not exist`. The card's Pause button never toggles (stays "Pause"). The web sends `isPaused` but the gateway `UpdateGoalInput` doesn't define it (likely wants `status`/`isActive`).
  - **Fix:** Align the pause mutation field with the schema.

- [ ] **Keyboard shortcuts are entirely non-functional** — global
  - The `?` dialog and command palette advertise single-key nav (T/D/W/M/G/P/A/S) and `N` for new task. None navigate. Root cause: `useGlobalKeyboardShortcuts()` builds the shortcut array but **is never passed to `useKeyboardShortcuts()`** anywhere in the app — the listener is never registered ([use-keyboard-shortcuts.tsx:55](apps/web/src/hooks/use-keyboard-shortcuts.tsx#L55)). Only `⌘K` (command palette, wired separately) and `?` (shortcuts dialog) work.
  - **Fix:** Call `useKeyboardShortcuts(useGlobalKeyboardShortcuts())` in the app shell.

### P2 — Wrong behavior / edge case

- [ ] **`manifest.json` 307-redirects to `/sign-in`** → console error `Manifest: Line: 1, column: 1, Syntax error.` on **every** page (logged in and out). The middleware matcher excludes `.js` but deliberately lets `.json` through (`js(?!on)`), so the PWA manifest request hits auth and gets HTML. Fix: exclude `/manifest.json` (or `.webmanifest`) from the matcher / mark public.

- [ ] **Command palette "Recent" items are hardcoded mock data** — `⌘K` shows "Career Growth" (Goal), "Morning workout" (Task), "Last Week's Plan" (Plan) for every user. Clicking "Career Growth" navigates to `/goals/1` → **404** (`command-palette.tsx:73-75`). "Morning workout" just `console.log('Open task')`. These are dead/mock affordances shipped to users.

- [ ] **Google/Outlook/Apple calendar "Connect" is a mock** — `/integrations` "Connect" calls `connectCalendar` with a hardcoded `authCode: 'mock-auth-code'` ([integrations/page.tsx:66](apps/web/src/app/(app)/integrations/page.tsx#L66)) — no real OAuth redirect. Also inconsistent: the `/integrations` page presents all three as connectable, while **Settings → Integrations** labels all three "PRO Feature". Neither actually connects. Decide one story and hide the rest.

- [ ] **`support.microplanner.com` does not resolve (DNS)** — linked as `https://support.microplanner.com/tickets` from Help/Support pages. Dead external link.

- [ ] **Marketing header has no mobile menu** — at 375px only the logo + "Get Started Free" CTA render; all nav links (Features/Pricing/About/…) are unreachable on phones. No hamburger in `components/marketing/page-template.tsx`.

- [ ] **App sidebar is expanded by default on mobile, squishing content** — at 375px the full sidebar occupies most of the viewport; the main content is a narrow strip and pages read as "Loading…" with no room. There is a collapse chevron, but the default state should be collapsed/overlay on mobile.

- [ ] **Fabricated social proof / unbuilt-feature claims on auth + marketing** — sign-up page: "10K+ Active Users / 50K+ Plans Generated / 95% Satisfaction" (DB has a handful of users) and "Calendar sync with Google, Outlook & Apple" (only Google is even stubbed, and that's a mock). Honesty risk for a sellable product.

- [ ] **Currency shows MAD in Stripe checkout** — checkout renders "68,15 MAD pro Monat" (≈$7 at the shown FX) with a German locale, because Stripe geolocated the test session to Morocco. Functionally correct (charged as USD-equivalent) but a US buyer expects "$7.00/month". Consider pinning `currency`/`locale` on the Checkout Session.

### P3 — Polish

- [ ] Apollo Client logs a deprecation warning on every page load (~75×): `connectToDevTools` → use `devtools.enabled` (`providers.tsx`).
- [ ] Slight horizontal overflow (`scrollWidth > clientWidth`) at 375px on `/pricing`, `/features`, and app `/day`, `/settings`, `/plans/generate`.
- [ ] All marketing pages share one generic `<title>` ("MicroPlanner - AI-Powered Weekly Planning") — no per-page titles for SEO/tabs (except auth pages, which are correct).
- [ ] Radix `DialogContent` a11y warnings: "requires a `DialogTitle`" / "Missing `Description` or `aria-describedby`" (seen when the command palette opens).
- [ ] React "Minified error #185" (setState on unmounted / update loop) thrown alongside the goal-color crash on `/week` — will likely vanish once the P0 null-guard lands, but worth confirming.
- [ ] Onboarding "Skip for now" on step 4 (wake time) — Continue is disabled until a wake time is chosen; the skip affordance exists but the flow still effectively requires it. Minor.

---

## Feature gaps (must exist for a sellable v1)

1. **Settings must actually persist.** Right now zero settings save (P1). A planner that can't store your timezone/chronotype/work-hours/notification prefs isn't shippable.
2. **Working sign out** (P0).
3. **Real notification data plumbing** — the notifications center and `/notifications` page render "No notifications / all caught up" (honest empty state, good), but there was no path observed to generate an in-app notification, so this is unverified beyond empty.
4. **Google Calendar**: either a real OAuth connect or removal. Half-mocked is worse than absent for a buyer.
5. **A functioning task-management surface** — blocked today by the P0 goal-color crash + the false-error task mutations (P1).

---

## UX friction (not bugs, but hurts real users)

- The plan-generation "AI is thinking…" screen is theater: it always waits a fixed 8s with fake stage labels ("Applying AI intelligence…") even though generation is instant and rule-based on FREE/STARTER. Combined with the hang bug, it actively misleads.
- After a plan is accepted, there's no clear confirmation/redirect into the week view — the user is left on the review page.
- Tier limit messaging is good on goals ("Goal limit reached (2 for FREE tier). Upgrade to create more goals.") but the task false-error swamps any real limit messaging on tasks.
- Mobile app shell (sidebar-over-content) makes the product feel broken on a phone even though desktop is polished.

## Dead ends inventory

| Affordance | Location | Result |
|---|---|---|
| "Log out" | Header user menu | No handler — does nothing (P0) |
| Single-key shortcuts (T/D/W/M/G/P/A/S, N) | Global | Not wired — do nothing (P1) |
| "Career Growth" recent item | ⌘K palette | → `/goals/1` → 404 |
| "Morning workout" recent item | ⌘K palette | `console.log` only |
| "Last Week's Plan" recent item | ⌘K palette | → `/plans/1` (mock id) |
| "Quick Complete Task" (C) | ⌘K palette | Opens dialog with a11y warnings; no completion |
| Google/Outlook/Apple "Connect" | `/integrations` | Mock `authCode`, no OAuth |
| `support.microplanner.com/tickets` | Help/Support | DNS does not resolve |
| Marketing nav links at 375px | Marketing header | No mobile menu; unreachable |
| Settings "Save Changes" / toggles | `/settings` | Schema mismatch, never persists |

## Console / GraphQL error log (aggregate, recurring)

**Prod-config issues (not code bugs):**
- Clerk dev keys in production (every page). — *env/config*
- `manifest.json` → 307 → HTML → "Manifest syntax error" (every page). — *middleware matcher*

**Code bugs:**
- `TypeError: Cannot read properties of null (reading 'color')` — Tasks/Week/Month/detail modal (P0).
- GraphQL `Internal server error` on `createTask`/`completeTask`/`deleteTask` (write succeeds; post-write pub/sub crash) (P1).
- GraphQL `Field "chronotype"/"timezone"/"appearance"/... is not defined by type "UpdateUserSettingsInput"` — all Settings saves (P1).
- GraphQL `property isPaused should not exist` — goal pause (P1).
- React Minified #185 on `/week` (P3, likely secondary to the null-color crash).

**Benign:** Apollo `connectToDevTools` deprecation; Radix Dialog a11y warnings.

---

## Pass checklist

- [x] Marketing public pages — 23/23 load 200, real content, no 404s/failed requests (but `/` funnel broken, P0)
- [x] Auth (sign-in ✓, sign-up page ✓, **sign-out broken** P0)
- [x] Onboarding (all 5 steps: context → goal → focus areas → sleep/wake → completion; back button + selection retention + refresh-persistence tested — wizard is solid)
- [x] App shell (sidebar ✓, header ✓, notifications bell ✓ empty state, command palette ✓ nav works / recent items mock, tier badge ✓ updates FREE→Starter)
- [x] Dashboard / Today / Day / Week / Month (Today/Day/Dashboard ✓; **Week/Month crash on goal-less tasks** P0)
- [x] Goals + create goal (create ✓, FREE cap-of-2 enforced with good message ✓, **pause broken** P1, goal card → `/goals/{id}` 404 P2)
- [x] Tasks (create works server-side but **shows false error** P1; list **crashes** P0; complete/delete same false-error pattern)
- [x] Plans (list ✓ honest empty state; generate **UI hangs** P1 though server succeeds; review page ✓ quality score; accept → **tasks materialize verified** ✓)
- [x] Search (works well — real results across tasks/goals/plans with counts and tabs)
- [x] Analytics (real data, honest empty/loading states, completion rate/streak/time — no fake data ✓)
- [x] Settings (every tab visited; **no tab persists** P1)
- [x] Integrations (Google/Outlook/Apple present but **mock connect** P2)
- [x] Billing / upgrade (**real Stripe test checkout FREE→STARTER ✓**, tier badge + AI-model label update ✓, portal ✓, period-end cancel ✓, resume ✓, `/billing` route exists ✓)
- [x] Notifications page + center (both render honest empty state; no data path exercised)
- [x] Keyboard shortcuts (**not wired** P1; only ⌘K + ? work)
- [x] Mobile viewport 375px (marketing: no menu P2; app: sidebar-over-content P2; some h-scroll P3; no crashes)
- [x] Tier limits surfaced (goals ✓; upgrade prompts present throughout)

---

## Product verdict (BUYER_GUIDE §1)

**Would a paying user understand the product in 5 minutes?** Yes on desktop — the onboarding wizard is genuinely good (context → first goal "aha" → focus areas → chronotype-based sleep schedule → summary), and the dashboard communicates the value immediately. On mobile, the sidebar-over-content shell makes it feel broken.

**Is the core loop complete?** Structurally yes, and I verified it end-to-end at the data layer: goal → generate plan (rule-based, quality 81) → accept → **tasks materialized onto the week** → analytics reflect 1/9 completed, streak, time. But two P0/P1s (goal-color crash on the Tasks/Week/Month surfaces, false-error task mutations) mean a real user *clicking through* hits a wall the moment they have real data.

**What's missing for "sellable v1":** (1) the 3 P0s, (2) Settings persistence, (3) the task-mutation false-error, (4) plan-gen redirect, (5) production Clerk keys, (6) an honest Google Calendar story. All are small, localized fixes — mostly null-guards, wiring one hook, a try/catch around pub/sub, and aligning ~3 mutation input shapes with the schema.

**What's comfortably good enough:** Billing (real, correct, full lifecycle: checkout/portal/cancel/resume, tier gating, model labels). Onboarding. Search. Analytics honesty. Marketing content quality. Plan generation *engine* and materialization. Auth protection (once signed out, middleware guards every protected route).

**Bottom line:** This is a ~1–2 day fix pass from being demoable without hitting a crash, not a rebuild. The backend is in much better shape than the frontend wiring.

---

## Recommended fix order (for implementation pass)

1. **P0 — Null-guard `task.goal` everywhere** (`task.goal?.color` + fallback). Unblocks `/tasks`, `/week`, `/month`, task-detail modal, dashboard, search, plans/review. Files listed in the P0 entry.
2. **P0 — Wire Sign Out** — `app-header.tsx:152` → `useClerk().signOut()`.
3. **P0 — Add `/home(.*)` to `isPublicRoute`** — `middleware.ts`.
4. **P1 — Guard `pubsub.publish` in try/catch** (or null-check) across `task.resolver.ts` (and confirm `REDIS_URL` on Render) — kills the false "Internal server error" on task create/complete/delete.
5. **P1 — Align Settings mutations to schema** — `UpdateUserSettingsInput` / `NotificationSettingsInput` field names (`chronotype`/`timezone`/`appearance`/`planReminders`/`taskReminders`). Files: web settings tab components + `operations.ts`.
6. **P1 — Fix plan-gen redirect** — `generating-step.tsx`: drive `onComplete` off the resolved mutation, drop the 8s race, fix `aiModel` id.
7. **P1 — Fix goal pause** — align `isPaused` with `UpdateGoalInput`.
8. **P1 — Register keyboard shortcuts** — `useKeyboardShortcuts(useGlobalKeyboardShortcuts())` in the app shell.
9. **P2 — Config/content:** production Clerk keys (owner); exclude `manifest.json` from middleware; replace/remove ⌘K mock recents; decide Google Calendar (real OAuth or hide); fix/remove `support.microplanner.com`; marketing mobile menu; mobile sidebar default-collapsed; replace fabricated stats.
10. **P3 — Polish:** Apollo `devtools.enabled`; per-page `<title>`; Dialog a11y title/description; horizontal-overflow trims.

---

### Re-run instructions
Regression net (must stay green): `node scripts/audit-contracts.mjs && node scripts/audit-operations.mjs` — both passed this session (195 REST routes matched, 100 GraphQL documents valid). Note these do **not** catch the runtime variable-shape mismatches in Settings (P1) — consider a smoke test that executes the real mutations.
