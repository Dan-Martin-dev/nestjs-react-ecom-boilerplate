# Shared Types & Schemas — Schema-First Implementation Guide

This document was updated to adopt a schema-first approach (Zod-first) and now provides a prescriptive, actionable migration plan, example patterns, tests, CI guidance, and a rollout checklist. The goal: a single source of truth for runtime validation and compile-time types to reduce duplication and drift.

## Purpose

Short summary of intent:

- Make Zod schemas the source-of-truth for domain contracts.
- Derive TypeScript types from Zod schemas (via `z.infer<>`) rather than hand-writing parallel interfaces.
- Ensure consistent exports, schema tests, and integration points for API (NestJS) and frontend (React).

## Small contract (inputs / outputs / success criteria)

- Inputs: existing `packages/shared/src/types/*` interfaces and `packages/shared/src/schemas/*` Zod schemas.
- Outputs: `packages/shared` where each domain has a single Zod schema file, an exported type derived with `z.infer`, complete index exports, and unit tests.
- Success: No duplicated domain shapes left in source control; all endpoints validate inputs with Zod; build & tests pass in CI.

## Why schema-first (concise)

- Single source of truth for validation and types.
- Fewer merge conflicts: only one place to change when a contract evolves.
- Better DX: runtime errors are caught earlier and return consistent messages.

## Practical Patterns & Examples

1. Canonical schema + derived type

```ts
// packages/shared/src/schemas/product.ts
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive('Price must be > 0').max(999999.99),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(10).optional(),
}).refine((d) => (d.price > 100 ? d.description.length >= 50 : true), {
  message: 'Premium products require detailed descriptions (50+ chars)',
  path: ['description'],
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
```

1. Schema index export (single place to import)

```ts
// packages/shared/src/schemas/index.ts
export * from './product';
export * from './user';
export * from './order';
export * from './payment';
export * from './inventory';
export * from './common';
```

1. Use in NestJS controller with a small validation pipe

```ts
// apps/api/src/common/pipes/zod-validation.pipe.ts
import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}
  transform(value: any, _meta: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    return result.data;
  }
}

// usage in controller
// @Post()
// create(@Body(new ZodValidationPipe(CreateProductSchema)) dto: CreateProductDto) {}
```

1. Use in React forms and API client

- Reuse `CreateProductSchema` in forms (zod + react-hook-form) and for optimistic validation before sending requests.
- Use `CreateProductDto` for typed API responses and React Query generics.

## Migration Checklist (apply incrementally)

The checklist below is designed for a repository-wide migration that minimizes breakage.

Phase A — Prepare (low risk)

1. Audit `packages/shared/src/schemas` and `packages/shared/src/types` to identify one-to-one matches.
2. Add missing schema exports to `packages/shared/src/schemas/index.ts` (payment, inventory, common, etc.).
3. Add `schemas/__tests__` with at least one test per schema verifying expected valid and invalid inputs.

Phase B — Convert & Derive (medium risk)

1. For each `*.ts` type interface that duplicates a schema, convert usage to `z.infer<typeof Schema>`.
   - Replace imports of `CreateProductDto` with `z.infer<typeof CreateProductSchema>` or keep a `type CreateProductDto = z.infer<typeof CreateProductSchema>;` exported alongside the schema.
2. Deprecate the hand-written file (leave a TODO/DEPRECATED comment) and remove after one release-cycle.

Phase C — Integrate (higher risk)

1. Replace validation middleware/pipes to use `ZodValidationPipe` shown above.
2. Update API controllers to accept schema-derived types.
3. Update frontend forms to validate using shared schemas.

Phase D — Harden & CI

1. Add schema validation tests to CI (jest/vitest). Fail the build if any schema test fails.
2. Optionally add a lightweight generation step (if you want .d.ts files): use `zod-to-ts` or maintain `z.infer<>`-based exports (recommended: `z.infer`).

Sample commands (run from repo root):

```bash
# run schema tests only
pnpm -w -C packages/shared test

# run full test suite
pnpm -w test
```

## Testing examples

```ts
// packages/shared/src/schemas/__tests__/product.test.ts
import { CreateProductSchema } from '../product';

test('valid product passes validation', () => {
  const data = {
    name: 'T-Shirt',
    description: 'Nice cotton tee',
    price: 19.99,
    categoryId: '00000000-0000-0000-0000-000000000000',
  };
  expect(CreateProductSchema.safeParse(data).success).toBe(true);
});

test('negative price fails', () => {
  const data = { name: 'Bad', description: 'x', price: -1, categoryId: '0000' };
  expect(CreateProductSchema.safeParse(data).success).toBe(false);
});
```

## CI / Lint / Test guidance

- Add a CI step that runs `pnpm -w -C packages/shared test` early in the pipeline.
- Fail CI on schema regressions.
- Consider running a quick `tsc --noEmit` step to ensure derived types compile.

## Export & Package guidance

- Keep all schemas and derived types exported from `packages/shared/src/schemas/index.ts` so apps can import from `@repo/shared/schemas`.
- Keep `packages/shared/src/index.ts` as a thin re-export layer that points to canonical schema exports.

## Rollout and Compatibility

- Roll forward gradually: convert domain-by-domain (products → orders → payments).
- Use backward-compatible export aliases if needed (keep old type imports re-exporting derived types for 1-2 releases).

## Minimal PR checklist

- [ ] Schema file added/updated with tests.
- [ ] Type derived via `z.infer<>` and exported next to schema (or removed if redundant).
- [ ] `packages/shared/src/schemas/index.ts` updated if a new schema is added.
- [ ] `apps/api` controllers updated to use `ZodValidationPipe` where appropriate.
- [ ] CI updated to run shared package tests.

## Next steps (recommended now)

1. Add tests for `payment`, `inventory`, and `common` schemas and update `packages/shared/src/schemas/index.ts` to export them.
2. Convert one low-risk domain (e.g. `product`) fully to schema-first as a pilot.
3. Add CI gate for `packages/shared` test suite and a pre-merge checklist for schema changes.

## Appendix: Quick status snapshot

- This document now describes the schema-first plan and the step-by-step migration checklist.
- Action items (repo edits) are listed above — follow the checklist to apply changes in code.

---

If you'd like, I can now: create the schema test files, add the missing exports to `packages/shared/src/schemas/index.ts`, and/or implement the `ZodValidationPipe` in `apps/api` and open PR-ready edits. Tell me which of those you'd like me to apply next.