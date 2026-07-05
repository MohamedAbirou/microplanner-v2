# MicroPlanner: Comprehensive Gap Analysis
**Document Purpose:** Identify what's missing, conflicts, and implementation priorities based on Competitive Research Report and Implementation Strategy vs actual codebase.

**Date:** 2025-11-16

---

## EXECUTIVE SUMMARY

### Critical Findings

1. **🚨 CRITICAL: GraphQL Gateway Not Fully Operational**
   - Only 3/8 resolvers active (User, Waitlist, Onboarding)
   - Core resolvers commented out: Task, Goal, Dashboard, Project, Productivity
   - **Impact:** Frontend pages load but can't fetch real data

2. **⚠️ HIGH PRIORITY: Missing Plan GraphQL Schema**
   - Frontend has plan operations but no GraphQL schema file
   - Plan resolver doesn't exist
   - Backend service exists but no GraphQL layer

3. **📊 MODERATE: Frontend-Backend Mismatch**
   - Frontend expects many features backend hasn't fully implemented
   - Calendar sync partially implemented
   - Analytics dashboard incomplete

4. **✅ GOOD NEWS: Strong Foundation**
   - Database schema complete (45+ models)
   - All UI components built
   - Onboarding flow complete
   - Type system comprehensive

---

## PART 1: COMPETITIVE RESEARCH REPORT GAPS

### Missing "Must-Have" Features (Launch Blockers)

#### 1. Calendar Integration (PARTIALLY DONE)
**Status:** Backend services exist, frontend UI exists, but integration incomplete

**What's Missing:**
- [ ] Full bidirectional sync (Google Calendar)
- [ ] Apple Calendar support (mentioned in competitive analysis)
- [ ] Microsoft Outlook support
- [ ] Conflict detection and resolution UI
- [ ] Calendar event creation from tasks
- [ ] Busy/free time detection

**Files Exist But Incomplete:**
- `/apps/api-gateway/src/modules/calendar/` - Services exist
- `/apps/web/src/app/(app)/integrations/page.tsx` - Frontend exists
- Database: `CalendarToken`, `SyncLog` models exist

