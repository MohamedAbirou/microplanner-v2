# 🚀 MicroPlanner Backend Development Roadmap

**Complete Backend Implementation Plan** - 108 Tasks organized into 12 Phases

This roadmap ensures the backend is **fully functional, tested, and production-ready** before frontend development.

---

## 📊 Overview

- **Total Tasks**: 108
- **Phases**: 12
- **Estimated Timeline**: 6-8 weeks (full-time)
- **Testing Coverage Target**: 80%+
- **Documentation**: Complete API + Integration Guides

---

## 🎯 Phase 1: Core Infrastructure (7 tasks)

**Goal**: Set up authentication, middleware, and core request handling

### Tasks
1. ✅ Set up authentication with Clerk
2. ✅ Create JWT validation middleware
3. ✅ Implement AuthGuard for route protection
4. ✅ Create user sync from Clerk webhook
5. ✅ Add error handling middleware
6. ✅ Implement request logging interceptor
7. ✅ Set up validation pipes with custom messages

### Deliverables
- Working authentication system
- Protected routes with JWT validation
- Automatic user creation from Clerk
- Comprehensive error handling
- Request/response logging

### Testing
- Test JWT validation with valid/invalid tokens
- Test auth guard on protected endpoints
- Test Clerk webhook user sync
- Test error responses are consistent

**Completion Criteria**: All endpoints return 401 for unauthorized requests, users sync from Clerk automatically

---

## 👤 Phase 2: Users Module (7 tasks)

**Goal**: Complete user management with GDPR compliance

### Tasks
8. ✅ Implement GET /users/me endpoint
9. ✅ Implement PUT /users/me (update profile)
10. ✅ Implement PUT /users/me/preferences
11. ✅ Implement DELETE /users/me (GDPR deletion)
12. ✅ Implement GET /users/me/export (data export)
13. ✅ Write unit tests for Users service
14. ✅ Write integration tests for Users endpoints

### API Endpoints
```
GET    /api/v1/users/me              # Get current user
PUT    /api/v1/users/me              # Update profile
PUT    /api/v1/users/me/preferences  # Update preferences
DELETE /api/v1/users/me              # Delete account (GDPR)
GET    /api/v1/users/me/export       # Export all data (GDPR)
```

### Deliverables
- User profile management
- Preferences (sleep, work hours, energy patterns)
- GDPR-compliant data export
- Complete account deletion

### Testing
- Unit tests: Service logic (mocked Prisma)
- Integration tests: Full request/response cycle
- Test GDPR export includes all user data
- Test deletion cascades correctly

**Completion Criteria**: Users can manage their profile, preferences, and exercise GDPR rights

---

## 🎯 Phase 3: Goals Module (11 tasks)

**Goal**: Full CRUD for goals with tier-based limits and analytics

### Tasks
15. ✅ Implement POST /goals (create goal with validation)
16. ✅ Implement GET /goals (list with filters & pagination)
17. ✅ Implement GET /goals/:id (single goal)
18. ✅ Implement PUT /goals/:id (update goal)
19. ✅ Implement DELETE /goals/:id (soft delete)
20. ✅ Implement PUT /goals/:id/pause
21. ✅ Implement PUT /goals/:id/activate
22. ✅ Add tier-based goal limits guard
23. ✅ Implement goal analytics calculations
24. ✅ Write unit tests for Goals service
25. ✅ Write integration tests for Goals endpoints

### API Endpoints
```
POST   /api/v1/goals           # Create goal
GET    /api/v1/goals           # List goals (filters, pagination)
GET    /api/v1/goals/:id       # Get single goal
PUT    /api/v1/goals/:id       # Update goal
DELETE /api/v1/goals/:id       # Delete goal (soft)
PUT    /api/v1/goals/:id/pause # Pause goal
PUT    /api/v1/goals/:id/activate # Activate paused goal
```

### Validation Rules
- Title: 1-100 characters
- Frequency: 1-7 times per week
- Duration: 15-480 minutes
- Priority: 1-10

### Tier Limits
- **FREE**: Max 2 active goals
- **STARTER**: Max 5 active goals
- **PRO**: Unlimited goals

### Deliverables
- Complete goal CRUD operations
- Automatic analytics calculation
- Tier-based limits enforcement
- Soft deletion (maintain history)

