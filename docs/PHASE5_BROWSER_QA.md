# Phase 5 Browser QA — 2026-07-06

**Tester:** Fable (automated headed Microsoft Edge via Playwright, real Clerk session)
**Environment:** Production — Web on Vercel (`microplanner-web.vercel.app`), GraphQL on Render (`microplanner-graphql.onrender.com`), REST API on Render (`microplanner-v2-api.onrender.com`)
**Method:** Real browser click-through with DevTools instrumentation (console errors, failed/`graphql` network responses, page crashes captured on every route). Not curl-only.

---

## Executive summary

- **Routes tested:** 23/23 public + 17/17 app routes + onboarding (5 steps) + Stripe checkout & portal = **full matrix visited**.
- **Bug counts:** **P0: 3** · **P1: 9** · **P2: 9** · **P3: 6** *(updated 2026-07-06 — owner-reported task CRUD + calendar interactions)*
- **Product completeness verdict:** **Not yet sellable — needs a fix pass first.** The core loop (goal → generate plan → accept → tasks materialize → calendar → analytics) genuinely works end-to-end and billing is real and correct. But three P0s make the app crash or strand a real user: the Tasks/Week/Month views white-screen the moment a task exists, there is no working Sign Out button, and the logged-out marketing homepage is unreachable. **Additionally, the entire task-management surface (edit, complete, delete, subtasks, dependencies, week drag-and-drop) is UI-complete but handler-incomplete** — users see success toasts while the calendar does not change. These are localized wiring fixes, not a rebuild.
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

- [x] **Tasks / Week / Month views crash to error boundary whenever a task has no goal** — Routes: `/tasks`, `/week`, `/month` (and the task-detail modal on any page)
  - **FIXED (step 1):** null-guarded every unguarded `task.goal.color/emoji/title` with optional chaining + `#94a3b8`/`📌`/`No goal` fallbacks. Files: `week-calendar.tsx`, `month-calendar.tsx`, `day-calendar.tsx`, `week-calendar-dnd.tsx`, `resizable-task-card.tsx`, `task-detail-modal.tsx`, `plans/review/page.tsx`. (dashboard/search/task-item/task-card were already `{task.goal && …}` guarded.) Typecheck + build green.
  - **Steps:** Create any task without a goal (e.g. quick-add with no goal, or a plan task) → open `/tasks`.
  - **Expected:** Task list renders.
  - **Actual:** White "Something went wrong" error boundary. Console: `TypeError: Cannot read properties of null (reading 'color')`. The page only rendered earlier because the task list was empty; the instant a task exists, `task.goal.color` dereferences a null `goal`.
  - **Root cause:** Many components read `task.goal.color` without null-guarding (`task-item.tsx:233`, `week-calendar.tsx:64`, `month-calendar.tsx:159/221/222/256/271`, `day-calendar.tsx:196/221`, `task-detail-modal.tsx:234`, `dashboard/page.tsx:219`, `search/page.tsx:194/318`, `plans/review/page.tsx:214/225`). `task-card.tsx:35` already does it right (`task.goal?.color`). A task's `goalId` is nullable in the schema, so `goal` can be null.
  - **Fix:** Make every `task.goal.color` (and `.emoji`/`.title`/`.id`) access optional-chained with a fallback color.

