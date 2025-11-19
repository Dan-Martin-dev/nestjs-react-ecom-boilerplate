import type { Category } from './category';
import { ProductImage } from '../schemas/product';

// SCHEMA-FIRST MIGRATION:
// CreateProductDto is now derived from CreateProductSchema in ../schemas/product.ts
// Import it from schemas instead of this file for validation-backed types
// This file retains database-returned entity types that don't need validation

// Product types and interfaces

export interface ProductVariant {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stockQuantity: number;
  ProductVariantAttribute?: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
  id: string;
  attributeId: string;
  value: string;
  attribute: Attribute;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: any[]; // Will be replaced with proper Review[] type after circular dependency is resolved
  _count?: {
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

// DEPRECATED: Use ProductSchema from @repo/shared/schemas instead
// Re-export for backward compatibility during migration
export type { ProductSchema as CreateProductDto } from '../schemas/product';

export interface ProductFilterDto {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
