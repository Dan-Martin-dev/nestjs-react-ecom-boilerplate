// Type integration utility for API
// Import shared schemas directly from packages/shared
import { CreateProductSchema, CreateCategorySchema } from '@repo/shared';
import type { ProductSchema as ProductSchemaType } from '@repo/shared';
import type { CategorySchema as CategorySchemaType } from '@repo/shared';

// Re-export schemas from the shared package
export { CreateProductSchema, CreateCategorySchema };

// Re-export the types for convenience
export type CreateProductDto = ProductSchemaType;
export type CreateCategoryDto = CategorySchemaType;
