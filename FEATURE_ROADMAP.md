# MicroPlanner Feature Roadmap
## Complete Implementation Plan for Competitive Superiority

**Last Updated**: November 9, 2025
**Current Status**: Backend Core Complete (8/12 phases done)
**Goal**: Surpass ReclaimAI, Motion, and Clockwise with unique features

---

## 📊 Current State Analysis

### ✅ What We Have (Backend Core - 35% Complete)

| Module | Status | Features |
|--------|--------|----------|
| **Users** | ✅ Complete | User management, onboarding, preferences |
| **Goals** | ✅ Complete | Goal CRUD, analytics, tier limits |
| **Plans** | ✅ Complete | AI plan generation (GPT-4o), quality scoring |
| **Tasks** | ✅ Complete | Task management, bulk operations, completion tracking |
| **Calendar** | ✅ Complete | Google Calendar sync, conflict detection, encryption |
| **Billing** | ✅ Complete | Stripe integration, webhooks, tier enforcement |
| **Analytics** | ✅ Complete | Weekly insights, productivity tracking, LLM usage |
| **Health** | ✅ Complete | Health checks, readiness probes |
| **Docs** | ✅ Complete | API docs, deployment guide, environment vars |

### ❌ What's Missing (65% to Build)

#### **Critical Tier Features (MUST HAVE)**
- [ ] FREE tier: Rule-based planner (no LLM)
- [ ] STARTER tier: GPT-4o-mini integration
- [ ] STARTER tier: Calendar sync
- [ ] STARTER tier: Email reminders
- [ ] PRO tier: Claude Sonnet 3.5 integration
- [ ] PRO tier: AI learning & pattern recognition
- [ ] PRO tier: Weekly auto-regeneration
- [ ] PRO tier: Plan templates
- [ ] PREMIUM tier: Team workspace
- [ ] PREMIUM tier: Custom AI personas
- [ ] PREMIUM tier: API access (100 calls/day)
- [ ] PREMIUM tier: White-label exports

#### **ReclaimAI Parity Features (COMPETITIVE)**
- [ ] Recurring tasks/habits
- [ ] Focus time blocks
- [ ] Smart meetings
- [ ] Scheduling links (Calendly alternative)
- [ ] Multi-calendar support (Outlook/Office365)
- [ ] Task dependencies
- [ ] Real-time rescheduling
- [ ] Slack integration
- [ ] Asana/Jira/ClickUp integration
- [ ] Notion integration

#### **Unique Advantages (DIFFERENTIATION)**
- [ ] 📱 Native mobile app (iOS + Android)
- [ ] 🧠 Energy pattern recognition
- [ ] 🔥 Burnout detection & prevention
- [ ] 📴 Offline mode
- [ ] 🎯 Smart task categorization
- [ ] 📊 Advanced productivity insights
- [ ] 🔄 Bi-directional calendar sync
- [ ] 🎨 Custom themes & branding

---

## 🎯 Implementation Roadmap

### 🔴 **PHASE 13: Critical Tier Features** (2-3 weeks)

**Goal**: Implement all pricing tier-specific features to match our promises

#### **13.1 FREE Tier: Rule-Based Planner**
**Priority**: P0 (CRITICAL - Required for FREE tier)
**Estimated Time**: 3-4 days

**What to Build**:
- Simple time-blocking algorithm without LLM
- Priority-based task scheduling
- Basic conflict avoidance
- No AI reasoning/explanations

**Implementation**:
```typescript
// apps/api-gateway/src/modules/plans/services/rule-based-planner.service.ts

export class RuleBasedPlannerService {
  // Algorithm: Sort goals by priority, allocate time blocks
  generatePlan(userId: string, goals: Goal[], weekStart: Date): Task[] {
    // 1. Sort goals by priority
    // 2. Calculate available time slots (user preferences)
    // 3. Allocate tasks evenly throughout week
    // 4. Avoid user's blocked times
    // 5. Return scheduled tasks
  }
}
```

**Files to Create**:
- `apps/api-gateway/src/modules/plans/services/rule-based-planner.service.ts`
- `apps/api-gateway/src/modules/plans/strategies/scheduling-strategy.interface.ts`

