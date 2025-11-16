# MicroPlanner: Systematic Implementation Plan
**Goal:** Full backend → GraphQL → Frontend integration with proper tier-based feature gating

**Date:** 2025-11-16

---

## PART 1: DATABASE MODEL AUDIT

### Total Models: 37

### Implementation Status:

#### ✅ FULLY IMPLEMENTED (7 models)
1. **User** - Backend ✅, GraphQL ✅, Frontend ✅
2. **Waitlist** - Backend ✅, GraphQL ✅, Frontend ✅
3. **Goal** - Backend ⚠️ (partial), GraphQL ✅, Frontend ✅
4. **Task** - Backend ⚠️ (partial), GraphQL ✅, Frontend ✅
5. **WeeklyPlan** - Backend ⚠️ (partial), GraphQL ✅, Frontend ✅
6. **CalendarToken** - Backend ✅, GraphQL ❌, Frontend ⚠️
7. **SyncLog** - Backend ✅, GraphQL ❌, Frontend ❌

#### ⚠️ PARTIALLY IMPLEMENTED (6 models)
8. **TaskDependency** - Backend ❌, GraphQL ✅, Frontend ⚠️
9. **Project** - Backend ❌, GraphQL ✅, Frontend ❌
10. **PlanTemplate** - Backend ⚠️, GraphQL ❌, Frontend ❌
11. **AIMemory** - Backend ❌, GraphQL ❌, Frontend ❌
12. **AnalyticsEvent** - Backend ⚠️, GraphQL ❌, Frontend ❌
13. **LLMUsage** - Backend ❌, GraphQL ❌, Frontend ❌

#### ❌ NOT IMPLEMENTED (24 models)
14. **Referral** - All ❌
15. **InviteCode** - All ❌
16. **SystemConfig** - All ❌
17. **Team** - All ❌
18. **TeamMember** - All ❌
19. **TeamInvitation** - All ❌
20. **ApiKey** - All ❌
21. **SchedulingLink** - All ❌
22. **Booking** - All ❌
23. **Integration** - All ❌
24. **Webhook** - All ❌
25. **WebhookDelivery** - All ❌
26. **WorkHours** - All ❌
27. **FocusTimeBlock** - All ❌
28. **NoMeetingDay** - All ❌
29. **PriorityHours** - All ❌
30. **CalendarDefense** - All ❌
31. **Smart1on1** - All ❌
32. **TravelTime** - All ❌
33. **KanbanBoard** - All ❌
34. **KanbanColumn** - All ❌
35. **ProductivityScore** - All ❌
36. **SmartNotification** - All ❌
37. **NotificationPreferences** - All ❌

---

## PART 2: TIER SYSTEM AUDIT

### Current Tier Limits (tier-context.tsx)

**❌ ISSUES FOUND:**

1. **AI Models are WRONG:**
   - Current: Uses old models (gpt-3.5-turbo, gpt-4, gpt-4-turbo, claude-3-opus)
   - Should be: rule-based (FREE), gpt-4o-mini (STARTER), claude-sonnet-3.5 (PRO)

2. **Plan Limits are WRONG:**
   - Current: 2 plans/month (FREE), 8/month (STARTER), 20/month (PRO)
   - Should be: 7 plans/week (FREE), 15/week (STARTER), unlimited (PRO)
   - Per competitive research: Users need daily/weekly planning, not monthly!

3. **Missing Limits:**
   - No activeGoals limit enforcement
   - No plan quality score differentiation
   - No template access control
   - No team workspace limits
   - No API access limits

### Recommended Tier Structure (From Competitive Research)

