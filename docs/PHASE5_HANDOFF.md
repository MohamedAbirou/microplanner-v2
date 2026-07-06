# Phase 5 Browser QA — Owner Handoff for Fable

**Prepared:** 2026-07-06  
**Attach this file to the Phase 5 prompt.** Everything below was verified against production.

---

## 1. Production endpoints (stack is UP — no local boot needed)

| Service | URL | Preflight (verified) |
|---------|-----|----------------------|
| **Web** | https://microplanner-web.vercel.app | HTTP 200 |
| **Sign-in** | https://microplanner-web.vercel.app/sign-in | Use this for Clerk |
| **GraphQL** | https://microplanner-graphql.onrender.com/graphql | Parent returns `{"status":"ok"}` |
| **REST API** | https://microplanner-v2-api.onrender.com | `/api/v1/health` → 200, DB connected |

**Render cold start:** first API/GraphQL request after idle may take 30–60s. Wait and retry before filing a P0.

**Network tab check:** GraphQL calls must go to `microplanner-graphql.onrender.com`, not `localhost`.

---

## 2. Clerk test accounts

### Currently in production database (only 1 user)

| # | Email | Display name | Tier | Onboarding | Goals | Tasks | Plans | Use for |
|---|-------|--------------|------|------------|-------|-------|-------|---------|
| 1 | `abiroumohamed58@gmail.com` | Mohamed Abirou | **FREE** | ✅ Complete | 1 | 0 | 0 | Main pass — core loops, settings, calendar views, tier limits |

> **Owner note:** Production DB currently has **one** synced user. There are no pre-seeded STARTER/PRO accounts yet.

### How to get multi-tier coverage (pick one strategy)

**Strategy A — Recommended (billing flow is part of QA anyway)**  
Use account #1 for FREE testing first, then during the billing section:
1. Upgrade to **Starter ($7/mo)** via in-app checkout → verify tier badge + limits change  
2. Later in the pass (or a second session): upgrade same account to **Pro ($15/mo)** OR use a fresh Google account for Pro-only tests  
3. After billing tests: **period-end cancel** (keeps access until period ends) — do **not** use immediate cancel unless testing that specific flow

**Strategy B — Separate accounts from OAuth picker**  
When Clerk/Google shows multiple accounts at sign-in, owner picks:
- **Session 1 (FREE):** `abiroumohamed58@gmail.com`  
- **Session 2 (fresh user):** any other Google account → full onboarding flow test  
- **Session 3 (STARTER):** different Google account → sign in → upgrade via Stripe  
- **Session 4 (PRO):** different Google account → sign in → upgrade to Pro  

Accounts not yet in DB will sync on first sign-in (2s onboarding spinner is normal).

### OAuth account-picker protocol (for Fable)

When the Google account chooser appears:
1. **Pause** and message owner: *"Account picker is open — which account for this session?"*
2. Owner replies with one of:
   - `"Use abiroumohamed58@gmail.com — FREE tier pass"`
   - `"Use [other account] — fresh onboarding test"`
   - `"Use [other account] — will upgrade to STARTER"`
3. Do **not** skip auth or mark flows passed without a signed-in session.

---

## 3. Stripe test mode (billing flows)

Production billing was built and verified in **Stripe test mode** (see `docs/COMPLETION_PLAN.md` Phase 4).

### Test card (success)

| Field | Value |
|-------|-------|
| Number | `4242 4242 4242 4242` |
| Expiry | Any future date (e.g. `12/34`) |
| CVC | Any 3 digits (e.g. `123`) |
| ZIP | Any (e.g. `10001`) |
| Name | Any |

### Other useful test cards (only if testing failure paths)

| Scenario | Number |
|----------|--------|
| Decline | `4000 0000 0000 0002` |
| Requires authentication (3DS) | `4000 0025 0000 3155` |

### Billing test protocol

1. Owner confirms Render `STRIPE_SECRET_KEY` starts with `sk_test_` (not live) before checkout  
2. Fable starts checkout from app (Settings billing / upgrade modal / `/billing` if it exists)  
3. If 3DS or bank confirmation appears → **pause**, owner completes in browser, Fable continues  
4. After successful checkout: verify tier badge in sidebar, plan generation model label, and goal/plan limits  
5. Prefer **period-end cancel** over immediate cancel to preserve test account for later routes  

### Pricing reference

| Tier | Price | Plan/week limit | Goals limit |
|------|-------|-----------------|-------------|
| FREE | $0 | 5 | 2 |
| STARTER | $7/mo | 20 | 5 |
| PRO | $15/mo | Unlimited | Unlimited |

---

## 4. Recommended test session order

| Order | Account | Tier | Focus |
|-------|---------|------|-------|
| 1 | `abiroumohamed58@gmail.com` | FREE | Marketing pages (logged out) → sign in → dashboard, goals, tasks, plans generate/accept, day/week/month, settings, search, analytics, integrations |
| 2 | Same or fresh Google account | FREE → onboarding | Full 5-step onboarding wizard (if using fresh account) |
| 3 | Account #1 or dedicated account | FREE → STARTER | Stripe checkout, tier change, Starter plan generation (GPT label or honest fallback) |
| 4 | Dedicated account | → PRO | Pro checkout, Claude planner label, unlimited goals UX |
| 5 | Any signed-in account | Any | Mobile viewport (~375px), keyboard shortcuts (⌘K), notifications bell + `/notifications` |

---

## 5. Owner actions Fable may request (have these ready)

| Blocker | Owner action |
|---------|--------------|
| OAuth account picker | Reply: `"Use abiroumohamed58@gmail.com"` or name another Google account |
| Stripe 3DS / confirmation | Complete payment step in browser, reply `"continue"` |
| Google Calendar OAuth | Approve Google consent for calendar connect test (or confirm keys not configured — document graceful degradation) |
| Confirm test vs live Stripe | Check Render env: `sk_test_` = safe to run checkout |
| Destructive tests (delete account, immediate cancel) | Explicit yes/no before Fable runs them |

---

## 6. What NOT to do on production

- Do not run load tests against Render URLs  
- Do not delete the only production user unless owner explicitly approves  
- Do not use live Stripe cards (`sk_live_`)  
- Do not paste database credentials into the QA doc or commits  

---

## 7. One-line paste for Fable (account selection)

Copy this into chat when starting Phase 5:

```
Production QA handoff: use docs/PHASE5_HANDOFF.md.
Sign in at https://microplanner-web.vercel.app/sign-in.
Session 1: use abiroumohamed58@gmail.com (FREE, onboarded, 1 goal).
When account picker appears, wait for me to confirm which account.
Stripe: test card 4242 4242 4242 4242, exp 12/34, CVC 123.
Billing is Stripe test mode — checkout is safe.
```

---

## 8. Gap vs ideal handoff

| Item | Status |
|------|--------|
| Production stack reachable | ✅ Ready |
| Stripe test card | ✅ Ready (above) |
| OAuth picker protocol | ✅ Ready |
| FREE test account | ✅ `abiroumohamed58@gmail.com` |
| Pre-built STARTER account | ⚠️ Create during billing test (Strategy A) |
| Pre-built PRO account | ⚠️ Create during billing test or second Google account |
| Fresh account for onboarding | ⚠️ Pick any other Google account from Clerk picker |

**Owner optional prep (5 min):** If you want dedicated STARTER/PRO accounts before Fable starts, sign in once with two other Google accounts from your picker and run Starter + Pro checkout on each — then tell Fable which email maps to which tier.