### Testing
- Test goal creation with valid/invalid data
- Test tier limits are enforced
- Test pagination and filters work
- Test analytics update on goal changes
- Test soft delete doesn't remove data

**Completion Criteria**: Users can create, manage, pause goals with tier limits enforced

---

## 📅 Phase 4: Plans Module (11 tasks)

**Goal**: AI plan generation orchestration with quality scoring

### Tasks
26. ✅ Implement POST /plans/generate (orchestration)
27. ✅ Implement GET /plans/current (current week)
28. ✅ Implement GET /plans/:id (single plan)
29. ✅ Implement GET /plans (history with pagination)
30. ✅ Implement PUT /plans/:id/accept
31. ✅ Implement POST /plans/:id/regenerate
32. ✅ Implement DELETE /plans/:id (archive)
33. ✅ Add tier-based plan limits guard
34. ✅ Implement quality scoring algorithm
35. ✅ Add LLM cost tracking
36. ✅ Write unit tests for Plans service
37. ✅ Write integration tests for Plans endpoints

### API Endpoints
```
POST   /api/v1/plans/generate          # Generate new plan
GET    /api/v1/plans/current           # Get current week plan
GET    /api/v1/plans/:id               # Get single plan
GET    /api/v1/plans                   # Plan history
PUT    /api/v1/plans/:id/accept        # Accept plan
POST   /api/v1/plans/:id/regenerate    # Regenerate plan
DELETE /api/v1/plans/:id               # Archive plan
```

### Plan Generation Flow
1. Validate user has active goals
2. Check tier limits (plans per week)
3. Fetch user preferences
4. Fetch calendar busy slots (if connected)
5. Call Planning Service (Python FastAPI)
6. Parse and validate response
7. Calculate quality score
8. Store plan in database
9. Track LLM cost
10. Return plan to user

### Tier Limits
- **FREE**: 5 plans per week
- **STARTER**: 20 plans per week
- **PRO**: Unlimited plans

### Deliverables
- Plan generation orchestration
- Quality scoring algorithm
- Cost tracking per plan
- Plan history with metrics

### Testing
- Test plan generation with different complexities
- Test tier limits prevent over-generation
- Test quality scoring algorithm
- Test cost calculation accuracy
- Test integration with Planning Service

**Completion Criteria**: Users can generate AI plans with proper orchestration and cost tracking

---

## ✅ Phase 5: Tasks Module (11 tasks)

**Goal**: Complete task management with goal analytics updates

### Tasks
38. ✅ Implement POST /tasks (manual task creation)
39. ✅ Implement GET /tasks (with date/week filters)
40. ✅ Implement GET /tasks/:id (single task)
41. ✅ Implement PUT /tasks/:id (update task)
42. ✅ Implement DELETE /tasks/:id
43. ✅ Implement POST /tasks/:id/complete
44. ✅ Implement POST /tasks/:id/skip
45. ✅ Implement PATCH /tasks/bulk (bulk operations)
46. ✅ Update goal analytics on task completion
47. ✅ Write unit tests for Tasks service
48. ✅ Write integration tests for Tasks endpoints

### API Endpoints
```
POST   /api/v1/tasks                # Create manual task
GET    /api/v1/tasks                # List tasks (filters)
GET    /api/v1/tasks/:id            # Get single task
PUT    /api/v1/tasks/:id            # Update task
DELETE /api/v1/tasks/:id            # Delete task
POST   /api/v1/tasks/:id/complete   # Mark complete
POST   /api/v1/tasks/:id/skip       # Skip task
PATCH  /api/v1/tasks/bulk           # Bulk operations
```

### Analytics Updates
On task completion:
- Update goal.completionRate
- Update goal.totalCompletions
- Update goal.currentStreak
- Update goal.longestStreak
- Update plan.completionRate

### Deliverables
- Task CRUD operations
- Task completion tracking
- Bulk operations for efficiency
- Automatic goal analytics updates

### Testing
- Test manual task creation
- Test task filtering by date, week, goal
- Test completion updates analytics correctly
- Test streak calculations
- Test bulk operations

**Completion Criteria**: Users can manage tasks with automatic analytics tracking

---

## 📆 Phase 6: Calendar Module (14 tasks) **CRITICAL**