```typescript
const tierLimits: Record<UserTier, TierLimits> = {
  FREE: {
    maxActiveGoals: 3,
    maxGoalsPerPlan: 3,
    maxTasksPerDay: 20,
    maxPlansPerWeek: 7,  // Changed from 2/month!
    aiModel: 'rule-based',
    qualityScoreRange: [70, 85],
    hasCalendarIntegration: false,
    hasTemplateAccess: false,  // Can use but not create
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  STARTER: {
    maxActiveGoals: 5,
    maxGoalsPerPlan: 5,
    maxTasksPerDay: 40,
    maxPlansPerWeek: 15,
    aiModel: 'gpt-4o-mini',
    qualityScoreRange: [80, 90],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,  // Can create & share
    hasAdvancedAnalytics: false,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PRO: {
    maxActiveGoals: 15,
    maxGoalsPerPlan: 10,
    maxTasksPerDay: 100,
    maxPlansPerWeek: -1,  // Unlimited
    aiModel: 'claude-sonnet-3.5',
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true,
    hasTeamWorkspace: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
  },
  PREMIUM: {
    maxActiveGoals: -1,  // Unlimited
    maxGoalsPerPlan: -1,
    maxTasksPerDay: -1,
    maxPlansPerWeek: -1,
    aiModel: 'claude-sonnet-3.5',  // Same as Pro
    qualityScoreRange: [85, 95],
    hasCalendarIntegration: true,
    hasTemplateAccess: true,
    hasAdvancedAnalytics: true,
    hasTeamWorkspace: true,  // Premium exclusive
    hasAPIAccess: true,       // Premium exclusive
    hasPrioritySupport: true,
  },
};
```

---

## PART 3: SYSTEMATIC IMPLEMENTATION PLAN

### PHASE 1: Fix Tier System (Week 1, Day 1)
**Priority: CRITICAL - Foundation for everything**

#### 1.1 Update Tier Limits
- [ ] Fix tier-context.tsx with correct limits
- [ ] Update AI model names
- [ ] Add missing limit types
- [ ] Add quality score ranges

#### 1.2 Backend Tier Enforcement
- [ ] Create tier guard middleware
- [ ] Add tier validation to all mutations
- [ ] Create usage tracking service
- [ ] Add limit exceeded errors

#### 1.3 Database Migrations
- [ ] Add usage tracking fields to User model:
  ```prisma
  model User {
    // ... existing fields

    // Usage tracking
    goalsCreatedCount    Int @default(0)
    plansCreatedThisWeek Int @default(0)
    tasksCreatedToday    Int @default(0)
    lastPlanCreatedAt    DateTime?
    weeklyPlanResetAt    DateTime @default(now())
    dailyTaskResetAt     DateTime @default(now())
  }
  ```

---

### PHASE 2: Core Models Implementation (Week 1, Days 2-5)
**Priority: HIGH - Core app functionality**

Focus on models that frontend already expects:

#### 2.1 Goal Model (Backend Completion)
**Files to create/update:**
- `/apps/api-gateway/src/modules/goals/goals.service.ts` - Complete implementation
- `/apps/api-gateway/src/modules/goals/goal-analytics.service.ts` - NEW

**What to implement:**
- [ ] Complete CRUD with tier limits enforcement
- [ ] Goal analytics calculation:
  ```typescript
  interface GoalAnalytics {
    completionRate: number;
    averageTaskDuration: number;
    bestDayOfWeek: string;
    consistency: number;  // 0-100
    prediction: string;   // AI-generated insight
  }
  ```
- [ ] Pause/resume functionality
- [ ] Archive functionality
- [ ] Progress tracking

**GraphQL:** ✅ Already exists

**Frontend:** ✅ Already expects this data

---

#### 2.2 Task Model (Backend Completion)
**Files to create/update:**
- `/apps/api-gateway/src/modules/tasks/tasks.service.ts` - Complete implementation
- Merge advanced-tasks.service.ts into tasks.service.ts

**What to implement:**
- [ ] Complete CRUD with tier limits
- [ ] Task completion with celebration triggers
- [ ] Reschedule functionality
- [ ] Bulk operations (complete, delete, reschedule)
- [ ] Natural language parsing service:
  ```typescript
  // Example: "Meeting tomorrow 3pm for 30min with John"
  interface ParsedTask {
    title: string;
    date?: Date;
    time?: string;
    duration?: number;
    participants?: string[];
  }
  ```

**GraphQL:** ✅ Already exists

**Frontend:** ✅ Already expects this data

---

