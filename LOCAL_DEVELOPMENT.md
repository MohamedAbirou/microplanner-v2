# 🚀 MicroPlanner - Local Development Setup Guide

**Complete guide to run the entire MicroPlanner stack on your local machine.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Steps](#installation-steps)
4. [Environment Variables](#environment-variables)
5. [Running the Project](#running-the-project)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

---

## 🔧 Prerequisites

Install these before starting:

### Required Software

1. **Node.js 18+** (recommended: v20.x)
   ```bash
   node --version  # Should be v18+ or v20+
   ```
   Download: https://nodejs.org/

2. **pnpm 8+** (package manager)
   ```bash
   npm install -g pnpm
   pnpm --version  # Should be 8.x or 9.x
   ```

3. **Docker** (for PostgreSQL and Redis)
   ```bash
   docker --version
   docker-compose --version
   ```
   Download: https://www.docker.com/products/docker-desktop/

4. **Git**
   ```bash
   git --version
   ```

---

## 📁 Project Structure

```
microplanner-v2/
├── node_modules/              # ← Root dependencies (pnpm workspace)
├── apps/
│   ├── web/                   # Next.js 15 web app
│   │   ├── node_modules/      # ← Web app dependencies (linked to root)
│   │   ├── .env.local         # ← WEB environment variables (create this!)
│   │   └── package.json
│   ├── api-gateway/           # NestJS REST API
│   │   ├── node_modules/      # ← API dependencies
│   │   ├── .env               # ← API environment variables (create this!)
│   │   └── package.json
│   ├── graphql-gateway/       # Apollo GraphQL Gateway
│   │   ├── node_modules/      # ← GraphQL dependencies
│   │   ├── .env               # ← GraphQL environment variables (create this!)
│   │   └── package.json
│   └── planning-service/      # Python AI Planning Service
│       └── .env               # ← Planning service env vars
│
├── packages/
│   ├── database/              # Prisma schema
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── types/                 # Shared TypeScript types
│   └── config/                # Shared configs
│
├── .env.example               # ← Example env file (copy this!)
├── docker-compose.yml         # Docker services (PostgreSQL, Redis)
├── package.json               # Root package.json (workspace config)
├── pnpm-lock.yaml
└── pnpm-workspace.yaml

```

**Key Points:**
- ✅ `node_modules/` at **root** - Contains all workspace dependencies
- ✅ `node_modules/` in each **app** - Symlinked to root (managed by pnpm)
- ✅ `.env` files go in **each app directory** that needs them
- ✅ Root `.env.example` is just a **reference**

---

## 🛠️ Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/MohamedAbirou/microplanner-v2.git
cd microplanner-v2
```

### Step 2: Install ALL Dependencies (One Command!)

From the **root directory**:

```bash
pnpm install
```

**What this does:**
- ✅ Installs root dependencies
- ✅ Installs dependencies for ALL apps (web, api-gateway, graphql-gateway)
- ✅ Links shared packages (database, types, config)
- ✅ Creates `node_modules/` in root and each app

**Expected output:**
```
 WARN  deprecated eslint@8.57.1
 WARN  24 deprecated subdependencies found
Packages: +2093
+++++++++++++++++++++++++++++++++
Done in 1m 30s
```

### Step 3: Start Docker Services (PostgreSQL + Redis)

```bash
docker-compose up -d
```

**What this starts:**
- ✅ PostgreSQL on port **5432**
- ✅ Redis on port **6379**

**Verify it's running:**
```bash
docker-compose ps
```

You should see:
```
NAME                 SERVICE      STATUS
microplanner-db      postgres     Up
microplanner-redis   redis        Up
```

### Step 4: Set Up Environment Variables

You need to create `.env` files for each service.

#### **4a. Copy the example file:**

```bash
cp .env.example apps/web/.env.local
cp .env.example apps/api-gateway/.env
cp .env.example apps/graphql-gateway/.env
```

#### **4b. Edit each `.env` file:**

##### **apps/web/.env.local** (Next.js Web App)

```env
# ============================================
# WEB APP ENVIRONMENT VARIABLES
# ============================================

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql

# Clerk Authentication (Sign up: https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Optional: Analytics (can skip for local dev)
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

##### **apps/api-gateway/.env** (NestJS REST API)

```env
# ============================================
# API GATEWAY ENVIRONMENT VARIABLES
# ============================================

# Server
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://microplanner:microplanner_dev_password@localhost:5432/microplanner_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CLERK_DOMAIN=your-clerk-instance.clerk.accounts.dev
CLERK_AUDIENCE=http://localhost:3001

# Stripe (can skip for local dev)
# STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
# STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
# OPENAI_ORG_ID=org-xxxxxxxxxxxxx

# Google Calendar (can skip for local dev)
# GOOGLE_CLIENT_ID=xxxxxxxxxxxxx
# GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxx
# GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/oauth/google/callback

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key-here  # Generate: openssl rand -hex 32

# Optional Services
# SENTRY_DSN=https://xxxxxxxxxxxxx
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# EXPO_ACCESS_TOKEN=xxxxxxxxxxxxx

# Planning Service
PLANNING_SERVICE_URL=http://localhost:8000
API_GATEWAY_URL=http://localhost:3001
```

##### **apps/graphql-gateway/.env** (Apollo GraphQL)

```env
# ============================================
# GRAPHQL GATEWAY ENVIRONMENT VARIABLES
# ============================================

# Server
NODE_ENV=development
PORT=4000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=  # Leave empty for local dev

# API Gateway
API_GATEWAY_URL=http://localhost:3001
```

### Step 5: Set Up the Database

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# (Optional) Seed the database
# pnpm prisma db seed
```

### Step 6: Verify Setup

Run this command to check if everything is configured:

```bash
pnpm --filter @microplanner/web type-check
```

If no errors, you're good! ✅

---

## 🚀 Running the Project

You have **3 services** to run:

### Option 1: Run All Services Separately (Recommended for Development)

Open **3 terminal windows**:

#### **Terminal 1: Web App (Next.js)**
```bash
cd apps/web
pnpm dev
```
**Runs on:** http://localhost:3000

#### **Terminal 2: API Gateway (NestJS)**
```bash
cd apps/api-gateway
pnpm start:dev
```
**Runs on:** http://localhost:3001

#### **Terminal 3: GraphQL Gateway (Apollo)**
```bash
cd apps/graphql-gateway
pnpm dev
```
**Runs on:** http://localhost:4000

---

### Option 2: Run Everything from Root (Using Turbo)

From the **root directory**:

```bash
# Run all services in parallel
pnpm dev

# Or run specific services
pnpm --filter @microplanner/web dev
pnpm --filter @microplanner/api-gateway start:dev
pnpm --filter @microplanner/graphql-gateway dev
```

---

## ✅ What Should Be Running

When everything is set up correctly:

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| **PostgreSQL** | 5432 | - | `docker-compose ps` |
| **Redis** | 6379 | - | `docker-compose ps` |
| **Web App** | 3000 | http://localhost:3000 | Open in browser |
| **API Gateway** | 3001 | http://localhost:3001/api | Visit /api/health |
| **GraphQL** | 4000 | http://localhost:4000/graphql | GraphQL Playground |

---

## 🐛 Troubleshooting

### ❌ Error: "The `border-border` class does not exist"

**Solution:** Already fixed! Pull the latest changes:
```bash
git pull origin claude/hello-world-011CUyGAiSHHsMrwL4L9kjEP
```

---

### ❌ Error: "Cannot find module '@microplanner/types'"

**Cause:** Dependencies not linked properly.

**Solution:**
```bash
# From root directory
pnpm install

# Verify packages are linked
ls -la node_modules/@microplanner
```

---

### ❌ Error: "Prisma Client is not generated"

**Cause:** Prisma client needs to be generated.

**Solution:**
```bash
pnpm prisma generate
```

---

### ❌ Error: "ECONNREFUSED 127.0.0.1:5432" (Database)

**Cause:** PostgreSQL is not running.

**Solution:**
```bash
# Start Docker services
docker-compose up -d

# Check if running
docker-compose ps

# Check logs
docker-compose logs postgres
```

---

### ❌ Error: "ECONNREFUSED 127.0.0.1:6379" (Redis)

**Cause:** Redis is not running.

**Solution:**
```bash
# Start Docker services
docker-compose up -d

# Check if running
docker-compose ps

# Check logs
docker-compose logs redis
```

---

### ❌ Error: Port 3000/3001/4000 already in use

**Solution:**
```bash
# Find and kill the process
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in .env
PORT=3002  # Use a different port
```

---

### ❌ Web app runs but shows blank page

**Cause:** Check browser console for errors.

**Common fixes:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Delete `.next` folder and restart:
   ```bash
   cd apps/web
   rm -rf .next
   pnpm dev
   ```

---

### ❌ Error: "Failed to fetch schema-engine"

**Cause:** Network issue downloading Prisma binaries.

**Solution:**
```bash
# Set environment variable to skip checksum
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma generate
```

---

## 🔄 Development Workflow

### Making Code Changes

1. **Edit code** in your favorite editor
2. **Hot reload** kicks in automatically (no restart needed!)
3. **Check terminal** for any errors

### Adding Dependencies

```bash
# Add to web app
pnpm --filter @microplanner/web add package-name

# Add to API gateway
pnpm --filter @microplanner/api-gateway add package-name

# Add to all apps
pnpm add -w package-name
```

### Database Changes

```bash
# 1. Edit schema: packages/database/prisma/schema.prisma
# 2. Create migration
pnpm prisma migrate dev --name your_migration_name

# 3. Generate client
pnpm prisma generate

# 4. Restart services
```

### Viewing the Database

```bash
# Open Prisma Studio (visual database editor)
pnpm prisma studio
```
Opens at: http://localhost:5555

---

## 🎯 Quick Start Checklist

Use this checklist to verify your setup:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Docker running (`docker --version`)
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install` from root)
- [ ] Docker services started (`docker-compose up -d`)
- [ ] .env files created in:
  - [ ] `apps/web/.env.local`
  - [ ] `apps/api-gateway/.env`
  - [ ] `apps/graphql-gateway/.env`
- [ ] Prisma client generated (`pnpm prisma generate`)
- [ ] Database migrated (`pnpm prisma migrate dev`)
- [ ] Web app running on port 3000
- [ ] API Gateway running on port 3001
- [ ] GraphQL Gateway running on port 4000
- [ ] Can access http://localhost:3000 in browser

---

## 🎉 Success!

If you can see the landing page at **http://localhost:3000**, you're all set! 🚀

**What you should see:**
- ✅ MicroPlanner logo
- ✅ Gradient hero section
- ✅ Email waitlist form
- ✅ Features grid
- ✅ No errors in browser console

---

## 📞 Need Help?

If you're still stuck:

1. Check browser console (F12) for errors
2. Check terminal for error messages
3. Make sure all 5 services are running (PostgreSQL, Redis, Web, API, GraphQL)
4. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -rf node_modules apps/*/node_modules
   pnpm install
   ```

---

## 🚀 Next Steps

Now that your local environment is running:

1. ✅ Explore the landing page at http://localhost:3000
2. ✅ Test the email waitlist form
3. ✅ Check the GraphQL playground at http://localhost:4000/graphql
4. ✅ Start building Phase 1 features!

**Happy coding! 💻**