**Goal**: Bulletproof calendar integration with zero duplicates

### Tasks
49. ✅ Set up Google OAuth 2.0 configuration
50. ✅ Implement GET /calendar/oauth/google (initiate)
51. ✅ Implement GET /calendar/oauth/google/callback
52. ✅ Implement token encryption/decryption service
53. ✅ Implement automatic token refresh
54. ✅ Implement GET /calendar/events (read calendar)
55. ✅ Implement POST /calendar/sync (write tasks)
56. ✅ Implement idempotent event creation
57. ✅ Implement conflict detection algorithm
58. ✅ Implement conflict resolution flow
59. ✅ Implement DELETE /calendar/disconnect
60. ✅ Add sync status tracking
61. ✅ Write unit tests for Calendar service
62. ✅ Write integration tests with Google Calendar API

### API Endpoints
```
GET    /api/v1/calendar/oauth/google          # Start OAuth
GET    /api/v1/calendar/oauth/google/callback # OAuth callback
GET    /api/v1/calendar/events                # Read events
POST   /api/v1/calendar/sync                  # Sync tasks
DELETE /api/v1/calendar/disconnect            # Disconnect
GET    /api/v1/calendar/status                # Sync status
```

### Idempotency Strategy
```typescript
// Every task has unique ID stored in calendar event metadata
// Before creating event:
1. Search for event with metadata.taskId = task.id
2. If exists: UPDATE event
3. If not exists: CREATE event
4. Never duplicate
```

### Conflict Detection
```typescript
// Conflicts occur when:
1. Task time overlaps with existing calendar event
2. Calendar event was modified externally
3. Task was moved after sync

// Resolution options:
- Skip task (don't sync)
- Adjust time (suggest new time)
- Overwrite (replace calendar event)
```

### Token Security
- Tokens encrypted with AES-256-GCM
- Stored in database encrypted
- Decrypted only when needed
- Automatic refresh before expiry

### Deliverables
- Google OAuth flow
- Secure token storage
- Read calendar events
- Idempotent sync (zero duplicates)
- Conflict detection & resolution

### Testing
- **100+ sync scenarios** (this is critical!)
- Test idempotency: sync twice → no duplicates
- Test conflict detection
- Test token refresh
- Test encryption/decryption
- Test disconnect clears tokens

**Completion Criteria**: Calendar sync works flawlessly with zero duplicates, tested extensively

---

## 💳 Phase 7: Billing Module (12 tasks)

**Goal**: Complete Stripe integration with webhook handling

### Tasks
63. ✅ Set up Stripe configuration
64. ✅ Implement GET /billing/plans (pricing info)
65. ✅ Implement POST /billing/checkout (create session)
66. ✅ Implement GET /billing/portal (customer portal)
67. ✅ Implement POST /billing/webhooks/stripe
68. ✅ Handle checkout.session.completed event
69. ✅ Handle customer.subscription.updated event
70. ✅ Handle customer.subscription.deleted event
71. ✅ Implement feature gates guard
72. ✅ Add usage tracking for limits
73. ✅ Write unit tests for Billing service
74. ✅ Write integration tests for Stripe webhooks

### API Endpoints
```
GET    /api/v1/billing/plans           # Get pricing tiers
POST   /api/v1/billing/checkout        # Create checkout session
GET    /api/v1/billing/portal          # Get customer portal URL
POST   /api/v1/billing/webhooks/stripe # Stripe webhook receiver
GET    /api/v1/billing/subscription    # Current subscription
POST   /api/v1/billing/cancel          # Cancel subscription
```

### Stripe Events to Handle
```typescript
checkout.session.completed → Create/update subscription
customer.subscription.updated → Update tier and status
customer.subscription.deleted → Downgrade to FREE
invoice.payment_failed → Mark PAST_DUE
invoice.payment_succeeded → Mark ACTIVE
```

### Feature Gates
```typescript
@UseGuards(FeatureGateGuard)
@RequireFeature('maxGoals', 5)
async createGoal() {
  // Only allows if user has < 5 goals or is STARTER/PRO tier
}
```

### Deliverables
- Stripe checkout flow
- Webhook handling for all events
- Feature gates by tier
- Usage tracking
- Customer portal access

