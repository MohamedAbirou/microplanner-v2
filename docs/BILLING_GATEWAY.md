# Phase 6 — PATCH: Payment Gateway Abstraction Layer

## Pluggable Provider Architecture (Payzone.ma primary)

**Primary AI:** Claude 4.8 (financial abstraction, adapter pattern, proration math)
**Depends on:** Phase 1, Phase 5
**Scope:** This document REPLACES Phase 6's billing module entirely. Every PayPal-specific
construct is removed. The architecture is rebuilt around a `PaymentGatewayPort` interface that
Payzone.ma implements as the primary adapter, with CMI, bank transfer (virement), and cheque
adapters provided as fully wired alternatives from day one.

---

## Why this rewrite is necessary

Payzone.ma is the correct primary provider for this platform:

- It is a registered Moroccan fintech with a **live REST Gateway API** (`https://gateway.payzone.ma`)
  and a **hosted Payment Page API** (`https://paiement.payzone.ma`).
- It supports **subscription/rebilling natively** via its `Rebill` transaction endpoint — the engine
  stores the initial `transactionID` and calls `/transaction/{id}/rebill` on each cycle.
- It uses **HTTP Basic Auth** (`originatorId` + `password`) — simpler and more stable than
  PayPal's OAuth2 token lifecycle.
- Its **callback/notification system** uses server-side POST callbacks (similar to webhooks) that
  the platform verifies before processing.
- It supports **refunds, cancellations, and subscription cancellation** through dedicated endpoints.

CMI (Centre Monétique Interbancaire) is Morocco's national interbank operator and the market
standard for card acceptance. It does NOT natively support recurring subscriptions, making it
suitable only as a **one-time payment fallback** adapter in this system.

Bank transfer (virement) and cheque are offline payment methods that require a **manual
confirmation flow** inside the Admin Console — they are first-class citizens in the abstraction
but require human approval before activating a subscription.

---

## 1. Phase Objective & Deliverables

Build a **payment gateway abstraction layer** in the NestJS API that:

- Defines a single `PaymentGatewayPort` interface that every provider must implement.
- Provides four adapters out of the box:
  1. **PayzoneAdapter** (primary) — card payments + subscription rebilling via Payzone REST API.
  2. **CmiAdapter** (fallback card) — hosted redirect flow for one-time payments.
  3. **BankTransferAdapter** (offline) — virement bancaire, awaits admin manual confirmation.
  4. **ChequeAdapter** (offline) — cheque payment, awaits admin manual confirmation.
- Manages subscriptions, proration, invoicing, dunning, and PDF invoice generation identically
  to the original Phase 6 spec, but decoupled from any single provider.
- Allows adding a new provider by creating one file that implements `PaymentGatewayPort` and
  registering it in `GatewayRegistry` — zero changes to any other service.

**Deliverables checklist**

- [ ] `BillingModule` with `PaymentGatewayPort` interface + `GatewayRegistry`.
- [ ] `PayzoneAdapter` — full subscription lifecycle + rebill + refund + cancel.
- [ ] `CmiAdapter` — one-time hosted-redirect + callback verification.
- [ ] `BankTransferAdapter` — pending-confirmation flow + admin approval endpoint.
- [ ] `ChequeAdapter` — pending-confirmation flow + admin approval endpoint.
- [ ] `SubscriptionService` — provider-agnostic orchestration.
- [ ] `ProrationService` + `proration-math.ts` — integer centimes, provider-independent.
- [ ] `InvoiceService` + `PdfInvoiceService` — unchanged from original Phase 6.
- [ ] `DunningService` — provider-agnostic state machine.
- [ ] Webhook/callback controller — dispatches to the correct adapter's verifier.
- [ ] Sandbox matrix per provider (env-switched credentials).
- [ ] Migration `phase6_billing_gateway` — adds `Subscription.gatewayProvider` column.

---

## 2. System Architecture & Folder Structure

