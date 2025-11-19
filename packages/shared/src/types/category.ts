// SCHEMA-FIRST MIGRATION:
// CreateCategoryDto is now derived from CreateCategorySchema in ../schemas/category.ts
// Import from schemas for validation-backed types

// Category types and interfaces
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    Product: number;
  };
}

// DEPRECATED: Use CategorySchema from @repo/shared/schemas instead
// Re-export for backward compatibility during migration
export type { CategorySchema as CreateCategoryDto } from '../schemas/category';
