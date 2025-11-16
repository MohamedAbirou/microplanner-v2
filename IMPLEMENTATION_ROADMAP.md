# MicroPlanner v2 - Implementation Roadmap & System Architecture

## 🎉 Completed Fixes

### 1. GraphQL Onboarding Error (FIXED)
**Issue:** `completeOnboarding` mutation was throwing a type error
```
Boolean cannot represent a non boolean value: { success: true, message: "..." }
```

**Root Cause:** The resolver was expecting a boolean but the datasource returned an object.

**Fix:** Updated `apps/graphql-gateway/src/resolvers/onboarding.resolver.ts` to return the datasource result directly.

**Files Changed:**
- `apps/graphql-gateway/src/resolvers/onboarding.resolver.ts`

### 2. Sleep Cycle Recommendations (ENHANCED)
**Issue:** Sleep calculation didn't show alternative cycle options (e.g., 7.5h = 5 cycles, 9h = 6 cycles)

**Enhancement:** Added beautiful visual cards showing 4, 5, and 6 sleep cycle options with:
- Hours of sleep for each option
- Calculated bedtime for each cycle
- Visual highlighting of the recommended cycle
- Educational note about 90-minute sleep cycles

**Files Changed:**
- `apps/web/src/components/onboarding/steps/sleep-intelligence-step.tsx`

---

## 🏗️ System Architecture Overview

### How Weekly Plan Generation Works

After onboarding, here's the complete user flow:

#### 1. **Onboarding Completion**
✅ User completes onboarding:
- Selects their context (employed, student, freelancer, etc.)
- Chooses focus areas (career, learning, health, etc.)
- Sets wake time → System calculates optimal sleep schedule
- Creates their first goal

#### 2. **Dashboard Redirection**
After clicking "Go to Dashboard", user lands on `/dashboard` where they should see:
- **Welcome message** with their name
- **First goal** they created during onboarding
- **"Generate Your First Weekly Plan" CTA** (prominent button)
- Empty states for tasks, calendar, and analytics

#### 3. **Weekly Plan Generation**
When user clicks "Generate Plan":

**FREE Tier** (Rule-based, no AI):
- Maximum 5 plans per week
- Uses algorithmic scheduling based on:
  - Goal frequency preferences (e.g., 3x per week)
  - User's work hours and sleep schedule
  - Calendar conflicts
  - Priority scores
- Quality score: ~70-85/100
- Cost: $0

**STARTER Tier** (GPT-4o-mini):
- Maximum 20 plans per week
- AI-powered scheduling with reasoning
- Considers energy patterns and productivity peaks
- Quality score: ~80-90/100
- Cost: ~$0.0006 per plan (~4000 tokens)

**PRO/PREMIUM Tier** (Claude Sonnet 3.5):
- Unlimited plans
- Advanced AI reasoning
- Deep personalization
- Template support
- Quality score: ~85-95/100
- Cost: ~$0.0072 per plan (~8000 tokens)

#### 4. **Plan Review & Acceptance**
User sees generated plan with:
- **Quality Score** (0-100 badge)
- **AI Reasoning** (why tasks were scheduled this way)
- **Weekly Calendar View** with all tasks
- **Task List** grouped by day
- **Generation Metrics**: time taken, model used, cost

**Actions Available:**
- ✅ **Accept Plan** → Tasks become official and can sync to calendar
- 🔄 **Regenerate** → Create a new plan (counts against weekly limit)
- ✏️ **Edit Mode** → Manually adjust before accepting
- ❌ **Reject** → Discard this plan

#### 5. **Task Management**
Once plan is accepted, tasks appear in:
- **Daily View** (`/dashboard/tasks`) - Today's tasks
- **Weekly Calendar** (`/dashboard/tasks?view=week`) - All week's tasks
- **By Goal View** (`/dashboard/goals/[goalId]`) - Tasks per goal

**Task Actions:**
- Mark complete (with animation + confetti 🎉)
- Skip with reason (tracks patterns)
- Reschedule (drag-drop or date picker)
- Start timer (time tracking)
- Edit details

---

## 📦 Complete Backend Feature Mapping

### Backend Modules → Frontend Implementation Status

