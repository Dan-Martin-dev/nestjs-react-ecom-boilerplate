# API build failures — quick fix guide

This file collects the fast, minimal, and safe fixes to resolve the current API build errors shown in the dev logs (TypeScript compile failures). Follow these steps from the repository root.

Summary of the runtime errors
- TS2307: Cannot find module 'passport-*' (missing runtime deps in `apps/api`).
- TS2339: `Property 'user' does not exist on type 'Request'` (Express/Request typing).
- TS2353 / TS2322: Prisma types mismatch — code references `provider`, `providerId`, `picture` and sets `password = null` while generated Prisma types disagree.

Goal
- Make the API buildable in dev by installing missing runtime deps, adding a minimal TypeScript augmentation for `req.user`, and making Prisma types consistent with code (or vice-versa). Then regenerate Prisma client and rebuild the `api` container.

Checklist (commands to run)

1) Install runtime passport strategies (run from repo root):

```bash
pnpm --filter ./apps/api add passport passport-facebook passport-google-oauth20 passport-instagram
```

2) (Optional) Install dev @types where available (best-effort):

```bash
pnpm --filter ./apps/api add -D @types/passport @types/passport-facebook @types/passport-google-oauth20 @types/passport-instagram || true
```

3) Add a minimal TypeScript augmentation so code that reads `req.user` compiles.
Create `apps/api/src/types/express.d.ts` with the following content:

```ts
// apps/api/src/types/express.d.ts
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Record<string, any> | undefined;
  }
}

```

Notes: put this under `src/` so the `apps/api/tsconfig.json` picks it up automatically (the monorepo `tsconfig.json` usually includes `src/**/*.ts`).

4) Add a small Nest param decorator (idiomatic) and migrate controllers to use it instead of `@Req()` where convenient.
Create `apps/api/src/common/decorators/user.decorator.ts`:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  return data ? user?.[data] : user;
});
```

Then update controllers which use `@Req() req` solely to access `req.user` (examples: `auth.controller.ts`, `addresses.controller.ts`, `users.controller.ts`, etc.) to instead accept `@User()` or `@User('sub')`.

5) Reconcile Prisma schema vs code

- Preferred: if you expect OAuth fields on `User`, make them optional in your Prisma schema (it already is in this repo: `provider String?`, `providerId String?`, `picture String?`, `password String?`). Then regenerate the client. From repo root run:

```bash
make db-generate
```

- Alternative: if you intentionally don't want provider fields, update `src/auth/auth.service.ts` to avoid using `provider`, `providerId`, `picture` or to guard them conditionally. Also avoid writing `password: null` unless `password` is nullable in the schema — set `password: ''` or omit the field.

6) Rebuild and restart the api service (dev):

```bash
make rebuild-restart-api
```

7) Stream logs and verify:

```bash
make logs service=api
```

Troubleshooting tips
- If Docker build stalls or fails during `pnpm install` inside the container because of an existing `node_modules` named volume, stop the running containers and remove the web/api node_modules volumes, then rebuild. Example:

```bash
docker compose -f docker-compose.dev.yml down
docker volume ls | grep nestjs-reactjs-ecom-boilerplate
docker volume rm <volume_name_for_apps_api_node_modules>
make rebuild-restart-api
```

- If the `pnpm install` step inside Docker fails repeatedly due to host lock/permissions, prefer installing workspace deps locally (outside Docker) from repo root with `pnpm install` then rebuild.

Verification
- After `make rebuild-restart-api` you should see Nest build output and eventually a log line like `Nest application successfully started` and no TypeScript compile errors. If errors persist, capture the top 40 lines from `make logs service=api` and inspect the first TypeScript errors — typically they are the root cause.

Minimal code changes to make now (safe, low-risk)
- Add `apps/api/src/types/express.d.ts` (non-invasive)
- Add `apps/api/src/common/decorators/user.decorator.ts` (helps migration)
- Install runtime passport packages into `apps/api` (resolves missing imports)
- Run `make db-generate` if you changed schema or to ensure Prisma client matches schema

If you want I can apply the minimal code files (`express.d.ts` + `user.decorator.ts`) and run the pnpm + make commands for you now — tell me to proceed and I'll run them from the repo root and paste the resulting top logs.

Done.