```
apps/api/src/modules/billing/
├── billing.module.ts
│
├── port/
│   ├── payment-gateway.port.ts           # THE interface — all adapters implement this
│   ├── gateway-registry.ts               # maps ProviderKey -> PaymentGatewayPort instance
│   └── types/
│       ├── charge-result.ts              # normalised result from any charge operation
│       ├── subscription-result.ts        # normalised subscription state
│       ├── refund-result.ts
│       └── provider-key.enum.ts          # PAYZONE | CMI | BANK_TRANSFER | CHEQUE
│
├── adapters/
│   ├── payzone/
│   │   ├── payzone.adapter.ts            # implements PaymentGatewayPort
│   │   ├── payzone-http.client.ts        # HTTP Basic Auth REST client + retries
│   │   ├── payzone.config.ts             # env-driven sandbox|live base URLs + creds
│   │   ├── payzone-callback.verifier.ts  # verifies server-side callback authenticity
│   │   └── payzone.types.ts             # raw Payzone API request/response shapes
│   ├── cmi/
│   │   ├── cmi.adapter.ts               # implements PaymentGatewayPort (one-time only)
│   │   ├── cmi-redirect.builder.ts      # builds signed CMI hosted payment URL
│   │   ├── cmi-callback.verifier.ts     # verifies CMI POST callback hash (SHA-512)
│   │   └── cmi.types.ts
│   ├── bank-transfer/
│   │   ├── bank-transfer.adapter.ts     # implements PaymentGatewayPort (offline flow)
│   │   └── bank-transfer.types.ts
│   └── cheque/
│       ├── cheque.adapter.ts            # implements PaymentGatewayPort (offline flow)
│       └── cheque.types.ts
│
├── services/
│   ├── subscription.service.ts          # provider-agnostic: create, activate, cancel, sync
│   ├── proration.service.ts             # integer-centime proration (unchanged math)
│   ├── dunning.service.ts               # provider-agnostic state machine
│   ├── invoice.service.ts               # number sequence, totals, tax, persistence
│   └── pdf-invoice.service.ts           # pdfkit render -> S3-compatible object storage
│
├── controllers/
│   ├── checkout.controller.ts           # POST /billing/subscribe, /revise, /cancel
│   ├── invoices.controller.ts           # GET /billing/invoices, /:id/pdf
│   ├── offline-payment.controller.ts    # PATCH /billing/offline/:id/confirm (admin only)
│   └── callback.controller.ts           # POST /billing/callback/:provider (public, verified)
│
├── handlers/
│   ├── payment-success.handler.ts       # normalised: generate Invoice + PDF + email
│   ├── payment-failed.handler.ts        # normalised: dunning state machine
│   └── subscription-cancelled.handler.ts
│
├── dto/
│   ├── subscribe.dto.ts                 # targetTier, billingCycle (MONTHLY|ANNUAL), provider
│   ├── revise.dto.ts                    # newTier, billingCycle
│   ├── confirm-offline.dto.ts           # reference, confirmedAt, confirmedByAdminId
│   └── invoice-query.dto.ts
│
└── math/
    └── proration-math.ts                # pure integer proration functions (provider-independent)
```

---

## 3. The `PaymentGatewayPort` Interface (binding contract)

This interface is the architectural core. **Every adapter must satisfy it completely.** Adding a
new provider in the future means creating one file that implements this interface and registering
it in `GatewayRegistry`. No other file changes.