#### 2.3 TaskDependency Model (Full Implementation)
**Files to create:**
- `/apps/api-gateway/src/modules/tasks/task-dependencies.service.ts` - NEW

**What to implement:**
- [ ] Create dependency (with validation)
- [ ] Delete dependency
- [ ] Get dependency chain
- [ ] Detect circular dependencies
- [ ] Auto-reschedule dependent tasks

**GraphQL:** ✅ Already exists

**Frontend:** ⚠️ UI exists, needs integration

---

#### 2.4 WeeklyPlan Model (Backend Completion)
**Files to create/update:**
- `/apps/api-gateway/src/modules/plans/plans.service.ts` - Complete implementation
- `/apps/api-gateway/src/modules/plans/quality-calculator.service.ts` - NEW

**What to implement:**
- [ ] Complete plan generation with all 3 AI strategies
- [ ] Quality score calculation:
  ```typescript
  interface QualityMetrics {
    goalBalance: number;        // 0-25 points
    peakHoursOptimization: number; // 0-25 points
    taskSpacing: number;         // 0-25 points
    workloadBalance: number;     // 0-25 points
    totalScore: number;          // 0-100
    reasoning: Record<string, string>; // Per-day explanations
  }
  ```
- [ ] Plan acceptance/rejection
- [ ] Plan history
- [ ] Current plan retrieval
- [ ] Tier-based quality expectations

**GraphQL:** ✅ Already exists (just added!)

**Frontend:** ✅ Already expects this data

---

#### 2.5 Project Model (Full Implementation)
**Files to create:**
- `/apps/api-gateway/src/modules/projects/projects.controller.ts` - NEW
- `/apps/api-gateway/src/modules/projects/projects.service.ts` - NEW

**What to implement:**
- [ ] Complete CRUD
- [ ] Archive/unarchive
- [ ] Project stats (tasks count, completion rate)
- [ ] Project templates

**GraphQL:** ✅ Schema exists, resolver exists

**Frontend:** ❌ UI doesn't exist yet - **SKIP FOR NOW**

---

### PHASE 3: Calendar Integration (Week 2, Days 1-2)
**Priority: HIGH - Competitive differentiator**

#### 3.1 Calendar Sync Service
**Files to update:**
- `/apps/api-gateway/src/modules/calendar/calendar.service.ts` - Complete implementation

**What to implement:**
- [ ] Full bidirectional sync (Google Calendar)
- [ ] Conflict detection
- [ ] Conflict resolution strategies:
  - User preference (task wins / calendar wins)
  - Manual resolution UI
- [ ] Webhook handling for external changes
- [ ] Busy/free time detection
- [ ] Buffer time enforcement

#### 3.2 Calendar GraphQL
**Files to create:**
- `/apps/graphql-gateway/src/schema/calendar.graphql` - NEW
- `/apps/graphql-gateway/src/resolvers/calendar.resolver.ts` - NEW

**What to implement:**
- [ ] Connect calendar mutation
- [ ] Disconnect calendar mutation
- [ ] Sync now mutation
- [ ] Get sync status query
- [ ] Resolve conflict mutation

**Frontend:** ✅ UI already exists at /integrations

---

### PHASE 4: Analytics & Insights (Week 2, Days 3-5)
**Priority: MEDIUM - Pro feature**

#### 4.1 Analytics Service
**Files to create/update:**
- `/apps/api-gateway/src/modules/analytics/analytics.service.ts` - Complete
- `/apps/api-gateway/src/modules/analytics/pattern-recognition.service.ts` - Enhance

**What to implement:**
- [ ] Daily productivity scores
- [ ] Weekly completion trends
- [ ] Goal progress tracking
- [ ] Time-of-day productivity analysis
- [ ] AI insights generation (Pro only):
  ```typescript
  interface AIInsight {
    type: 'pattern' | 'suggestion' | 'achievement';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    action?: string;
  }
  ```

#### 4.2 Analytics GraphQL
**Files to create:**
- `/apps/graphql-gateway/src/schema/analytics.graphql` - Enhance existing
- `/apps/graphql-gateway/src/resolvers/analytics.resolver.ts` - NEW

