# Shared Package

This package contains shared types, utilities, and constants used across both the frontend and backend applications in the monorepo.

## Usage

### Installation

This package is automatically available to all other packages in the monorepo. To use it, add it as a dependency in your package.json:

```json
"dependencies": {
  "@repo/shared": "workspace:*"
}
```

### Importing Types

```typescript
// Import all shared types
import * as SharedTypes from '@repo/shared';

// Or import specific types
import { User, Product, ApiResponse } from '@repo/shared';
```

### Using Shared Types with Zod Validation (Backend)

```typescript
import { z } from 'zod';
import * as SharedTypes from '@repo/shared';

// Create a Zod schema
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  // ...other fields
});

// Infer the type from the schema
export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// Type check to ensure compatibility with shared types
// This will cause a TypeScript error if the schemas don't match
const _typeCheck: SharedTypes.CreateProductDto = {} as CreateProductDto;
```

### Using Shared Types in React Components (Frontend)

```typescript
import { Product } from '@repo/shared';
import { useState } from 'react';

function ProductComponent() {
  const [product, setProduct] = useState<Product | null>(null);
  
  // Now you can use the product type
  return (
    <div>
      {product?.name}
    </div>
  );
}
```

## Structure

- `/src/types/` - Contains all shared type definitions
  - `common.ts` - Common types used across the application
  - `user.ts` - User-related types
  - `product.ts` - Product-related types
  - etc.

## Adding New Types

When adding new types, follow these guidelines:

1. Group related types in appropriate files
2. Export all types from the index file
3. Keep types consistent between frontend and backend
4. Use TypeScript's strict mode features (readonly, etc.) when appropriate
5. Add documentation comments for complex types

## Building

Build this package with:

```bash
pnpm build
```

This will generate TypeScript declaration files in the `dist` directory.