**Files to Modify**:
- `apps/api-gateway/src/modules/plans/plans.service.ts` (add tier check)

**Testing**:
- Unit tests for scheduling algorithm
- Edge cases: no available time, conflicting priorities

---

#### **13.2 STARTER Tier: GPT-4o-mini planner + Email Reminders**
**Priority**: P0 (CRITICAL - Promised in STARTER tier)
**Estimated Time**: 2-3 days

**What to Build**:
- Email service integration (Resend or SendGrid)
- Task reminder emails (1 day before, 1 hour before)
- Open AI API integration.
- Replace rule based with GPT-4o-mini for Starter users
- Prompt engineering for GPT-4o-mini's style
- Cost tracking for GPT API calls
- Weekly summary emails
- Email templates
- User preference toggles

**Dependencies**:
```bash
pnpm add resend  # or @sendgrid/mail
```

**Implementation**:
```typescript
// apps/api-gateway/src/modules/email/email.service.ts

export class EmailService {
  async sendTaskReminder(task: Task, user: User): Promise<void>
  async sendWeeklySummary(user: User, summary: WeeklySummary): Promise<void>
  async sendPlanReady(user: User, plan: WeeklyPlan): Promise<void>
}
```

**Cron Jobs** (using Bull):
```typescript
// Check for tasks starting in 1 hour
@Cron('0 * * * *') // Every hour
async checkUpcomingTasks() { ... }

// Send weekly summaries on Sunday evening
@Cron('0 18 * * 0') // 6 PM every Sunday
async sendWeeklySummaries() { ... }
```

**Files to Create**:
- `apps/api-gateway/src/modules/email/email.module.ts`
- `apps/api-gateway/src/modules/email/email.service.ts`
- `apps/api-gateway/src/modules/email/templates/task-reminder.html`
- `apps/api-gateway/src/modules/email/templates/weekly-summary.html`

**Environment Variables**:
```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=MicroPlanner <noreply@microplanner.app>
```

---

#### **13.3 PRO Tier: Claude Sonnet 3.5 Integration**
**Priority**: P0 (CRITICAL - Wrong AI model currently)
**Estimated Time**: 2-3 days

**What to Build**:
- Anthropic API integration
- Replace GPT-4o-mini with Claude Sonnet 3.5 for PRO+ users
- Prompt engineering for Claude's style
- Cost tracking for Claude API calls

**Dependencies**:
```bash
pnpm add @anthropic-ai/sdk
```

**Implementation**:
```typescript
// apps/ai-service/src/services/claude.service.ts (Python FastAPI)

from anthropic import Anthropic

class ClaudeService:
    def generate_plan(self, goals, user_context):
        response = client.messages.create(
            model="claude-sonnet-3.5-20241022",
            max_tokens=8000,
            messages=[{
                "role": "user",
                "content": f"Generate a weekly plan for these goals: {goals}..."
            }]
        )
        return response.content
```

**Files to Create/Modify**:
- `apps/ai-service/src/services/claude_service.py`
- `apps/ai-service/src/main.py` (add Claude endpoint)
- Update `apps/api-gateway/src/modules/plans/plans.service.ts` (tier-based model selection)

**Cost Optimization**:
- FREE: No AI (rule-based)
- STARTER: GPT-4o-mini (~$0.15/1M tokens)
- PRO/PREMIUM: Claude Sonnet 3.5 (~$3/1M tokens)

---

#### **13.4 PRO Tier: AI Learning & Pattern Recognition**
**Priority**: P1 (HIGH - Competitive advantage)
**Estimated Time**: 5-7 days

**What to Build**:
- Track actual task completion times vs estimates
- Identify user's productive hours
- Learn preferred task types by time of day
- Adjust future plans based on historical data

**Database Tables** (add to Prisma schema):
```prisma
model TaskCompletion {
  id              String   @id @default(cuid())
  taskId          String
  userId          String
  scheduledStart  DateTime
  actualStart     DateTime?
  actualEnd       DateTime?
  durationMinutes Int
  completedOnTime Boolean
  energyLevel     Int?     // 1-5 scale
  createdAt       DateTime @default(now())
}

model UserPattern {
  id                String   @id @default(cuid())
  userId            String   @unique
  productiveHours   Json     // { "monday": [9,10,11,14,15], ... }
  averageTaskTime   Json     // { "goalId": avgMinutes }
  preferredTimes    Json     // { "goalId": [preferredHours] }
  energyPattern     String   // MORNING, AFTERNOON, EVENING, NIGHT
  updatedAt         DateTime @updatedAt
}
```

