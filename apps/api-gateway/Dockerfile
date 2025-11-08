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
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @microplanner/database db:generate
RUN pnpm --filter @microplanner/api-gateway build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=build /app/packages ./packages
COPY apps/api-gateway/package.json ./apps/api-gateway/

WORKDIR /app/apps/api-gateway

EXPOSE 3001

CMD ["node", "dist/main.js"]
