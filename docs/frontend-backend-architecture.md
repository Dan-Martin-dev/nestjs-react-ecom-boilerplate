# Frontend & Backend Architecture Overview

This document explains how the frontend (React, in the `web` folder) and backend (NestJS, in the `api` folder) work together in your monorepo, and how they are structured for development and production.

---

## 1. Project Structure

```
apps/
  api/   # NestJS backend (REST API)
  web/   # React frontend (Vite)
packages/
  db/    # Prisma schema and DB utilities
  shared/# Shared TypeScript types and utilities
  ui/    # Shared UI components
```

---

## 2. Frontend (`apps/web`)

- **Framework:** React 19, Vite, TypeScript
- **Purpose:** Provides the user interface for the e-commerce app.
- **API Communication:** Uses REST API calls (usually via `fetch` or Axios) to the backend at `/api/v1/*` endpoints.
- **Environment Variables:**
  - `VITE_API_URL` is set to the backend API base URL (e.g., `http://localhost:3001/api/v1` in dev).
- **Development:**
  - Hot-reloading via Vite dev server (`pnpm dev` or Docker Compose `web` service).
  - Consumes types and UI components from `packages/shared` and `packages/ui`.
- **Production:**
  - Built static files are served by a production web server (e.g., Nginx or via Docker).

---

## 3. Backend (`apps/api`)

- **Framework:** NestJS (TypeScript)
- **Purpose:** Provides REST API endpoints for frontend and other clients.
- **API Prefix:** All endpoints are under `/api/v1/` (e.g., `/api/v1/products`).
- **Database:**
  - Uses PostgreSQL via Prisma ORM (`packages/db/schema.prisma`).
  - Prisma client is generated and used in NestJS services.
- **Environment Variables:**
  - `DATABASE_URL` for Postgres connection
  - `REDIS_URL` for Redis cache
- **Development:**
  - Hot-reloading via `pnpm dev` or Docker Compose `api` service.
  - Shares types with frontend via `packages/shared`.
- **Production:**
  - Runs as a compiled Node.js app, typically behind a reverse proxy (Traefik/Nginx).

---

## 4. How They Work Together

- **API Requests:**
  - The frontend makes HTTP requests to the backend API (e.g., `GET /api/v1/products`).
  - In development, CORS is enabled so the frontend (localhost:3000) can talk to the backend (localhost:3001).
- **Shared Types:**
  - Both frontend and backend import TypeScript types from `packages/shared` for type safety and consistency.
- **Authentication:**
  - The frontend handles login/signup via API endpoints (e.g., `/api/v1/auth/login`).
  - JWT tokens or cookies are used for session management.
- **State Management:**
  - The frontend manages UI state (e.g., cart, user) and syncs with backend as needed.
- **Error Handling:**
  - API errors are caught in the frontend and displayed to the user.

---

## 5. Development Workflow

1. **Start Docker Compose:**
   - `docker compose -f docker-compose.dev.yml up -d` (or `make up-dev`)
2. **Frontend:**
   - Runs on [http://localhost:3000](http://localhost:3000)
3. **Backend:**
   - Runs on [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)
4. **Database:**
   - PostgreSQL runs in a container, Prisma Studio can be opened with `make db-studio`.
5. **Hot Reloading:**
   - Both frontend and backend support hot reload for rapid development.

---

## 6. Production Workflow

- Both apps are built and run in Docker containers.
- Traefik or Nginx is used as a reverse proxy for SSL and routing.
- Environment variables are set via `.env.production`.

---

## 7. Useful Commands

- **Frontend:**
  - `pnpm dev` (in `apps/web`): Start Vite dev server
  - `pnpm build` (in `apps/web`): Build production static files
- **Backend:**
  - `pnpm dev` (in `apps/api`): Start NestJS in watch mode
  - `pnpm build` (in `apps/api`): Build production API
- **Database:**
  - `make db-generate`: Generate Prisma client
  - `make db-migrate`: Run migrations
  - `make db-studio`: Open Prisma Studio

---

## 8. References
- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Turborepo Docs](https://turbo.build/repo)

---

This document should help you and your team understand how the frontend and backend interact, and how to work with both in development and production.