**Implementation**:
```typescript
// apps/api-gateway/src/modules/analytics/services/pattern-learning.service.ts

export class PatternLearningService {
  async analyzeCompletionPatterns(userId: string): Promise<UserPattern> {
    // 1. Get all task completions from last 30 days
    // 2. Group by hour of day
    // 3. Calculate completion rates by hour
    // 4. Identify productive hours (>70% completion rate)
    // 5. Calculate average duration by goal type
    // 6. Detect energy pattern (when most tasks completed)
    // 7. Store in UserPattern table
  }

  async adjustPlanWithLearning(plan: WeeklyPlan, patterns: UserPattern) {
    // Apply learned patterns to future plans
    // Schedule hard tasks during productive hours
    // Adjust durations based on historical data
  }
}
```

**Cron Job**:
```typescript
@Cron('0 2 * * 0') // 2 AM every Sunday
async updateUserPatterns() {
  const proUsers = await this.usersService.findByTier([Tier.PRO, Tier.PREMIUM]);
  for (const user of proUsers) {
    await this.patternLearningService.analyzeCompletionPatterns(user.id);
  }
}
```

---

#### **13.5 PRO Tier: Weekly Auto-Regeneration**
**Priority**: P1 (HIGH - Promised in PRO tier)
**Estimated Time**: 2 days

**What to Build**:
- Cron job to auto-regenerate plans for PRO+ users
- User preference: enable/disable auto-regen
- Smart regeneration: only if < 50% tasks completed
- Email notification when new plan is ready

**Implementation**:
```typescript
// apps/api-gateway/src/modules/plans/jobs/auto-regen.job.ts

@Injectable()
export class AutoRegenJob {
  @Cron('0 20 * * 0') // 8 PM every Sunday
  async regeneratePlans() {
    const eligibleUsers = await this.usersService.findEligibleForAutoRegen();

    for (const user of eligibleUsers) {
      const currentPlan = await this.plansService.getCurrentWeekPlan(user.id);

      // Only regen if current week completion < 50%
      if (currentPlan && currentPlan.completionRate < 0.5) {
        const newPlan = await this.plansService.generate(user.id);
        await this.emailService.sendPlanReady(user, newPlan);
      }
    }
  }
}
```

**User Preference**:
```typescript
interface UserPreferences {
  autoRegenEnabled: boolean;
  autoRegenDay: 'sunday' | 'monday';
  autoRegenTime: string; // "20:00"
}
```

---

#### **13.6 PRO Tier: Plan Templates**
**Priority**: P2 (MEDIUM - Nice to have)
**Estimated Time**: 3-4 days

**What to Build**:
- Save plans as reusable templates
- Template library (personal + community)
- One-click apply template
- Template sharing (PREMIUM only)

**Database**:
```prisma
model PlanTemplate {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean  @default(false)
  tasks       Json     // Array of task templates
  tags        String[]
  usageCount  Int      @default(0)
  createdAt   DateTime @default(now())
}
```

**API Endpoints**:
```
POST   /api/v1/templates                 - Create template from plan
GET    /api/v1/templates                 - List user's templates
GET    /api/v1/templates/community       - Browse public templates
POST   /api/v1/templates/:id/apply       - Apply template to current week
DELETE /api/v1/templates/:id             - Delete template
```

---

### 🟠 **PHASE 14: PREMIUM Tier Features** (3-4 weeks)

**Goal**: Build team collaboration and API access features

#### **14.1 Team Workspace**
**Priority**: P0 (CRITICAL - PREMIUM tier)
**Estimated Time**: 1 week

**What to Build**:
- Multi-user workspaces
- Team member invitations (up to 5 members)
- Shared goals across team
- Team calendar view
- Role-based permissions (owner, admin, member)