#### 4.3 Analytics Events Tracking
**What to implement:**
- [ ] Track all user actions (task_created, task_completed, goal_created, etc.)
- [ ] LLM usage tracking
- [ ] Pattern detection

**Frontend:** ✅ Charts exist, need data integration

---

### PHASE 5: AI Memory & Learning (Week 3, Days 1-2)
**Priority: MEDIUM - Quality improvement**

#### 5.1 AI Memory Service
**Files to create:**
- `/apps/api-gateway/src/modules/ai/ai-memory.service.ts` - NEW

**What to implement:**
- [ ] Store user patterns:
  - Preferred work times
  - Task completion patterns
  - Energy levels by time
  - Frequent task types
  - Goal achievement patterns
- [ ] Use memory in plan generation
- [ ] Privacy controls (Premium feature)

**GraphQL:** Create schema/resolver

---

### PHASE 6: Plan Templates & Marketplace (Week 3, Days 3-5)
**Priority: MEDIUM - Viral growth feature**

#### 6.1 Plan Templates Service
**Files to update:**
- `/apps/api-gateway/src/modules/plans/plan-templates.service.ts` - Complete

**What to implement:**
- [ ] Create template from plan
- [ ] Browse templates (public)
- [ ] Use template
- [ ] Featured templates (admin curated)
- [ ] Template ratings
- [ ] Template categories
- [ ] Template search

#### 6.2 Templates GraphQL
Add to existing plan.graphql schema

#### 6.3 Templates Frontend
**Files to create:**
- `/apps/web/src/app/(app)/templates/page.tsx` - NEW
- `/apps/web/src/app/(app)/templates/[id]/page.tsx` - NEW
- `/apps/web/src/components/templates/` - NEW components

---

### PHASE 7: Premium Features (Week 4)
**Priority: LOW - Premium tier only**

#### 7.1 Team Workspaces (Premium)
**Models:** Team, TeamMember, TeamInvitation

**What to implement:**
- [ ] Create team
- [ ] Invite members
- [ ] Shared plans
- [ ] Team analytics

**Tier Gate:** Premium only

---

#### 7.2 API Access (Premium)
**Models:** ApiKey, Webhook, WebhookDelivery

**What to implement:**
- [ ] Generate API keys
- [ ] REST API endpoints
- [ ] Webhook subscriptions
- [ ] Webhook delivery

**Tier Gate:** Premium only

---

#### 7.3 Scheduling Links (Premium)
**Models:** SchedulingLink, Booking

**What to implement:**
- [ ] Create scheduling link (Calendly-like)
- [ ] Public booking page
- [ ] Calendar integration
- [ ] Notification on booking

**Tier Gate:** Premium only

---

### PHASE 8: Productivity Features (Week 5)
**Priority: LOW - Phase 18 features**

**Models:** WorkHours, FocusTimeBlock, NoMeetingDay, PriorityHours, CalendarDefense, Smart1on1, TravelTime

These are all defined in GraphQL schema but not implemented.

**What to implement:**
- [ ] Work hours configuration
- [ ] Focus time block scheduling
- [ ] No-meeting day enforcement
- [ ] Priority hours
- [ ] Calendar defense rules
- [ ] Smart 1:1 scheduling
- [ ] Travel time buffer

**Skip for now - Focus on core features first**

---

### PHASE 9: Notifications System (Week 6)
**Priority: MEDIUM - Engagement feature**

**Models:** SmartNotification, NotificationPreferences

**What to implement:**
- [ ] Notification generation service
- [ ] Smart notification timing
- [ ] User preferences
- [ ] Push notification delivery
- [ ] Email notifications
- [ ] In-app notifications

---

### PHASE 10: Referral System (Week 7)
**Priority: LOW - Growth feature**

**Models:** Referral, InviteCode

**What to implement:**
- [ ] Generate referral codes
- [ ] Track referrals
- [ ] Reward system (1 month free Pro per referral)
- [ ] Referral analytics

---

## PART 4: TIER-BASED FEATURE ENFORCEMENT

### Backend Enforcement Strategy

