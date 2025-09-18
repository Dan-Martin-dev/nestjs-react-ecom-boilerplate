# Hybrid DevOps Guide — TurboRepo + Docker (Postgres + Redis)

This guide collects the general health checks and hybrid-specific instructions for the monorepo (apps/api, apps/web, packages/db, packages/shared) using a hybrid development approach: app processes run on the host (turborepo) while Postgres and Redis run in Docker Compose.

## Goals
- Ensure environment loading is deterministic and always uses the repository root `.env`.
- Make Prisma workflows reproducible (validate, migrate, generate, studio).
- Provide fast local dev with `make dev` while keeping DB and cache in Docker.
- Make OAuth redirect URIs and social login predictable and testable.

---

## 1) High-level health check
- Repo layout: `apps/api`, `apps/web`, `packages/db`, `packages/shared`, `docker-compose.dev.yml`, `Makefile`.
- Current issues to monitor:
  - Prisma may complain about missing `DATABASE_URL` if the wrong `.env` is used.
  - ConfigModule may load `.env` relative to `process.cwd()` which can vary by how you start the app.
  - OAuth redirect mismatches (server and Google Console must match exactly).
  - Port collisions (EADDRINUSE) when processes linger.

## 2) Environment & Config

- Prefer repository root `.env` for all dev commands. Example root `.env` values:

```
JWT_SECRET=devjwtsecretkey
DATABASE_URL=postgresql://postgres:postgres@db:5432/monorepo-ecom-dev
VITE_API_URL=http://localhost:3001/api/v1
FRONTEND_URL=http://localhost:3000
```

- Ensure the API explicitly loads the repo root `.env` by updating `apps/api/src/app.module.ts`:

```ts
import path from 'path';
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [path.resolve(process.cwd(), '.env'), path.resolve(__dirname, '../../../.env')],
  expandVariables: true,
});
```

- Scripts and Makefile commands that invoke Prisma must export `DOTENV_CONFIG_PATH` or source the `.env` file.

## 3) Docker Compose (DB + Redis)

- Start DB and Redis using the repository `.env`:

```bash
docker compose -f docker-compose.dev.yml --env-file=.env up -d db redis
```

- If you want to run Prisma Studio on your host, expose Postgres in `docker-compose.dev.yml` (service `db`):

