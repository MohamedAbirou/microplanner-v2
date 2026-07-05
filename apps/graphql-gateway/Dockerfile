# Multi-stage build for Apollo GraphQL Gateway

FROM node:18-alpine AS base
RUN npm install -g pnpm@8.15.4
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/graphql-gateway/package.json ./apps/graphql-gateway/
RUN pnpm install --frozen-lockfile
COPY apps/graphql-gateway ./apps/graphql-gateway
RUN pnpm --filter @microplanner/graphql-gateway build

FROM base AS production
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/graphql-gateway/package.json ./apps/graphql-gateway/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/graphql-gateway/dist ./apps/graphql-gateway/dist
COPY --from=build /app/apps/graphql-gateway/src/schema ./apps/graphql-gateway/dist/schema

WORKDIR /app/apps/graphql-gateway

EXPOSE 4000

CMD ["node", "dist/index.js"]