### Testing
- Test checkout session creation
- Test webhook signature validation
- Test each webhook event
- Test feature gates work correctly
- Test usage limits enforced

**Completion Criteria**: Users can subscribe, upgrade, cancel with all webhooks handled

---

## 📊 Phase 8: Analytics Module (6 tasks)

**Goal**: Event tracking and insights generation

### Tasks
75. ✅ Implement POST /analytics/events (track event)
76. ✅ Implement GET /analytics/metrics (user metrics)
77. ✅ Implement GET /analytics/insights (weekly)
78. ✅ Implement LLM usage tracking
79. ✅ Create analytics aggregation job
80. ✅ Write unit tests for Analytics service

### API Endpoints
```
POST   /api/v1/analytics/events   # Track event
GET    /api/v1/analytics/metrics  # User metrics
GET    /api/v1/analytics/insights # Weekly insights
GET    /api/v1/analytics/usage    # LLM usage stats
```

### Events to Track
```typescript
- user_signup
- user_onboarding_complete
- goal_created
- plan_generated
- plan_accepted
- task_completed
- calendar_connected
- subscription_started
```

### Metrics Calculated
- Total goals created
- Total plans generated
- Average plan acceptance rate
- Total tasks completed
- Calendar sync success rate
- LLM costs per user

### Deliverables
- Event tracking system
- User metrics dashboard data
- Weekly insights generation
- LLM usage analytics

### Testing
- Test event tracking
- Test metrics calculation
- Test insights generation
- Test LLM usage tracking

**Completion Criteria**: All user actions tracked, insights generated weekly

---

## 🧪 Phase 9: Testing & Quality (7 tasks)

**Goal**: Comprehensive testing with 80%+ coverage

### Tasks
81. ✅ Set up Jest testing framework
82. ✅ Configure test database
83. ✅ Write E2E tests for auth flow
84. ✅ Write E2E tests for complete user journey
85. ✅ Run load tests with k6
86. ✅ Fix all failing tests
87. ✅ Achieve 80% code coverage

### Testing Strategy

#### Unit Tests
- All services (mocked dependencies)
- All guards and pipes
- Utility functions
- **Target**: 80% coverage

#### Integration Tests
- All endpoints (real database)
- Webhook handling
- External API integration
- **Target**: All critical paths covered

#### E2E Tests
```typescript
// Complete user journey
1. Sign up with Clerk
2. Create 2 goals
3. Generate plan
4. Accept plan
5. Connect calendar
6. Sync tasks to calendar
7. Complete tasks
8. View analytics
```

#### Load Tests (k6)
```javascript
// Test scenarios:
- 100 concurrent users creating goals
- 50 concurrent plan generations
- 200 concurrent task operations
- Target: p95 < 2 seconds
```

### Deliverables
- Complete test suite
- 80%+ code coverage
- Load test results
- Performance benchmarks

### Testing
- All tests passing
- No flaky tests
- Fast test execution (<2 min)

**Completion Criteria**: 80%+ coverage, all tests green, load tests pass

---

## 📚 Phase 10: Documentation (5 tasks)

**Goal**: Complete API documentation and guides

### Tasks
88. ✅ Create Postman/Bruno collection
89. ✅ Document all API endpoints
90. ✅ Create integration guide for calendar
91. ✅ Create deployment guide
92. ✅ Update README with API examples

### Deliverables

#### Postman Collection
- All endpoints with examples
- Environment variables
- Pre-request scripts
- Test scripts

#### API Documentation
- Endpoint descriptions
- Request/response examples
- Error codes
- Rate limits
- Authentication

#### Integration Guides
- Calendar integration step-by-step
- Stripe integration guide
- Clerk authentication setup
- Local development guide

#### Deployment Guide
- Environment variables
- Database migrations
- Fly.io deployment
- Monitoring setup

**Completion Criteria**: Any developer can use the API with documentation alone

---

## 🚀 Phase 11: Production Readiness (9 tasks)

**Goal**: Production-grade reliability and monitoring

### Tasks
93. ✅ Set up Sentry error tracking
94. ✅ Configure rate limiting per endpoint
95. ✅ Add request ID tracking
96. ✅ Implement circuit breakers for external APIs
97. ✅ Add health check endpoints with dependencies
98. ✅ Configure graceful shutdown
99. ✅ Set up Redis connection pooling
100. ✅ Optimize database queries
101. ✅ Add database connection retry logic

