Collecting workspace informationHere are the most urgent fixes sorted by priority with exactly where to look and quick remediation steps.

1) Env / Prisma / API startup (highest)
- Problem: API can load the wrong .env (Prisma DATABASE_URL missing) which breaks builds and runtime DB access.
- Why urgent: backend failing prevents auth, migrations, tests and frontend integration.
- Check: `ConfigModule.forRoot` in app.module.ts, your root env files (.env, .env.dev) and Prisma schema/migrations in db.
- Quick fix: ensure repo-root .env is always loaded (use process.cwd() path or set DOTENV_CONFIG_PATH in scripts) and run Prisma generate/migrate.
  - Files: sep_18_hybrid-devops-guide.md, setup_dev.sh

2) TypeScript compile errors around Express / req.user (API build failures)
- Problem: missing Request augmentation causes TS build errors and CI/docker build to fail.
- Why urgent: blocks Docker image builds and CI.
- Check: api-fix-guide.md and app.module.ts.
- Quick fix: add the recommended TypeScript augmentation and minimal decorator. Create express.d.ts and user.decorator.ts (examples below).

4```typescript
// filepath: express.d.ts
// ...existing code...
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Record<string, any> | undefined;
  }
}
4```

4```typescript
// filepath: user.decorator.ts
// ...existing code...
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return data ? req.user?.[data as string] : req.user;
});
4```

3) Docker/pnpm install / node_modules volume issues
- Problem: pnpm inside Docker sometimes fails due to host lock or node_modules named volume conflicts causing unreliable builds.
- Why urgent: reproducible production images and local Docker dev fail.
- Check: Dockerfile, Makefile.
- Quick fix: ensure Dockerfile uses pnpm --frozen-lockfile, avoid mounting host node_modules into container during build, or document removing named volumes before rebuild (see docs/api-fix-guide.md).

4) Frontend ↔ API URL / CORS mismatch
- Problem: VITE_API_URL mismatch or missing -> frontend can't reach API.
- Why urgent: user flows (login, cart) fail even if backend works.
- Check: vite.config.ts (`import.meta.env.VITE_API_URL`), check_connections.sh, and your .env.dev / .env.
- Quick fix: verify .env.dev contains VITE_API_URL and that web dev server uses it; ensure API CORS origins in main.ts include the frontend origin.

5) Health & deployment checks consistency
- Problem: health endpoints, Docker HEALTHCHECKs and deploy scripts expect consistent URLs (/api/v1/health vs /health).
- Why urgent: deployment scripts and health monitors may report false failures.
- Check: `AppController.health` in [apps/api/src/app.controller.ts], Dockerfile healthchecks and deploy_to_hetzner.sh.
- Quick fix: standardize endpoints and update HEALTHCHECKs and deploy scripts to use the same URL (e.g., GET /api/v1/health).

6) Tests & CI (practical)
- Problem: E2E/unit tests assume DB state, may fail if migrations/fixtures are not applied.
- Why urgent: CI failing will block merges.
- Check: app.e2e-spec.ts, vitest.config.ts, and Makefile test targets.
- Quick fix: ensure test DB is reset in CI, run `pnpm --filter @repo/db db:generate` and `pnpm --filter @repo/db db:migrate` before tests.

7) Centralized error notifications & dedupe (UX)
- Problem: duplicate error toasts and session-expired handling suppressed inconsistently.
- Why: lower priority but improves dev/debugging and UX.
- Check: providers.tsx, notify.ts, react-query.ts.
- Quick fix: keep dedupe logic, ensure server error codes are respected in `queryClient` default error handlers.

If you want, I can:
- Apply the two TypeScript helper files above automatically (I already used your recommended minimal implementations).
- Prepare a short PR to add DOTENV_CONFIG_PATH usage to critical scripts (Makefile targets and Docker build steps).
Tell me which of the two (apply TS helpers, or add env-path fixes) to do next and I'll apply the change.

Referenced files & symbols:
- `ConfigModule.forRoot` — app.module.ts
- `AppController.health` — app.controller.ts
- main.ts
- db
- vite.config.ts
- Dockerfile
- Makefile
- check_connections.sh
- setup_dev.sh
- api-fix-guide.md
- sep_18_hybrid-devops-guide.md

If you want I can create the PR with the two files above and a small Makefile/script patch to export DOTENV_CONFIG_PATH — tell me to proceed.