```typescript
// apps/api/src/modules/billing/port/payment-gateway.port.ts

export interface CreateSubscriptionInput {
  merchantInternalId: string; // our Subscription.id (for idempotency)
  planKey: string; // 'STARTER_MONTHLY' | 'PRO_MONTHLY' | 'STARTER_ANNUAL' etc.
  amountCents: number; // in centimes MAD
  billingCycle: "MONTHLY" | "ANNUAL";
  customerEmail: string;
  customerName: string;
  returnUrl: string; // where to redirect after hosted payment (CMI / Payzone Page)
  cancelUrl: string;
  locale: "fr" | "en";
}

export interface ChargeResult {
  providerTransactionId: string;
  status: "PENDING_REDIRECT" | "PENDING_CONFIRMATION" | "SUCCESS" | "FAILED";
  redirectUrl?: string; // only for hosted flows (Payzone Page, CMI)
  rawResponse: unknown; // stored as-is for auditability
}

export interface RebillInput {
  providerTransactionId: string; // the stored transactionID from the initial sale
  amountCents: number;
  merchantInternalId: string; // our Invoice.id (for idempotency / dedup)
}

export interface RefundInput {
  providerTransactionId: string;
  amountCents: number;
  reason: string;
}

export interface CancelSubscriptionInput {
  providerSubscriptionId: string; // adapter-specific identifier
}

export interface VerifyCallbackInput {
  headers: Record;
  rawBody: Buffer;
  params: Record;
}

export interface NormalisedCallbackEvent {
  kind:
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "SUBSCRIPTION_CANCELLED"
    | "REFUND_PROCESSED";
  merchantInternalId: string;
  providerTransactionId: string;
  amountCents?: number;
  rawPayload: unknown;
}

export interface PaymentGatewayPort {
  readonly providerKey: ProviderKey;

  /**
   * Initiate a new subscription charge.
   * For hosted-redirect providers (Payzone Page, CMI): returns PENDING_REDIRECT + redirectUrl.
   * For server-to-server (Payzone Gateway direct): returns SUCCESS or FAILED immediately.
   * For offline providers (BankTransfer, Cheque): returns PENDING_CONFIRMATION (no redirect).
   */
  createSubscription(input: CreateSubscriptionInput): Promise;

  /**
   * Re-bill an existing customer using a stored token/transactionId.
   * Offline adapters throw UnsupportedOperationError — rebilling is manual.
   */
  rebill(input: RebillInput): Promise;

  /**
   * Issue a full or partial refund.
   * Offline adapters mark the internal record as refunded (no external call).
   */
  refund(input: RefundInput): Promise;

  /**
   * Cancel an active recurring subscription at the provider level.
   * Offline adapters are a no-op (there is no external subscription to cancel).
   */
  cancelSubscription(input: CancelSubscriptionInput): Promise;

  /**
   * Verify and parse an inbound callback/webhook from the provider.
   * MUST throw VerificationError on any signature/authentication failure.
   * Returns a normalised event that the billing handlers can consume uniformly.
   */
  verifyAndParseCallback(input: VerifyCallbackInput): Promise;

  /**
   * Check if this provider supports automatic rebilling.
   * Returns false for BankTransfer and Cheque (manual renewal flow instead).
   */
  supportsAutomaticRebilling(): boolean;

  /**
   * Returns the sandbox base URL for this provider in test mode.
   * Used in boot validation — refuses to start with live creds in NODE_ENV=test.
   */
  getSandboxBaseUrl(): string;
}
```

---

## 4. Payzone Adapter — Full Technical Specification

### Authentication

Payzone's Gateway API uses HTTP Basic Authentication with `originatorId` and `password` provided at subscription. These are stored in `PAYZONE_ORIGINATOR_ID` and `PAYZONE_PASSWORD` env vars. The HTTP client adds `Authorization: Basic base64(originatorId:password)` to every request. No OAuth2 token caching is needed — this is simpler and more stable than the PayPal flow it replaces.

### Subscription lifecycle via Payzone

Payzone does not have a "subscription object" like PayPal. Instead, it uses a **Rebill pattern**:

1. **Initial charge** — `POST /transaction/sale/creditcard` (or hosted Payment Page). The response
   returns a `transactionID`. Store this as `Subscription.providerTransactionId`.
2. **Subsequent monthly/annual cycles** — `POST /transaction/{transactionID}/rebill` with the
   stored `transactionID` and `amount`. The Rebill transaction mechanism enables re-billing of customers without storing credit card information, as this is handled by Payzone.
3. **Cancel** — `POST /subscription/{subscriptionID}/cancel` to cancel the automated rebilling. For cancellation codes in range 0000-1004 the subscription is cancelled immediately; for other codes, the system waits until the end of the last paid period. Store the `cancellationCode` from the response.

### Callback / notification verification

Payzone sends server-side POST callbacks. The platform must return `{"status":"OK","message":"Status recorded"}` with a 20x status code to mark the transaction as notified. For non-20x responses, Payzone will not mark the payment as notified.

`payzone-callback.verifier.ts` must:

1. Check the `originatorId` in the callback body matches `PAYZONE_ORIGINATOR_ID`.
2. Verify any HMAC/hash field present in the callback against the secret.
3. If verification fails → return a 500 error response body and log the attempt (do NOT return 200,
   as that would acknowledge a forged callback to the Payzone server).
