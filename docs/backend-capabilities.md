# MicroPlanner Backend Capabilities

**Last Updated:** 2025-11-14
**Purpose:** Complete reference for frontend development

---

## 🔐 Authentication

### Provider
- **Clerk** (JWT-based authentication)
- User sync via webhook on user.created, user.updated, user.deleted events
- Auto-creation of User record in database when authenticated

### User Model Fields
```typescript
{
  id: string (cuid)
  clerkId: string (unique)
  email: string (unique)
  name: string?
  avatar: string?
  timezone: string (default: "UTC")
  tier: SubscriptionTier (FREE | STARTER | PRO | PREMIUM)
  subscriptionStatus: SubscriptionStatus
  onboardingCompleted: boolean (default: false)
  onboardingStep: int (default: 0)
}
```

### GraphQL Operations
- `Query.me` - Get current authenticated user
- `Mutation.updateUserProfile` - Update profile (name, avatar, timezone)
- `Mutation.updateUserSettings` - Update user settings
- `Mutation.completeOnboarding` - Complete onboarding flow
- `Mutation.deleteAccount` - GDPR-compliant account deletion
- `Query.exportUserData` - GDPR-compliant data export

---

## 🎯 Goals Management

### Features
- CRUD operations (create, read, update, delete, pause/resume)
- Project association
- Priority (1-10 scale)
- Frequency per week
- Preferred time blocks
- Completion tracking & analytics

### Tier Limits
- **FREE**: 2 goals max
- **STARTER**: 5 goals max
- **PRO**: 15 goals max
- **PREMIUM**: Unlimited

### GraphQL Operations
- `Query.goals` - List user goals (filtered, sorted, paginated)
- `Query.goal(id)` - Get single goal
- `Mutation.createGoal` - Create new goal
- `Mutation.updateGoal` - Update goal
- `Mutation.deleteGoal` - Delete goal
- `Mutation.pauseGoal` - Pause goal temporarily

---

## 📅 Weekly Plans (AI-Powered)

### AI Models Supported
1. **Rule-Based** (FREE tier) - Deterministic scheduling
2. **GPT-4o Mini** (STARTER+) - Fast, cost-effective
3. **GPT-4o** (PRO+) - High quality
4. **Claude Sonnet 4** (PREMIUM) - Best quality

### Features
- Generate weekly plan from goals
- AI reasoning per task
- Quality scoring (0-100)
- Accept/reject/regenerate
- Plan history & analytics
- Plan templates (PRO/PREMIUM)
- Auto-regeneration (PRO/PREMIUM)

### GraphQL Operations
- `Query.plans` - List plans
- `Query.currentWeekPlan` - Get plan for current week
- `Mutation.generatePlan` - Generate new plan
- `Mutation.acceptPlan` - Accept generated plan
- `Mutation.regeneratePlan` - Regenerate plan with feedback

---

## ✅ Tasks Management

### Features
- CRUD operations
- Subtasks (nested tasks)
- Dependencies (blocking relationships)
- Time tracking (start/stop timer)
- Project association
- Bulk operations
- Calendar sync (Google, Outlook, Apple)
- Offline support with conflict resolution

### GraphQL Operations
- `Query.tasks` - List tasks (filtered, sorted)
- `Query.task(id)` - Get single task
- `Mutation.createTask` - Create task
- `Mutation.updateTask` - Update task
- `Mutation.completeTask` - Mark complete
- `Mutation.skipTask` - Skip with reason
- `Mutation.rescheduleTask` - Reschedule
- `Mutation.bulkCompleteTasks` - Bulk complete
- `Mutation.startTimer` - Start time tracking
- `Mutation.stopTimer` - Stop time tracking

### Subscriptions
- `Subscription.taskUpdated` - Real-time task updates
- `Subscription.timerUpdated` - Real-time timer updates

---

## 📊 Productivity & Analytics

### Features
- Daily productivity score (0-100)
- Completion rate tracking
- Time tracking analytics
- Energy pattern recognition (MORNING_PERSON, NIGHT_OWL, BALANCED)
- Weekly insights
- Pattern insights (PRO/PREMIUM)
- LLM usage stats (PRO/PREMIUM)

### GraphQL Operations
- `Query.productivityScore` - Get score for date
- `Query.productivityScoreRange` - Get scores for date range
- `Query.weeklyInsights` - Get weekly summary
- `Query.patternInsights` - Get pattern recognition data (PRO/PREMIUM)
- `Query.llmUsageStats` - Get LLM usage stats (PRO/PREMIUM)

---

## 🗓️ Calendar Integration

### Supported Providers
- Google Calendar
- Microsoft Outlook
- Apple Calendar (iCloud)

### Features
- OAuth2 connection flow
- Bi-directional sync (tasks ↔ calendar events)
- Conflict detection & resolution
- Auto-sync intervals
- Sync error handling

### GraphQL Operations
- `Query.connectedCalendars` - List connected calendars
- `Mutation.connectCalendar` - Initiate OAuth flow
- `Mutation.disconnectCalendar` - Disconnect calendar
- `Mutation.syncTasks` - Manually trigger sync

---

## 🔗 Scheduling Links (PRO/PREMIUM)

