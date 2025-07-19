# Multi-stage Docker build for production readiness

# Base stage: Install dependencies
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy package.json files for all apps and packages
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Dependencies stage: Install all dependencies
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Build stage: Build the applications
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cp .env.dev .env

# Generate Prisma client
RUN pnpm --filter @repo/db db:generate

# Build applications
RUN pnpm --filter api build
RUN pnpm --filter web build

# Development API stage
FROM base AS api-dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @repo/db db:generate
EXPOSE 3001
USER node
CMD ["pnpm", "--filter", "api", "start:dev"]

# Development Web stage  
FROM base AS web-dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
USER node
CMD ["pnpm", "--filter", "web", "dev"]

# Production API stage
FROM node:20-alpine AS api
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/packages ./packages

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/apps/api/main"]

# Production Web stage
FROM node:20-alpine AS web
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sveltekit -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=build --chown=sveltekit:nodejs /app/apps/web/.svelte-kit/output ./build
COPY --from=build --chown=sveltekit:nodejs /app/apps/web/package.json ./package.json
COPY --from=build --chown=sveltekit:nodejs /app/node_modules ./node_modules

USER sveltekit

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "build"]