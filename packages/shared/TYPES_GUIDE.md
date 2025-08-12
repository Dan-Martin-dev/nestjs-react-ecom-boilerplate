# Single Source of Truth for Types in Your Monorepo

## Overview

I've restructured your project to establish a single source of truth for types across your frontend and backend applications. This will improve type consistency, reduce duplication, and make maintenance easier.

## Key Changes

1. **Created a Comprehensive Type System in `@repo/shared` Package**
   - All shared types are now defined in `/packages/shared/src/types/`
   - Types are organized by domain (user, product, order, etc.)
   - Common utility types and functions in `common.ts`

2. **Updated Package Dependencies**
   - Added `@repo/shared` as a dependency in both frontend and backend applications

3. **Type Organization by Domain**
   - `user.ts` - User and authentication types
   - `product.ts` - Product and variant types
   - `category.ts` - Category types
   - `cart.ts` - Cart and cart item types
   - `order.ts` - Order, payment, and order status types
   - `address.ts` - Address types
   - `review.ts` - Review types
   - `discount.ts` - Discount types
   - `common.ts` - Common utility types and API response formats

## Best Practices for Using Shared Types

### In Backend (NestJS)

```typescript
// Example of using shared types in a NestJS service
import * as SharedTypes from '@repo/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async findAll(): Promise<SharedTypes.PaginatedResponse<SharedTypes.Product>> {
    // Implementation...
  }
}
```

### In Frontend (React)

```typescript
// Example of using shared types in React components
import { Product } from '@repo/shared';
import { useState } from 'react';

function ProductComponent() {
  const [product, setProduct] = useState<Product | null>(null);
  // Component implementation...
}
```

## Type Validation with Zod

For backend validation, I've created a pattern that uses Zod to validate incoming data while ensuring compatibility with shared types:

```typescript
import { z } from 'zod';
import * as SharedTypes from '@repo/shared';

// Define schema
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  // ...other fields
});

// Extract type from schema
export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// Compatibility check (this will cause TypeScript error if types don't match)
const _typeCheck: SharedTypes.CreateProductDto = {} as CreateProductDto;
```

## Remaining Issues

1. **Permission Issues with Build**: 
   - When building the shared package, we encountered permission issues. 
   - You may need to fix the permissions on the `/packages/shared/dist` directory.

2. **Update Import Paths**: 
   - Throughout your codebase, imports from local type files should be updated to import from `@repo/shared` instead.

## Recommendations for Moving Forward

1. **Always Define New Types in the Shared Package First**:
   - When adding new features, define types in the shared package before implementing in frontend or backend.

2. **Regular Type Audits**:
   - Periodically review types to ensure they're accurate and consistent.

3. **Use TypeScript's Advanced Features**:
   - Consider using readonly properties for immutable data
   - Use discriminated unions for state management
   - Leverage utility types like Pick, Omit, and Partial

4. **Update Database Types When Schema Changes**:
   - Keep shared types in sync with your database schema
   - Consider automating this with a schema-to-type generation tool

By following these practices, your monorepo will maintain type consistency across the stack, reducing bugs and improving developer experience.
