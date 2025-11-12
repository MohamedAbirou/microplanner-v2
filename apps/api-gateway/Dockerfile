# Multi-stage build for NestJS API Gateway

FROM node:18-alpine AS base
RUN npm install -g pnpm@8.15.4
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules

# Copy all package.json files first
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Copy source code and Prisma schema
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY apps/api-gateway ./apps/api-gateway

# Generate Prisma client
RUN pnpm --filter @microplanner/database db:generate

# Build the API gateway
RUN pnpm --filter @microplanner/api-gateway build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy workspace files needed for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install ONLY production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=build /app/apps/api-gateway/dist ./apps/api-gateway/dist

# Copy packages with generated Prisma client
COPY --from=build /app/packages ./packages

# Copy Prisma schema and generated binaries
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/apps/api-gateway

EXPOSE 3001

CMD ["node", "dist/main.js"]