```yaml
services:
  # Hybrid DevOps Guide — TurboRepo + Docker (Postgres + Redis)

  This guide collects the general health checks and hybrid-specific instructions for the monorepo (apps/api, apps/web, packages/db, packages/shared) using a hybrid development approach: app processes run on the host (turborepo) while Postgres and Redis run in Docker Compose.

  ## Goals

  - Ensure environment loading is deterministic and always uses the repository root `.env`.
  - Make Prisma workflows reproducible (validate, migrate, generate, studio).
  - Provide fast local dev with `make dev` while keeping DB and cache in Docker.
  - Make OAuth redirect URIs and social login predictable and testable.

  ---

  ## 1) High-level health check

  - Repo layout: `apps/api`, `apps/web`, `packages/db`, `packages/shared`, `docker-compose.dev.yml`, `Makefile`.

  - Current issues to monitor:
    - Prisma may complain about missing `DATABASE_URL` if the wrong `.env` is used.
    - ConfigModule may load `.env` relative to `process.cwd()` which can vary by how you start the app.
    - OAuth redirect mismatches (server and Google Console must match exactly).
    - Port collisions (EADDRINUSE) when processes linger.

  ## 2) Environment & Config

  - Prefer repository root `.env` for all dev commands. Example root `.env` values:

  ```env
  JWT_SECRET=devjwtsecretkey
  DATABASE_URL=postgresql://postgres:postgres@db:5432/monorepo-ecom-dev
  VITE_API_URL=http://localhost:3001/api/v1
  FRONTEND_URL=http://localhost:3000
  ```

  - Ensure the API explicitly loads the repo root `.env` by updating `apps/api/src/app.module.ts`:

  ```ts
  import path from 'path';
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [path.resolve(process.cwd(), '.env'), path.resolve(__dirname, '../../../.env')],
    expandVariables: true,
  });
  ```

  - Scripts and Makefile commands that invoke Prisma must export `DOTENV_CONFIG_PATH` or source the `.env` file.

  ## 3) Docker Compose (DB + Redis)

  - Start DB and Redis using the repository `.env`:

  ```bash
  docker compose -f docker-compose.dev.yml --env-file=.env up -d db redis
  ```

  - If you want to run Prisma Studio on your host, expose Postgres in `docker-compose.dev.yml` (service `db`):

  ```yaml
  services:
    db:
      image: postgres:15
      ports:
        - "5432:5432"
      # ...existing config
  ```

  Restart db after editing compose file.

  ## 4) Prisma: validate / migrate / generate / studio

  - Validate schema (ensures `DATABASE_URL` visible):

  ```bash
  cd packages/db
  DOTENV_CONFIG_PATH=../../.env pnpm prisma validate --schema=./schema.prisma
  ```

  - Deploy migrations and generate client:

  ```bash
  DOTENV_CONFIG_PATH=../../.env pnpm prisma migrate deploy --schema=./schema.prisma
  DOTENV_CONFIG_PATH=../../.env pnpm prisma generate --schema=./schema.prisma
  ```

  - Run Prisma Studio (host, if port exposed):

  ```bash
  cd packages/db
  DOTENV_CONFIG_PATH=../../.env pnpm prisma studio --schema=./schema.prisma
  ```

  - Run Prisma Studio inside a container (no port expose):

  ```bash
  NETWORK=$$(docker compose -f docker-compose.dev.yml ps -q db | xargs docker inspect -f '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' | head -n1)
  docker run --rm -it -v "$$PWD/packages/db":/app -w /app --network "$$NETWORK" node:18-bullseye-slim \
    /bin/sh -c "npm i -g pnpm >/dev/null && pnpm install --silent && DOTENV_CONFIG_PATH=../../.env pnpm prisma studio --schema=./schema.prisma"
  ```

  ## 5) OAuth (Google) — quick verification

  - Make sure `.env` has the real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - Verify what redirect URI your running server sends:

  ```bash
  # ensure API running
  curl -I "http://localhost:3001/api/v1/auth/google" | sed -n '1,20p'
  ```

  - Add the exact, decoded `redirect_uri` value to Google Cloud Console -> OAuth 2.0 Client -> Authorized redirect URIs.

  ## 6) Port collisions and process management

  - Free port 3001 if occupied:

  ```bash
  sudo lsof -ti:3001 | xargs -r kill -15
  ```

  - For local dev watchers (turborepo), prefer `make dev` which runs processes on host and avoids docker port surprises.


  ## 7) Makefile conveniences (recommended edits)

  - `Makefile` should:
    - start db + redis before running lazydocker or web dev targets
    - export `DOTENV_CONFIG_PATH=.env` for Prisma commands
    - include `rebuild-dev` to rebuild shared packages and regenerate Prisma client

  Example `docker-ui` tweak:

  ```makefile
  docker-ui:
      $(COMPOSE_DEV) up -d db redis
      lazydocker
  ```

  ## 8) Dev workflow recommendations

  - Typical dev start (hybrid):

  ```bash
  # from repo root
  make dev
  ```

  - When to run `make rebuild-dev`:
    - after changing package.json or workspace deps
    - after modifying packages/shared or packages/ui
    - after modifying Prisma schema

  ## 9) Quick troubleshooting checklist

  - If Prisma P1012: verify `DOTENV_CONFIG_PATH` in scripts or prefix your prisma command with `DOTENV_CONFIG_PATH=../../.env`.
  - If OAuth redirect mismatch: run the curl above and add the decoded redirect_uri to Google Console.
  - If server fails with JwtStrategy secret missing: confirm `JWT_SECRET` exists in the used `.env` and restart the API.

  ---

  ## Appendix: Useful commands

  - Start DB + Redis (compose):
  ```bash
  docker compose -f docker-compose.dev.yml --env-file=.env up -d db redis
  ```

  - Generate Prisma client:
  ```bash
  cd packages/db && DOTENV_CONFIG_PATH=../../.env pnpm db:generate
  ```

  - Build and run API locally (after build):
  ```bash
  pnpm --filter api build
  NODE_ENV=development node apps/api/dist/apps/api/src/main.js
  ```

  ---

  If you want, I can:
  - patch `docs/sep_17_db_generalcheck.md` or replace it with this new guide,
  - make the `Makefile` edits (docker-ui, export DOTENV_CONFIG_PATH in db targets), or
  - run the DB expose + Prisma Studio flow now.
