# Docker Deployment Guide - Waitlist Feature

This guide explains how to deploy the MicroPlanner API Gateway with just the waitlist feature using Docker.

## Prerequisites

- Docker installed
- PostgreSQL database (can be hosted on services like Neon, Supabase, Railway, etc.)
- Environment variables configured

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the `apps/api-gateway` directory with the following **required** variable:

```bash
# Required
DATABASE_URL="postgresql://user:password@your-db-host:5432/microplanner"
NODE_ENV="production"
PORT="3001"

# Optional - Redis (for caching and job queues)
# If not provided, the app will run without caching
# REDIS_URL="redis://your-redis-host:6379"
```

See `.env.docker.example` for a complete example.

### 2. Build the Docker Image

From the **root directory** of the project:

```bash
docker build -f apps/api-gateway/Dockerfile -t microplanner-api .
```

### 3. Run the Container

```bash
docker run -d \
  --name microplanner-api \
  -p 3001:3001 \
  -e DATABASE_URL="your-database-url" \
  -e NODE_ENV="production" \
  microplanner-api
```

Or with a `.env` file:

```bash
docker run -d \
  --name microplanner-api \
  -p 3001:3001 \
  --env-file apps/api-gateway/.env \
  microplanner-api
```

### 4. Run Database Migrations

Before using the app, run Prisma migrations:

```bash
docker exec -it microplanner-api pnpm --filter @microplanner/database db:push
```

## Using the Waitlist GraphQL API

The API will be available at `http://localhost:3001/graphql` (or your deployment URL).

### Join Waitlist Mutation

```graphql
mutation JoinWaitlist($input: JoinWaitlistInput!) {
  joinWaitlist(input: $input) {
    success
    message
    position
    email
  }
}

# Variables:
{
  "input": {
    "email": "user@example.com",
    "name": "John Doe",
    "useCase": "Personal productivity",
    "referralSource": "Twitter"
  }
}
```

### Get Waitlist Stats Query

```graphql
query WaitlistStats {
  waitlistStats {
    total
    pending
    approved
    invited
    converted
    averageWaitDays
  }
}
```

## Redis Optional

The app is designed to work **without Redis**. If Redis is unavailable:
- ✅ Waitlist will work perfectly
- ✅ Database operations will work
- ❌ Caching will be disabled (minor performance impact)
- ❌ Background job queues will be disabled

To enable Redis, add one of these to your environment:

```bash
# Option 1: Connection string
REDIS_URL="redis://your-redis-host:6379"

# Option 2: Separate variables
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="optional-password"
```

## Deployment Platforms

### Railway

1. Create a new project
2. Add PostgreSQL database
3. Deploy from GitHub (select `apps/api-gateway/Dockerfile` as root directory)
4. Set `DATABASE_URL` environment variable (auto-provided by Railway)

### Render

1. Create a new Web Service
2. Docker runtime
3. Set Dockerfile path: `apps/api-gateway/Dockerfile`
4. Add PostgreSQL database
5. Set environment variables

### DigitalOcean App Platform

1. Create a new app
2. Select Docker as runtime
3. Set Dockerfile path: `apps/api-gateway/Dockerfile`
4. Add a managed PostgreSQL database
5. Configure environment variables

## Troubleshooting

### Redis connection errors (safe to ignore)

If you see:
```
❌ Redis connection error: ECONNREFUSED
```

This is expected if Redis is not configured. The app will continue to work without caching.

### Missing package error

If you see:
```
The "@as-integrations/express5" package is missing
```

Run `pnpm install` in the root directory and rebuild the Docker image.

### Database connection issues

Ensure your `DATABASE_URL` is correct and the database is accessible from your Docker container.

## Health Check

Check if the API is running:

```bash
curl http://localhost:3001/health
```

## Viewing Logs

```bash
docker logs -f microplanner-api
```

## Stopping the Container

```bash
docker stop microplanner-api
docker rm microplanner-api
```
