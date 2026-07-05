# Multi-stage build for Apollo GraphQL Gateway

FROM node:18-alpine AS base
RUN npm install -g pnpm@8.15.4
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/graphql-gateway/package.json ./apps/graphql-gateway/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY apps/graphql-gateway/package.json ./apps/graphql-gateway/
COPY apps/graphql-gateway ./apps/graphql-gateway
RUN pnpm --filter @microplanner/graphql-gateway build

FROM base AS production
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/graphql-gateway/package.json ./apps/graphql-gateway/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/graphql-gateway/dist ./dist
COPY --from=build /app/apps/graphql-gateway/src/schema ./dist/schema

WORKDIR /app/apps/graphql-gateway

EXPOSE 4000

CMD ["node", "dist/index.js"]
