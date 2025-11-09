# MicroPlanner API Documentation

## Base URL
```
Production: https://api.microplanner.app/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All endpoints (except webhooks and public endpoints) require Bearer token authentication:

```http
Authorization: Bearer <clerk_jwt_token>
```

Get JWT token from Clerk after user signs in.

---

## 📋 API Endpoints Overview

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `PUT /users/me/preferences` - Update user preferences
- `DELETE /users/me` - Delete account (GDPR)
- `GET /users/me/export` - Export all user data (GDPR)

### Goals
- `POST /goals` - Create a new goal
- `GET /goals` - List all goals (with filters)
- `GET /goals/:id` - Get single goal
- `PUT /goals/:id` - Update goal
- `DELETE /goals/:id` - Soft delete goal
- `PUT /goals/:id/pause` - Pause goal
- `PUT /goals/:id/activate` - Activate paused goal

### Plans
- `POST /plans/generate` - Generate AI weekly plan
- `GET /plans/current` - Get current week's plan
- `GET /plans/:id` - Get plan by ID
- `GET /plans` - List all plans
- `PUT /plans/:id/accept` - Accept generated plan
- `POST /plans/:id/regenerate` - Regenerate plan
- `DELETE /plans/:id` - Archive plan

### Tasks
- `POST /tasks` - Create manual task
- `GET /tasks` - List tasks (with filters)
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/complete` - Mark task complete
- `POST /tasks/:id/skip` - Skip task with reason
- `PATCH /tasks/bulk` - Bulk operations

### Calendar
- `GET /calendar/oauth/google` - Initiate Google OAuth
- `GET /calendar/oauth/google/callback` - OAuth callback
- `GET /calendar/events` - Get calendar events
- `POST /calendar/sync` - Sync tasks to calendar
- `GET /calendar/status` - Get sync status
- `DELETE /calendar/disconnect` - Disconnect calendar

### Billing
- `GET /billing/plans` - Get pricing tiers
- `POST /billing/checkout` - Create Stripe checkout
- `GET /billing/portal` - Get customer portal URL
- `GET /billing/subscription` - Get current subscription
- `POST /billing/cancel` - Cancel subscription
- `POST /billing/webhooks/stripe` - Stripe webhook (no auth)

### Analytics
- `POST /analytics/events` - Track event
- `GET /analytics/metrics` - Get user metrics
- `GET /analytics/insights` - Get weekly insights
- `GET /analytics/usage` - Get LLM usage stats
- `POST /analytics/aggregate` - Run aggregation job

---

## 📝 Detailed Endpoint Documentation

### Users Module