| Module | Backend Location | Status | Frontend Location | Notes |
|--------|-----------------|--------|-------------------|-------|
| **Auth** | `/modules/auth` | ✅ Done | `/app/(auth)/*` | Clerk integration complete |
| **Onboarding** | `/modules/onboarding` | ✅ Done | `/app/(app)/onboarding` | Multi-step wizard complete |
| **Waitlist** | `/modules/waitlist` | ✅ Done | `/app/(marketing)/*` | Join waitlist functional |
| **Users** | `/modules/users` | ⏳ Partial | `/app/(app)/settings` | Profile settings needed |
| **Goals** | `/modules/goals` | ❌ TODO | `/app/(app)/goals` | **PHASE 3** |
| **Plans** | `/modules/plans` | ❌ TODO | `/app/(app)/plans` | **PHASE 4** |
| **Tasks** | `/modules/tasks` | ❌ TODO | `/app/(app)/tasks` | **PHASE 5** |
| **Projects** | `/modules/tasks` | ❌ TODO | `/app/(app)/projects` | **PHASE 6** |
| **Calendar** | `/modules/calendar` | ❌ TODO | `/app/(app)/calendar` | **PHASE 7** |
| **Scheduling** | `/modules/scheduling` | ❌ TODO | `/app/(app)/scheduling` | **PHASE 7** |
| **Analytics** | `/modules/analytics` | ❌ TODO | `/app/(app)/analytics` | **PHASE 9** |
| **Integrations** | `/modules/integrations` | ❌ TODO | `/app/(app)/integrations` | **PHASE 10** |
| **Billing** | `/modules/billing` | ❌ TODO | `/app/(app)/billing` | **PHASE 11** |
| **Premium** | `/modules/premium` | ❌ TODO | `/app/(app)/team` | **PHASE 12** |
| **Productivity** | `/modules/productivity` | ❌ TODO | `/app/(app)/productivity` | **PHASE 8** |

---

## 🗄️ Database Schema → Features

### Core Features (Phases 3-7)

#### Goals Management (Phase 3)
**Models:** `Goal`, `Project`
**Features:**
- CRUD operations for goals
- Goal settings: frequency, duration, priority, preferred times
- Pause/resume goals
- Goal analytics: completion rate, streaks, time invested
- Project grouping

#### Weekly Plans (Phase 4)
**Models:** `WeeklyPlan`, `PlanTemplate`
**Features:**
- AI plan generation (3 strategies)
- Plan templates (PRO/PREMIUM)
- Plan history with pagination
- Accept/reject/regenerate plans
- Quality scoring
- Auto-regeneration scheduling

#### Tasks (Phase 5)
**Models:** `Task`, `TaskDependency`
**Features:**
- Task CRUD
- Subtasks (parent-child relationships)
- Task dependencies (finish-to-start, etc.)
- Time tracking (start/stop timer)
- Calendar sync status
- Offline support (localId, pendingSync)
- Skip reasons and completion tracking

#### Projects (Phase 6)
**Models:** `Project`, `KanbanBoard`, `KanbanColumn`
**Features:**
- Project management
- Archive/unarchive
- Kanban boards with drag-drop
- Project analytics and timeline
- Color coding

#### Calendar & Scheduling (Phase 7)
**Models:** `CalendarToken`, `SyncLog`, `SchedulingLink`, `Booking`
**Features:**
- Google/Outlook/Apple calendar OAuth
- Bi-directional sync
- Conflict detection
- Scheduling links (Calendly-like)
- Public booking pages
- Booking management

### Advanced Features (Phases 8-13)

#### Productivity Tools (Phase 8)
**Models:** `WorkHours`, `FocusTimeBlock`, `NoMeetingDay`, `PriorityHours`, `CalendarDefense`, `Smart1on1`, `TravelTime`, `ProductivityScore`
**Features:**
- Work hours configuration
- Focus time blocks (auto-schedule or manual)
- No-meeting days
- Priority hours (high-value time slots)
- Calendar defense (auto-decline rules)
- Smart 1:1 scheduling
- Travel time calculator
- Daily productivity score (0-100)

#### Analytics & Insights (Phase 9)
**Models:** `AnalyticsEvent`, `LLMUsage`, `ProductivityScore`
**Features:**
- Metrics dashboard
- Weekly insights
- Pattern detection (best/worst hours, days)
- LLM usage stats (cost, tokens, operations)
- Event tracking

#### Integrations (Phase 10)
**Models:** `Integration`, `Webhook`, `WebhookDelivery`
**Features:**
- Third-party integrations (Slack, Zoom, Notion, Linear, GitHub)
- OAuth flows
- Webhook management
- Delivery logs with retry

#### Billing (Phase 11)
**Models:** `User.tier`, `User.stripeCustomerId`, `User.subscriptionStatus`
**Features:**
- Stripe checkout
- Subscription management
- Upgrade/downgrade
- Usage limits enforcement
- Invoice history