- [x] **No working Sign Out** — Route: any app route, header user menu
  - **FIXED (step 2):** `app-header.tsx` now `const { signOut } = useClerk()` + `onSelect={() => signOut(() => router.push('/sign-in'))}`. Also wired "Help & Support" → `/help` (was a dead item).
  - **Steps:** Click avatar (top-right) → "Log out".
  - **Expected:** Session ends, redirect to sign-in.
  - **Actual:** Nothing. The `DropdownMenuItem` for "Log out" has **no `onSelect`/`onClick` handler** ([app-header.tsx:152-155](apps/web/src/components/layout/app-header.tsx#L152-L155)). Verified logout only works by calling `window.Clerk.signOut()` directly. A paying user cannot log out.
  - **Fix:** Wire the item to Clerk's `signOut()` (e.g. `const { signOut } = useClerk()` → `onSelect={() => signOut(() => router.push('/sign-in'))}`).

- [x] **Logged-out marketing homepage is unreachable** — Route: `/` (and `/home`)
  - **FIXED (step 3):** added `'/home(.*)'` to `isPublicRoute` in `middleware.ts`.
  - **Steps:** Visit `https://microplanner-web.vercel.app/` while logged out.
  - **Expected:** Marketing landing page.
  - **Actual:** `/` client-redirects guests to `/home` ([app/page.tsx:23](apps/web/src/app/page.tsx#L23)), but `/home` is **not** in the middleware's `isPublicRoute` list ([middleware.ts:7-23](apps/web/src/middleware.ts#L7-L23)), so it falls through to the default "require auth" branch and redirects to `/sign-in`. Every logged-out visitor lands on the sign-in form instead of the homepage — the top of the funnel is broken.
  - **Fix:** Add `'/home(.*)'` to `isPublicRoute`.

### P1 — Core feature broken / launch-blocking

- [ ] **Clerk running development keys in production** — every page
  - Console on every page: *"Clerk has been loaded with development keys… strict usage limits… should not be used when deploying to production."* The sign-in/sign-up widgets show an orange **"Development mode"** badge to real users. Dev instances are rate-limited and not for production. **Owner must create a production Clerk instance and set the live keys in Vercel.**

- [x] **Settings save is completely broken (schema mismatch)** — Route: `/settings` (Profile + Notifications + Appearance tabs)
  - **FIXED (P1-8):** aligned web mutations to schema. `GET_USER_SETTINGS` now reads `timezone`/`energyPattern`/real notification fields; added `UPDATE_USER_PROFILE`. Profile save → `updateUserProfile` (name+timezone) + `updateUserSettings` (chronotype↔`energyPattern` map). Notifications use `email/planReminders/taskReminders/goalMilestones/productivityInsights`. Theme → `theme` enum + applied live via `next-themes`. Removed dead push/compact toggles (no backing field). All hooks refetch `GET_USER_SETTINGS`. Operations audit still 0-invalid.
  - **Steps:** Change name/chronotype/timezone → "Save Changes"; or toggle any notification switch; or change theme.
  - **Actual:** `UpdateUserSettings` mutation rejected by the gateway — the client sends fields the input type doesn't define:
    - Profile: `Field "chronotype" is not defined by type "UpdateUserSettingsInput"` (and `timezone`).
    - Notifications: `emailNotifications`/`pushNotifications`/`weeklyPlanReminder`/`dailyTaskReminder` not defined — schema expects `planReminders`, `taskReminders`, and the fields nested differently.
    - Appearance: `Field "appearance" is not defined by type "UpdateUserSettingsInput"`.
  - Toast shows the raw GraphQL error to the user. **Nothing on the Settings page persists.** Verified name reverts to "Ethan" and timezone stays "Eastern Time (ET)" after refresh.
  - **Fix:** Align the web mutation variables + `NotificationSettingsInput` field names with the gateway schema (`UpdateUserSettingsInput`, `NotificationSettingsInput`).
  - Note: this contradicts the audit scripts passing — the audit validates *documents* against the schema, but these variable shapes are built at runtime, so a static document check doesn't catch the field mismatch.

- [x] **Plan generation UI hangs forever on the spinner** — Route: `/plans/generate`
  - **FIXED (P1-9):** `generating-step.tsx` now fires the mutation on mount and redirects off the **resolved result** (no 8s race); progress creeps to 90% and snaps to 100% on success; `onError` returns to the customize step. Removed the bogus `aiModel: 'claude-sonnet-3.5'` from the client (server selects model by tier) and removed the PRO/PREMIUM "AI model chooser" in `customize-preferences-step.tsx` (it was decorative — server ignores it) in favor of a read-only "included with your tier" note.
  - **Steps:** Select goals → customize → Generate Plan.
  - **Actual:** The "Generating Your Perfect Week" spinner runs indefinitely. Server-side the plan **is** created within ~180ms (verified: DRAFT plan, quality 81, rule-based), but the UI never advances to `/plans/review`. Root cause: `generating-step.tsx` uses a hardcoded `setTimeout(..., 8000)` then fires the mutation and calls `onComplete` only inside a fragile path; the redirect (`handlePlanGenerated`) didn't fire in testing. The mutation also carries `aiModel: 'claude-sonnet-3.5'` (a nonexistent model id) — harmless because the server falls back to rule-based, but misleading.
  - **Impact:** A user thinks generation failed and navigates away; the DRAFT plan is silently left behind. Verified the review page works if reached directly.
  - **Fix:** Drive the redirect off the mutation's resolved result (remove the 8s race), and fix the `aiModel` value.

- [x] **`CreateTask` / `updateTask` / `completeTask` / `uncompleteTask` / `deleteTask` return "Internal server error" from GraphQL despite succeeding** — Routes: quick-add modal, task detail modal, week reschedule, bulk actions
  - **FIXED (step 4):** wrapped the gateway `pubsub` in a safe context-level facade in `graphql-gateway/src/index.ts` — `publish` no-ops when Redis is absent and swallows/logs any publish error, so a pub/sub failure can never fail a mutation whose DB write already succeeded. Covers task/project/productivity resolvers with one guard. `asyncIterator` returns an empty stream when Redis is absent (subscriptions idle instead of throwing). Also fixed the `createSubtask` resolver arg mismatch (schema is `input`-only; it destructured a non-existent `parentId` → `parentTaskId` now read from `input`). `REDIS_URL` noted for owner in deploy checklist.
  - **Steps:** Create, edit, complete, uncomplete, or delete a task from any surface.
  - **Actual:** Toast "Failed…" / GraphQL `Internal server error`. **But the DB write often persists** (verified for create/complete/delete via REST). Root cause: **GraphQL gateway resolver `pubsub.publish` throws** when Redis/pubsub isn't configured on Render (`task.resolver.ts` publishes `TASK_CREATED`/`TASK_UPDATED`/`TASK_DELETED` after every write). Plan resolver (no publish) does not exhibit this.
  - **Impact:** User sees failure + **stale calendar** (mutation error aborts `refetch()` in page handlers). Combined with unwired modal handlers (next P1), task management appears fully broken.
  - **Fix:** Wrap `pubsub.publish` in try/catch (or null-guard `pubsub`); set `REDIS_URL` on Render graphql-gateway; ensure every page handler **always `refetch()` in `finally`** even on mutation error if REST write may have succeeded.

- [x] **Task detail modal — full CRUD is decorative on all calendar/list routes** — Routes: `/tasks`, `/day`, `/week`, `/month`, `/today` (task detail modal)
  - **FIXED (step 5):** new shared `useTaskDetailActions(tasks, refetch)` hook wires `onUpdate`→`updateTask`, `onDelete`, `onToggleComplete` (complete/uncomplete by current state), `onAddSubtask`/`onToggleSubtask`/`onDeleteSubtask`, `onAddDependency`/`onRemoveDependency`. Spread into `<TaskDetailModal {...taskActions} />` on all 5 pages; each page also passes `goals`, `allTasks`, and mapped `dependencies` (new `mapTaskDependencies()` converts GraphQL `dependentTaskId`/`blockingTaskId` → the lib's `fromTaskId`/`toTaskId`). Pages now derive the open task from the live list (by id) so it reflects refetches. Hooks used by the modal are called in `notify:false` mode so the modal/panels own the toasts (no double-toast). **Code-complete + typecheck/build/audits green; browser-verify pending (see checklist).**
  - **Steps:** Open any task → try Edit & Save, Mark Complete / Incomplete, Delete, add subtask, add dependency.
  - **Expected:** Mutation runs → modal/calendar reflect change immediately.
  - **Actual (owner-verified + code audit):**
    - **Edit:** Shows "Task updated successfully!" toast but **nothing changes** on calendar or in modal. Every page passes `onUpdate={async () => { await refetch(); }}` — **ignores `(taskId, updates)`** so `updateTask` is never called (`tasks/page.tsx:274-276`, same pattern in `week/page.tsx`, `day/page.tsx`, `month/page.tsx`, `today/page.tsx`).
    - **Mark complete / uncomplete:** `onToggleComplete` **not passed** — button calls optional callback → no-op; toast may still fire from modal's internal success path without mutation.
    - **Delete:** `onDelete` **not passed** — delete confirm does nothing useful.
    - **Subtasks:** `onAddSubtask` / `onToggleSubtask` / `onDeleteSubtask` **not passed** — subtask panel UI renders but mutations never fire (`task-detail-modal.tsx` → `TaskSubtasksPanel`; hooks exist: `useCreateSubtask`, etc. in `use-graphql.tsx`).
    - **Dependencies:** `onAddDependency` / `onRemoveDependency` **not passed** — panel uses **no-op fallback** `onAddDependency || (async () => {})` (`task-detail-modal.tsx:467-468`). Add/remove dependency buttons do nothing.
  - **Fix:** Create a shared `useTaskDetailActions()` hook wiring `useUpdateTask`, `useDeleteTask`, `useCompleteTask`, `useUncompleteTask`, subtask + dependency mutations, and `refetch`. Pass **all** callbacks into `TaskDetailModal` on every page that renders it. Map `onUpdate(taskId, updates)` → `updateTask({ variables: { id, input: updates } })`.

- [x] **Week view drag-and-drop — broken drag ghost + unreliable reschedule** — Route: `/week`
  - **FIXED (step 6):** `week-calendar-dnd.tsx` no longer overrides the library's positioning during drag. The draggable applies `absolute left-1 right-1 top:4px` **only when NOT dragging**; while dragging it uses `provided.draggableProps.style` verbatim (the library's `position: fixed` + transform), so the ghost stays under the cursor. Removed the `rotate-2 scale-105` Tailwind transforms that fought the library's `translate`. Droppable slots already have `position: relative`. `week/page.tsx` reschedule now `refetch()`s in `finally` and re-throws so the optimistic update rolls back on real error. **Code-complete; browser-verify pending.**
  - **Steps:** Grab a task card in the week grid → drag to another day/time slot → release.
  - **Expected:** Card drags smoothly within the grid; on drop, task moves to new slot and calendar updates.
  - **Actual (owner-verified):** On drag start, the task card **jumps to the top of the page** and renders broken (mispositioned drag preview). `@hello-pangea/dnd` uses `position: fixed` for the dragging element while task cards use `position: absolute; top: 4px` inside scroll containers (`week-calendar-dnd.tsx:254-265`) — classic portal/overflow/positioning conflict. Reschedule handler exists (`week/page.tsx:39-54` → `updateTask`) but user may see success toast with **no visible calendar move** when mutation false-errors (pub/sub P1 above) or refetch skipped.
  - **Fix:** Fix DnD container styles (ensure droppable slots have `position: relative`, use `DragDropContext` `onDragUpdate` if needed, consider `position: static` during drag per hello-pangea docs); after drop, optimistic UI update + `refetch()` in `finally`; verify `scheduledDate` + `startTime` input shapes match `UpdateTaskInput`.

- [x] **Calendar views do not refresh after successful task mutations** — Routes: `/day`, `/week`, `/month`, `/tasks`
  - **FIXED (step 7):** every task/subtask/dependency mutation hook now uses `refetchQueries: ['GetTasks']` (by operation **name**, so it refreshes every active tasks query regardless of filter/sort variables — day uses `{scheduledDate}`, others `{}`) plus `awaitRefetchQueries: true`, so the calendar/list updates without a full reload.
  - **Steps:** Perform any task mutation that succeeds server-side (or shows success toast).
  - **Actual:** Task remains in old slot / old completion state until full page refresh. Page handlers call `refetch()` only on happy path; combined with false GraphQL errors and unwired modal callbacks, **UI is always stale**.
  - **Fix:** Centralize task mutation + cache update: `refetchQueries: [GET_TASKS]` on all task mutations; Apollo cache eviction; or shared `useTaskMutations` that always refetches parent view.

- [x] **`isPaused` not accepted by `UpdateGoal` — goal pause/activate silently fails** — Route: `/goals`
  - **FIXED (P1-10):** the gateway datasource `updateGoal` now routes `isPaused` to the dedicated `PUT /goals/:id/pause` / `/activate` REST endpoints (the generic `PUT /goals/:id` rejects `isPaused` via `forbidNonWhitelisted`), applying any remaining editable fields separately. `pauseGoal`/`resumeGoal` extract `.goal`. Web `UPDATE_GOAL` now selects `isActive/isPaused/pausedUntil` and refetches `GET_GOALS`. Also added the missing `/goals/[id]` detail route so goal cards no longer 404 (was P2 bonus).
  - **Steps:** Click "Pause" on a goal card.
  - **Actual:** GraphQL `property isPaused should not exist`. The card's Pause button never toggles (stays "Pause"). The web sends `isPaused` but the gateway `UpdateGoalInput` doesn't define it (likely wants `status`/`isActive`).
  - **Fix:** Align the pause mutation field with the schema.

- [x] **Keyboard shortcuts are entirely non-functional** — global
  - **FIXED (P1-11):** `useKeyboardShortcuts(useGlobalKeyboardShortcuts())` is now called in the app shell (`(app)/layout.tsx`), registering the T/D/W/M/G/P/A/S nav, N (new task), and ? shortcuts.
  - The `?` dialog and command palette advertise single-key nav (T/D/W/M/G/P/A/S) and `N` for new task. None navigate. Root cause: `useGlobalKeyboardShortcuts()` builds the shortcut array but **is never passed to `useKeyboardShortcuts()`** anywhere in the app — the listener is never registered ([use-keyboard-shortcuts.tsx:55](apps/web/src/hooks/use-keyboard-shortcuts.tsx#L55)). Only `⌘K` (command palette, wired separately) and `?` (shortcuts dialog) work.

### P2 — Wrong behavior / edge case

- [ ] **`manifest.json` 307-redirects to `/sign-in`** → console error `Manifest: Line: 1, column: 1, Syntax error.` on **every** page (logged in and out). The middleware matcher excludes `.js` but deliberately lets `.json` through (`js(?!on)`), so the PWA manifest request hits auth and gets HTML. Fix: exclude `/manifest.json` (or `.webmanifest`) from the matcher / mark public.

- [ ] **Command palette "Recent" items are hardcoded mock data** — `⌘K` shows "Career Growth" (Goal), "Morning workout" (Task), "Last Week's Plan" (Plan) for every user. Clicking "Career Growth" navigates to `/goals/1` → **404** (`command-palette.tsx:73-75`). "Morning workout" just `console.log('Open task')`. These are dead/mock affordances shipped to users.

- [ ] **Google/Outlook/Apple calendar "Connect" is a mock** — `/integrations` "Connect" calls `connectCalendar` with a hardcoded `authCode: 'mock-auth-code'` ([integrations/page.tsx:66](apps/web/src/app/(app)/integrations/page.tsx#L66)) — no real OAuth redirect. Also inconsistent: the `/integrations` page presents all three as connectable, while **Settings → Integrations** labels all three "PRO Feature". Neither actually connects. Decide one story and hide the rest.

- [ ] **`support.microplanner.com` does not resolve (DNS)** — linked as `https://support.microplanner.com/tickets` from Help/Support pages. Dead external link.

- [ ] **Marketing header has no mobile menu** — at 375px only the logo + "Get Started Free" CTA render; all nav links (Features/Pricing/About/…) are unreachable on phones. No hamburger in `components/marketing/page-template.tsx`.

- [ ] **App sidebar is expanded by default on mobile, squishing content** — at 375px the full sidebar occupies most of the viewport; the main content is a narrow strip and pages read as "Loading…" with no room. There is a collapse chevron, but the default state should be collapsed/overlay on mobile.

- [ ] **Fabricated social proof / unbuilt-feature claims on auth + marketing** — sign-up page: "10K+ Active Users / 50K+ Plans Generated / 95% Satisfaction" (DB has a handful of users) and "Calendar sync with Google, Outlook & Apple" (only Google is even stubbed, and that's a mock). Honesty risk for a sellable product.

- [ ] **Currency shows MAD in Stripe checkout** — checkout renders "68,15 MAD pro Monat" (≈$7 at the shown FX) with a German locale, because Stripe geolocated the test session to Morocco. Functionally correct (charged as USD-equivalent) but a US buyer expects "$7.00/month". Consider pinning `currency`/`locale` on the Checkout Session.

- [ ] **Day and Month views have no drag-and-drop** — Routes: `/day`, `/month`
  - Week has `WeekCalendarDnd`; day uses `DayCalendar` (click time-slot → quick add only); month uses `MonthCalendar` (click date → `/day`, click task → modal). **No reschedule-by-drag** on day/month. If product expects parity with week view, implement DnD or remove drag affordances and document click-only UX.

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
5. **A functioning task-management surface** — blocked by: P0 goal-color crash, P1 pub/sub false-errors, **P1 task detail modal handlers not wired (edit/complete/delete/subtasks/dependencies)**, **P1 week DnD broken UI**, **P1 stale calendar refetch**.

### Task management — full CRUD matrix (owner-verified 2026-07-06)

| Operation | UI exists? | Works end-to-end? | Doc ref | Root cause |
|---|---|---|---|---|
| Create task | ✅ Quick-add, day slot click | ⚠️ Partial | P1 pub/sub | DB write OK; false error + stale UI |
| **Edit task** | ✅ Task detail modal | ❌ | P1 modal wiring | `onUpdate` ignores `updates`; no `updateTask` call |
| **Complete task** | ✅ Modal + list | ❌ | P1 modal + pub/sub | `onToggleComplete` not passed |
| **Uncomplete task** | ✅ Modal | ❌ | P1 modal + pub/sub | Same |
| **Delete task** | ✅ Modal | ❌ | P1 modal + pub/sub | `onDelete` not passed |
| **Add subtask** | ✅ Subtasks tab | ❌ | P1 modal wiring | `onAddSubtask` not passed |
| **Toggle/delete subtask** | ✅ Subtasks tab | ❌ | P1 modal wiring | Callbacks not passed |
| **Add dependency** | ✅ Dependencies tab | ❌ | P1 modal wiring | No-op `async () => {}` fallback |
| **Remove dependency** | ✅ Dependencies tab | ❌ | P1 modal wiring | Same |
| **Drag reschedule (week)** | ✅ Week grid DnD | ❌ | P1 DnD UI | Broken drag ghost; stale after drop |
| Drag reschedule (day/month) | ❌ Not implemented | N/A | P2 | No DnD component |

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
| Task detail "Save Changes" | Modal on `/tasks` `/day` `/week` `/month` | Toast success; `updateTask` never called (P1) |
| Task detail "Mark Complete" / "Incomplete" | Task detail modal | `onToggleComplete` not wired (P1) |
| Task detail "Delete" | Task detail modal | `onDelete` not wired (P1) |
| Add subtask | Task detail modal → Subtasks tab | `onAddSubtask` not wired (P1) |
| Add / remove dependency | Task detail modal → Dependencies tab | No-op fallback handlers (P1) |
| Week drag-and-drop | `/week` calendar grid | Broken drag ghost at top of page (P1) |

## Console / GraphQL error log (aggregate, recurring)

**Prod-config issues (not code bugs):**
- Clerk dev keys in production (every page). — *env/config*
- `manifest.json` → 307 → HTML → "Manifest syntax error" (every page). — *middleware matcher*

**Code bugs:**
- `TypeError: Cannot read properties of null (reading 'color')` — Tasks/Week/Month/detail modal (P0).
- GraphQL `Internal server error` on `createTask`/`updateTask`/`completeTask`/`uncompleteTask`/`deleteTask` (write may succeed; post-write pub/sub crash) (P1).
- Task detail modal callbacks not wired — edit/complete/delete/subtasks/dependencies show UI but no mutations (P1).
- Week DnD drag preview mispositioned (`week-calendar-dnd.tsx` absolute + fixed conflict) (P1).
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
- [x] Tasks (**entire CRUD surface broken in UI** — edit/complete/delete/subtasks/deps unwired P1; week DnD broken P1; stale calendar P1; create false-error P1; list **crashes** P0)
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

**Is the core loop complete?** Structurally yes at the data layer: goal → generate plan → accept → **tasks materialized onto the week** → analytics reflect completion. But P0 crashes + **the entire task CRUD surface is UI-only** (modal handlers not wired, week DnD broken, stale refetch) mean a real user *clicking through* cannot manage tasks on the calendar.

**What's missing for "sellable v1":** (1) the 3 P0s, (2) **task surface wiring** (modal CRUD + week DnD + refetch), (3) pub/sub false-error guard, (4) Settings persistence, (5) plan-gen redirect, (6) production Clerk keys, (7) honest Google Calendar story.

**What's comfortably good enough:** Billing (real, correct, full lifecycle: checkout/portal/cancel/resume, tier gating, model labels). Onboarding. Search. Analytics honesty. Marketing content quality. Plan generation *engine* and materialization. Auth protection (once signed out, middleware guards every protected route).

**Bottom line:** This is a ~1–2 day fix pass from being demoable without hitting a crash, not a rebuild. The backend is in much better shape than the frontend wiring.

---

## Recommended fix order (for implementation pass)

> **STOP — read before implementing.** Finish **all P0**, then **all P1**, then P2, then P3 — in the numbered order below. Do **not** skip ahead to P2 polish (e.g. fabricated stats, manifest.json, marketing mobile menu) while task CRUD or calendar interactions are still broken. The owner has confirmed the **whole task surface** is non-functional in the browser; that block is launch-blocking.

1. **P0 — Null-guard `task.goal` everywhere** (`task.goal?.color` + fallback). Unblocks `/tasks`, `/week`, `/month`, task-detail modal, dashboard, search, plans/review. Files listed in the P0 entry.
2. **P0 — Wire Sign Out** — `app-header.tsx:152` → `useClerk().signOut()`.
3. **P0 — Add `/home(.*)` to `isPublicRoute`** — `middleware.ts`.
4. **P1 — Guard `pubsub.publish` in try/catch** (or null-check) across `task.resolver.ts` (and confirm `REDIS_URL` on Render) — kills false "Internal server error" on all task mutations.
5. **P1 — Wire `TaskDetailModal` on every page** — shared `useTaskDetailActions()` hook: `onUpdate` → `updateTask`, `onDelete`, `onToggleComplete` (complete/uncomplete), subtask + dependency mutations, always `refetch()`. Files: `tasks/page.tsx`, `week/page.tsx`, `day/page.tsx`, `month/page.tsx`, `today/page.tsx`.
6. **P1 — Fix week drag-and-drop UI** — `week-calendar-dnd.tsx` positioning/portal; `week/page.tsx` reschedule + `refetch()` in `finally`.
7. **P1 — Centralize task mutation refetch** — `refetchQueries: [GET_TASKS]` on all task/subtask/dependency mutations in `use-graphql.tsx`; calendar views must update without full page reload.
8. **P1 — Align Settings mutations to schema** — `UpdateUserSettingsInput` / `NotificationSettingsInput` field names. Files: web settings tab components + `operations.ts`.
9. **P1 — Fix plan-gen redirect** — `generating-step.tsx`: drive `onComplete` off the resolved mutation, drop the 8s race, fix `aiModel` id.
10. **P1 — Fix goal pause** — align `isPaused` with `UpdateGoalInput`.
11. **P1 — Register keyboard shortcuts** — `useKeyboardShortcuts(useGlobalKeyboardShortcuts())` in the app shell.
12. **P2 — Config/content:** production Clerk keys (owner); exclude `manifest.json` from middleware; replace/remove ⌘K mock recents; decide Google Calendar (real OAuth or hide); fix/remove `support.microplanner.com`; marketing mobile menu; mobile sidebar default-collapsed; replace fabricated stats; day/month DnD decision.
13. **P3 — Polish:** Apollo `devtools.enabled`; per-page `<title>`; Dialog a11y title/description; horizontal-overflow trims.

### Implementation agent checklist (mark `[x]` only after browser-verified)

> **Agents cannot complete this checklist autonomously.** Production and local app routes are behind Clerk (Google OAuth). A headed browser session requires the **owner** to sign in manually. Agents should run the autonomous tier below, then hand off this checklist to the owner.

After steps 1–7, **owner** manually verifies on production (or local against prod API):
- [ ] Open task → Edit title → Save → calendar + modal show new title
- [ ] Mark complete → strikethrough + analytics update
- [ ] Mark incomplete → reopens task
- [ ] Delete task → removed from calendar without refresh
- [ ] Add subtask → appears in Subtasks tab
- [ ] Add dependency → appears in Dependencies tab
- [ ] Week drag task to new slot → card stays under cursor; lands in new slot after drop

---

## Verification tiers (what agents can vs cannot prove)

| Tier | Who | What it proves | What it does **not** prove |
|---|---|---|---|
| **A — Static** | Agent | Typecheck, contract/operation audits, callback wiring exists in source | Runtime behavior, OAuth flows, calendar actually updates |
| **B — Build** | Agent | `pnpm build` in `apps/web` compiles; routes bundle without SSR errors | Clerk session, GraphQL auth headers, drag UX feel |
| **C — Backend smoke** | Agent (with local stack + test token) | Resolvers/datasources accept mutations (`createTask` → `updateTask` → `completeTask` → `deleteTask` → subtask → dependency) | Web wiring, Apollo cache refresh, modal toasts |
| **D — Browser QA** | **Owner** (or Fable with stored session) | Full click-through: edit/complete/delete/subtasks/deps, week DnD ghost, stale UI gone | — |

**Why agents skip tier D:** Clerk/Google sign-in is interactive. Cursor agents and MCP browser tools cannot complete OAuth on your behalf in a non-interactive session. Opus correctly treats tier D as owner-in-the-loop — not a failure of the fix, a limitation of the harness.

**Autonomous run (2026-07-06, this session):**
- [x] Tier A — `node scripts/audit-contracts.mjs` + `audit-operations.mjs` → green (195 REST routes, 101 GraphQL docs)
- [x] Tier A — `pnpm type-check` in `apps/web` → green
- [x] Tier B — `pnpm build` in `apps/web` → green (42 routes)
- [ ] Tier C — local GraphQL mutation smoke: **blocked autonomously.** Postgres+Redis are up, but the gateway verifies every request against Clerk JWKS (no dev bypass), so a valid JWT requires an interactive `window.Clerk.session.getToken()` from a signed-in browser. Owner can run it, or it falls to Tier D.
- [ ] Tier D — owner browser checklist above

**Note for implementers:** Tier A/B passing does **not** close a P0/P1 bug in this doc. Only tier D (or Fable regression with a real session) can mark checklist items `[x]` and flip bug entries to fixed.

---

### Re-run instructions
Regression net (must stay green): `node scripts/audit-contracts.mjs && node scripts/audit-operations.mjs` — both passed this session (195 REST routes matched, 100 GraphQL documents valid). Note these do **not** catch the runtime variable-shape mismatches in Settings (P1) — consider a smoke test that executes the real mutations.