**Database**:
```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String
  ownerId     String
  members     WorkspaceMember[]
  goals       Goal[]
  createdAt   DateTime @default(now())
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole // OWNER, ADMIN, MEMBER
  joinedAt    DateTime @default(now())
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}
```

**API Endpoints**:
```
POST   /api/v1/workspaces                      - Create workspace
GET    /api/v1/workspaces                      - List user's workspaces
POST   /api/v1/workspaces/:id/invite           - Invite member
DELETE /api/v1/workspaces/:id/members/:userId  - Remove member
GET    /api/v1/workspaces/:id/goals            - Team goals
```

---

#### **14.2 Custom AI Personas**
**Priority**: P1 (HIGH - Unique feature)
**Estimated Time**: 4-5 days

**What to Build**:
- User-defined planning styles
- Preset personas: Aggressive, Balanced, Gentle, Minimalist
- Custom prompts for AI planner
- Persona library

**Database**:
```prisma
model AIPersona {
  id          String   @id @default(cuid())
  userId      String
  name        String   // "Aggressive Optimizer"
  description String?
  systemPrompt String  // Custom AI instructions
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**Example Personas**:
```typescript
const PRESET_PERSONAS = {
  aggressive: {
    name: "Aggressive Optimizer",
    prompt: "Pack the schedule tight. Minimize breaks. Push for maximum productivity.",
  },
  balanced: {
    name: "Balanced Planner",
    prompt: "Balance work and rest. Include breaks. Avoid burnout.",
  },
  gentle: {
    name: "Gentle Scheduler",
    prompt: "Leave plenty of buffer time. Be realistic. Prioritize well-being.",
  },
  minimalist: {
    name: "Minimalist Focus",
    prompt: "Focus on 1-2 top priorities per day. Say no to non-essentials.",
  },
};
```

---

#### **14.3 API Access (100 calls/day)**
**Priority**: P1 (HIGH - PREMIUM tier)
**Estimated Time**: 5-6 days

**What to Build**:
- API key generation for PREMIUM users
- Rate limiting: 100 calls/day
- API documentation for public endpoints
- Webhook support
- Usage tracking & analytics

**Database**:
```prisma
model APIKey {
  id          String   @id @default(cuid())
  userId      String
  name        String
  key         String   @unique
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  revokedAt   DateTime?
}

model APIUsage {
  id          String   @id @default(cuid())
  userId      String
  apiKeyId    String
  endpoint    String
  method      String
  statusCode  Int
  timestamp   DateTime @default(now())
}
```

**Rate Limiting**:
```typescript
@UseGuards(ApiKeyGuard)
@Throttle({ default: { limit: 100, ttl: 86400 } }) // 100 calls per day
export class PublicAPIController {
  @Post('goals')
  async createGoal(@ApiKey() key: APIKey, @Body() dto: CreateGoalDto) { ... }

  @Get('plans')
  async getPlans(@ApiKey() key: APIKey) { ... }
}
```

**API Endpoints** (Public API for PREMIUM users):
```
POST   /api/public/v1/goals              - Create goal
GET    /api/public/v1/goals              - List goals
POST   /api/public/v1/plans/generate     - Generate plan
GET    /api/public/v1/tasks              - List tasks
PATCH  /api/public/v1/tasks/:id/complete - Complete task
POST   /api/public/v1/webhooks           - Configure webhooks
```

---

#### **14.4 White-Label Exports**
**Priority**: P2 (MEDIUM - Nice to have)
**Estimated Time**: 3-4 days

**What to Build**:
- PDF export without MicroPlanner branding
- Custom logo upload
- Professional reports
- Export templates (weekly, monthly, quarterly)

**Implementation**:
```typescript
// Use Puppeteer or PDFKit
import PDFDocument from 'pdfkit';

