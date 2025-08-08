# Multi-stage Docker build for production readiness

# Base stage: Install dependencies
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl openssl openssl-dev ca-certificates
WORKDIR /app

# Install pnpm v9.14.2 (static binary)
RUN wget -qO /usr/local/bin/pnpm https://github.com/pnpm/pnpm/releases/download/v9.14.2/pnpm-linuxstatic-x64 && chmod +x /usr/local/bin/pnpm

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
# Copy dependencies with proper ownership
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy files with correct ownership from the start
COPY --chown=node:node apps/api ./apps/api
COPY --chown=node:node packages ./packages
COPY --chown=node:node pnpm-workspace.yaml ./
COPY --chown=node:node .env.dev ./

# Set NODE_PATH to find modules from root
ENV NODE_PATH=/app/node_modules

# Generate Prisma client and build packages as root first to avoid permission issues
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/shared build

# Create a startup script to fix permissions and run as node user
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'chown -R node:node /app/apps/api /app/packages 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'exec su node -c "$*"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

WORKDIR /app/apps/api
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "dev"]

# Development Web stage  
FROM base AS web-dev
# Copy dependencies with proper ownership
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy files with correct ownership from the start
COPY --chown=node:node apps/web ./apps/web
COPY --chown=node:node apps/api ./apps/api
COPY --chown=node:node packages ./packages
COPY --chown=node:node pnpm-workspace.yaml ./
COPY --chown=node:node .env.dev ./

# Set NODE_PATH to find modules from root
ENV NODE_PATH=/app/node_modules

# Generate shared packages that web might depend on as root first
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/ui build

# Create a startup script to fix permissions and run as node user
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'chown -R node:node /app/apps/web /app/packages 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'exec su node -c "$*"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

WORKDIR /app/apps/web
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "dev"]

# Production API stage
FROM node:20-alpine AS api
RUN apk add --no-cache curl openssl openssl-dev ca-certificates
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/packages ./packages
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./package.json

USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/apps/api/src/main.js"]

# Production Web stage  
FROM nginx:alpine AS web
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]