#### GET /users/me
Get current user profile with all preferences.

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "PRO",
    "subscriptionStatus": "ACTIVE",
    "wakeTime": "07:00",
    "sleepTime": "23:00",
    "timezone": "America/New_York",
    "calendarConnected": true
  }
}
```

#### PUT /users/me
Update user profile.

**Request:**
```json
{
  "name": "John Doe",
  "timezone": "America/Los_Angeles",
  "language": "en"
}
```

#### DELETE /users/me
Delete user account (GDPR compliant - cascades to all data).

**Response:** `204 No Content`

---

### Goals Module

#### POST /goals
Create a new goal. Subject to tier limits (FREE: 2, STARTER: 5, PRO: unlimited).

**Request:**
```json
{
  "title": "Morning Workout",
  "description": "30-min cardio and strength training",
  "frequencyPerWeek": 5,
  "durationMinutes": 30,
  "preferredTimes": ["07:00", "08:00"],
  "priority": 8
}
```

**Response:**
```json
{
  "message": "Goal created successfully",
  "goal": {
    "id": "goal_123",
    "title": "Morning Workout",
    "frequencyPerWeek": 5,
    "durationMinutes": 30,
    "isActive": true,
    "completionRate": 0,
    "currentStreak": 0
  }
}
```

**Error (Tier Limit):**
```json
{
  "statusCode": 403,
  "message": "Your FREE plan allows maximum 2 active goals. Upgrade to create more."
}
```

#### GET /goals?page=1&limit=10&isActive=true
List all goals with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `isActive` (boolean): Filter by active status
- `isPaused` (boolean): Filter by paused status

**Response:**
```json
{
  "goals": [...],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### Plans Module

#### POST /plans/generate
Generate AI-powered weekly plan. Subject to tier limits (FREE: 5/week, STARTER: 20/week, PRO: unlimited).

**Request:**
```json
{
  "weekStartDate": "2025-01-13",
  "goalIds": ["goal_1", "goal_2"]
}
```

**Response:**
```json
{
  "message": "Plan generated successfully",
  "plan": {
    "id": "plan_123",
    "weekStartDate": "2025-01-13T00:00:00.000Z",
    "weekEndDate": "2025-01-19T23:59:59.999Z",
    "status": "DRAFT",
    "qualityScore": 87,
    "totalTasks": 15,
    "aiModel": "gpt-4o",
    "generationTime": 3.2,
    "generationCost": 0.0012
  }
}
```

#### PUT /plans/:id/accept
Accept a generated plan and mark it as active.

**Response:**
```json
{
  "message": "Plan accepted successfully",
  "plan": {
    "id": "plan_123",
    "status": "ACCEPTED",
    "acceptedAt": "2025-01-13T10:30:00.000Z"
  }
}
```

---

### Tasks Module

#### POST /tasks
Create a manual task (user-created, not AI-generated).

**Request:**
```json
{
  "title": "Team meeting prep",
  "scheduledDate": "2025-01-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "durationMinutes": 60,
  "goalId": "goal_123",
  "notes": "Review Q1 metrics"
}
```

#### GET /tasks?date=2025-01-15&isCompleted=false
List tasks with powerful filtering.

**Query Parameters:**
- `date` (YYYY-MM-DD): Filter by specific date
- `weekStart` (YYYY-MM-DD): Filter by week
- `goalId` (string): Filter by goal
- `planId` (string): Filter by plan
- `isCompleted` (boolean): Completion status
- `aiGenerated` (boolean): AI vs manual tasks
- `page`, `limit`: Pagination

#### POST /tasks/:id/complete
Mark task as complete. Automatically updates goal analytics (completion rate, streaks).

**Response:**
```json
{
  "message": "Task marked as complete",
  "task": {
    "id": "task_123",
    "isCompleted": true,
    "completedAt": "2025-01-15T14:30:00.000Z"
  },
  "analytics": {
    "goalAnalyticsUpdated": true,
    "planAnalyticsUpdated": true
  }
}
```

#### PATCH /tasks/bulk
Perform bulk operations on multiple tasks.

**Request:**
```json
{
  "taskIds": ["task_1", "task_2", "task_3"],
  "operation": "complete"
}
```

**Operations**: `complete`, `skip`, `delete`, `reschedule`

---

### Calendar Module

#### GET /calendar/oauth/google
Initiate Google Calendar OAuth flow.

**Response:**
```json
{
  "message": "Please visit the auth URL to connect your Google Calendar",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### POST /calendar/sync
Sync tasks to Google Calendar with conflict detection.

**Request:**
```json
{
  "planId": "plan_123",
  "conflictResolution": "skip"
}
```

**Conflict Resolution Options:**
- `skip`: Don't sync conflicting tasks
- `adjust`: Auto-reschedule to suggested time
- `overwrite`: Force sync anyway

**Response:**
```json
{
  "message": "Successfully synced 12 tasks",
  "success": 12,
  "failed": 0,
  "skipped": 3,
  "conflicts": [
    {
      "task": {...},
      "reason": "Overlaps with existing event: Team Meeting",
      "suggestedTime": { "startTime": "10:00", "endTime": "11:00" }
    }
  ]
}
```

**Key Feature**: **Zero duplicates guaranteed!** Uses `taskId` in event metadata to ensure idempotency.

---

### Billing Module

#### GET /billing/plans
Get all pricing tiers.

**Response:**
```json
{
  "plans": [
    {
      "tier": "FREE",
      "name": "Free",
      "price": 0,
      "features": {
        "maxGoals": 2,
        "maxPlansPerWeek": 5,
        "aiModel": "gpt-4o-mini",
        "calendarSync": false
      }
    },
    {
      "tier": "STARTER",
      "name": "Starter",
      "price": 9.99,
      "features": {
        "maxGoals": 5,
        "maxPlansPerWeek": 20,
        "aiModel": "gpt-4o-mini",
        "calendarSync": true
      }
    },
    {
      "tier": "PRO",
      "name": "Pro",
      "price": 19.99,
      "features": {
        "maxGoals": "Infinity",
        "maxPlansPerWeek": "Infinity",
        "aiModel": "gpt-4o",
        "calendarSync": true,
        "prioritySupport": true
      }
    }
  ]
}
```

#### POST /billing/checkout
Create Stripe checkout session.

**Request:**
```json
{
  "tier": "PRO",
  "successUrl": "https://app.microplanner.com/dashboard",
  "cancelUrl": "https://app.microplanner.com/billing"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### POST /billing/webhooks/stripe
Stripe webhook receiver (NO AUTHENTICATION REQUIRED).

**Headers:**
```
stripe-signature: t=...,v1=...
```

**Handled Events:**
- `checkout.session.completed` → Upgrade user
- `customer.subscription.updated` → Update tier/status
- `customer.subscription.deleted` → Downgrade to FREE
- `invoice.payment_failed` → Mark PAST_DUE
- `invoice.payment_succeeded` → Mark ACTIVE

---

### Analytics Module

#### POST /analytics/events
Track user events for analytics.

**Request:**
```json
{
  "event": "plan_generated",
  "properties": {
    "planId": "plan_123",
    "goalCount": 3,
    "aiModel": "gpt-4o"
  },
  "platform": "ios",
  "appVersion": "1.0.0",
  "sessionId": "session_abc"
}
```

**Supported Events:**
- `user_signup`, `user_onboarding_complete`
- `goal_created`, `plan_generated`, `plan_accepted`
- `task_completed`, `calendar_connected`, `subscription_started`

#### GET /analytics/metrics
Get user dashboard metrics.

**Response:**
```json
{
  "metrics": {
    "totalGoals": 5,
    "totalPlans": 12,
    "totalTasks": 87,
    "tasksCompleted": 64,
    "planAcceptanceRate": 91.7,
    "calendarConnected": true,
    "llmCostTotal": 0.47,
    "avgTaskCompletionRate": 73.6
  }
}
```

#### GET /analytics/insights
Get weekly insights with personalized recommendations.

**Response:**
```json
{
  "insights": {
    "weekStartDate": "2025-01-13T00:00:00.000Z",
    "weekEndDate": "2025-01-19T23:59:59.999Z",
    "goalsCreated": 2,
    "plansGenerated": 1,
    "tasksCompleted": 18,
    "completionRate": 85.7,
    "topGoals": [
      { "title": "Morning Workout", "completions": 45 },
      { "title": "Deep Work", "completions": 38 }
    ],
    "productivity": "high",
    "recommendation": "Excellent work! You're crushing your goals this week."
  }
}
```

**Productivity Levels:**
- `high`: ≥80% completion rate
- `medium`: 50-79% completion rate
- `low`: <50% completion rate

#### GET /analytics/usage?days=30
Get LLM usage and costs.

**Response:**
```json
{
  "usage": {
    "period": { "days": 30, "since": "2024-12-15T00:00:00.000Z" },
    "totalRequests": 24,
    "totalCost": 0.47,
    "totalTokens": 125430,
    "avgLatency": 2.3,
    "byModel": {
      "gpt-4o-mini": { "count": 20, "cost": 0.23, "tokens": 98000 },
      "gpt-4o": { "count": 4, "cost": 0.24, "tokens": 27430 }
    }
  }
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["title must be between 1 and 100 characters"]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Tier Limit)
```json
{
  "statusCode": 403,
  "message": "Your FREE plan allows maximum 2 active goals. Upgrade to create more."
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📊 Rate Limiting

- **Default**: 100 requests/minute per user
- **Plan Generation**: 10 requests/hour (FREE), 50/hour (STARTER), unlimited (PRO)
- **Webhook endpoints**: No rate limiting

---

## 🎯 Feature Gates

Endpoints with tier restrictions automatically enforce limits:

| Feature | FREE | STARTER | PRO |
|---------|------|---------|-----|
| Goals | 2 | 5 | ∞ |
| Plans/Week | 5 | 20 | ∞ |
| Calendar Sync | ❌ | ✅ | ✅ |
| AI Model | gpt-4o-mini | gpt-4o-mini | gpt-4o |
| Priority Support | ❌ | ❌ | ✅ |

---

## 🔗 Swagger/OpenAPI

Interactive API documentation available at:
```
http://localhost:3000/api
```

---

## 📱 SDK Examples

### JavaScript/TypeScript
```typescript
const token = await clerk.session.getToken();

const response = await fetch('http://localhost:3000/api/v1/goals', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Morning Workout',
    frequencyPerWeek: 5,
    durationMinutes: 30,
  }),
});

const data = await response.json();
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Workout",
    "frequencyPerWeek": 5,
    "durationMinutes": 30
  }'
```

---

## 🚀 Postman Collection

Import the Postman collection for quick testing:
```
[Link to Postman collection]
```

Includes:
- All endpoints with examples
- Environment variables
- Pre-request scripts for authentication
- Test scripts for response validation
