# MicroPlanner Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Local Development](#local-development)
5. [Production Deployment (Fly.io)](#production-deployment-flyio)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- [Fly.io](https://fly.io) - Application hosting
- [Neon](https://neon.tech) or [Supabase](https://supabase.com) - PostgreSQL database
- [Clerk](https://clerk.com) - Authentication
- [Stripe](https://stripe.com) - Payments
- [Google Cloud Console](https://console.cloud.google.com) - Calendar API
- [Sentry](https://sentry.io) (optional) - Error tracking

### Required Tools
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Install pnpm (if not already installed)
npm install -g pnpm

# Verify Node.js version (requires Node 18+)
node --version  # Should be v18.x or higher
```

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/microplanner-v2.git
cd microplanner-v2
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables

Create `.env` file in `apps/api-gateway/`:
```bash
cp apps/api-gateway/.env.example apps/api-gateway/.env
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed configuration.

**Critical Variables (Required for deployment):**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/microplanner?sslmode=require"

# Clerk Authentication
CLERK_SECRET_KEY="sk_live_xxxxx"
CLERK_PUBLISHABLE_KEY="pk_live_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Stripe Billing
STRIPE_SECRET_KEY="sk_live_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
STRIPE_STARTER_PRICE_ID="price_xxxxx"
STRIPE_PRO_PRICE_ID="price_xxxxx"

# Google Calendar
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
GOOGLE_REDIRECT_URI="https://api.microplanner.app/api/v1/calendar/oauth/google/callback"

# Encryption (Generate with: openssl rand -base64 32)
ENCRYPTION_SECRET="your-256-bit-encryption-key-here"

# App Configuration
NODE_ENV="production"
PORT="3000"
APP_URL="https://app.microplanner.com"
API_URL="https://api.microplanner.app"
```

---

## Database Setup

### Option A: Neon (Recommended)

1. **Create Neon Project**:
   ```bash
   # Visit https://neon.tech
   # Create new project: microplanner-production
   # Copy connection string
   ```

2. **Configure Database**:
   ```bash
   # Add to .env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Option B: Supabase

1. **Create Supabase Project**:
   ```bash
   # Visit https://supabase.com
   # Create new project
   # Go to Settings > Database > Connection string
   ```

2. **Configure Database**:
   ```bash
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

### Run Migrations

```bash
cd packages/database
pnpm prisma migrate deploy
pnpm prisma generate
```

### Seed Database (Optional)

```bash
pnpm prisma db seed
```

---

## Local Development

### 1. Start Development Server
```bash
# Terminal 1: Start API Gateway
cd apps/api-gateway
pnpm dev

# Terminal 2: Start AI Service (Python)
cd apps/ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3: Start Frontend (Next.js)
cd apps/web
pnpm dev
```

### 2. Access Services
- API Gateway: http://localhost:3000
- API Docs: http://localhost:3000/api
- AI Service: http://localhost:8000
- Frontend: http://localhost:3001

### 3. Test Webhooks Locally

Use [ngrok](https://ngrok.com) or [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Option 1: ngrok
ngrok http 3000

# Option 2: Stripe CLI (recommended)
stripe listen --forward-to localhost:3000/api/v1/billing/webhooks/stripe
stripe trigger checkout.session.completed
```

Update webhook URLs in Clerk and Stripe dashboards:
- Clerk: `https://your-ngrok-url.ngrok.io/api/v1/webhooks/clerk`
- Stripe: `https://your-ngrok-url.ngrok.io/api/v1/billing/webhooks/stripe`

---

## Production Deployment (Fly.io)

### 1. Login to Fly.io
```bash
flyctl auth login
```

### 2. Create Fly.io App

```bash
cd apps/api-gateway
fly launch --no-deploy

# Follow prompts:
# - App name: microplanner-api
# - Region: Choose closest to your users (e.g., iad - Washington D.C.)
# - PostgreSQL: No (we're using Neon)
# - Redis: No (not needed yet)
```

### 3. Configure fly.toml

Update `apps/api-gateway/fly.toml`:

```toml
app = "microplanner-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

  [http_service.concurrency]
    type = "connections"
    hard_limit = 250
    soft_limit = 200

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[[services]]
  protocol = "tcp"
  internal_port = 8080
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 250
    soft_limit = 200

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
    restart_limit = 0

  [[services.http_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
    method = "get"
    path = "/health"
    protocol = "http"
    restart_limit = 0
```

### 4. Create Dockerfile

Create `apps/api-gateway/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database ./packages/database
COPY apps/api-gateway ./apps/api-gateway

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/packages/database
RUN pnpm prisma generate

# Build API Gateway
WORKDIR /app/apps/api-gateway
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY --from=builder /app/packages/database ./packages/database

# Copy built API Gateway
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/
COPY --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma Client in production
WORKDIR /app/packages/database
RUN pnpm prisma generate

WORKDIR /app/apps/api-gateway

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
```

### 5. Set Secrets

```bash
# Database
fly secrets set DATABASE_URL="postgresql://user:password@host:5432/microplanner?sslmode=require"

# Clerk
fly secrets set CLERK_SECRET_KEY="sk_live_xxxxx"
fly secrets set CLERK_PUBLISHABLE_KEY="pk_live_xxxxx"
fly secrets set CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Stripe
fly secrets set STRIPE_SECRET_KEY="sk_live_xxxxx"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
fly secrets set STRIPE_STARTER_PRICE_ID="price_xxxxx"
fly secrets set STRIPE_PRO_PRICE_ID="price_xxxxx"

# Google Calendar
fly secrets set GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
fly secrets set GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
fly secrets set GOOGLE_REDIRECT_URI="https://api.microplanner.app/api/v1/calendar/oauth/google/callback"

# Encryption
fly secrets set ENCRYPTION_SECRET="$(openssl rand -base64 32)"

# App Config
fly secrets set APP_URL="https://app.microplanner.com"
fly secrets set API_URL="https://api.microplanner.app"
```

### 6. Deploy

```bash
# First deployment
fly deploy

# Watch logs
fly logs

# Check status
fly status
```

### 7. Custom Domain

```bash
# Add custom domain
fly certs add api.microplanner.app

# Get DNS instructions
fly certs show api.microplanner.app

# Add CNAME record to your DNS:
# CNAME api.microplanner.app -> microplanner-api.fly.dev
```

### 8. Scale (Optional)

```bash
# Scale to 2 machines for high availability
fly scale count 2

# Scale up memory/CPU
fly scale vm shared-cpu-2x --memory 1024
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        run: flyctl deploy --remote-only
        working-directory: ./apps/api-gateway
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Setup GitHub Secrets

1. Get Fly.io token:
   ```bash
   fly auth token
   ```

2. Add to GitHub:
   - Go to repository Settings > Secrets and variables > Actions
   - Add secret: `FLY_API_TOKEN` = `<your_token>`

---

## Post-Deployment Checklist

### 1. Update External Service Webhooks

**Clerk Dashboard**:
- Go to Webhooks
- Add endpoint: `https://api.microplanner.app/api/v1/webhooks/clerk`
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`
- Copy webhook secret → Update `CLERK_WEBHOOK_SECRET`

**Stripe Dashboard**:
- Go to Developers > Webhooks
- Add endpoint: `https://api.microplanner.app/api/v1/billing/webhooks/stripe`
- Subscribe to events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`
- Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET`

**Google Cloud Console**:
- Go to APIs & Services > Credentials
- Edit OAuth 2.0 Client ID
- Add Authorized redirect URI: `https://api.microplanner.app/api/v1/calendar/oauth/google/callback`

### 2. Run Database Migrations

```bash
fly ssh console
cd /app/packages/database
pnpm prisma migrate deploy
```

### 3. Verify Health Check

```bash
curl https://api.microplanner.app/health
# Should return: {"status": "ok", "timestamp": "..."}
```

### 4. Test Critical Endpoints

```bash
# Test Swagger docs
open https://api.microplanner.app/api

# Test authentication
curl -X GET https://api.microplanner.app/api/v1/users/me \
  -H "Authorization: Bearer <clerk_token>"

# Test Stripe webhook (use Stripe CLI)
stripe trigger checkout.session.completed
```

### 5. Monitor Initial Traffic

```bash
# Watch logs for errors
fly logs

# Check machine metrics
fly status
fly dashboard
```

---

## Monitoring & Maintenance

### Application Monitoring

**Fly.io Metrics**:
```bash
# Real-time logs
fly logs

# Machine status
fly status

# Open dashboard
fly dashboard
```

**Sentry Error Tracking** (Optional):

1. Install Sentry:
   ```bash
   pnpm add @sentry/node @sentry/tracing
   ```

2. Configure in `main.ts`:
   ```typescript
   import * as Sentry from '@sentry/node';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

3. Add to fly.toml:
   ```bash
   fly secrets set SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
   ```

### Database Monitoring

**Neon Console**:
- Monitor queries
- Check connection pool
- Review slow queries
- Set up alerts for high CPU/memory

### Cost Optimization

**Fly.io**:
- Start with 1 machine (512MB RAM)
- Scale up based on traffic
- Use autoscaling: `auto_stop_machines = true`

**Database**:
- Neon: Start with free tier, upgrade as needed
- Enable connection pooling
- Add indexes for slow queries

### Backup Strategy

**Database Backups**:
```bash
# Neon: Automatic daily backups (retain 7 days)
# Manual backup:
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore:
psql $DATABASE_URL < backup-20250113.sql
```

**Application State**:
- All state in database (stateless API)
- No local file storage needed

### Update/Rollback

**Deploy Update**:
```bash
git push origin main  # Triggers CI/CD
# OR
fly deploy
```

**Rollback**:
```bash
# List releases
fly releases

# Rollback to previous
fly releases rollback <version>
```

### Security Checklist

- [ ] All secrets stored in Fly secrets (not in code)
- [ ] HTTPS enforced (`force_https = true`)
- [ ] Webhook signatures verified
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Helmet security headers added
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] OAuth tokens encrypted at rest
- [ ] Regular dependency updates (`pnpm update`)
- [ ] Sentry error tracking enabled

### Performance Optimization

- [ ] Database indexes added for common queries
- [ ] Connection pooling configured
- [ ] Response compression enabled
- [ ] API response caching (Redis)
- [ ] CDN for static assets
- [ ] Image optimization
- [ ] Lazy loading implemented

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors**:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify SSL mode
# Should end with: ?sslmode=require
```

**2. Webhook Verification Failures**:
```bash
# Check webhook secret
fly secrets list | grep WEBHOOK

# Verify endpoint in Stripe/Clerk dashboard
# Must match exactly: https://api.microplanner.app/api/v1/...
```

**3. Build Failures**:
```bash
# Check logs
fly logs --app microplanner-api

# SSH into machine
fly ssh console

# Check disk space
df -h

# Clear cache
fly deploy --no-cache
```

**4. Out of Memory**:
```bash
# Check current memory
fly status

# Scale up
fly scale memory 1024
```

**5. Prisma Client Errors**:
```bash
# Regenerate client
fly ssh console
cd /app/packages/database
pnpm prisma generate
exit

# Restart app
fly apps restart microplanner-api
```

### Support

- **Fly.io Community**: https://community.fly.io
- **Documentation**: https://fly.io/docs
- **Status Page**: https://status.fly.io

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations deployed
- [ ] Custom domain configured with SSL
- [ ] Webhooks tested (Clerk, Stripe)
- [ ] Google OAuth redirect URI updated
- [ ] Health check endpoint working
- [ ] Monitoring/alerting configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team has access to Fly.io dashboard
- [ ] Incident response plan ready
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Error tracking (Sentry) enabled

**You're ready to launch! 🚀**