#### 4.1 Tier Guard Decorator
**File:** `/apps/api-gateway/src/common/guards/tier.guard.ts`

```typescript
@Injectable()
export class TierGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.get('tier', context.getHandler());
    const user = context.switchToHttp().getRequest().user;

    return this.checkTierAccess(user.tier, requiredTier);
  }
}

// Usage:
@Tier('PRO')
@Post('generate-plan')
async generatePlan() { ... }
```

#### 4.2 Usage Limit Middleware
**File:** `/apps/api-gateway/src/common/middleware/usage-limit.middleware.ts`

```typescript
@Injectable()
export class UsageLimitMiddleware {
  async checkLimit(userId: string, limitType: 'goals' | 'plans' | 'tasks') {
    const user = await this.userService.getUser(userId);
    const usage = await this.getUsage(userId, limitType);
    const limit = this.tierLimits[user.tier][limitType];

    if (limit !== -1 && usage >= limit) {
      throw new ForbiddenException(`${limitType} limit reached for ${user.tier} tier`);
    }
  }
}
```

#### 4.3 Frontend Tier Enforcement
Update `/apps/web/src/contexts/tier-context.tsx`:

```typescript
export function TierGate({
  requiredTier,
  feature,
  children,
  fallback
}: TierGateProps) {
  const { tier, limits } = useTier();

  const hasAccess = checkTierAccess(tier, requiredTier);

  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} requiredTier={requiredTier} />;
  }

  return <>{children}</>;
}

// Usage:
<TierGate requiredTier="PRO" feature="Advanced Analytics">
  <AnalyticsDashboard />
</TierGate>
```

---

## PART 5: IMPLEMENTATION ORDER

### Week 1: Foundation
- ✅ Day 1 AM: Fix tier system
- ✅ Day 1 PM: Add usage tracking to database
- ✅ Day 2-3: Complete Goal backend + analytics
- ✅ Day 4-5: Complete Task backend + dependencies

### Week 2: Core Features
- ✅ Day 1-2: Complete WeeklyPlan backend + quality score
- ✅ Day 3-4: Complete calendar integration
- ✅ Day 5: Analytics backend

### Week 3: Enhancement Features
- ✅ Day 1-2: AI Memory service
- ✅ Day 3-5: Plan templates + marketplace

### Week 4: Testing & Polish
- ✅ Day 1-2: Integration testing
- ✅ Day 3-4: Tier enforcement testing
- ✅ Day 5: Frontend integration fixes

### Week 5+: Premium & Advanced Features
- Teams, API access, scheduling links
- Productivity features
- Notifications
- Referrals

---

## PART 6: IMMEDIATE NEXT STEPS

### TODAY (Priority Order):

1. **Fix Tier Context** (1 hour)
   - Update tier-context.tsx with correct limits
   - Update AI model names
   - Add quality score ranges

2. **Create Database Migration** (30 min)
   - Add usage tracking fields
   - Run migration

3. **Create Tier Guard** (1 hour)
   - Backend tier guard decorator
   - Usage limit middleware
   - Frontend TierGate component

4. **Complete Goals Service** (2 hours)
   - Goal analytics calculation
   - Tier limit enforcement
   - Testing

5. **Complete Tasks Service** (2 hours)
   - Bulk operations
   - Natural language parsing
   - Tier limit enforcement

---

## SUCCESS CRITERIA

### Phase 1-2 Complete When:
- [ ] All tier limits correctly defined and enforced
- [ ] Goals CRUD fully functional with analytics
- [ ] Tasks CRUD fully functional with dependencies
- [ ] Plans generate with quality scores
- [ ] Frontend can create/edit/delete all entities
- [ ] Tier gates block unauthorized access
- [ ] Usage limits enforced on backend
- [ ] All GraphQL operations return real data

### Phase 3 Complete When:
- [ ] Google Calendar syncs bidirectionally
- [ ] Conflicts detected and resolvable
- [ ] Buffer time enforced

### Phase 4 Complete When:
- [ ] Analytics dashboard shows real data
- [ ] AI insights generated for Pro users
- [ ] Productivity patterns detected

---

**Ready to begin systematic implementation!**