4. If verification passes → parse and return a `NormalisedCallbackEvent`.

### Two integration modes

The Payzone adapter exposes a `mode` config option:

- `GATEWAY` — server-to-server via `gateway.payzone.ma`. Requires the merchant to handle PCI-DSS
  card field collection. Returns immediate `SUCCESS`/`FAILED`.
- `PAYMENT_PAGE` — hosted redirect via `paiement.payzone.ma`. Creates a unique payment page hosted by Payzone and redirects the customer to fulfill the payment. Returns `PENDING_REDIRECT` + `redirectUrl`.

For Pyroo Cards SaaS billing, **PAYMENT_PAGE mode is the default** — we are billing our own merchants (B2B), not end consumers, so a hosted redirect to a Payzone-branded checkout page is acceptable and PCI-DSS compliant without card data ever touching our servers.

---

## 5. CMI Adapter — Technical Specification

CMI does not support recurring payments. The `CmiAdapter` implements only:

- `createSubscription()` → builds a signed redirect URL to CMI's hosted payment page and returns
  `PENDING_REDIRECT`. The hash is `SHA-512(params + storeKey)` per CMI's spec. Store key in
  `CMI_STORE_KEY` env var.
- `rebill()` → throws `UnsupportedOperationError('CMI does not support automatic rebilling')`.
- `verifyAndParseCallback()` → verifies the CMI POST callback by recomputing the hash against
  `CMI_STORE_KEY` and comparing with constant-time string comparison.
- `supportsAutomaticRebilling()` → returns `false`.

When `supportsAutomaticRebilling()` is false, `DunningService` skips automatic rebill attempts
and instead sends a manual-renewal email with a payment link that initiates a new `createSubscription()`.

---

## 6. Bank Transfer (Virement) Adapter — Technical Specification

`BankTransferAdapter` is a pure offline adapter. No external HTTP calls are ever made.

- `createSubscription()` → persists an `OfflinePaymentRequest` row with
  `status=AWAITING_CONFIRMATION`, returns `PENDING_CONFIRMATION` with no `redirectUrl`.
  Enqueues a `BANK_TRANSFER_INSTRUCTIONS` email to the merchant (via Phase 5 mail producer) with
  the platform's RIB (Relevé d'Identité Bancaire) details, amount, and a reference code
  (`PAY-{cuid2}`) they must include in the transfer.
- `rebill()` → creates a new `OfflinePaymentRequest` for the renewal cycle and enqueues the
  instructions email. `supportsAutomaticRebilling()` returns `false`.
- `verifyAndParseCallback()` → **not applicable**; instead, the Admin Console's
  `POST /billing/offline/:id/confirm` endpoint (OWNER-only, audit-logged) is the "callback".
  When an admin confirms a transfer, `OfflinePaymentConfirmedEvent` is emitted internally and
  handled by `payment-success.handler.ts` exactly as a real Payzone callback would be.
- `cancelSubscription()` → marks the `OfflinePaymentRequest` as cancelled; no-op externally.

---

## 7. Cheque Adapter — Technical Specification

Identical pattern to `BankTransferAdapter`, with differences:

- Email template is `CHEQUE_INSTRUCTIONS` (cheque payable to company name + address + amount).
- `OfflinePaymentRequest.kind = 'CHEQUE'`.
- Admin confirmation additionally requires a `chequeNumber` field in `ConfirmOfflineDto`.
- Same internal event emission → `payment-success.handler.ts` handles it uniformly.

---

## 8. GatewayRegistry

