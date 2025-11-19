# Schema-First Migration Guide

## Overview

This guide demonstrates how to use the updated schema-first approach in your controllers, services, and frontend code.

## Changes Summary

✅ **Completed:**
- Added all missing schema exports to `packages/shared/src/schemas/index.ts`
- Created comprehensive unit tests for all schemas in `packages/shared/src/schemas/__tests__/`
- Enhanced all schemas with:
  - Better validation rules and business logic
  - User-friendly error messages
  - Proper type exports using `z.infer<>`
- Removed duplicate type definitions in favor of schema-derived types
- ZodValidationPipe already implemented in `apps/api/src/common/pipes/`

## Using Schemas in API Controllers (NestJS)

### Example 1: Product Controller

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateProductSchema, ProductSchema } from '@repo/shared/schemas';

@Controller('products')
export class ProductsController {
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateProductSchema)) dto: ProductSchema
  ) {
    // dto is fully validated and typed
    return this.productsService.create(dto);
  }
}
```

### Example 2: Auth Controller

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoginSchema, LoginDto, RegisterSchema, RegisterDto } from '@repo/shared/schemas';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto
  ) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto
  ) {
    // Password strength validation happens automatically
    return this.authService.register(dto);
  }
}
```

### Example 3: Order Controller with Complex Validation

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateOrderSchema, CreateOrderDto } from '@repo/shared/schemas';

@Controller('orders')
export class OrdersController {
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateOrderSchema)) dto: CreateOrderDto
  ) {
    // Validation ensures:
    // - At least one item in the order
    // - Valid shipping address with all required fields
    // - Proper quantity and price validation
    return this.ordersService.create(dto);
  }
}
```

## Using Schemas in Frontend (React)

### Example 1: Product Form with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProductSchema, ProductSchema } from '@repo/shared/schemas';

export function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductSchema>({
    resolver: zodResolver(CreateProductSchema),
  });

  const onSubmit = async (data: ProductSchema) => {
    // Data is validated client-side before submission
    await api.post('/products', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input type="number" {...register('price', { valueAsNumber: true })} />
      {errors.price && <span>{errors.price.message}</span>}
      
      <button type="submit">Create Product</button>
    </form>
  );
}
```

### Example 2: Login Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginDto } from '@repo/shared/schemas';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="email" {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Example 3: Manual Validation

```tsx
import { CreateProductSchema } from '@repo/shared/schemas';

function validateProduct(data: unknown) {
  const result = CreateProductSchema.safeParse(data);
  
  if (!result.success) {
    console.error('Validation errors:', result.error.issues);
    return null;
  }
  
  return result.data; // Fully typed and validated
}
```

## Enhanced Validation Features

### 1. Business Rules

The schemas now include business logic validation:

```typescript
// Products: Premium products require detailed descriptions
CreateProductSchema // validates that products > $100 have 50+ char descriptions

// Reviews: Low ratings require explanations
CreateReviewSchema // validates that 1-2 star ratings have a review body

// Discounts: Date and value validation
CreateDiscountSchema // ensures end date > start date, PERCENT discounts ≤ 100%
```

### 2. Better Error Messages

```typescript
// Old error: "Invalid"
// New error: "Product name is required"

// Old error: "Expected number, received string"
// New error: "Price must be positive"

// Old error: "Invalid type"
// New error: "Password must contain at least one uppercase letter"
```

### 3. Field Constraints

All schemas now include realistic constraints:

```typescript
CreateProductSchema
  - name: 1-100 characters
  - description: 10-2000 characters (optional)
  - price: > 0, max 999,999.99
  - images: 1-10 images (optional)
  - variants: minimum 1 variant required

RegisterSchema
  - email: valid email format, max 255 chars
  - password: 8-100 chars, must include uppercase, lowercase, and number
  - name: 2-100 characters (optional)
```

## Migration Checklist for Existing Code

### Backend (API)

- [ ] Replace duplicate DTO interfaces with schema imports
- [ ] Use `ZodValidationPipe` in controllers instead of class-validator
- [ ] Update service method signatures to use schema-derived types
- [ ] Remove old validation decorators from DTO files

### Frontend (Web)

- [ ] Install `@hookform/resolvers` if not already installed
- [ ] Update form validation to use `zodResolver`
- [ ] Replace manual validation with schema `.safeParse()`
- [ ] Update TypeScript imports to use schema-derived types

## Testing the Migration

### Run Schema Tests

```bash
# From repo root
cd packages/shared
pnpm install # Install vitest if needed
pnpm test

# Run with coverage
pnpm test --coverage
```

### Check Type Compilation

```bash
# From repo root
pnpm -w build
```

### Run Full Test Suite

```bash
# From repo root
pnpm -w test
```

## Next Steps

1. **Install vitest** in the shared package:
   ```bash
   cd packages/shared
   pnpm add -D vitest
   ```

2. **Run the schema tests** to ensure all validation works:
   ```bash
   pnpm test
   ```

3. **Update one controller** as a pilot (e.g., products or auth)

4. **Test the updated controller** to ensure validation works

5. **Gradually migrate** remaining controllers domain-by-domain

## Common Patterns

### Pattern 1: Optional Update DTOs

```typescript
// Use .partial() for optional update schemas
export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
```

### Pattern 2: Schema Composition

```typescript
// Reuse common schemas
export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema),
  shippingAddress: ShippingAddressSchema,
  billingAddress: ShippingAddressSchema.optional(),
});
```

### Pattern 3: Custom Error Messages

```typescript
export const EmailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email address is too long');
```

## Troubleshooting

### Issue: Circular Dependencies

**Solution:** Keep entity types (database models) in `types/` and validation schemas in `schemas/`.

### Issue: Import Not Found

**Solution:** Ensure you're importing from `@repo/shared/schemas` not `@repo/shared/types`.

### Issue: Type Mismatch

**Solution:** Use the schema-derived type: `z.infer<typeof Schema>` instead of the old interface.

## Resources

- [Zod Documentation](https://zod.dev/)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [NestJS Pipes](https://docs.nestjs.com/pipes)
- [Schema-First Design Patterns](../docs/shared-types-schemas-analysis.md)
