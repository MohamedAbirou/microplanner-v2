# MicroPlanner — Security Checklist

**Audit date:** 2026-07-07 · Companion: [`FINDINGS.md`](./FINDINGS.md), [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md)

Legend: ✅ verified in code · 🟡 partial / documented risk · ⏳ deferred (P2)

---

## 5.1 Authentication & authorization

| Item | Status | Notes |
|------|--------|-------|
| Every api-gateway route requires auth by default | ✅ | Global `ClerkAuthGuard` (`APP_GUARD`); opt-out only via explicit `@Public()`. |
| JWT verified against Clerk JWKS (RS256, issuer check) | ✅ | `ClerkStrategy` (api-gateway) + `verifyToken` (graphql-gateway). No token → `user=null` → `UNAUTHENTICATED`. |
| `userId` derived **server-side only** | ✅ | From verified JWT `sub` → DB user. |
| **`x-user-id` header is never trusted** | ✅ | Grep confirms **0 reads** of `x-user-id` in api-gateway. The gateway sets it but it is dead/cosmetic; JWT is authoritative end-to-end. |
| Row-level ownership on get/update/delete | ✅ | `findFirst({ where: { id, userId } })` on task/goal/plan single-entity ops. |
| GraphQL rejects unauthenticated | ✅ | Every resolver guards `if (!user) throw UNAUTHENTICATED`. |
| Introspection disabled in production | ✅ | Gateway + nested NestJS GraphQL module, gated on `NODE_ENV`. |
| GraphQL query depth limited | ✅ | `depthLimit(8)` validation rule — blocks nested-fan-out DoS. |

**Residual risk (🟡, P2):** the dead `x-user-id` header *looks* security-relevant.
Recommend removing it from `rest-api.ts` and adding a cross-user IDOR regression
test (`GET /tasks/:otherUsersTaskId` → 404). Effort ~1h.

## 5.2 Input validation

| Item | Status | Notes |
|------|--------|-------|
| DTO validation (class-validator) | ✅ | Global `ValidationPipe`; `QueryTasksDto` bounds `limit` `[1,500]`, `priority` `[1,3]`, ISO date strings. |
| `forbidNonWhitelisted` on update DTOs | ✅ | Referenced in `GoalsAPI.updateGoal` comments; rejects unexpected fields. |
| Task query date range capped | ✅ | 400-day clamp added (`TasksService.findAll`). |
| No arbitrary `orderBy` passthrough → Prisma injection | 🟡 | Task sort uses fixed server-side ordering (`scheduledDate, startTime`); GraphQL `sort` accepted but default is authoritative. No user string reaches a Prisma `orderBy` key. Confirmed safe. |

## 5.3 Rate limiting & abuse

| Item | Status | Notes |
|------|--------|-------|
| Global rate limiting enforced | ✅ | `UserThrottlerGuard` now registered as `APP_GUARD` (was configured but **never enforced** — key finding P0-1). |
| Per-**user** limits (not just IP) | ✅ | Tracker keys by user id, falls back to IP. |
| Stricter limit on expensive `generatePlan` | ✅ | `@Throttle({ strict: 5/min })`. |
| `429` + `Retry-After` | ✅ | Emitted natively by Throttler v5. |
| Health probes exempt | ✅ | `@SkipThrottle()` on `HealthController`. |
| Idempotency on plan accept | ✅ | `acceptPlan` guards on `existingTaskCount` — safe to re-run. |
| Idempotency on Stripe webhook | ✅ | Redis dedup key, 72h TTL (`billing.service`). |
| Multi-instance shared limits | 🟡 | In-memory storage → limit is per-instance. Redis-backed storage deferred (P1). |

## 5.4 Secrets & data

| Item | Status | Notes |
|------|--------|-------|
| Stripe webhook signature verified | ✅ | `stripe.webhooks.constructEvent(rawBody, sig, secret)`. |
| Clerk webhook signature verified | ✅ | Svix `wh.verify` with `svix-*` headers (`webhook.service`). |
| Calendar OAuth tokens encrypted at rest | ✅ | `EncryptionService` (`ENCRYPTION_KEY`); `CalendarToken.accessToken` stored via app-level encryption. |
| No secrets committed | ✅ | Production DB URL lives in `packages/database/.env` (gitignored); nothing committed this pass. |
| CORS explicit origins | ✅ | Allowlist + `*.vercel.app`; unknown origins logged + blocked (`graphql-gateway/index.ts`). |
| Security headers (X-Frame-Options, nosniff, Referrer-Policy) | ✅ | `next.config.js`. |
| HSTS + Permissions-Policy | ✅ | Added this pass (`max-age=2y; includeSubDomains; preload`). |
| Content-Security-Policy | ⏳ | **Deferred.** A correct CSP with Clerk + Apollo + Vercel is high-risk to get wrong and easy to break auth. Recommend building in report-only mode first. Effort ~1d. |
| `NEXT_PUBLIC_*` audit (no secrets in bundle) | 🟡 | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public by design) and GraphQL URL only. No private keys observed. Recommend a scripted grep gate in CI. |

## 5.5 Dependency & supply chain

| Item | Status | Notes |
|------|--------|-------|
| `pnpm audit` | ⏳ | **Not run this pass** (network/time). Recommend running before release; triage critical/high. |
| No raw SQL without parameterization | ✅ | Only raw SQL is `$queryRaw\`SELECT 1\`` (health) — no interpolation. All data access via Prisma. |
| New dependencies added | ✅ none | Depth-limit rule and throttler tracker written with existing packages only. |

---

## Remaining risks / deferrals

| # | Risk | Severity | Effort |
|---|------|----------|--------|
| 1 | Rate limits per-instance (in-memory) until Redis storage added | Medium | 0.5d |
| 2 | No CSP header | Medium | 1d (report-only first) |
| 3 | `x-user-id` dead header + missing IDOR regression test | Low | 1h |
| 4 | `pnpm audit` not run | Unknown | 0.5d incl. triage |
| 5 | Load test baseline not captured | — (perf, not security) | 0.5d |

No P0 security holes remain open after this pass. The single highest-impact fix
was **P0-1: rate limiting was configured but never enforced** — now global.