#### Team Features (Phase 12)
**Models:** `Team`, `TeamMember`, `TeamInvitation`, `ApiKey`
**Features:**
- Team workspaces
- Member management with roles
- Invite system
- API key management (PREMIUM)
- Team analytics

#### Real-time (Phase 13)
**Models:** All models (via GraphQL subscriptions)
**Features:**
- WebSocket subscriptions
- Live updates across devices
- Optimistic updates
- Offline queue
- Conflict resolution

### Support Features

#### Notifications
**Models:** `SmartNotification`, `NotificationPreferences`
**Features:**
- Smart notification center
- Email/push/SMS preferences
- Quiet hours
- Alert types: overbooked, breaks, focus time, tasks, meetings

#### AI Memory (Future)
**Models:** `AIMemory`
**Features:**
- Learning user preferences
- Pattern recognition
- Personalized suggestions

#### Referrals
**Models:** `Referral`, `ReferralStatus`
**Features:**
- Referral system
- Reward tracking

---

## 🚀 Adjusted Implementation Roadmap

### ✅ PHASE 0: Marketing & Landing (COMPLETE)
- Landing page
- Pricing page
- Features page
- Waitlist functionality

### ✅ PHASE 1: Authentication (COMPLETE)
- Clerk integration
- Protected routes
- Session management
- Webhook handler

### ✅ PHASE 2: Onboarding (COMPLETE)
- Multi-step wizard (5 steps)
- Context selection
- Focus areas
- Sleep intelligence with cycle recommendations
- First goal creation
- Progress indicator
- Auto-save

---

### 🎯 PHASE 3: Goals Management (NEXT - Week 2-3)

#### Backend GraphQL Schema Needed
Create `/apps/graphql-gateway/src/schema/goals.graphql`:

```graphql
type Goal {
  id: ID!
  userId: ID!
  projectId: ID
  title: String!
  description: String
  emoji: String!
  color: String!
  frequencyPerWeek: Int!
  durationMinutes: Int!
  preferredTimes: [String!]!
  priority: Int!
  isActive: Boolean!
  isPaused: Boolean!
  pausedUntil: DateTime
  completionRate: Float!
  totalCompletions: Int!
  currentStreak: Int!
  longestStreak: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateGoalInput {
  title: String!
  description: String
  emoji: String
  color: String
  frequencyPerWeek: Int
  durationMinutes: Int
  preferredTimes: [String!]
  priority: Int
  projectId: ID
}

input UpdateGoalInput {
  title: String
  description: String
  emoji: String
  color: String
  frequencyPerWeek: Int
  durationMinutes: Int
  preferredTimes: [String!]
  priority: Int
  isPaused: Boolean
  pausedUntil: DateTime
}

extend type Query {
  goals(isActive: Boolean): [Goal!]!
  goal(id: ID!): Goal
}

extend type Mutation {
  createGoal(input: CreateGoalInput!): Goal!
  updateGoal(id: ID!, input: UpdateGoalInput!): Goal!
  deleteGoal(id: ID!): Boolean!
  pauseGoal(id: ID!, pausedUntil: DateTime): Goal!
  resumeGoal(id: ID!): Goal!
}
```

#### Frontend Pages & Components

**Pages:**
- `/app/(app)/goals/page.tsx` - Goals list view
- `/app/(app)/goals/[id]/page.tsx` - Goal detail view
- `/app/(app)/goals/new/page.tsx` - Create goal page

**Components:**
- `/components/goals/goal-card.tsx` - Goal card for list
- `/components/goals/goal-form.tsx` - Create/edit form
- `/components/goals/goal-analytics.tsx` - Analytics charts
- `/components/goals/goal-settings.tsx` - Goal settings modal

**GraphQL Operations:**
- `/graphql/goals.graphql.ts` - All goal queries and mutations

#### Implementation Steps
1. ✅ Create GraphQL schema for goals
2. ✅ Create GraphQL resolvers (proxy to NestJS)
3. ✅ Create datasource for goals API
4. ✅ Generate TypeScript types with codegen
5. ✅ Create goals list page
6. ✅ Create goal form component
7. ✅ Create goal card component
8. ✅ Create goal detail page
9. ✅ Add goal analytics
10. ✅ Add pause/resume functionality

**Success Criteria:**
- User can create, edit, delete goals
- Goals display with emoji, color, and analytics
- Goal detail shows completion rate, streaks, time invested
- User can pause/resume goals
- Tier limits enforced (FREE=2, STARTER=5, UNLIMITED for PRO/PREMIUM)

