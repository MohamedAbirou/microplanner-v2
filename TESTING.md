# Testing Guide

## Test Suite Summary

### ✅ Unit Tests Created

**Users Module** (`users.service.spec.ts`):
- 9 test cases covering all service methods
- Tests: findByClerkId, findById, createFromClerk, updateProfile, updatePreferences, deleteAccount, exportUserData, updateLastSeen

**Users Controller** (`users.controller.spec.ts`):
- 11 integration tests
- Tests all endpoints, error handling, data completeness

**Goals Service** (from Phase 3):
- Tests for create, findAll, findOne, update, remove, pause, activate, calculateAnalytics

**Plans Service** (from Phase 4):
- Tests for generate, getCurrentWeekPlan, findOne, accept, regenerate, archive

**Tasks Service** (`tasks.service.spec.ts`):
- 11 test cases
- Tests: create, findAll, findOne, update, remove, complete, skip, bulkOperation

**Tasks Controller** (`tasks.controller.spec.ts`):
- 10 integration tests
- Tests all 8 endpoints + bulk operations

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

### Test Infrastructure

**Framework**: Jest + NestJS Testing
**Database**: Mocked with Prisma (unit tests)
**Coverage Target**: 80%+

### Current Coverage

Modules with unit tests:
- ✅ Users (service + controller)
- ✅ Goals (service)
- ✅ Plans (service)
- ✅ Tasks (service + controller)
- ⚠️ Calendar (needs tests)
- ⚠️ Billing (needs tests)
- ⚠️ Analytics (needs tests)

### E2E Test Scenarios

#### Critical User Journey
```typescript
1. User signup via Clerk
2. Create 2 goals (test tier limits)
3. Generate weekly plan
4. Accept plan
5. Connect Google Calendar
6. Sync tasks to calendar
7. Complete tasks
8. View analytics/insights
9. Upgrade subscription
10. Create unlimited goals (PRO tier)
```

### Load Testing (k6)

**Scenarios to Test**:
```javascript
// 100 concurrent users creating goals
export let options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% under 2s
  },
};

// 50 concurrent plan generations
// 200 concurrent task operations
```

### Test Best Practices

1. **Mock External APIs**: Stripe, Google Calendar, Clerk
2. **Use Test Database**: Separate from development
3. **Cleanup After Tests**: Reset database state
4. **Test Error Cases**: Not just happy paths
5. **Test Feature Gates**: Tier limit enforcement
6. **Test Webhooks**: Signature verification

### Running Tests

```bash
# API Gateway tests
cd apps/api-gateway
pnpm test

# Specific module
pnpm test users.service

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:cov
open coverage/lcov-report/index.html
```

### Notes

- Jest configuration: Uses NestJS defaults
- Test files: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for E2E
- Mocking: Uses Jest mocks for Prisma, external APIs
- All service tests use dependency injection mocking
- Controller tests mock the service layer

### Next Steps

1. Add E2E tests for complete user journeys
2. Add tests for Calendar, Billing, Analytics modules
3. Set up CI/CD to run tests on every PR
4. Add load tests with k6
5. Achieve 80%+ code coverage