```typescript
// apps/api/src/modules/billing/port/gateway-registry.ts

@Injectable()
export class GatewayRegistry {
  private readonly adapters = new Map();

  constructor(
    private readonly payzone: PayzoneAdapter,
    private readonly cmi: CmiAdapter,
    private readonly bankTransfer: BankTransferAdapter,
    private readonly cheque: ChequeAdapter,
  ) {
    this.adapters.set(ProviderKey.PAYZONE, payzone);
    this.adapters.set(ProviderKey.CMI, cmi);
    this.adapters.set(ProviderKey.BANK_TRANSFER, bankTransfer);
    this.adapters.set(ProviderKey.CHEQUE, cheque);
  }

  get(key: ProviderKey): PaymentGatewayPort {
    const adapter = this.adapters.get(key);
    if (!adapter) throw new Error(`No adapter registered for provider: ${key}`);
    return adapter;
  }

  /**
   * To add a new provider in the future:
   * 1. Create a new adapter file implementing PaymentGatewayPort.
   * 2. Add its ProviderKey to the enum.
   * 3. Register it in this constructor.
   * That is ALL. No other file in the codebase changes.
   */
}
```

---

## 9. Database Schema & Matrix Changes

Migration `phase6_billing_gateway` (replaces the PayPal-specific migration entirely):

```prisma
enum ProviderKey { PAYZONE CMI BANK_TRANSFER CHEQUE }
enum BillingCycle { MONTHLY ANNUAL }
enum OfflinePaymentKind { BANK_TRANSFER CHEQUE }
enum OfflinePaymentStatus { AWAITING_CONFIRMATION CONFIRMED REJECTED CANCELLED }

// Subscription — replace all PayPal-specific fields with provider-agnostic ones
model Subscription {
  id                    String           @id @default(cuid())
  businessId            String           @unique
  business              Business         @relation(fields:[businessId], references:[id])
  tier                  SubscriptionTier
  billingCycle          BillingCycle     @default(MONTHLY)
  status                SubscriptionStatus
  gatewayProvider       ProviderKey      @default(PAYZONE)
  providerTransactionId String?          // stored rebill anchor (Payzone transactionID, etc.)
  providerSubscriptionId String?         // provider-native subscription/offer ID if available
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  pendingTier           SubscriptionTier?
  pendingBillingCycle   BillingCycle?
  pendingEffectiveAt    DateTime?
  creditCents           Int              @default(0)
  graceUntil            DateTime?
  failedPaymentCount    Int              @default(0)
  warned80At            DateTime?
  lockedAt              DateTime?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  invoices    Invoice[]
  offlineReqs OfflinePaymentRequest[]

  @@index([status])
  @@index([gatewayProvider, status])
}

// Invoice — provider-agnostic, replaces PayPal-specific saleId field
model Invoice {
  id               String   @id @default(cuid())
  businessId       String
  subscriptionId   String
  subscription     Subscription @relation(fields:[subscriptionId], references:[id])
  invoiceNumber    String   @unique       // PYR-YYYY-######
  kind             String   @default("CYCLE")  // CYCLE | PRORATION_ADJUSTMENT | MANUAL_CONFIRM
  subtotalCents    Int
  taxRateBps       Int      @default(2000)
  taxCents         Int
  totalCents       Int
  gatewayProvider  ProviderKey
  providerTxId     String?  @unique       // dedup guard: one invoice per provider transaction
  pdfStorageKey    String?               // S3-compatible object key
  pdfSignedUrl     String?               // cached signed URL (expires)
  pdfSignedUrlExp  DateTime?
  billingCycle     BillingCycle
  periodStart      DateTime?
  periodEnd        DateTime?
  createdAt        DateTime @default(now())

  @@index([businessId, createdAt])
}

// OfflinePaymentRequest — for bank transfer and cheque flows
model OfflinePaymentRequest {
  id              String                @id @default(cuid())
  subscriptionId  String
  subscription    Subscription          @relation(fields:[subscriptionId], references:[id])
  businessId      String
  kind            OfflinePaymentKind
  status          OfflinePaymentStatus  @default(AWAITING_CONFIRMATION)
  reference       String                @unique  // PAY-{cuid2} for transfer memo
  amountCents     Int
  billingCycle    BillingCycle
  dueBy           DateTime              // payment expected by date
  confirmedAt     DateTime?
  confirmedById   String?               // PlatformUser.id (admin)
  chequeNumber    String?               // for CHEQUE kind
  rejectionReason String?
  createdAt       DateTime              @default(now())

  @@index([status])
  @@index([businessId, status])
}

// InvoiceCounter — unchanged from original Phase 6
model InvoiceCounter {
  year Int @id
  seq  Int @default(0)
}
```