export class ExportService {
  async generateWhiteLabelReport(userId: string, options: ExportOptions): Promise<Buffer> {
    const doc = new PDFDocument();

    // Add custom logo if uploaded
    if (options.logo) {
      doc.image(options.logo, 50, 50, { width: 100 });
    }

    // Generate report content
    doc.fontSize(24).text('Weekly Productivity Report', 50, 150);
    // ... add charts, stats, etc.

    return doc;
  }
}
```

---

### 🟡 **PHASE 15: ReclaimAI Parity Features** (4-6 weeks)

**Goal**: Match all core ReclaimAI features

#### **15.1 Recurring Tasks/Habits**
**Priority**: P0 (CRITICAL - Most requested)
**Estimated Time**: 1 week

**What to Build**:
- RRULE support for recurring tasks
- Habit templates (morning routine, exercise, etc.)
- Auto-generation of recurring instances
- Habit tracking & streaks

**Database**:
```prisma
model Task {
  // ... existing fields
  isRecurring     Boolean  @default(false)
  recurrenceRule  String?  // RRULE format
  parentTaskId    String?  // For recurring instances
  instanceDate    DateTime? // Which day this instance is for
}

model Habit {
  id              String   @id @default(cuid())
  userId          String
  title           String
  recurrenceRule  String   // RRULE
  durationMinutes Int
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastCompleted   DateTime?
}
```

**RRULE Examples**:
```typescript
// Daily at 7 AM
RRULE:FREQ=DAILY;BYHOUR=7;BYMINUTE=0

// Every Monday, Wednesday, Friday
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR

// Last day of every month
RRULE:FREQ=MONTHLY;BYMONTHDAY=-1
```

**Dependencies**:
```bash
pnpm add rrule
```

---

#### **15.2 Focus Time Blocks**
**Priority**: P0 (CRITICAL - Core feature)
**Estimated Time**: 5-6 days

**What to Build**:
- Dedicated "focus time" task type
- Auto-defend from meeting requests
- Minimum focus block duration (e.g., 2 hours)
- Smart scheduling: cluster deep work tasks

**Implementation**:
```typescript
export class FocusTimeService {
  async createFocusBlock(userId: string, duration: number, date: Date) {
    // 1. Find largest available time slot
    // 2. Mark as "focus time" (protected)
    // 3. Auto-decline meeting invites during this time
    // 4. Group similar tasks into focus block
  }

  async defendFocusTime(userId: string, meetingInvite: CalendarEvent) {
    const focusBlocks = await this.getFocusBlocks(userId);
    const conflict = focusBlocks.find(block => overlaps(block, meetingInvite));

    if (conflict) {
      // Auto-decline or suggest alternative time
      await this.calendar.declineEvent(meetingInvite.id);
      await this.emailService.sendAlternativeTimeProposal(meetingInvite);
    }
  }
}
```

---

#### **15.3 Scheduling Links (Calendly Alternative)**
**Priority**: P1 (HIGH - Revenue opportunity)
**Estimated Time**: 2 weeks

**What to Build**:
- Shareable booking links
- Availability detection
- Meeting auto-scheduling
- Custom meeting types (15min, 30min, 60min)
- Buffer time between meetings
- PREMIUM: Payment collection (Stripe integration)

**Database**:
```prisma
model SchedulingLink {
  id              String   @id @default(cuid())
  userId          String
  slug            String   @unique
  name            String
  duration        Int      // minutes
  bufferTime      Int      // minutes before/after
  availability    Json     // Weekly availability rules
  requirePayment  Boolean  @default(false)
  price           Int?     // in cents
  createdAt       DateTime @default(now())
}