### Production Features

#### Error Tracking (Sentry)
```typescript
@Catch()
export class SentryInterceptor {
  catch(exception: any, host: ArgumentsHost) {
    Sentry.captureException(exception);
    // ... handle error
  }
}
```

#### Rate Limiting
```typescript
// Per endpoint rate limits
@Throttle(100, 60) // 100 requests per 60 seconds
@Get('goals')
```

#### Request ID
```typescript
// Track requests across services
X-Request-ID: uuid-v4
// Logged with every request
```

#### Circuit Breakers
```typescript
// For OpenAI, Google Calendar, Stripe
circuitBreaker.execute(async () => {
  return await externalService.call();
});
```

#### Health Checks
```typescript
GET /health
{
  status: "healthy",
  database: "connected",
  redis: "connected",
  planningService: "connected"
}
```

### Deliverables
- Sentry integration
- Rate limiting configured
- Circuit breakers for external APIs
- Health checks
- Graceful shutdown
- Connection pooling
- Query optimization

**Completion Criteria**: System is production-ready with monitoring and resilience

---

## ✅ Phase 12: Final Testing (7 tasks)

**Goal**: Final verification before production

### Tasks
102. ✅ Run full integration test suite
103. ✅ Perform security audit
104. ✅ Test all error scenarios
105. ✅ Verify all tier limits work correctly
106. ✅ Test calendar sync with 100+ scenarios
107. ✅ Load test entire system
108. ✅ Deploy to staging and smoke test
109. ✅ Create final commit and push to GitHub

### Final Checklist

#### Functionality
- [ ] All 50+ endpoints working
- [ ] All tier limits enforced
- [ ] Calendar sync zero duplicates
- [ ] Webhooks handled correctly
- [ ] Analytics tracking works

#### Performance
- [ ] API p95 latency < 2s
- [ ] Database queries optimized
- [ ] Handles 500 concurrent users
- [ ] No memory leaks

#### Security
- [ ] All routes protected
- [ ] Tokens encrypted
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] CORS configured

#### Testing
- [ ] 80%+ code coverage
- [ ] All tests passing
- [ ] Load tests pass
- [ ] E2E tests complete

#### Documentation
- [ ] API docs complete
- [ ] Postman collection ready
- [ ] Integration guides written
- [ ] README updated

**Completion Criteria**: Backend is production-ready, tested, documented, and deployed to staging

---

## 📈 Progress Tracking

Use this checklist to track overall progress:

- [ ] **Phase 1**: Core Infrastructure (7/7)
- [ ] **Phase 2**: Users Module (7/7)
- [ ] **Phase 3**: Goals Module (11/11)
- [ ] **Phase 4**: Plans Module (11/11)
- [ ] **Phase 5**: Tasks Module (11/11)
- [ ] **Phase 6**: Calendar Module (14/14) ⚠️ CRITICAL
- [ ] **Phase 7**: Billing Module (12/12)
- [ ] **Phase 8**: Analytics Module (6/6)
- [ ] **Phase 9**: Testing & Quality (7/7)
- [ ] **Phase 10**: Documentation (5/5)
- [ ] **Phase 11**: Production Readiness (9/9)
- [ ] **Phase 12**: Final Testing (7/7)

**Total Progress**: 0/108 tasks completed

---

## 🎯 Success Metrics

Backend is complete when:

✅ **All 108 tasks completed**
✅ **All tests passing (80%+ coverage)**
✅ **All endpoints documented**
✅ **Calendar sync tested with 100+ scenarios**
✅ **Load tests passing (500 concurrent users)**
✅ **Deployed to staging successfully**
✅ **Security audit passed**
✅ **All tier limits working**

---

## 🚀 Next Steps After Completion

Once backend is 100% complete:

1. **Frontend Development**
   - Next.js web app
   - Expo mobile app
   - Connect to completed API

2. **Production Deployment**
   - Deploy API Gateway to Fly.io
   - Deploy Planning Service to Fly.io
   - Configure production environment

3. **Beta Launch**
   - Invite beta users
   - Collect feedback
   - Iterate on features

---

**Ready to build the ReclaimAI killer!** 🚀

_Professional, tested, production-ready backend._