---

### 🎯 PHASE 4: Weekly Plans (Week 3-4)

#### Backend GraphQL Schema Needed
Create `/apps/graphql-gateway/src/schema/plans.graphql`:

```graphql
type WeeklyPlan {
  id: ID!
  userId: ID!
  weekStartDate: DateTime!
  weekEndDate: DateTime!
  planJson: JSON!
  reasoning: JSON
  status: PlanStatus!
  aiModel: String
  complexity: String
  generationTime: Float
  generationCost: Float
  tokenUsage: Int
  qualityScore: Float
  userSatisfaction: String
  completionRate: Float
  totalTasks: Int
  completedTasks: Int
  tasks: [Task!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum PlanStatus {
  DRAFT
  ACCEPTED
  APPLIED
  ARCHIVED
}

input GeneratePlanInput {
  weekStartDate: String
  goalIds: [ID!]
}

extend type Query {
  currentWeekPlan: WeeklyPlan
  plan(id: ID!): WeeklyPlan
  plans(page: Int, limit: Int): PlanConnection!
  planTemplates: [PlanTemplate!]
}

type PlanConnection {
  plans: [WeeklyPlan!]!
  total: Int!
  page: Int!
  limit: Int!
}

extend type Mutation {
  generatePlan(input: GeneratePlanInput!): WeeklyPlan!
  acceptPlan(id: ID!): WeeklyPlan!
  regeneratePlan(id: ID!): WeeklyPlan!
  archivePlan(id: ID!): Boolean!
}
```

#### Frontend Pages & Components

**Pages:**
- `/app/(app)/dashboard/page.tsx` - Main dashboard with plan overview
- `/app/(app)/plans/page.tsx` - Current week plan view
- `/app/(app)/plans/history/page.tsx` - Plan history
- `/app/(app)/plans/templates/page.tsx` - Templates (PRO/PREMIUM)

**Components:**
- `/components/plans/plan-generator-wizard.tsx` - Plan generation wizard
- `/components/plans/plan-review-card.tsx` - Plan review with quality score
- `/components/plans/plan-calendar-view.tsx` - Weekly calendar
- `/components/plans/plan-task-list.tsx` - Tasks grouped by day
- `/components/plans/plan-metrics.tsx` - Generation metrics
- `/components/plans/plan-history-table.tsx` - History table

#### Implementation Steps
1. ✅ Create GraphQL schema for plans
2. ✅ Create GraphQL resolvers
3. ✅ Create datasource for plans API
4. ✅ Update dashboard to show "Generate Plan" CTA
5. ✅ Create plan generation wizard
6. ✅ Create plan review interface
7. ✅ Implement accept/reject/regenerate actions
8. ✅ Create weekly calendar view
9. ✅ Create plan history view
10. ✅ Add plan templates (PRO/PREMIUM)

**Success Criteria:**
- User can generate plan from dashboard
- Plan displays with quality score and reasoning
- User can accept/reject/regenerate plan
- Plan shows in beautiful calendar view
- Tier limits enforced (FREE=5/week, STARTER=20/week, PRO/PREMIUM=unlimited)
- Templates available for PRO/PREMIUM

---

### 🎯 PHASE 5: Tasks Management (Week 4-5)

#### Backend GraphQL Schema Needed
Already exists in NestJS, needs GraphQL gateway schema.

#### Frontend Pages & Components

**Pages:**
- `/app/(app)/tasks/page.tsx` - Task list view (multiple views)

**Components:**
- `/components/tasks/task-card.tsx` - Task card
- `/components/tasks/task-form.tsx` - Create/edit task
- `/components/tasks/task-timer.tsx` - Time tracking timer
- `/components/tasks/task-calendar.tsx` - Calendar view
- `/components/tasks/task-filters.tsx` - Filters and search

**Success Criteria:**
- Multiple views: daily, weekly, by goal, by project
- Complete/skip/reschedule tasks
- Time tracking with start/stop timer
- Drag-drop rescheduling
- Offline support

---

### 🎯 PHASE 6: Projects & Advanced Tasks (Week 5-6)

**Success Criteria:**
- Projects CRUD
- Subtasks and dependencies
- Kanban boards
- Time tracking stats
- Dependency graph visualization

---

### 🎯 PHASE 7: Calendar & Scheduling (Week 6-7)

**Success Criteria:**
- Calendar OAuth (Google, Outlook, Apple)
- Bi-directional sync
- Scheduling links (Calendly-like)
- Public booking pages
- Booking management