### Features (Calendly-like)
- Create booking pages (`/book/{slug}`)
- Customizable availability
- Buffer time before/after
- Approval workflow
- Custom questions
- Email notifications
- Calendar integration

### GraphQL Operations
- `Query.schedulingLinks` - List links
- `Mutation.createSchedulingLink` - Create link
- `Mutation.updateSchedulingLink` - Update link
- `Mutation.deleteSchedulingLink` - Delete link
- `Query.bookings` - List bookings
- `Mutation.confirmBooking` - Confirm booking
- `Mutation.cancelBooking` - Cancel booking

---

## 💳 Billing & Subscriptions (Stripe)

### Tiers
- **FREE**: 2 goals, rule-based planning, basic features
- **STARTER** ($9/mo): 5 goals, GPT-4o Mini, 10 plans/week
- **PRO** ($19/mo): 15 goals, GPT-4o, unlimited plans, templates, scheduling links
- **PREMIUM** ($49/mo): Unlimited goals, Claude Sonnet 4, teams, API access

### GraphQL Operations
- `Query.subscriptionStatus` - Get current subscription
- `Query.usageLimits` - Get current usage vs limits
- `Mutation.createCheckoutSession` - Create Stripe checkout
- `Mutation.createPortalSession` - Create customer portal session
- `Mutation.upgradeTier` - Upgrade subscription
- `Mutation.cancelSubscription` - Cancel subscription

---

## 🔌 Integrations

### Available Integrations
- Slack
- Zoom
- Google Meet
- Notion
- Linear
- GitHub

### Features
- OAuth connection
- Webhook configuration
- Event filtering
- Delivery logs
- Retry logic

### GraphQL Operations
- `Query.integrations` - List integrations
- `Mutation.connectIntegration` - Connect integration
- `Mutation.disconnectIntegration` - Disconnect integration
- `Query.webhooks` - List webhooks
- `Mutation.createWebhook` - Create webhook
- `Mutation.deleteWebhook` - Delete webhook

---

## 👥 Teams (PREMIUM)

### Features
- Team workspace
- Member roles (owner, admin, member, viewer)
- Invite system
- Shared templates
- Team analytics

### GraphQL Operations
- `Query.teams` - List user's teams
- `Mutation.createTeam` - Create team
- `Mutation.inviteTeamMember` - Invite member
- `Mutation.updateMemberRole` - Update member role
- `Mutation.removeTeamMember` - Remove member

---

## 🔑 API Access (PREMIUM)

### Features
- Generate API keys
- Scoped permissions
- Rate limiting
- Usage tracking

### GraphQL Operations
- `Query.apiKeys` - List API keys
- `Mutation.createApiKey` - Generate API key
- `Mutation.revokeApiKey` - Revoke API key

---

## 🛠️ Advanced Features (Phase 18)

### Work Hours Configuration
- Weekly schedule builder
- Max meetings per day
- Break time preferences

### Focus Time Blocks
- Protected focus time
- Auto-schedule focus blocks
- Priority levels

### Calendar Defense
- Auto-decline rules
- Minimum notice requirements
- Buffer time requirements

### Smart 1:1 Scheduling
- Recurring 1:1 setup
- Auto-schedule next occurrence

### Kanban Boards
- Visual task boards
- Custom columns
- Drag-drop task management

---

## 🔒 Security

### Guards & Decorators
- `@UseGuards(ClerkAuthGuard)` - Require authentication
- `@Public()` - Mark route as public
- `@RequireSubscription(tier)` - Enforce tier requirement
- `@CurrentUser()` - Inject current user into handler

### Rate Limiting
- Applied per API endpoint
- Tier-based limits

---

## 📡 Real-Time Features

### WebSocket Subscriptions
- Task updates (create, update, delete, complete)
- Timer updates (start, stop)
- Goal updates
- Plan generation progress

### Technology
- GraphQL Subscriptions
- WebSocket transport

---

## 🎨 Frontend Integration Notes

### Authentication Flow
1. User signs in via Clerk
2. Clerk JWT sent to backend
3. Backend validates JWT and finds/creates User
4. User returned with tier/subscription info

### Protected Routes
Use Clerk middleware to protect routes:
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server'
```

### GraphQL Authorization
Include Clerk session token in Authorization header:
```typescript
headers: {
  Authorization: `Bearer ${await getToken()}`
}
```

### Tier Enforcement
- Frontend should check `user.tier` and hide/disable premium features
- Backend enforces tier limits with `@RequireSubscription` decorator
- Show upgrade prompts when limits reached

---

## 📚 GraphQL Schema Location

Full schema: `/apps/graphql-gateway/src/schema/*.graphql`

Import in frontend:
```typescript
import { gql } from '@apollo/client'
```

---

## 🚀 Deployment

- **API Gateway**: Render (REST endpoints, webhooks)
- **GraphQL Gateway**: Separate service
- **Database**: PostgreSQL (Prisma ORM)
- **Redis**: Optional (caching, job queues)

---

## ✅ Ready for Frontend Implementation

All backend features are production-ready and tested.
Frontend can start Phase 1: Authentication & Onboarding.