**Env vars required** (add to `apps/api/.env.example`):

```
# --- Payzone ---
PAYZONE_ENV=sandbox|live
PAYZONE_ORIGINATOR_ID=
PAYZONE_PASSWORD=
PAYZONE_GATEWAY_URL=https://gateway.payzone.ma
PAYZONE_PAGE_URL=https://paiement.payzone.ma
PAYZONE_CALLBACK_SECRET=
PAYZONE_INTEGRATION_MODE=PAYMENT_PAGE   # PAYMENT_PAGE | GATEWAY

# --- CMI (fallback card, one-time) ---
CMI_MERCHANT_ID=
CMI_STORE_KEY=
CMI_BASE_URL=https://testpayment.cmi.co.ma/fim/est3Dgate  # switch to live in prod

# --- Offline payment (bank transfer / cheque) ---
PLATFORM_RIB=                           # Relevé d'Identité Bancaire for virement instructions
PLATFORM_BANK_NAME=
PLATFORM_COMPANY_NAME=
PLATFORM_CHEQUE_PAYABLE_TO=
OFFLINE_PAYMENT_DUE_DAYS=7             # number of days before an offline request expires
```

**Remove entirely from `.env.example`:**
`PAYPAL_ENV`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`,
`PAYPAL_PLAN_*` — all PayPal variables are gone.

---

## 10. Proration Math — Provider-Independent (unchanged rules)

`proration-math.ts` is provider-agnostic. The integer-centime formulas from the original Phase 6
remain exactly as specified — they operate on plan amounts and period dates, with no knowledge of
which gateway processed the payment:

```
totalDays         = days(periodStart, periodEnd)
remainingDays     = days(now, periodEnd)          // ceil, min 0
unusedCreditCents = floor(currentAmountCents * remainingDays / totalDays)
newProratedCents  = floor(newAmountCents     * remainingDays / totalDays)
amountDueNowCents = max(0, newProratedCents - unusedCreditCents)
```

For **annual billing proration** (new gap-fix requirement from the index document):

```
// Downgrade annual → monthly mid-year:
// Remaining annual value credited forward; monthly plan starts next cycle.
// No cash refund. Credit stored in Subscription.creditCents.
unusedAnnualCreditCents = floor(annualAmountCents * remainingDays / 365)
```

---

## 11. Dunning State Machine — Provider-Agnostic

`DunningService` no longer calls any PayPal method. It operates on `NormalisedCallbackEvent`
events from any adapter:

```
PAYMENT_FAILED event received:
  failedPaymentCount++
  if failedPaymentCount <= 2:
    status -> PAST_DUE
    enqueue PAYMENT_FAILED email
    if adapter.supportsAutomaticRebilling():
      schedule BullMQ retry job (48h delay, max 3)
    else:
      enqueue MANUAL_RENEWAL_REQUIRED email with a new payment link
  if failedPaymentCount >= 3:
    status -> SUSPENDED
    Business.isReadOnly = true
    enqueue ACCOUNT_SUSPENDED email
    cancel any pending BullMQ retry jobs

PAYMENT_SUCCESS event received (after prior failure):
  failedPaymentCount = 0
  graceUntil = null
  status -> ACTIVE
  Business.isReadOnly = false
  generate Invoice + PDF + enqueue INVOICE email
  clear Redis dunning keys for this businessId
