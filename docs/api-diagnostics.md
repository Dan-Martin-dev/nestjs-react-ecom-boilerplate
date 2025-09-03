# API build diagnostics (from `make logs service=api`)

Date: 2025-09-03

This document lists the TypeScript/Prisma/passport errors observed when running `make logs service=api`, explains the likely cause, and provides concrete remediation steps and commands.

## Summary

- Build failed with TypeScript errors related to Prisma types (missing `provider`/`providerId` fields on `User` selections/inputs) and missing passport strategy packages/types.
- Additional runtime issue previously observed: `@prisma/client` needed generation/installation (resolved during local investigation by running `pnpm --filter @repo/db db:generate` and installing `@prisma/client`).

## Errors observed (excerpts)

1) TypeScript / Prisma type errors (multiple locations)

  - Examples from logs:
    - "Object literal may only specify known properties, and 'provider' does not exist in type 'UserWhereInput'" (src/auth/auth.service.ts:195)
    - Similar errors for `UserSelect`, `UserUpdateInput`, `UserCreateInput` and later property access errors (user.provider, user.providerId)

  - Likely cause:
    - The runtime/generated Prisma client does not include `provider` / `providerId` (and related OAuth fields). That means the Prisma schema used to generate the client differs from what the code expects.
    - Either the Prisma schema removed those fields, or the client wasn't regenerated after a schema change.

  - Fixes (choose one):
    - Preferred: Add the OAuth fields to the Prisma `User` model (nullable if not always present) and regenerate the client.
      1. Edit `packages/db/schema.prisma` and ensure the `User` model contains (example):
         ```prisma
         provider String?
         providerId String?
         picture String?
         ```
      2. From repo root run:
         ```bash
         pnpm --filter @repo/db db:generate
         ```
      3. Rebuild API (dev):
         ```bash
         make rebuild-restart-api
         ```
    - Alternative: If you intentionally don't want `provider` fields, update the code to stop using them and avoid writing `password: null` (use an empty string or omit the field) — specifically in `src/auth/auth.service.ts` guard provider usage and adjust create/update calls.

  - Quick temporary workaround (if you need the build immediately):
    - Narrow the Prisma selects to only requested fields (avoid selecting `provider`), or cast results to `any` in the OAuth handler to bypass type checks (short-term only).

2) Missing passport strategy modules/types

  - Examples from logs:
    - "Cannot find module 'passport-facebook' or its corresponding type declarations." (src/auth/strategies/facebook.strategy.ts)
    - Same for `passport-google-oauth20` and `passport-instagram`.

  - Likely cause:
    - The workspace or container image doesn't have the runtime packages installed for these strategies.

  - Fix:
    - Install runtime strategies for the API package and (optionally) install dev types:
      ```bash
      pnpm --filter api add passport passport-facebook passport-google-oauth20 passport-instagram
      pnpm --filter api add -D @types/passport @types/passport-facebook @types/passport-google-oauth20 @types/passport-instagram || true
      ```
    - Rebuild/restart the API container (dev):
      ```bash
      make rebuild-restart-api
      ```
    - If using Docker dev images, you may need to remove the named `node_modules` volume and rebuild (see docs/api-fix-guide.md for volume removal commands).

3) @prisma/client initialization error (investigation notes)

  - Observed while iterating: "@prisma/client did not initialize yet. Please run 'prisma generate' and try to import it again." — this happens when the `@prisma/client` package was installed but the generated client files are not present where Node expects them.

  - Fix:
    - Run Prisma generate for the `@repo/db` package (the repo includes a helper script):
      ```bash
      pnpm --filter @repo/db db:generate
      ```
    - Ensure `@prisma/client` is installed and the `node_modules/.prisma/client` directory exists for the runtime location (installing `@prisma/client` for the `api` package can help):
      ```bash
      pnpm --filter api add @prisma/client
      pnpm --filter @repo/db db:generate
      ```
    - Rebuild API (dev):
      ```bash
      make rebuild-restart-api
      ```

## Recommended end-to-end fix sequence (safe, minimal)

1. From repository root:

```bash
pnpm --filter api add passport passport-facebook passport-google-oauth20 passport-instagram
pnpm --filter api add -D @types/passport @types/passport-facebook @types/passport-google-oauth20 @types/passport-instagram || true
pnpm --filter @repo/db db:generate
pnpm install
make rebuild-restart-api
make logs service=api
```

2. If TypeScript still complains about `provider` fields, update `packages/db/schema.prisma` to include them, then repeat the `db:generate` + rebuild steps.

## Notes and next steps

- I collected the logs with `make logs service=api` and saved the diagnostic here. If you want, I can:
  - Open a PR that adds the Prisma fields and regenerates the client (low-risk if fields should exist).
  - Edit `src/auth/auth.service.ts` to defensively guard against missing fields (short-term type fixes).
  - Automate the rebuild inside the Makefile target if you prefer.

If you want me to apply any of the concrete fixes above now, tell me which option you prefer (add Prisma fields or change code to avoid fields) and I'll implement it and re-run the build/logs.
