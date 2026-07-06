# Phase 5 — Owner Deploy Checklist (human-only env tasks)

These are the items the implementation agent **cannot** do (they require account/DNS
access), extracted from the Phase 5 QA. All code-side alternatives have already been
implemented (dead links removed, mock UI hidden, graceful degradation added). Do these
before selling / demoing on a fresh domain.

---

## 1. Production Clerk instance (P1) — Vercel

Currently the app runs **Clerk development keys** in production (orange "Development mode"
badge, strict rate limits). Create a **production** Clerk instance and set these on the
Vercel project (Production scope):

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Web (Vercel) | `pk_live_…` |
| `CLERK_SECRET_KEY` | Web (Vercel) | `sk_live_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Web (Vercel) | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Web (Vercel) | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Web (Vercel) | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Web (Vercel) | `/onboarding` |
| `CLERK_DOMAIN` | **graphql-gateway (Render)** | e.g. `clerk.microplanner.com` (prod Clerk Frontend API host) |
| `CLERK_WEBHOOK_SECRET` | api-gateway (Render) | from the prod Clerk webhook endpoint |

> The gateway verifies every JWT against `https://$CLERK_DOMAIN/.well-known/jwks.json`.
> If `CLERK_DOMAIN` is unset it **rejects all tokens** (logs a warning on boot) — so this
> must be the **production** Clerk domain, matching the live publishable key.

## 2. Redis on the graphql-gateway (P1) — Render

Set `REDIS_URL` on the **graphql-gateway** Render service so GraphQL subscriptions work.

- Code already degrades safely without it: the gateway wraps pub/sub in a safe facade
  (`apps/graphql-gateway/src/index.ts`) — `publish` no-ops when Redis is absent and never
  fails a mutation, and subscriptions simply stay idle. So task create/complete/delete no
  longer throw a false "Internal server error" even if `REDIS_URL` is missing.
- Setting `REDIS_URL` re-enables live subscription pushes (real-time task updates).

## 3. Support domain DNS (P2)

`support.microplanner.com` does not resolve. Code no longer links to it — the support CTA
now uses `mailto:support@microplanner.com` and Help links point at in-app `/help`. Either:
- point `support.microplanner.com` at a real help desk and restore the link, **or**
- leave the mailto (already done) and do nothing.

## 4. (Optional) LLM planner keys — Render api-gateway

Rule-based planning always works (FREE tier + fallback). To enable AI planning on paid
tiers, set on the **api-gateway**:

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | STARTER (GPT-4o-mini) |
| `ANTHROPIC_API_KEY` | PRO/PREMIUM (Claude) |
| `ANTHROPIC_PLANNER_MODEL` | optional model override (default `claude-sonnet-5`) |

Without valid keys the planner degrades to rule-based and labels the plan honestly.

## 5. (Optional) Stripe checkout locale/currency (P2)

Test checkout showed `MAD` + German locale because Stripe geolocated the session. If you
want to pin USD/en-US for a US audience, set `currency: 'usd'` and `locale: 'en'` when
creating the Checkout Session in `billing.service.ts`. (Left as-is: it's cosmetic and
Stripe may override by geo; noted here as an owner decision.)
