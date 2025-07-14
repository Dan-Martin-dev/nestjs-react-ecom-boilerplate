FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

# Copy package.json files for all apps and packages
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm --filter @repo/db db:generate

# Build stage for API
FROM base AS api
WORKDIR /app
RUN pnpm --filter api build
EXPOSE 3001
CMD ["pnpm", "--filter", "api", "start:prod"]

# Build stage for Web
FROM base AS web
WORKDIR /app
RUN pnpm --filter web build
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "preview"]