model Booking {
  id              String   @id @default(cuid())
  linkId          String
  attendeeName    String
  attendeeEmail   String
  scheduledTime   DateTime
  paid            Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

**Public Booking Page**:
```
https://microplanner.app/book/john-doe/30min
```

---

#### **15.4 Multi-Calendar Support (Outlook/Office365/Apple)**
**Priority**: P1 (HIGH - Enterprise requirement)
**Estimated Time**: 1 week

**What to Build**:
- Microsoft Graph API integration
- OAuth for Outlook/Office365
- Sync events across multiple calendars
- Primary calendar selection

**Dependencies**:
```bash
pnpm add @microsoft/microsoft-graph-client isomorphic-fetch
```

**Implementation**:
```typescript
// Similar to GoogleOAuthService
export class MicrosoftOAuthService {
  async generateAuthUrl(): Promise<string> { ... }
  async handleCallback(code: string): Promise<CalendarToken> { ... }
  async syncEvents(userId: string): Promise<void> { ... }
}
```

**Environment Variables**:
```env
MICROSOFT_CLIENT_ID=xxxxx
MICROSOFT_CLIENT_SECRET=xxxxx
MICROSOFT_REDIRECT_URI=https://api.microplanner.app/api/v1/calendar/oauth/microsoft/callback
```

---

#### **15.5 Slack Integration**
**Priority**: P2 (MEDIUM - Nice to have)
**Estimated Time**: 4-5 days

**What to Build**:
- Slack bot for task creation
- Daily plan notifications
- Task completion from Slack
- `/plan` slash command

**Slack Commands**:
```
/microplanner plan                    - Get today's plan
/microplanner add [task]              - Quick add task
/microplanner done [task]             - Mark complete
/microplanner focus 2h                - Block focus time
```

---

### 🔵 **PHASE 16: Unique Competitive Advantages** (6-8 weeks)

**Goal**: Build features competitors don't have

#### **16.1 Energy Pattern Recognition** (UNIQUE!)
**Priority**: P1 (HIGH - Killer feature)
**Estimated Time**: 1 week

**What to Build**:
- Track when users actually complete tasks
- Identify high/low energy periods
- ML model to predict energy levels
- Schedule hard tasks during peak energy
- Warn about scheduling during low-energy times

**Algorithm**:
```python
# apps/ai-service/src/services/energy_detector.py

class EnergyDetector:
    def analyze_completion_patterns(user_id: str):
        # 1. Get all completed tasks from last 60 days
        # 2. Group by hour of day (0-23)
        # 3. Calculate completion rate by hour
        # 4. Identify peak hours (>80% completion)
        # 5. Identify low hours (<50% completion)
        # 6. Detect pattern: MORNING, AFTERNOON, EVENING, NIGHT

    def predict_energy_level(user_id: str, datetime: DateTime) -> float:
        # Return 0.0-1.0 energy prediction for specific time
```

**UI Visualization**:
- Heatmap showing energy levels by hour/day
- Color-coded calendar (green = high energy, red = low)

---

#### **16.2 Burnout Detection & Prevention** (UNIQUE!)
**Priority**: P1 (HIGH - Wellness angle)
**Estimated Time**: 1 week

**What to Build**:
- Monitor task overload
- Detect patterns: working too many hours, no breaks
- Warning system: "You're overbooked this week"
- Suggest recovery time
- Forced break suggestions

**Burnout Indicators**:
```typescript
interface BurnoutMetrics {
  hoursScheduledPerWeek: number;      // > 60 hours = warning
  consecutiveDaysWithoutBreak: number; // > 7 days = warning
  taskCompletionRate: number;          // < 40% = overcommitment
  sleepHoursReduction: number;         // Reduced sleep time
  lastRestDay: Date;                   // > 14 days ago = critical
}

export class BurnoutDetector {
  async analyzeBurnoutRisk(userId: string): BurnoutRisk {
    const metrics = await this.calculateMetrics(userId);

    if (metrics.hoursScheduledPerWeek > 60) {
      return { level: 'HIGH', message: 'You're scheduling 60+ hours. Consider reducing commitments.' };
    }

    if (metrics.consecutiveDaysWithoutBreak > 7) {
      return { level: 'MEDIUM', message: 'You haven't had a break in a week. Schedule a rest day.' };
    }

    return { level: 'LOW', message: 'Looking good!' };
  }
}
```

**Notifications**:
- In-app warnings when burnout detected
- Email suggestions for breaks
- Block scheduling if at critical burnout level

---

#### **16.3 Offline Mode** (UNIQUE!)
**Priority**: P1 (HIGH - Mobile advantage)
**Estimated Time**: 2 weeks

**What to Build**:
- Local-first architecture
- Sync when online (conflict resolution)
- Offline task creation/completion
- Background sync

**Tech Stack**:
```typescript
// Expo app with local SQLite database
import * as SQLite from 'expo-sqlite';

// Sync engine
export class OfflineSyncService {
  async syncPendingChanges() {
    const pendingTasks = await this.localDB.getPendingSync();

    for (const task of pendingTasks) {
      try {
        await this.api.syncTask(task);
        await this.localDB.markSynced(task.id);
      } catch (error) {
        // Handle conflicts
        await this.conflictResolver.resolve(task, error);
      }
    }
  }
}
```

---

#### **16.4 Native Mobile App** (UNIQUE!)
**Priority**: P0 (CRITICAL - #1 ReclaimAI complaint)
**Estimated Time**: 8-10 weeks (full app)

**What to Build**:
- React Native app (Expo)
- iOS + Android
- Quick task addition
- Voice input for tasks
- Widget support
- Push notifications
- Calendar widget

**Key Screens**:
1. Today's Plan (main screen)
2. Weekly Overview
3. Add Task (quick)
4. Goals Management
5. Settings
6. Analytics Dashboard

**Expo Stack**:
```json
{
  "expo": "^51.0.0",
  "expo-calendar": "^12.0.0",
  "expo-notifications": "^0.28.0",
  "expo-sqlite": "^14.0.0",
  "@react-navigation/native": "^6.1.0",
  "@tanstack/react-query": "^5.0.0"
}
```

---

### 🟢 **PHASE 17: Integrations** (4-6 weeks)

#### **17.1 Asana Integration**
**Priority**: P2 (MEDIUM)
**Estimated Time**: 1 week

- Sync tasks from Asana projects
- Bi-directional sync (complete in MicroPlanner → mark done in Asana)
- Auto-schedule Asana tasks

#### **17.2 Jira Integration**
**Priority**: P2 (MEDIUM)
**Estimated Time**: 1 week

- Sync Jira issues
- Respect Jira due dates
- Update Jira status from MicroPlanner

#### **17.3 Notion Integration**
**Priority**: P2 (MEDIUM)
**Estimated Time**: 1 week

- Sync Notion tasks
- Create MicroPlanner tasks from Notion databases
- Two-way sync

---

## 📅 Implementation Timeline

### **Q1 2025: Critical Features (Weeks 1-12)**
- Week 1-2: FREE tier rule-based planner
- Week 2-3: GPT-4o-mini + Email reminders (STARTER)
- Week 3-4: Claude Sonnet 3.5 (PRO)
- Week 5-6: AI learning & patterns (PRO)
- Week 6-7: Weekly auto-regen (PRO)
- Week 7-8: Plan templates (PRO)
- Week 9-10: Team workspace (PREMIUM)
- Week 10-11: Custom AI personas (PREMIUM)
- Week 11-12: API access (PREMIUM)

### **Q2 2025: ReclaimAI Parity (Weeks 13-24)**
- Week 13-14: Recurring tasks/habits
- Week 14-15: Focus time blocks
- Week 16-17: Scheduling links (Calendly alternative)
- Week 18-19: Outlook/Office365/Apple integration
- Week 19-20: Slack integration
- Week 21-22: Asana/Jira integrations
- Week 23-24: Notion integration

### **Q3 2025: Unique Features (Weeks 25-36)**
- Week 25-26: Energy pattern recognition
- Week 27-28: Burnout detection
- Week 29-30: Offline mode
- Week 31-40: Native mobile app (iOS + Android)

### **Q4 2025: Polish & Launch (Weeks 37-48)**
- Week 41-42: UI/UX polish
- Week 43-44: Performance optimization
- Week 45-46: Beta testing
- Week 47-48: Public launch 🚀

---

## 🎯 Feature Priority Matrix

### **P0 - CRITICAL (Must Have for Launch)**
1. FREE tier: Rule-based planner
2. STARTER tier: GPT-4o-mini planner + Email reminders
3. PRO tier: Claude Sonnet 3.5
4. PRO tier: AI learning
5. PREMIUM tier: Team workspace
6. PREMIUM tier: API access
7. Recurring tasks/habits
8. Focus time blocks
9. Native mobile app

### **P1 - HIGH (Competitive Differentiators)**
1. Energy pattern recognition
2. Burnout detection
3. Weekly auto-regeneration
4. Custom AI personas
5. Scheduling links
6. Outlook/Office365/Apple integration
7. Offline mode

### **P2 - MEDIUM (Nice to Have)**
1. Plan templates
2. White-label exports
3. Slack integration
4. Asana/Jira/Notion integrations

### **P3 - LOW (Future Enhancements)**
1. Zoom/Google Meet deep integration
2. Voice commands
3. AR/VR planning (future)
4. AI coach (conversational)

---

## 💰 Cost Estimation

### **Development Costs** (if outsourced)

| Phase | Duration | Cost (@ $100/hr) |
|-------|----------|------------------|
| Phase 13: Critical Tier Features | 3 weeks | $12,000 |
| Phase 14: PREMIUM Features | 4 weeks | $16,000 |
| Phase 15: ReclaimAI Parity | 6 weeks | $24,000 |
| Phase 16: Unique Features | 8 weeks | $32,000 |
| Phase 17: Integrations | 4 weeks | $16,000 |
| **Total** | **25 weeks** | **$100,000** |

### **Ongoing Operational Costs**

| Service | Monthly Cost |
|---------|-------------|
| Fly.io or Railway (depends which is cheapest) (API + AI service) | $20-50 |
| Neon Database (Pro tier) | $19 |
| OpenAI API (GPT-4o-mini) | $50-200 |
| Anthropic API (Claude) | $100-500 |
| Resend (Email) | $20 |
| Sentry (Error tracking) | $26 |
| Stripe (Payment processing) | 2.9% + $0.30 per transaction |
| **Total** | **$235-795/month** |

---

## 🚀 Success Metrics

### **Launch Goals (Month 1)**
- 1,000 FREE users
- 100 STARTER users ($700 MRR)
- 20 PRO users ($300 MRR)
- 5 PREMIUM users ($145 MRR)
- **Total: $1,145 MRR**

### **6-Month Goals**
- 10,000 FREE users
- 1,000 STARTER users ($7,000 MRR)
- 200 PRO users ($3,000 MRR)
- 50 PREMIUM users ($1,450 MRR)
- **Total: $11,450 MRR**

### **12-Month Goals**
- 50,000 FREE users
- 5,000 STARTER users ($35,000 MRR)
- 1,000 PRO users ($15,000 MRR)
- 200 PREMIUM users ($5,800 MRR)
- **Total: $55,800 MRR ($670K ARR)**

---

## 🔥 Competitive Positioning

### **vs ReclaimAI**
- ✅ Native mobile app (they don't have)
- ✅ Offline mode (they don't have)
- ✅ Energy pattern recognition (they don't have)
- ✅ Burnout detection (they don't have)
- ✅ Better calendar sync (no duplicates)
- ✅ Lower pricing ($7 vs $8, $15 vs $12)
- ⚠️ Need to match: Habits, focus time, scheduling links

### **vs Motion**
- ✅ More affordable ($7/15/29 vs $19/34)
- ✅ Mobile-first (Motion is desktop-focused)
- ✅ AI learning patterns
- ✅ Team features at lower price
- ⚠️ Need to match: Auto-scheduling, task dependencies

### **vs Clockwise**
- ✅ Individual focus (Clockwise is team-only)
- ✅ AI plan generation (Clockwise just optimizes meetings)
- ✅ Broader feature set
- ✅ Mobile app

---

## 📊 Technical Debt & Improvements

### **Current Issues to Fix**
1. Prisma client generation (using temporary types)
2. Test execution (Babel parsing errors)
3. Add E2E tests
4. Improve error handling
5. Add request logging
6. Database query optimization
7. Add caching layer (Redis)

### **Performance Optimizations**
1. Implement response caching
2. Database connection pooling
3. CDN for static assets
4. Image optimization
5. Lazy loading
6. API response compression (already done)

---

## 🎓 Next Steps

### **Immediate (This Week)**
1. ✅ Fix pricing tiers
2. ✅ Add PREMIUM tier
3. ✅ Update documentation
4. [ ] Create Stripe products for new pricing
5. [ ] Start FREE tier rule-based planner

### **This Month**
1. Implement all critical tier features (Phase 13)
2. Deploy updated pricing to production
3. Start user beta testing
4. Gather feedback on AI planning

### **This Quarter**
1. Complete Phase 13 + 14 (tier features)
2. Launch mobile app MVP
3. Reach 100 paying users
4. Implement energy pattern recognition

---

**Ready to build the best AI planner in the market! 🚀**