**Priority:** HIGH (Competitive differentiator - ReclaimAI's weakness)

---

#### 2. Command Palette (Cmd+K) - FRONTEND ONLY
**Status:** UI component exists but not functional

**What's Missing:**
- [ ] Fuzzy search implementation
- [ ] Quick actions (create task, goal, plan)
- [ ] Recent items tracking
- [ ] Navigation shortcuts integration
- [ ] Global keyboard listener

**Files Exist:**
- `/apps/web/src/components/command-palette.tsx` - Shell exists
- `/apps/web/src/hooks/use-keyboard-shortcuts.tsx` - Basic hooks exist

**What Needs Implementation:**
- Search indexing service
- Action registry
- Recent activity tracking

**Priority:** HIGH (Power user feature, Linear/Superhuman model)

---

#### 3. Mobile Apps - NOT STARTED
**Status:** Not implemented (web app is mobile-responsive only)

**What Competitive Research Says:**
> "ReclaimAI's #1 complaint: 'NO native iOS app' - most requested feature"
> "Your Opportunity: Full native mobile app with offline sync is a major differentiator"

**What's Missing:**
- [ ] React Native setup (iOS)
- [ ] React Native setup (Android)
- [ ] Offline-first architecture
- [ ] IndexedDB/SQLite local storage
- [ ] Sync queue for offline changes
- [ ] Push notifications setup

**Priority:** CRITICAL (Competitive moat - 18-24 month lead according to research)

**Note:** This is marked as "Priority #1" in competitive research but completely missing.

---

#### 4. Offline Mode - NOT IMPLEMENTED
**Status:** No offline capabilities

**What Competitive Research Says:**
> "Motion-level AI at Reclaim-level pricing PLUS mobile apps with offline sync"

**What's Missing:**
- [ ] Service worker implementation
- [ ] Local data cache (IndexedDB)
- [ ] Offline action queue
- [ ] Sync conflict resolution
- [ ] Online/offline status indicator

**Files to Create:**
- `/apps/web/public/service-worker.js`
- `/apps/web/src/lib/offline-queue.ts`
- `/apps/web/src/lib/sync-manager.ts`

**Priority:** HIGH (Mentioned as key differentiator in research)

---

#### 5. Quality Score System - NOT IMPLEMENTED
**Status:** Database field exists, frontend displays it, but calculation missing

**What Competitive Research Says:**
> "Implement Quality Scores with Testing - Unique differentiator showing transparent AI value"
> "Research shows value-focused prompts convert 350% better"

**What Exists:**
- Database: `WeeklyPlan.qualityScore` field exists
- Frontend: `/apps/web/src/components/plans/plan-quality-score.tsx` displays it
- Frontend: Quality score shown on review page

**What's Missing:**
- [ ] Actual quality score calculation algorithm
- [ ] Quality metrics breakdown (Goal Balance, Peak Hours, etc.)
- [ ] Tier-based score ranges (Free: 70-85, Starter: 80-90, Pro: 85-95)
- [ ] A/B testing framework (vs "time saved" alternative)
- [ ] Explanation system ("Why this score?")

**Backend Implementation Needed:**
- Quality calculation in plan generation services
- Metrics computation for each quality dimension

**Priority:** HIGH (Monetization strategy - mentioned 15+ times in research)

---

### Missing "Should-Have" Features (First 6 Months)

#### 6. Plan Templates + Marketplace - BACKEND ONLY
**Status:** Backend service exists, database models exist, frontend missing

**What Exists:**
- Database: `PlanTemplate` model with marketplace fields
- Backend: `/apps/api-gateway/src/modules/plans/plan-templates.service.ts`

**What's Missing:**
- [ ] Frontend template browser UI
- [ ] Template detail pages
- [ ] Template creation workflow
- [ ] Template submission flow
- [ ] Featured templates section
- [ ] Template categories/tags
- [ ] User ratings and reviews
- [ ] "Created with MicroPlanner" attribution

**Files to Create:**
- `/apps/web/src/app/(app)/templates/page.tsx`
- `/apps/web/src/app/(app)/templates/[id]/page.tsx`
- `/apps/web/src/components/templates/template-browser.tsx`
- `/apps/web/src/components/templates/template-card.tsx`

**Priority:** MEDIUM (Viral growth feature - Notion model)

---

#### 7. Todoist Integration - NOT STARTED
**Status:** Not implemented (mentioned in roadmap)

**What Competitive Research Says:**
> "Phase 1 (Launch): Google Calendar (required), Todoist (3M+ users), Linear (tech adopters)"

**What's Missing:**
- [ ] Todoist OAuth setup
- [ ] Task import from Todoist
- [ ] Bidirectional sync
- [ ] Todoist webhook handling
- [ ] UI for connecting Todoist

**Priority:** MEDIUM (Month 4 according to research)

---

#### 8. Linear Integration - NOT STARTED
**Status:** Not implemented (mentioned in roadmap)

**What's Missing:**
- [ ] Linear OAuth setup
- [ ] Issue import
- [ ] Status sync
- [ ] Webhook handling

**Priority:** MEDIUM (Month 6 according to research)

---

#### 9. Buffer Time Between Meetings - PARTIALLY DONE
**Status:** Database field exists, UI exists in plan generation, but logic missing

**What Exists:**
- Frontend: Buffer time slider in `/apps/web/src/components/plans/customize-preferences-step.tsx`
- Database: User preferences can store buffer time

**What's Missing:**
- [ ] Actual buffer time enforcement in scheduling algorithm
- [ ] Calendar event buffer detection
- [ ] Meeting conflict prevention

**Priority:** HIGH (Universal pain point - "table stakes" per research)

---

#### 10. Natural Language Input - NOT IMPLEMENTED
**Status:** Frontend has placeholder UI, no parser

**What Competitive Research Says:**
> "Motion users love: 'Dinner tomorrow at 7pm' → auto-creates event"

**What Exists:**
- Frontend: Quick add task modal with input field

**What's Missing:**
- [ ] Natural language parsing service
- [ ] Date/time extraction (chrono-node or similar)
- [ ] Duration parsing
- [ ] Priority detection
- [ ] Goal/project assignment parsing

**Files to Create:**
- `/apps/api-gateway/src/modules/tasks/nlp-parser.service.ts`

**Priority:** MEDIUM (Power user delight, not critical)

---

#### 11. Habit/Routine Scheduling - NOT IMPLEMENTED
**Status:** Not started (mentioned as ReclaimAI feature to copy)

**What Competitive Research Says:**
> "Smart 1:1 Meeting Scheduling + Habits/Routines Scheduling from ReclaimAI"
> "Flexible recurring blocks (exercise, lunch) that auto-reschedule"

**What's Missing:**
- [ ] Habit creation UI
- [ ] Flexible scheduling preferences
- [ ] Auto-rescheduling logic
- [ ] Habit completion tracking

**Database Changes Needed:**
- Add `Habit` model or extend `Task` with habit properties

**Priority:** MEDIUM (Complements chronotype feature)

---

#### 12. 7-Day Pro Trial Program - NOT IMPLEMENTED
**Status:** Subscription system exists but trial logic missing

**What Competitive Research Says:**
> "7-day trials: 35-45% conversion (RevenueCat data)"
> "Trigger: After creating 3+ plans in first week"

**What Exists:**
- Billing module exists
- Stripe integration exists

**What's Missing:**
- [ ] Trial state tracking
- [ ] Trial trigger logic (3+ plans condition)
- [ ] Trial expiration handling
- [ ] Trial-to-paid conversion flow
- [ ] "Try Pro Free" CTAs

**Database Changes Needed:**
- Add trial tracking fields to User model

**Priority:** HIGH (Monetization - can increase conversion 10x)

---

### Missing UX/UI Elements from Competitive Research

#### 13. Progress Indicators with Time Estimates
**Status:** Plan generation has loading, but missing time estimates

**What Research Says:**
> "Add time estimates to progress bar: '~X minutes remaining'"
> "First 7 minutes are decisive (50% drop-off at 7-minute mark)"

**What's Missing:**
- [ ] Onboarding time estimates per step
- [ ] Plan generation progress with time estimate
- [ ] Task time estimates in UI

**Priority:** LOW (Polish, not critical)

---

#### 14. Upgrade Prompts - MISSING
**Status:** Tier limits exist but no strategic upgrade prompts

**What Research Says:**
> "3-Stage Framework: Awareness (Days 1-7), Consideration (Days 8-30), Decision (31+)"
> "Trigger-based prompts at high-intent signals"

**What's Missing:**
- [ ] Usage tracking for trigger conditions
- [ ] Smart upgrade prompt system
- [ ] Dismissible persistent banner
- [ ] Feature-locked discovery (show but disable premium features)
- [ ] Value-adding tips
- [ ] Success-moment prompts

**Files to Create:**
- `/apps/web/src/components/upgrades/upgrade-prompt-manager.tsx`
- `/apps/api-gateway/src/modules/analytics/upgrade-triggers.service.ts`

**Priority:** HIGH (Monetization critical)

---

#### 15. Empty States - PARTIALLY DONE
**Status:** Generic empty state component exists, specific ones missing

**What Exists:**
- `/apps/web/src/components/empty-states.tsx` - Generic component

**What's Missing:**
- [ ] First-time user dashboard empty state
- [ ] No goals empty state with CTA
- [ ] No tasks empty state
- [ ] No plans empty state with "Generate First Plan" CTA
- [ ] Contextual empty states per page

**Priority:** MEDIUM (Onboarding experience)

---

#### 16. Celebration Moments - PARTIALLY DONE
**Status:** Confetti exists for onboarding completion only

**What Research Says:**
> "Brief animation + encouraging message for: First task completed, Goal achieved, 7-day streak, 10 plans created"

**What Exists:**
- Confetti on onboarding completion
- Task completion animation exists

**What's Missing:**
- [ ] Goal achievement celebration
- [ ] Streak celebrations
- [ ] Milestone celebrations
- [ ] First plan generation celebration

**Priority:** LOW (Engagement feature)

---

#### 17. Keyboard Shortcuts Suite - INCOMPLETE
**Status:** Dialog exists, but only basic shortcuts implemented

**What Research Says:**
> "20+ shortcuts for all actions - Linear/Superhuman model"

**What Exists:**
- Shortcuts dialog UI
- Basic navigation hooks

**What's Missing:**
- [ ] Full shortcut registry
- [ ] Context-aware shortcuts
- [ ] Shortcut customization
- [ ] Shortcut hints in UI (like "⌘K" badges)

**Priority:** MEDIUM (Power users)

---

---

## PART 2: IMPLEMENTATION STRATEGY GAPS

### Critical GraphQL Layer Issues

#### Issue #1: Commented Out Resolvers
**Location:** `/apps/graphql-gateway/src/resolvers/index.ts`

**Current State:**
```typescript
// Only these are active:
import { userResolvers } from './user.resolver';
import { waitlistResolvers } from './waitlist.resolver';
import { onboardingResolvers } from './onboarding.resolver';

// THESE ARE COMMENTED OUT:
// import { goalResolvers } from './goal.resolver';
// import { taskResolvers } from './task.resolver';
// import { projectResolvers } from './project.resolver';
// import { productivityResolvers } from './productivity.resolver';
// import { dashboardResolvers } from './dashboard.resolver';
```

**Impact:**
- Dashboard page can't fetch real data
- Goals page can't fetch real data
- Tasks page can't fetch real data
- All mutations for these entities fail

**Fix Required:**
1. Uncomment all resolver imports
2. Test each resolver
3. Wire up to backend services

**Priority:** CRITICAL (Blocks entire app functionality)

---

#### Issue #2: Missing Plan GraphQL Schema
**Status:** Frontend uses plan operations but schema doesn't exist

**Frontend Expects These Operations:**
```graphql
query WeeklyPlans {
  weeklyPlans { ... }
}

query WeeklyPlan($id: ID!) {
  weeklyPlan(id: $id) { ... }
}

mutation GenerateWeeklyPlan($input: GenerateWeeklyPlanInput!) {
  generateWeeklyPlan(input: $input) { ... }
}

mutation AcceptWeeklyPlan($id: ID!) {
  acceptWeeklyPlan(id: $id) { ... }
}
```

**But These Don't Exist:**
- No `/apps/graphql-gateway/src/schema/plan.graphql` file
- No `/apps/graphql-gateway/src/resolvers/plan.resolver.ts` file

**Files to Create:**
1. `/apps/graphql-gateway/src/schema/plan.graphql` - Schema definitions
2. `/apps/graphql-gateway/src/resolvers/plan.resolver.ts` - Resolver implementation
3. Update `/apps/graphql-gateway/src/schema/index.graphql` - Add plan types

**Priority:** CRITICAL (Plan generation is core feature)

---

#### Issue #3: GraphQL Schema vs Frontend Mismatch
**Problem:** Frontend hooks expect fields that may not match schema

**Examples Found:**
- Frontend uses `task.goal.emoji` but schema may not include emoji
- Frontend uses `plan.qualityScore` but calculation doesn't exist
- Frontend uses `goal.analytics` but resolver doesn't populate it

**Fix Required:**
- Audit all GraphQL schemas against frontend hook usage
- Ensure all expected fields are included
- Add computed fields where needed

**Priority:** HIGH

---

### Backend Service Gaps

#### Gap #1: Dashboard Data Aggregation
**Status:** Schema exists, resolver commented out, service missing

**What Frontend Expects:**
```typescript
{
  stats: {
    tasksToday: { completed: number, total: number }
    currentStreak: number
    activeGoals: number
    plansThisWeek: number
  }
  todayTasks: Task[]
  upcomingTasks: Task[]
  activeGoals: Goal[]
  currentPlan: WeeklyPlan | null
  weekOverview: {...}
}
```

**What's Missing:**
- [ ] Dashboard data aggregation service
- [ ] Streak calculation logic
- [ ] Week overview computation
- [ ] Stats caching

**Files to Create:**
- `/apps/api-gateway/src/modules/dashboard/dashboard.service.ts`

**Priority:** CRITICAL (First page users see)

---

#### Gap #2: Goal Analytics
**Status:** Schema defines analytics, no implementation

**Schema Promises:**
```graphql
type GoalAnalytics {
  completionRate: Float!
  averageCompletionTime: Float
  bestDay: DayOfWeek
  consistency: Float!
  prediction: String
}
```

**What's Missing:**
- [ ] Analytics calculation service
- [ ] Historical data aggregation
- [ ] ML prediction model (or simple heuristics)
- [ ] Best day detection algorithm

**Priority:** MEDIUM (Pro feature)

---

#### Gap #3: Quality Score Calculation
**Status:** Field exists, no calculation logic

**What's Needed:**
```typescript
interface QualityMetrics {
  goalBalance: number;        // 0-25 points
  peakHoursOptimization: number; // 0-25 points
  taskSpacing: number;         // 0-25 points
  workload: number;            // 0-25 points
  totalScore: number;          // 0-100
  tierExpected: { min: number, max: number };
}
```

**Implementation Needed:**
- [ ] Quality metrics calculator in plan service
- [ ] Tier-based expectations
- [ ] Reasoning generation for each metric

**Priority:** HIGH (Monetization feature)

---

#### Gap #4: Calendar Sync Logic
**Status:** OAuth services exist, sync logic incomplete

**What Exists:**
- Google OAuth service
- Token encryption service
- Database models for sync

**What's Missing:**
- [ ] Full bidirectional sync algorithm
- [ ] Conflict detection
- [ ] Conflict resolution strategies
- [ ] Webhook handling for external changes
- [ ] Sync status UI updates

**Priority:** HIGH (Core feature)

---

#### Gap #5: AI Planning Strategies Incomplete
**Status:** 3 strategy services exist but may not be fully functional

**Files Exist:**
- `/apps/api-gateway/src/modules/plans/strategies/rule-based-planner.service.ts`
- `/apps/api-gateway/src/modules/plans/strategies/gpt-4o-mini-planner.service.ts`
- `/apps/api-gateway/src/modules/plans/strategies/claude-sonnet-planner.service.ts`

**Need to Verify:**
- [ ] Do they implement quality score calculation?
- [ ] Do they consider chronotype?
- [ ] Do they handle buffer time?
- [ ] Do they avoid weekends option?
- [ ] Do they respect work hours?

**Priority:** CRITICAL (Core value proposition)

---

### Frontend Implementation Gaps

#### Gap #1: Calendar Drag-and-Drop Not Fully Functional
**Status:** DnD components exist but may not persist changes

**Files Exist:**
- `/apps/web/src/components/calendar/draggable-week-calendar.tsx`
- `/apps/web/src/components/calendar/week-calendar-dnd.tsx`

**What Needs Verification:**
- [ ] Does drag update trigger mutation?
- [ ] Does optimistic update work?
- [ ] Does it handle conflicts?
- [ ] Does undo work?

**Priority:** HIGH (Core UX)

---

#### Gap #2: Task Filters Not Functional
**Status:** UI exists but filter logic may be client-side only

**File Exists:**
- `/apps/web/src/components/filters/task-filters-panel.tsx`

**What's Missing:**
- [ ] Server-side filtering (performance for large datasets)
- [ ] Filter persistence (user preferences)
- [ ] Smart filters (overdue, upcoming, etc.)

**Priority:** MEDIUM

---

#### Gap #3: Bulk Task Actions Not Wired Up
**Status:** UI component exists

**File Exists:**
- `/apps/web/src/components/tasks/bulk-task-actions.tsx`

**What Needs Verification:**
- [ ] Does bulk complete work?
- [ ] Does bulk reschedule work?
- [ ] Does bulk delete work?
- [ ] Are there GraphQL mutations for bulk operations?

**Priority:** MEDIUM (Power user feature)

---

#### Gap #4: Analytics Charts Missing Data
**Status:** Chart components exist but may not have real data

**Files Exist:**
- All chart components in `/apps/web/src/components/analytics/charts/`

**What's Missing:**
- [ ] Analytics data aggregation backend
- [ ] Historical data queries
- [ ] Real-time updates

**Priority:** MEDIUM

---

#### Gap #5: Notifications System Incomplete
**Status:** UI exists, backend webhook exists, but notification generation missing

**Files Exist:**
- `/apps/web/src/components/notifications-center.tsx`
- `/apps/web/src/contexts/notifications-context.tsx` (uses mock data)

**What's Missing:**
- [ ] Notification generation service
- [ ] Notification preferences handling
- [ ] Push notification setup
- [ ] Email notification templates

**Priority:** MEDIUM

---

---

## PART 3: DATABASE SCHEMA ANALYSIS

### Unused Models (Defined but Not Used Yet)

These models exist in Prisma schema but have no backend implementation or frontend UI:

1. **Project** - Project grouping (Phase 17)
2. **Team** - Team workspaces (Premium feature)
3. **TeamMember** - Team membership
4. **TeamInvitation** - Team invitations
5. **ApiKey** - API access (Premium feature)
6. **SchedulingLink** - Calendly-like scheduling
7. **Booking** - Booking appointments
8. **Integration** - Third-party integrations (beyond calendar)
9. **Webhook** - Webhook subscriptions
10. **WebhookDelivery** - Webhook delivery logs
11. **WorkHours** - Work hours configuration (Phase 18)
12. **FocusTimeBlock** - Focus time blocks
13. **NoMeetingDay** - No-meeting days
14. **PriorityHours** - Priority hours
15. **CalendarDefense** - Calendar defense rules
16. **Smart1on1** - Smart 1:1 scheduling
17. **TravelTime** - Travel time entries
18. **KanbanBoard** - Kanban boards
19. **KanbanColumn** - Kanban columns
20. **ProductivityScore** - Daily productivity scores
21. **SmartNotification** - Smart notifications
22. **NotificationPreferences** - Notification preferences
23. **Referral** - Referral system
24. **ReferralStatus** - Referral tracking
25. **InviteCode** - Invitation codes
26. **SystemConfig** - System configuration

**Recommendation:**
- Keep these for future phases
- Don't remove (schema is forward-looking)
- Document which phase each belongs to

---

### Missing Database Fields

Fields mentioned in documents but not in schema:

1. **User.trialStartedAt** - For 7-day Pro trial tracking
2. **User.trialEndsAt** - Trial expiration
3. **User.upgradePromptsSeen** - Track upgrade prompt impressions
4. **User.lastUpgradePromptAt** - Prevent spam
5. **Task.naturalLanguageInput** - Store original NLP input
6. **Goal.templates** - Template usage tracking

**Recommendation:**
- Add these fields in a migration
- Update Prisma schema

---

### Schema Conflicts

None found! The Prisma schema is comprehensive and well-designed.

---

---

## PART 4: TYPE SYSTEM ANALYSIS

### Type Mismatches

#### Issue #1: GraphQL Types vs Prisma Types
**Problem:** Frontend uses GraphQL types, backend uses Prisma types, may not match

**Example:**
```typescript
// Frontend expects (from GraphQL):
interface Goal {
  emoji?: string;  // Optional
}

// Prisma schema has:
model Goal {
  emoji String @default("🎯")  // Required with default
}
```

**Recommendation:**
- Auto-generate GraphQL types from Prisma schema
- Use `@graphql-codegen` to ensure sync
- Document any intentional differences

---

#### Issue #2: Missing Shared Types
**Location:** `/packages/types`

**What's Missing:**
- Calendar sync types (conflict resolution, merge strategies)
- Notification types (comprehensive)
- Template marketplace types
- Upgrade prompt types
- Quality score breakdown types

**Recommendation:**
- Add missing shared types
- Export from `/packages/types`
- Use across frontend and backend

---

---

## PART 5: CONFLICTS & REDUNDANCIES

### Conflict #1: Two Calendar Component Sets
**Found:**
- `/apps/web/src/components/calendar/week-calendar.tsx`
- `/apps/web/src/components/calendar/draggable-week-calendar.tsx`
- `/apps/web/src/components/calendar/week-calendar-dnd.tsx`

**Issue:** Multiple implementations of week calendar

**Recommendation:**
- Consolidate to single week calendar component with DnD
- Remove redundant files
- Choose best implementation

---

### Conflict #2: Task Management in Two Places
**Found:**
- `/apps/api-gateway/src/modules/tasks/tasks.service.ts` - Basic tasks
- `/apps/api-gateway/src/modules/tasks/advanced-tasks.service.ts` - Advanced tasks

**Issue:** Split logic may cause inconsistency

**Recommendation:**
- Merge into single service
- Use clear method organization
- Avoid duplication

---

### Redundancy #1: Multiple Loading States
**Found:**
- `/apps/web/src/components/loading-states.tsx` - Generic skeletons
- Inline loading states in many components

**Recommendation:**
- Standardize on component library loading states
- Use generic skeletons consistently
- Remove inline duplicates

---

### Redundancy #2: Error Handling
**Found:**
- Error boundary component exists
- Many try-catch blocks without using boundary
- Inconsistent error toasts

**Recommendation:**
- Wrap all routes in error boundary
- Standardize error toast messages
- Create error handling utility

---

---

## PART 6: PRIORITIZED IMPLEMENTATION PLAN

### PHASE 1: Critical GraphQL Fixes (Week 1)
**Goal:** Make core app functional with real data

**Tasks:**
1. ✅ Uncomment all resolver imports in `/apps/graphql-gateway/src/resolvers/index.ts`
2. ✅ Create plan GraphQL schema `/apps/graphql-gateway/src/schema/plan.graphql`
3. ✅ Create plan resolver `/apps/graphql-gateway/src/resolvers/plan.resolver.ts`
4. ✅ Test all GraphQL queries/mutations
5. ✅ Fix any schema/resolver mismatches
6. ✅ Verify frontend can fetch real data

**Success Criteria:**
- Dashboard loads with real data
- Goals page shows real goals
- Tasks page shows real tasks
- Plan generation works end-to-end

---

### PHASE 2: Backend Service Completion (Week 2-3)
**Goal:** Implement missing business logic

**Tasks:**
1. ✅ Implement dashboard data aggregation service
2. ✅ Add quality score calculation to plan generation
3. ✅ Implement streak calculation logic
4. ✅ Add goal analytics calculation
5. ✅ Complete calendar sync bidirectional logic
6. ✅ Verify all AI planning strategies work correctly

**Success Criteria:**
- Dashboard shows accurate stats
- Plans have real quality scores
- Calendar sync works both ways
- All three AI models generate valid plans

---

### PHASE 3: High-Priority Features (Week 4-5)
**Goal:** Add competitive differentiators

**Tasks:**
1. ✅ Implement 7-day Pro trial system
2. ✅ Add strategic upgrade prompts
3. ✅ Implement command palette functionality
4. ✅ Add buffer time enforcement in scheduling
5. ✅ Create all empty states
6. ✅ Add quality score breakdown UI

**Success Criteria:**
- Trial conversions trackable
- Users see relevant upgrade prompts
- Command palette is usable
- Buffer time prevents back-to-back tasks
- First-time users see helpful empty states

---

### PHASE 4: UX Polish (Week 6)
**Goal:** Match Implementation Strategy specifications

**Tasks:**
1. ✅ Add time estimates to progress indicators
2. ✅ Implement celebration moments
3. ✅ Complete keyboard shortcuts suite
4. ✅ Add inline shortcut hints
5. ✅ Implement all toast notifications
6. ✅ Add optimistic updates everywhere

**Success Criteria:**
- UI feels instant (<100ms)
- Users are delighted by celebrations
- Power users can navigate without mouse
- Clear feedback for all actions

---

### PHASE 5: Templates & Integrations (Week 7-8)
**Goal:** Viral growth features

**Tasks:**
1. ✅ Build template marketplace frontend
2. ✅ Add template creation workflow
3. ✅ Implement Todoist integration
4. ✅ Add natural language parsing for quick add
5. ✅ Create habit/routine scheduling

**Success Criteria:**
- Users can browse and use templates
- Templates can be shared
- Todoist imports work
- "Meeting tomorrow 3pm" creates event

---

### PHASE 6: Analytics & Insights (Week 9)
**Goal:** Premium feature completion

**Tasks:**
1. ✅ Implement analytics data pipeline
2. ✅ Add pattern recognition service
3. ✅ Build AI insights for Pro users
4. ✅ Add data export functionality

**Success Criteria:**
- Analytics dashboard shows real data
- Patterns detected and surfaced
- Pro users see AI insights

---

### PHASE 7: Mobile Preparation (Week 10-12)
**Goal:** Offline-first architecture

**Tasks:**
1. ✅ Implement service worker
2. ✅ Add offline queue
3. ✅ Build sync conflict resolution
4. ✅ Add PWA manifest
5. ✅ Test offline capabilities

**Success Criteria:**
- App works offline
- Changes sync when online
- Conflicts resolved gracefully

---

### PHASE 8: Testing & Launch Prep (Week 13-14)
**Goal:** Production ready

**Tasks:**
1. ✅ Write integration tests for all flows
2. ✅ Load testing
3. ✅ Security audit
4. ✅ Accessibility audit
5. ✅ Performance optimization
6. ✅ Documentation

**Success Criteria:**
- All tests pass
- No critical bugs
- WCAG 2.1 AA compliant
- Core Web Vitals green

---

---

## PART 7: IMMEDIATE ACTION ITEMS

### Today (Must Do)
1. ✅ Uncomment GraphQL resolvers
2. ✅ Create plan GraphQL schema
3. ✅ Test dashboard query
4. ✅ Test goals query
5. ✅ Test tasks query

### This Week (Critical Path)
1. ✅ Implement plan resolver fully
2. ✅ Add quality score calculation
3. ✅ Implement dashboard aggregation service
4. ✅ Fix calendar sync
5. ✅ Test end-to-end plan generation

### Next Week (High Priority)
1. ✅ Add 7-day trial logic
2. ✅ Implement upgrade prompts
3. ✅ Build command palette search
4. ✅ Add buffer time logic
5. ✅ Create empty states

---

---

## APPENDIX A: Files to Create

### GraphQL Layer
- `/apps/graphql-gateway/src/schema/plan.graphql`
- `/apps/graphql-gateway/src/resolvers/plan.resolver.ts`
- `/apps/graphql-gateway/src/schema/analytics.graphql` (enhance existing)

### Backend Services
- `/apps/api-gateway/src/modules/dashboard/dashboard.service.ts`
- `/apps/api-gateway/src/modules/goals/goal-analytics.service.ts`
- `/apps/api-gateway/src/modules/plans/quality-calculator.service.ts`
- `/apps/api-gateway/src/modules/tasks/nlp-parser.service.ts`
- `/apps/api-gateway/src/modules/analytics/pattern-recognition.service.ts` (enhance)
- `/apps/api-gateway/src/modules/billing/trial-manager.service.ts`
- `/apps/api-gateway/src/modules/analytics/upgrade-triggers.service.ts`

### Frontend Components
- `/apps/web/src/app/(app)/templates/page.tsx`
- `/apps/web/src/app/(app)/templates/[id]/page.tsx`
- `/apps/web/src/components/templates/template-browser.tsx`
- `/apps/web/src/components/templates/template-card.tsx`
- `/apps/web/src/components/upgrades/upgrade-prompt-manager.tsx`
- `/apps/web/src/components/command-palette-search.tsx` (enhance existing)

### Utilities
- `/apps/web/src/lib/offline-queue.ts`
- `/apps/web/src/lib/sync-manager.ts`
- `/apps/web/src/lib/celebration.ts`
- `/packages/types/src/quality-score.types.ts`
- `/packages/types/src/trial.types.ts`
- `/packages/types/src/notifications.types.ts`

---

## APPENDIX B: Database Migrations Needed

```prisma
// Migration: Add trial and upgrade tracking
model User {
  // ... existing fields

  // Trial tracking
  trialStartedAt      DateTime?
  trialEndsAt         DateTime?
  trialUsedAt         DateTime?  // Prevent multiple trials

  // Upgrade prompts
  upgradePromptsSeen  Int @default(0)
  lastUpgradePromptAt DateTime?
  upgradeTriggersHit  String[]  // JSON array of triggers hit

  // Usage tracking for triggers
  plansCreatedCount   Int @default(0)
  tasksCompletedCount Int @default(0)
  goalsCompletedCount Int @default(0)
  lastActiveAt        DateTime @default(now())
}

// Migration: Add NLP tracking
model Task {
  // ... existing fields
  naturalLanguageInput String?  // Store original NLP input
}

// Migration: Add quality metrics
model WeeklyPlan {
  // ... existing fields
  qualityMetrics Json?  // Store detailed breakdown
}
```

---

## CONCLUSION

### Summary Statistics
- **Critical Issues:** 3 (GraphQL layer, Plan schema, Backend services)
- **High Priority Features:** 12
- **Medium Priority Features:** 15
- **Low Priority Polish:** 8

### Estimated Timeline
- **Phase 1 (Critical):** 1 week
- **Phase 2 (Core):** 2 weeks
- **Phase 3 (High Priority):** 2 weeks
- **Phase 4 (Polish):** 1 week
- **Phase 5 (Growth):** 2 weeks
- **Phase 6 (Premium):** 1 week
- **Phase 7 (Mobile Prep):** 3 weeks
- **Phase 8 (Launch Prep):** 2 weeks

**Total:** 14 weeks to production-ready

### Next Steps
1. Start with Phase 1 (Critical GraphQL fixes)
2. Get dashboard working with real data
3. Verify plan generation end-to-end
4. Then proceed to Phase 2

### Risk Assessment
- **HIGH RISK:** Mobile apps not started (competitive moat)
- **MEDIUM RISK:** Quality score not implemented (monetization)
- **LOW RISK:** Polish features can ship later

---

**Document prepared by:** Claude Code Analysis
**Last updated:** 2025-11-16
