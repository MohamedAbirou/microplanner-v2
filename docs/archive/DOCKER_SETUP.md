# 🐳 Docker Setup Guide - MicroPlanner v2

**Complete guide to run MicroPlanner using Docker Compose with all errors fixed.**

---

## ✅ What Was Fixed

### 1. **Removed Obsolete `version` Field**
- ❌ **Before**: `version: '3.8'` (line 1 of docker-compose.yml)
- ✅ **After**: Removed (Docker Compose v2 doesn't require version field)
- **Why**: Docker Compose v2+ ignores the version field and shows a warning

### 2. **Fixed Environment Variable Warnings**
- ❌ **Before**: `${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}` caused "variable is not set" warning
- ✅ **After**: `${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_placeholder}`
- **Why**: Provides default values so Docker doesn't show warnings when .env isn't configured yet

### 3. **Fixed Prisma Client Generation in api-gateway Dockerfile**
- ❌ **Before**:
  ```dockerfile
  COPY --from=dependencies /app/node_modules ./node_modules
  COPY . .
  RUN pnpm --filter @microplanner/database db:generate
  ```
  **Error**: `Cannot find module '/app/packages/database/node_modules/prisma/build/index.js'`

- ✅ **After**:
  ```dockerfile
  # Copy workspace files first
  COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
  COPY --from=dependencies /app/node_modules ./node_modules

  # Copy package.json files
  COPY apps/api-gateway/package.json ./apps/api-gateway/
  COPY packages/database/package.json ./packages/database/

  # Copy Prisma schema BEFORE generating
  COPY packages/database ./packages/database

  # Now generate Prisma client
  RUN pnpm --filter @microplanner/database db:generate
  ```

- **Why**: Prisma needs the schema.prisma file to be present before running `prisma generate`. We now copy the entire packages/database directory before running the generation command.

### 4. **Updated planning-service Dockerfile for Root Context**
- ❌ **Before**: `COPY requirements.txt .` (assumes context is apps/planning-service)
- ✅ **After**: `COPY apps/planning-service/requirements.txt .` (context is root)
- **Why**: docker-compose.yml sets `context: .` (root), so paths must be relative to root

### 5. **Enhanced web Dockerfile.dev**
- ✅ Added database package to dependencies
- ✅ Properly copies all packages including Prisma client
- ✅ Ensures workspace structure is maintained

### 6. **Added .dockerignore**
- ✅ Excludes node_modules, .next, and other unnecessary files
- ✅ Speeds up Docker builds by reducing context size
- ✅ Prevents conflicts with Docker-generated files

---

## 🚀 How to Use Docker

### Prerequisites

1. **Docker Desktop** installed (includes Docker Compose v2)
   - Download: https://www.docker.com/products/docker-desktop/

2. **Verify Installation**:
   ```bash
   docker --version
   docker compose version
   ```

### Starting All Services

#### Option 1: Quick Start (All Services)

```bash
# From project root
docker compose up -d
```

**What this starts**:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ API Gateway (port 3001)
- ✅ Planning Service (port 8000)
- ✅ Web App (port 3000)

#### Option 2: Start Specific Services

```bash
# Just databases
docker compose up -d postgres redis

# Just backend
docker compose up -d api-gateway planning-service

# Just frontend
docker compose up -d web
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway
docker compose logs -f web
docker compose logs -f planning-service

# Last 100 lines
docker compose logs --tail=100 api-gateway
```

### Stopping Services

```bash
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps data)
docker compose down

# Stop and remove everything including volumes (⚠️ DELETES DATA)
docker compose down -v
```

### Rebuilding After Code Changes

```bash
# Rebuild a specific service
docker compose build api-gateway
docker compose build web

# Rebuild and restart
docker compose up -d --build api-gateway

# Rebuild all services
docker compose build
```

---

## 🔍 Verifying Everything Works

### 1. Check Service Status

```bash
docker compose ps
```

**Expected output**:
```
NAME                          STATUS        PORTS
microplanner-api-gateway      Up            0.0.0.0:3001->3001/tcp
microplanner-planning-service Up            0.0.0.0:8000->8000/tcp
microplanner-postgres         Up (healthy)  0.0.0.0:5432->5432/tcp
microplanner-redis            Up (healthy)  0.0.0.0:6379->6379/tcp
microplanner-web              Up            0.0.0.0:3000->3000/tcp
```

### 2. Test Each Service

#### PostgreSQL
```bash
docker compose exec postgres psql -U microplanner -d microplanner_dev -c "SELECT version();"
```

#### Redis
```bash
docker compose exec redis redis-cli ping
# Should return: PONG
```

#### API Gateway
```bash
curl http://localhost:3001/api/health
# Should return health check response
```

#### Planning Service
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

#### Web App
```bash
curl http://localhost:3000
# Should return HTML
```

Or open in browser: http://localhost:3000

---

## 🐛 Troubleshooting

### ❌ Error: "Prisma Client generation failed"

**Cause**: Old build cache from before the fix.

**Solution**:
```bash
# Remove old build cache
docker compose down
docker system prune -f

# Rebuild from scratch
docker compose build --no-cache api-gateway
docker compose up -d api-gateway
```

---

### ❌ Error: "port is already allocated"

**Cause**: Port already in use by local development or another Docker container.

**Solution**:

**Option 1**: Stop local services
```bash
# If you're running local pnpm dev, stop it first
# Ctrl+C in the terminal running pnpm dev
```

**Option 2**: Change Docker ports in docker-compose.yml
```yaml
# Example: Change web from 3000 to 3002
web:
  ports:
    - '3002:3000'  # Host:Container
```

---

### ❌ Error: "Error response from daemon: Get https://registry-1.docker.io/v2/: net/http: request canceled"

**Cause**: Network issue or Docker Desktop not running.

**Solution**:
```bash
# Make sure Docker Desktop is running
# Restart Docker Desktop
# Then try again
docker compose up -d
```

---

### ❌ Error: "database 'microplanner_dev' does not exist"

**Cause**: PostgreSQL container started but database not initialized.

**Solution**:
```bash
# Restart PostgreSQL to trigger init
docker compose restart postgres

# Or recreate it
docker compose down
docker volume rm microplanner-v2_postgres_data
docker compose up -d postgres
```

---

### ❌ Error: "Cannot find module '@microplanner/types'"

**Cause**: node_modules not properly installed in Docker.

**Solution**:
```bash
# Rebuild with no cache
docker compose build --no-cache api-gateway
docker compose up -d api-gateway
```

---

### ❌ Service keeps restarting

**Cause**: Application error or missing environment variables.

**Solution**:
```bash
# Check logs
docker compose logs -f [service-name]

# Common fixes:
# 1. Make sure .env files exist
# 2. Check for typos in docker-compose.yml environment section
# 3. Verify database is healthy before API starts
```

---

## 📊 Service Dependencies

```
PostgreSQL (must start first)
    ↓
Redis (must start first)
    ↓
Planning Service (depends on DB + Redis)
    ↓
API Gateway (depends on DB + Redis + Planning Service)
    ↓
Web App (depends on API Gateway)
```

**This is automatically handled by `depends_on` in docker-compose.yml**

---

## 🔧 Environment Variables

### Required for Production

Create a `.env` file in the root directory:

```env
# OpenAI (required for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Clerk (required for authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

### Optional (has defaults)

These have placeholder defaults in docker-compose.yml, so Docker will work without them:

```env
# These are optional for development
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## 🎯 Development Workflow with Docker

### Workflow 1: Docker for Everything

```bash
# Start all services
docker compose up -d

# View logs in real-time
docker compose logs -f api-gateway web

# Make code changes (hot reload works via volumes)
# Edit files locally, changes reflect immediately

# Rebuild only when dependencies change
docker compose up -d --build api-gateway
```

### Workflow 2: Docker for Databases Only (Recommended)

```bash
# Start only databases
docker compose up -d postgres redis

# Run services locally for faster development
cd apps/web && pnpm dev          # Terminal 1
cd apps/api-gateway && pnpm dev  # Terminal 2
cd apps/planning-service && ...  # Terminal 3
```

**Why this is better**:
- ✅ Faster hot reload
- ✅ Better debugging
- ✅ Native performance
- ✅ Easier to see logs

---

## 🚀 Production Deployment

For production, you'll want to:

1. **Build production images**:
   ```bash
   docker compose -f docker-compose.prod.yml build
   ```

2. **Use environment-specific configs**:
   - Create `docker-compose.prod.yml`
   - Remove volume mounts (use COPY instead)
   - Set `NODE_ENV=production`
   - Use health checks
   - Set resource limits

3. **Use orchestration** (Kubernetes, ECS, etc.):
   - Convert docker-compose to k8s manifests
   - Or deploy to AWS ECS/Fargate
   - Or use Docker Swarm

---

## 📝 Summary of All Fixes

| Issue | Status | Fix Location |
|-------|--------|--------------|
| Obsolete version field | ✅ Fixed | docker-compose.yml line 1 |
| Clerk env var warning | ✅ Fixed | docker-compose.yml line 112-113 |
| Prisma generation error | ✅ Fixed | apps/api-gateway/Dockerfile lines 18-35 |
| Planning service context | ✅ Fixed | apps/planning-service/Dockerfile lines 11, 15 |
| Web app workspace | ✅ Fixed | apps/web/Dockerfile.dev lines 17-27 |
| Missing .dockerignore | ✅ Added | .dockerignore (new file) |

---

## ✅ Testing Checklist

Use this to verify everything works:

- [ ] Docker Desktop is running
- [ ] Run `docker compose build` (no errors)
- [ ] Run `docker compose up -d` (all services start)
- [ ] Run `docker compose ps` (all services show "Up")
- [ ] Check postgres: `docker compose logs postgres` (no errors)
- [ ] Check redis: `docker compose logs redis` (no errors)
- [ ] Check api-gateway: `docker compose logs api-gateway` (shows "Nest application successfully started")
- [ ] Check planning-service: `docker compose logs planning-service` (shows "Application startup complete")
- [ ] Check web: `docker compose logs web` (shows "Ready in Xms")
- [ ] Open http://localhost:3000 in browser (landing page loads)
- [ ] Check http://localhost:3001/api/health (health check works)
- [ ] Check http://localhost:4000/graphql (GraphQL playground loads)

---

## 🎉 Success!

If all services are running without errors, you now have:

- ✅ PostgreSQL with pgvector extension
- ✅ Redis for caching and queues
- ✅ NestJS API Gateway with Prisma
- ✅ FastAPI Planning Service
- ✅ Next.js 15 Web App
- ✅ All services communicating properly
- ✅ Hot reload enabled for development
- ✅ Health checks configured
- ✅ Network isolation with docker bridge

**Docker is running smoothly! 🚀**

---

## 📞 Still Having Issues?

If you encounter any Docker errors not covered here:

1. **Check logs**: `docker compose logs -f [service-name]`
2. **Clean rebuild**: `docker compose down && docker compose build --no-cache`
3. **Check Docker resources**: Ensure Docker has enough memory (4GB+ recommended)
4. **Verify files exist**: Make sure all Dockerfiles and docker-compose.yml are saved
5. **Check Docker version**: Ensure you have Docker Compose v2+ (`docker compose version`)

---

**Happy Dockerizing! 🐳**
