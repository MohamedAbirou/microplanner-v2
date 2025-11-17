# Deploy MicroPlanner API Gateway to Render

## Quick Setup

### Option 1: Using render.yaml (Recommended)

1. **Push the code** (already done)
2. **In Render Dashboard:**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo: `MohamedAbirou/microplanner-v2`
   - Select branch: `claude/microplanner-v2-ultra-premium-frontend-011CUztgtXJ5mYQwqQ9ZqRZU`
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   REDIS_URL=<your-redis-url>
   ANTHROPIC_API_KEY=<your-key>
   OPENAI_API_KEY=<your-key>
   CLERK_PUBLISHABLE_KEY=<your-key>
   CLERK_SECRET_KEY=<your-key>
   STRIPE_SECRET_KEY=<your-key>
   STRIPE_WEBHOOK_SECRET=<your-secret>
   ```

### Option 2: Manual Configuration

1. **Create New Web Service** in Render
2. **Connect Repository**: `MohamedAbirou/microplanner-v2`
3. **Configure:**

   **Root Directory:** `.` (leave blank)

   **Build Command:**
   ```bash
   corepack enable && corepack prepare pnpm@8.15.4 --activate && pnpm install --frozen-lockfile && cd packages/database && pnpm prisma generate && cd ../.. && pnpm build --filter=@microplanner/api-gateway
   ```

   **Start Command:**
   ```bash
   node apps/api-gateway/dist/main.js
   ```

   **Environment:** Node

   **Node Version:** 22

4. **Add Environment Variables** (same as above)

## Important Notes

### Database Setup
Before deploying, you need a PostgreSQL database. On Render:
1. Create a new PostgreSQL database
2. Copy the "Internal Database URL"
3. Use it as `DATABASE_URL` env var

### Redis Setup
For background jobs and caching:
1. Create a Redis instance (Render or Upstash)
2. Copy the connection URL
3. Use it as `REDIS_URL` env var

### Build Process
The build command:
1. Enables pnpm via corepack
2. Installs all dependencies from root
3. Generates Prisma client
4. Builds only the api-gateway workspace using Turborepo

### Troubleshooting

**Error: `nest: not found`**
- Make sure you're building from monorepo root (`.`)
- pnpm must be enabled via corepack

**Error: Prisma client not generated**
- Add `cd packages/database && pnpm prisma generate && cd ../..` before the build command

**Error: Module '@microplanner/database' not found**
- Ensure all dependencies are installed with `pnpm install --frozen-lockfile`
- Check that paths are correct in tsconfig

**Port Issues**
- Render automatically sets the `PORT` environment variable
- NestJS will use `process.env.PORT` or default to 3000

## Health Check

Once deployed, test the API:
```bash
curl https://your-app.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

## Scaling

- **Free Tier**: Spins down after inactivity, slow cold starts
- **Starter ($7/month)**: Always on, better for production
- **Standard**: For higher traffic

## Next Steps

After deployment:
1. Test all endpoints
2. Set up monitoring (Sentry is already configured)
3. Configure custom domain if needed
4. Set up CI/CD for automatic deployments