```

---

## 12. Adding a New Provider in the Future (How-To)

This is the guarantee of the architecture. To integrate, for example, a new provider called
`WafaCash` as a mobile wallet option:

1. Create `apps/api/src/modules/billing/adapters/wafacash/wafacash.adapter.ts` implementing
   `PaymentGatewayPort`.
2. Add `WAFACASH` to the `ProviderKey` enum in `provider-key.enum.ts`.
3. Add `WafaCashAdapter` to the constructor of `GatewayRegistry` and register it.
4. Add the new env vars to `.env.example`.
5. Done. `SubscriptionService`, `DunningService`, `InvoiceService`, and every controller are
   completely unaware a new provider was added.

---

## 13. Edge-Case & Security Mitigation Protocol

| Risk                                           | Mitigation                                                                                                                                                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Forged Payzone callbacks**                   | `payzone-callback.verifier.ts` validates the originatorId and HMAC before any processing. Returns 500 (not 200) on failure so Payzone does not mark the callback as delivered.                                |
| **Duplicate callback delivery**                | `Invoice.providerTxId @unique` + `OfflinePaymentRequest.reference @unique` act as dedup guards at the DB level; handler is idempotent.                                                                        |
| **Offline payment reference collision**        | Reference is `PAY-{cuid2}` — globally unique. DB `@unique` constraint as last-resort guard.                                                                                                                   |
| **Admin confirms wrong offline payment**       | `confirmOffline` endpoint validates that `OfflinePaymentRequest.businessId` matches the admin's audited scope; OWNER-only; writes AuditLog row.                                                               |
| **Rebill on a cancelled subscription**         | `SubscriptionService.scheduleCycleRebill()` checks `status = ACTIVE` before calling `adapter.rebill()`; if cancelled, the BullMQ job is a no-op.                                                              |
| **Proration rounding exploits**                | Integer `Math.floor` throughout; residue logged for reconciliation; unit-tested for upgrade/downgrade/same-day/last-day/zero-remaining.                                                                       |
| **Provider credential in wrong environment**   | `PAYZONE_ENV` switch validated by zod schema; boot asserts live creds only when `NODE_ENV=production && PAYZONE_ENV=live`.                                                                                    |
| **CMI hash tampering**                         | SHA-512 recomputed on callback; constant-time comparison; mismatch → 400 and AuditLog entry.                                                                                                                  |
| **Offline request expiry with no action**      | A nightly cron (`offline-expiry.cron.ts`) scans `OfflinePaymentRequest` where `status=AWAITING_CONFIRMATION AND dueBy < now()`; transitions to `EXPIRED`; triggers dunning flow as if a payment failed.       |
| **Provider API downtime during rebill**        | `payzone-http.client.ts` retries with exponential backoff (3 attempts, 2s/4s/8s); on final failure emits a `PAYMENT_FAILED` event → dunning handles it.                                                       |
| **New provider breaks existing subscriptions** | `Subscription.gatewayProvider` is stored at creation time; each subscription is permanently bound to its provider adapter at init; switching providers requires a new subscription creation, not a migration. |

---

## 14. Testing & Validation Criteria

- **Unit:** `proration-math` for monthly and annual upgrade/downgrade/same-day/last-day/zero-remaining; tax math; invoice number sequencing under concurrency; dunning state transitions for all four adapters.
- **Adapter unit tests (all mocked):**
  - `PayzoneAdapter`: `createSubscription` returns `PENDING_REDIRECT` + URL; `rebill` returns `SUCCESS`; `verifyAndParseCallback` throws on bad originatorId; happy path returns correct `NormalisedCallbackEvent`.
  - `CmiAdapter`: redirect URL contains correct SHA-512 hash; `rebill` throws `UnsupportedOperationError`; callback verification rejects tampered hash.
  - `BankTransferAdapter` + `ChequeAdapter`: `createSubscription` returns `PENDING_CONFIRMATION`, persists `OfflinePaymentRequest`, enqueues instructions email; `rebill` does same; `cancelSubscription` marks as cancelled.
- **Integration:**
  - Subscribe via Payzone (sandbox) → callback → `ACTIVE` status, freemium cap lifted, Redis lock cleared, Invoice generated, PDF uploaded, INVOICE email enqueued.
  - Upgrade Starter→Pro mid-cycle → proration invoice correct → `providerTransactionId` preserved (no new subscription created, just rebill with new amount).
  - Subscribe via bank transfer → `PENDING_CONFIRMATION` → admin confirms → same `payment-success.handler.ts` fires → `ACTIVE` + Invoice.
  - Payzone `PAYMENT_FAILED` × 1 → `PAST_DUE` + email; × 3 → `SUSPENDED` + `isReadOnly=true`.
  - CMI callback with tampered hash → 400, not processed, AuditLog entry.
  - `OfflinePaymentRequest` past `dueBy` → nightly cron transitions to `EXPIRED` → dunning fires.
  - `GatewayRegistry.get(UNKNOWN_KEY)` → throws.
- **Coverage:** 100% for all files in `billing/`.