---

### 🎯 PHASE 8: Productivity Tools (Week 7-8)

**Success Criteria:**
- Work hours configuration
- Focus time blocks
- No-meeting days
- Calendar defense rules
- Kanban boards
- Productivity score
- Smart notifications

---

### 🎯 PHASE 9: Analytics & Insights (Week 8-9)

**Success Criteria:**
- Metrics dashboard
- Weekly insights
- Pattern detection
- LLM usage stats
- Event tracking

---

### 🎯 PHASE 10: Integrations (Week 9)

**Success Criteria:**
- Integration marketplace
- OAuth flows for Slack, Zoom, Notion, Linear, GitHub
- Webhook management
- Delivery logs

---

### 🎯 PHASE 11: Billing (Week 10)

**Success Criteria:**
- Stripe checkout
- Subscription management
- Upgrade/downgrade flow
- Usage limits
- Invoice history

---

### 🎯 PHASE 12: Team Features (Week 10-11)

**Success Criteria:**
- Team workspace creation
- Member management
- Role assignment
- API key management

---

### 🎯 PHASE 13: Real-time (Week 11)

**Success Criteria:**
- WebSocket subscriptions
- Live updates
- Optimistic UI
- Offline queue

---

### 🎯 PHASE 14-16: Performance, Mobile, Testing (Week 12-14)

**Success Criteria:**
- Lighthouse 95+ score
- PWA support
- 80%+ test coverage
- Production deployment

---

## 📝 Next Immediate Steps

### For You to Test:
1. **Restart your dev servers**
   ```bash
   # Terminal 1: GraphQL Gateway
   cd apps/graphql-gateway && pnpm dev

   # Terminal 2: API Gateway (NestJS)
   cd apps/api-gateway && pnpm dev

   # Terminal 3: Web
   cd apps/web && pnpm dev
   ```

2. **Test Onboarding Flow**
   - Complete onboarding with a new account
   - Check sleep cycle recommendations display
   - Click "Go to Dashboard" and verify no GraphQL error
   - Should land on `/dashboard` successfully

3. **Expected Dashboard State**
   - Dashboard should show:
     - Welcome message
     - First goal created
     - Empty state with "Generate Your First Plan" CTA
     - No tasks yet (plan needs to be generated)

### For Me to Implement Next (Phase 3):
Once you confirm onboarding works perfectly, I'll start **Phase 3: Goals Management**:

1. Create GraphQL schema for goals
2. Build goals list page
3. Build goal creation/edit forms
4. Add goal analytics
5. Implement pause/resume functionality

**Then Phase 4:** Implement the weekly plan generation flow so users can actually generate and view their plans!

---

## 🎨 UI/UX Notes

### Design Inspiration
You mentioned being inspired by successful companies. Here are some design patterns to follow:

**Linear** - Clean, minimal, fast
- Use shadcn/ui components consistently
- Subtle animations with Framer Motion
- Keyboard shortcuts for power users

**Notion** - Beautiful, intuitive
- Emoji pickers for goals/projects
- Color coding throughout
- Inline editing

**Superhuman** - Delightful interactions
- Celebration animations (confetti on task completion)
- Smart keyboard shortcuts
- Optimistic UI updates

**Calendly** - Simple booking flow
- Clean public booking pages
- Time zone detection
- Mobile-responsive

---

## 🔥 Key Principles

1. **GraphQL First**: Frontend ONLY talks to GraphQL gateway, never REST directly
2. **Tier-Based Features**: Enforce limits based on subscription tier
3. **Real-time Where It Matters**: Use subscriptions for live updates
4. **Offline Support**: Local-first for tasks, sync when online
5. **Performance**: Code splitting, lazy loading, Server Components
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Mobile-First**: Responsive design, touch-friendly
8. **Analytics**: Track everything for product insights

---

## 📊 Success Metrics

### Phase 3 (Goals) Success:
- [ ] User can create unlimited goals (FREE tier limit enforced)
- [ ] Goals display with analytics (completion rate, streaks)
- [ ] Goal editing works smoothly
- [ ] Pause/resume functionality works
- [ ] Mobile responsive

### Phase 4 (Plans) Success:
- [ ] User can generate plan from dashboard
- [ ] Plan generation uses correct strategy based on tier
- [ ] Quality score displays correctly
- [ ] User can accept/reject/regenerate
- [ ] Weekly calendar view renders tasks
- [ ] Tier limits enforced

---

Let me know when you've tested the onboarding fixes, and I'll start implementing **Phase 3: Goals Management**! 🚀
