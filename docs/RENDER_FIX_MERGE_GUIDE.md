# Critical Files to Merge for Render Deployment

You need to merge these specific files from `claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU` into your deployment branch to fix the Render build.

## 🚨 Critical Files (MUST MERGE):

### 1. `apps/api-gateway/package.json`
**What changed:** Moved build-time dependencies to production dependencies

```json
{
  "dependencies": {
    "@nestjs/cli": "^10.3.0",
    "typescript": "^5.3.3",
    "ts-loader": "^9.5.1",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.11.5",
    "@types/passport-jwt": "^4.0.0",
    "@types/compression": "^1.7.5",
    // ... all other deps
  },
  "devDependencies": {
    // Only true dev-only tools here
  }
}
```

**Why:** Render sets `NODE_ENV=production` which skips devDependencies. Build tools MUST be in dependencies.

---

### 2. `packages/database/package.json`
**What changed:** Moved `prisma` CLI to production dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^5.9.1",
    "prisma": "^5.9.1"  // ← MOVED FROM devDependencies
  }
}
```

**Why:** `pnpm prisma generate` command fails without prisma CLI in production.

---

### 3. `apps/api-gateway/tsconfig.json`
**What changed:** Removed restrictive `rootDir` setting

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    // NO "rootDir": "./src" !!! This line should NOT exist
    "baseUrl": "./",
    "paths": {
      "@microplanner/types": ["../../packages/types/src"],
      "@microplanner/config": ["../../packages/config/src"],
      "@microplanner/database": ["../../packages/database/src"]
    }
  }
}
```

**Why:** `rootDir` prevents importing from workspace packages in monorepo.

---

### 4. `packages/database/src/index.ts`
**What changed:** Export Prisma enums as values, not just types

```typescript
// Export Prisma types AND enums from generated client
export * from '@prisma/client';  // NOT: export type * from '@prisma/client'
```

**Why:** Code needs to import enum VALUES like `SubscriptionTier.FREE`, not just types.

---

### 5. `render.yaml`
**What changed:** Proper build command for monorepo

```yaml
services:
  - type: web
    name: microplanner-api
    runtime: node
    plan: starter
    buildCommand: |
      npm install -g pnpm@8.15.4
      pnpm install --no-frozen-lockfile
      cd packages/database
      pnpm prisma generate
      cd ../..
      pnpm build --filter=@microplanner/api-gateway
    startCommand: node apps/api-gateway/dist/main.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        sync: false
      # ... other env vars
```

**Why:** Proper pnpm setup, Prisma generation, and Turborepo filtering.

---

## How to Merge:

### Option 1: Cherry-pick these specific files
```bash
git checkout claude/microplanner-mvp-setup-011CUwJu5ddw7tfYxVo2iJuj
git checkout claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU -- apps/api-gateway/package.json
git checkout claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU -- apps/api-gateway/tsconfig.json
git checkout claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU -- packages/database/package.json
git checkout claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU -- packages/database/src/index.ts
git checkout claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU -- render.yaml
pnpm install  # Update lockfile
git add -A
git commit -m "fix: Merge Render deployment fixes from frontend branch"
git push
```

### Option 2: Full merge
```bash
git checkout claude/microplanner-mvp-setup-011CUwJu5ddw7tfYxVo2iJuj
git merge claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU
# Resolve any conflicts, keeping the changes from the list above
git push
```

---

## After Merging:

1. **Regenerate lockfile:**
   ```bash
   pnpm install
   git add pnpm-lock.yaml
   git commit -m "chore: Update lockfile after dependency changes"
   git push
   ```

2. **Redeploy on Render** - It should automatically trigger

3. **Build should succeed!** ✅

---

## What Each Fix Solves:

| Error | Fix |
|-------|-----|
| `nest: not found` | Moved `@nestjs/cli` to dependencies |
| `ts-loader not found` | Moved `ts-loader` to dependencies |
| `Cannot find module 'express'` | Moved `@types/express` to dependencies |
| `prisma generate failed` | Moved `prisma` CLI to dependencies |
| `rootDir error` | Removed `rootDir` from tsconfig |
| `Cannot import SubscriptionTier` | Changed `export type *` to `export *` |

---

## Verification:

After merging, verify locally:
```bash
pnpm build --filter=@microplanner/api-gateway
```

Should complete without errors!
