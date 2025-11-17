# Environment Variables Guide

## Overview

MicroPlanner requires several environment variables for different services. This guide covers all required and optional variables with examples and security best practices.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Configuration](#core-configuration)
3. [Database](#database)
4. [Authentication (Clerk)](#authentication-clerk)
5. [Billing (Stripe)](#billing-stripe)
6. [Calendar Integration (Google)](#calendar-integration-google)
7. [AI Service](#ai-service)
8. [Security](#security)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Development vs Production](#development-vs-production)
11. [Security Best Practices](#security-best-practices)

---

## Quick Start

### Development Setup

Create `apps/api-gateway/.env`:

```bash
cp apps/api-gateway/.env.example apps/api-gateway/.env
```

### Example .env File

```env
# ============================================
# CORE CONFIGURATION
# ============================================
NODE_ENV="development"
PORT="3000"
APP_URL="http://localhost:3001"
API_URL="http://localhost:3000"

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microplanner_dev?schema=public"

# ============================================
# AUTHENTICATION (CLERK)
# ============================================
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# ============================================
# BILLING (STRIPE)
# ============================================
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
STRIPE_STARTER_PRICE_ID="price_xxxxx"
STRIPE_PRO_PRICE_ID="price_xxxxx"

# ============================================
# GOOGLE CALENDAR
# ============================================
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/calendar/oauth/google/callback"

# ============================================
# SECURITY
# ============================================
ENCRYPTION_SECRET="your-256-bit-secret-key-here-change-in-production"
JWT_SECRET="your-jwt-secret-key-here"

# ============================================
# AI SERVICE (OPTIONAL)
# ============================================
AI_SERVICE_URL="http://localhost:8000"
OPENAI_API_KEY="sk-xxxxx"

# ============================================
# MONITORING (OPTIONAL)
# ============================================
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
LOG_LEVEL="debug"
```

---

## Core Configuration

### NODE_ENV

**Description**: Application environment mode

**Required**: Yes

**Options**:
- `development` - Local development with hot reload
- `production` - Production deployment with optimizations
- `test` - Test environment for CI/CD

**Example**:
```env
NODE_ENV="production"
```

---

### PORT

**Description**: Port for the API Gateway to listen on

**Required**: Yes

**Default**: `3000`

**Example**:
```env
PORT="3000"
```

**Note**: On Fly.io, use `PORT="8080"`

---

### APP_URL

**Description**: URL where the frontend (Next.js/Expo) is hosted

**Required**: Yes

**Usage**: CORS configuration, redirect URLs, email links

**Examples**:
```env
# Development
APP_URL="http://localhost:3001"

# Production
APP_URL="https://app.microplanner.com"
```

---

### API_URL

**Description**: URL where the API Gateway is hosted

**Required**: Yes

**Usage**: Frontend API calls, webhook endpoints

**Examples**:
```env
# Development
API_URL="http://localhost:3000"

# Production
API_URL="https://api.microplanner.ai"
```

---

## Database

### DATABASE_URL

**Description**: PostgreSQL connection string

**Required**: Yes

**Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA&sslmode=require`

**Examples**:
```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microplanner_dev?schema=public"

# Neon (Production)
DATABASE_URL="postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Supabase (Production)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**Security**:
- Always use `?sslmode=require` in production
- Never commit this to git
- Use connection pooling for production (Neon, Supabase)

**How to Get**:

**Neon**:
1. Go to https://neon.tech
2. Create project
3. Copy connection string from dashboard

**Supabase**:
1. Go to https://supabase.com
2. Create project
3. Settings > Database > Connection string > URI

**Local Docker**:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microplanner_dev"
```

---

## Authentication (Clerk)

### CLERK_SECRET_KEY

**Description**: Clerk server-side secret key for API calls

**Required**: Yes

**Format**: `sk_test_xxxxx` (test) or `sk_live_xxxxx` (production)

**Example**:
```env
CLERK_SECRET_KEY="sk_test_AbCdEf123456GhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Go to https://clerk.com
2. Create application (or select existing)
3. Dashboard > API Keys > Secret keys
4. Copy "Secret key"

---

### CLERK_PUBLISHABLE_KEY

**Description**: Clerk client-side publishable key (safe to expose)

**Required**: Yes

**Format**: `pk_test_xxxxx` (test) or `pk_live_xxxxx` (production)

**Example**:
```env
CLERK_PUBLISHABLE_KEY="pk_test_AbCdEf123456GhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Clerk Dashboard > API Keys
2. Copy "Publishable key"

---

### CLERK_WEBHOOK_SECRET

**Description**: Secret for verifying Clerk webhook signatures

**Required**: Yes (if using webhooks)

**Format**: `whsec_xxxxx`

**Example**:
```env
CLERK_WEBHOOK_SECRET="whsec_AbCdEf123456GhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Clerk Dashboard > Webhooks
2. Add endpoint: `https://api.microplanner.ai/api/v1/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy "Signing Secret"

**Development**:
Use Clerk CLI or ngrok:
```bash
# Option 1: Clerk CLI
clerk webhooks forward --endpoint http://localhost:3000/api/v1/webhooks/clerk

# Option 2: ngrok
ngrok http 3000
# Update Clerk webhook URL to: https://xxxxx.ngrok.io/api/v1/webhooks/clerk
```

---

## Billing (Stripe)

### STRIPE_SECRET_KEY

**Description**: Stripe server-side secret key

**Required**: Yes

**Format**: `sk_test_xxxxx` (test) or `sk_live_xxxxx` (production)

**Example**:
```env
STRIPE_SECRET_KEY="sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Go to https://stripe.com
2. Create account
3. Dashboard > Developers > API keys
4. Copy "Secret key"

**Security**:
- NEVER expose this in client-side code
- Use test keys for development
- Rotate keys if compromised

---

### STRIPE_PUBLISHABLE_KEY

**Description**: Stripe client-side publishable key (safe to expose)

**Required**: Yes (for frontend checkout)

**Format**: `pk_test_xxxxx` (test) or `pk_live_xxxxx` (production)

**Example**:
```env
STRIPE_PUBLISHABLE_KEY="pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz"
```

---

### STRIPE_WEBHOOK_SECRET

**Description**: Secret for verifying Stripe webhook signatures

**Required**: Yes

**Format**: `whsec_xxxxx`

**Example**:
```env
STRIPE_WEBHOOK_SECRET="whsec_AbCdEf123456GhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://api.microplanner.ai/api/v1/billing/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy "Signing secret"

**Development**:
Use Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/v1/billing/webhooks/stripe

# Test webhook
stripe trigger checkout.session.completed
```

---

### STRIPE_STARTER_PRICE_ID

**Description**: Stripe Price ID for Starter tier ($9.99/month)

**Required**: Yes

**Format**: `price_xxxxx`

**Example**:
```env
STRIPE_STARTER_PRICE_ID="price_1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Stripe Dashboard > Products
2. Create product: "MicroPlanner Starter"
3. Add price: $9.99/month recurring
4. Copy Price ID

---

### STRIPE_PRO_PRICE_ID

**Description**: Stripe Price ID for Pro tier ($19.99/month)

**Required**: Yes

**Format**: `price_xxxxx`

**Example**:
```env
STRIPE_PRO_PRICE_ID="price_1XyZaBcDeFgHiJkLmNoPqRsTuV"
```

**How to Get**:
1. Stripe Dashboard > Products
2. Create product: "MicroPlanner Pro"
3. Add price: $19.99/month recurring
4. Copy Price ID

---

## Calendar Integration (Google)

### GOOGLE_CLIENT_ID

**Description**: Google OAuth 2.0 Client ID

**Required**: Yes (for calendar sync)

**Format**: `xxxxx.apps.googleusercontent.com`

**Example**:
```env
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
```

**How to Get**:
1. Go to https://console.cloud.google.com
2. Create project (or select existing)
3. Enable Google Calendar API:
   - APIs & Services > Library
   - Search "Google Calendar API"
   - Click Enable
4. Create OAuth credentials:
   - APIs & Services > Credentials
   - Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Name: MicroPlanner API
   - Authorized redirect URIs:
     - `http://localhost:3000/api/v1/calendar/oauth/google/callback`
     - `https://api.microplanner.ai/api/v1/calendar/oauth/google/callback`
5. Copy Client ID

---

### GOOGLE_CLIENT_SECRET

**Description**: Google OAuth 2.0 Client Secret

**Required**: Yes (for calendar sync)

**Format**: `GOCSPX-xxxxx`

**Example**:
```env
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"
```

**How to Get**:
1. Same as GOOGLE_CLIENT_ID above
2. Copy Client Secret from OAuth credentials

**Security**:
- Never expose in client-side code
- Store securely in Fly.io secrets
- Rotate if compromised

---

### GOOGLE_REDIRECT_URI

**Description**: OAuth redirect URI after Google authorization

**Required**: Yes

**Format**: Full URL to callback endpoint

**Examples**:
```env
# Development
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/calendar/oauth/google/callback"

# Production
GOOGLE_REDIRECT_URI="https://api.microplanner.ai/api/v1/calendar/oauth/google/callback"
```

**Important**:
- Must exactly match one of the Authorized redirect URIs in Google Console
- Include protocol (`http://` or `https://`)
- No trailing slash

---

## AI Service

### AI_SERVICE_URL

**Description**: URL of the Python FastAPI AI service

**Required**: Optional (if using AI plan generation)

**Default**: `http://localhost:8000`

**Examples**:
```env
# Development
AI_SERVICE_URL="http://localhost:8000"

# Production (separate Fly.io app)
AI_SERVICE_URL="https://microplanner-ai.fly.dev"
```

---

### OPENAI_API_KEY

**Description**: OpenAI API key for GPT models

**Required**: Optional (if using AI plan generation)

**Format**: `sk-xxxxx`

**Example**:
```env
OPENAI_API_KEY="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz123456789"
```

**How to Get**:
1. Go to https://platform.openai.com
2. Sign up or log in
3. API Keys > Create new secret key
4. Copy key (only shown once!)

**Cost**:
- gpt-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- gpt-4o: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens

**Security**:
- Set usage limits in OpenAI dashboard
- Monitor usage to prevent overspending
- Use gpt-4o-mini for FREE/STARTER tiers

---

## Security

### ENCRYPTION_SECRET

**Description**: 256-bit secret key for encrypting OAuth tokens in database

**Required**: Yes

**Format**: Base64-encoded 32-byte string

**Example**:
```env
ENCRYPTION_SECRET="AbCdEf1234567890GhIjKlMnOpQrStUvWxYz1234=="
```

**How to Generate**:
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online (not recommended for production)
# https://www.random.org/bytes/
```

**Security**:
- Generate a NEW key for each environment
- Never reuse development keys in production
- If leaked, regenerate and re-encrypt all tokens

**Used For**:
- Encrypting Google OAuth refresh tokens
- Encrypting calendar access tokens
- AES-256-GCM encryption algorithm

---

### JWT_SECRET

**Description**: Secret for signing JWT tokens (if not using Clerk)

**Required**: Optional (only if implementing custom JWT auth)

**Format**: Strong random string (32+ characters)

**Example**:
```env
JWT_SECRET="supersecretjwtkeythatshouldbelongandcomplex123456"
```

**How to Generate**:
```bash
openssl rand -hex 32
```

**Note**: MicroPlanner uses Clerk for authentication, so this is typically not needed.

---

## Monitoring & Analytics

### SENTRY_DSN

**Description**: Sentry Data Source Name for error tracking

**Required**: Optional (recommended for production)

**Format**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

**Example**:
```env
SENTRY_DSN="https://1234567890abcdef1234567890abcdef@o123456.ingest.sentry.io/9876543"
```

**How to Get**:
1. Go to https://sentry.io
2. Create account and project
3. Copy DSN from Project Settings > Client Keys

**Benefits**:
- Real-time error tracking
- Performance monitoring
- Release tracking
- User feedback

---

### LOG_LEVEL

**Description**: Logging verbosity level

**Required**: Optional

**Default**: `info`

**Options**:
- `error` - Only errors
- `warn` - Errors and warnings
- `info` - Informational messages (default)
- `debug` - Detailed debugging info
- `verbose` - All logs

**Examples**:
```env
# Development
LOG_LEVEL="debug"

# Production
LOG_LEVEL="info"
```

---

## Development vs Production

### Development (.env)

```env
NODE_ENV="development"
PORT="3000"
APP_URL="http://localhost:3001"
API_URL="http://localhost:3000"

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/microplanner_dev"

CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_test_xxxxx"

STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_test_xxxxx"
STRIPE_STARTER_PRICE_ID="price_test_xxxxx"
STRIPE_PRO_PRICE_ID="price_test_xxxxx"

GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/calendar/oauth/google/callback"

ENCRYPTION_SECRET="dev-secret-change-in-production-123456"
LOG_LEVEL="debug"
```

### Production (Fly.io Secrets)

```bash
# Set all secrets at once
fly secrets set \
  NODE_ENV="production" \
  PORT="8080" \
  APP_URL="https://app.microplanner.com" \
  API_URL="https://api.microplanner.ai" \
  DATABASE_URL="postgresql://..." \
  CLERK_SECRET_KEY="sk_live_xxxxx" \
  CLERK_PUBLISHABLE_KEY="pk_live_xxxxx" \
  CLERK_WEBHOOK_SECRET="whsec_xxxxx" \
  STRIPE_SECRET_KEY="sk_live_xxxxx" \
  STRIPE_WEBHOOK_SECRET="whsec_xxxxx" \
  STRIPE_STARTER_PRICE_ID="price_xxxxx" \
  STRIPE_PRO_PRICE_ID="price_xxxxx" \
  GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx" \
  GOOGLE_REDIRECT_URI="https://api.microplanner.ai/api/v1/calendar/oauth/google/callback" \
  ENCRYPTION_SECRET="$(openssl rand -base64 32)" \
  SENTRY_DSN="https://..." \
  LOG_LEVEL="info"

# View secrets
fly secrets list

# Delete secret
fly secrets unset VARIABLE_NAME
```

---

## Security Best Practices

### ✅ DO:

1. **Use Strong Secrets**:
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

2. **Different Keys Per Environment**:
   - Development: `sk_test_xxxxx`
   - Production: `sk_live_xxxxx`

3. **Store Secrets Securely**:
   - Development: `.env` file (git-ignored)
   - Production: Fly.io secrets / environment variables
   - Never in `package.json`, `fly.toml`, or committed code

4. **Rotate Keys Regularly**:
   - Every 90 days for high-security keys
   - Immediately if compromised

5. **Use SSL Everywhere**:
   ```env
   DATABASE_URL="postgresql://...?sslmode=require"
   ```

6. **Limit Permissions**:
   - Stripe: Use restricted API keys
   - Google: Only request required OAuth scopes

7. **Monitor Usage**:
   - Stripe: Set up usage alerts
   - OpenAI: Set spending limits
   - Database: Connection pool limits

### ❌ DON'T:

1. **Never Commit Secrets**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Never Log Secrets**:
   ```typescript
   // BAD
   console.log('API Key:', process.env.STRIPE_SECRET_KEY);

   // GOOD
   console.log('API Key configured:', !!process.env.STRIPE_SECRET_KEY);
   ```

3. **Never Use Default Secrets**:
   - Change all `change-in-production` values
   - Generate unique keys per environment

4. **Never Hardcode Secrets**:
   ```typescript
   // BAD
   const apiKey = 'sk_live_12345';

   // GOOD
   const apiKey = process.env.STRIPE_SECRET_KEY;
   ```

5. **Never Share Secrets**:
   - Use secret sharing tools (1Password, LastPass)
   - Don't send via email, Slack, etc.

---

## Validation Checklist

Before deploying, verify all environment variables:

```bash
# Check all required variables are set
node -e "
const required = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'GOOGLE_CLIENT_ID',
  'ENCRYPTION_SECRET'
];

required.forEach(key => {
  if (!process.env[key]) {
    console.error('❌ Missing:', key);
  } else {
    console.log('✅', key);
  }
});
"
```

### Complete Checklist:

- [ ] NODE_ENV set to "production"
- [ ] PORT configured (8080 for Fly.io)
- [ ] APP_URL and API_URL match production domains
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] CLERK_SECRET_KEY uses `sk_live_` prefix
- [ ] CLERK_WEBHOOK_SECRET configured and webhook endpoint tested
- [ ] STRIPE_SECRET_KEY uses `sk_live_` prefix
- [ ] STRIPE_WEBHOOK_SECRET configured and webhook endpoint tested
- [ ] STRIPE_STARTER_PRICE_ID and STRIPE_PRO_PRICE_ID point to live prices
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from production OAuth app
- [ ] GOOGLE_REDIRECT_URI matches production domain and is authorized
- [ ] ENCRYPTION_SECRET is unique 256-bit key (not reused from dev)
- [ ] SENTRY_DSN configured for error tracking (optional)
- [ ] LOG_LEVEL set to "info" or "warn"
- [ ] All secrets stored in Fly.io secrets (not in code)
- [ ] .env files added to .gitignore
- [ ] Webhook URLs updated in Clerk and Stripe dashboards
- [ ] Google OAuth redirect URIs updated in Google Console
- [ ] Database connection tested
- [ ] Health check endpoint working

---

## Getting Help

### Resources:

- **Clerk**: https://clerk.com/docs
- **Stripe**: https://stripe.com/docs/api
- **Google Calendar API**: https://developers.google.com/calendar/api
- **Fly.io**: https://fly.io/docs
- **Neon**: https://neon.tech/docs
- **Sentry**: https://docs.sentry.io

### Support:

- GitHub Issues: [your-repo/issues]
- Email: support@microplanner.ai

---

**Keep your secrets safe! 🔒**
