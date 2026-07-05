# MicroPlanner — Buyer / Operator Guide

Everything you need to run, verify, and operate MicroPlanner. Written for the
person who takes this product over: setup in minutes, no tribal knowledge.

---

## 1. What this product is

A mobile-first **AI weekly planner** SaaS: users create goals, the AI (tiered:
rule-based → GPT-4o-mini → Claude) generates a scheduled weekly plan, accepted
plans materialize as calendar tasks, progress feeds streaks/analytics, and
Stripe subscriptions gate the tiers.

**Monetization is built in and live-verified in Stripe test mode:**
Free ($0) → Starter ($7/mo) → Pro ($15/mo) → Premium ($29/mo), enforced
server-side (goals/plans/tasks caps + AI model selection per tier).

## 2. Architecture (three deployables + two datastores)

```
Next.js 15 web (:3000)  — 100% GraphQL via Apollo Client, Clerk auth
        │
GraphQL gateway (:4000) — Apollo Server 4, JWKS-verified JWTs,
        │                 graphql-ws subscriptions, DataLoaders
NestJS API (:3001)      — business logic, Prisma, Stripe, Clerk/Stripe
        │                 webhooks, AI planners, email (Resend), crons
PostgreSQL + Redis      — docker-compose for dev
```

The GraphQL gateway is the ONLY API the frontend talks to. REST is internal
plus the webhook endpoints external services require.

## 3. Run it locally (verified sequence)

```bash
pnpm install
docker compose up -d postgres redis
cd packages/database && pnpm prisma db push && pnpm prisma generate

# terminal 1 — REST API
cd apps/api-gateway && pnpm exec nest build && node dist/main.js

# terminal 2 — GraphQL gateway
cd apps/graphql-gateway && pnpm dev

# terminal 3 — web
cd apps/web && pnpm dev
```

Then create Stripe products once (test key required in
`apps/api-gateway/.env.local`):

```bash
node scripts/setup-stripe-products.mjs
```

## 4. Environment variables

Copy `.env.example` per app and fill in. The load-bearing ones:

| Var | App | Purpose |
|---|---|---|
| `DATABASE_URL` | api-gateway, packages/database | Postgres connection |
| `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` | api-gateway, web | Auth |
| `CLERK_DOMAIN` | api-gateway, graphql-gateway | JWKS verification (e.g. `xxx.clerk.accounts.dev`) |
| `CLERK_WEBHOOK_SECRET` | api-gateway | Clerk user webhooks |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | api-gateway | Billing |
| `STRIPE_STARTER/PRO/PREMIUM_PRICE_ID` | api-gateway | Created by the bootstrap script |
| `OPENAI_API_KEY` | api-gateway | Starter-tier planner (falls back to rule-based if absent) |
| `ANTHROPIC_API_KEY` | api-gateway | Pro/Premium planner (falls back gracefully) |
| `ANTHROPIC_PLANNER_MODEL` | api-gateway | Default `claude-sonnet-5` |
| `RESEND_API_KEY` | api-gateway | All product emails (no-ops if absent) |
| `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` | api-gateway | Google Calendar sync |
| `ADMIN_EMAILS` | api-gateway, graphql-gateway | Comma-separated admin allowlist (refunds, reconcile, waitlist ops). Fail-closed when unset |
| `APP_URL` | api-gateway | Checkout redirect + email links |
| `REDIS_URL` / `REDIS_HOST/PORT` | api-gateway, graphql-gateway | Cache, pub/sub, webhook dedup |
| `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_GRAPHQL_WS_URL` | web | Gateway endpoints |

⚠️ **`packages/database/.env` must contain ONLY `DATABASE_URL`/`DIRECT_URL`.**
Prisma loads it into `process.env` at import time, before app env files, and
dotenv never overrides — any secret placed there silently shadows the real one.

## 5. Billing operations (Stripe)

- **Products/prices**: `node scripts/setup-stripe-products.mjs` (idempotent,
  refuses live keys).
- **Webhook**: point a Stripe webhook at `POST /api/v1/billing/webhooks/stripe`
  with events `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_succeeded`,
  `invoice.payment_failed`. Locally: `stripe listen --forward-to
  localhost:3001/api/v1/billing/webhooks/stripe`.
- **Lost webhooks are self-healing**: a daily reconciliation sweep re-derives
  every user's subscription state from Stripe (admins can trigger it with
  `POST /api/v1/billing/reconcile`). The system works even before the webhook
  endpoint is publicly reachable.
- **Cancel semantics**: period-end cancel keeps the user's paid access until
  the boundary (Stripe `cancel_at_period_end`); `{"immediately": true}`
  cancels now. Users get scheduled/cancelled emails.
- **Dunning**: payment failure → PAST_DUE with a 7-day grace anchored to the
  FIRST failure; 3 failures or grace expiry → suspended to Free (nothing
  deleted); a later successful payment restores the tier automatically.
- **Refunds**: `POST /api/v1/billing/refund` (admin-only) — partial refunds
  supported, cumulative amount capped at the original charge.

## 6. AI planner behavior

Tier → model: Free = rule-based, Starter = GPT-4o-mini, Pro/Premium = Claude.
Every LLM call is wrapped in a fallback chain (Claude → GPT → rule-based), so
**an AI-provider outage or missing key never blocks plan generation** — the
plan's `aiModel` field labels any fallback honestly. Accepting a plan
materializes its tasks onto the calendar (idempotent).

## 7. Operational surface

- Health: `GET /api/v1/health` (+ `/detailed`, `/liveness`, `/readiness`)
- API docs (Swagger): `http://localhost:3001/api/docs`
- Contract regression net (run before any deploy):
  `node scripts/audit-contracts.mjs && node scripts/audit-operations.mjs`
- Crons (inside api-gateway): task reminders (hourly + daily 09:00), weekly
  summary (Sun 18:00), billing reconciliation (daily 06:30) — all honor
  per-user notification preferences.

## 8. Known deferred features (expansion roadmap)

All have database models and partial backends; they are hidden or clearly
scoped rather than half-working: native mobile apps, offline/PWA mode,
template marketplace UI, Todoist/Linear/Outlook integrations, team
workspaces UI, scheduling-links UI, referrals, per-user work-days field,
focus-block auto-scheduling. See `docs/COMPLETION_PLAN.md` (Phase 7 notes)
for the full list.

## 9. Before going live (checklist)

1. Rotate every key that was used during development, set live Stripe keys,
   re-run the product bootstrap against live mode manually.
2. Configure the Stripe + Clerk webhooks against your production domain.
3. Set `ADMIN_EMAILS` to the real operator emails.
4. Set `NODE_ENV=production` (gateway disables introspection; Sentry sampling
   drops to 10%).
5. Point `DATABASE_URL` at managed Postgres and run
   `pnpm prisma migrate deploy` (or `db push` for first boot).
