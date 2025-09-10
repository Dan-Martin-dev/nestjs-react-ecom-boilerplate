import type { Category } from './category';

// Product types and interfaces
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
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

export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryIds: string[];
  images?: {
    url: string;
    altText?: string;
    isDefault?: boolean;
  }[];
  variants: {
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    attributes?: {
      attributeId: string;
      value: string;
    }[];
  }[];
  metaTitle?: string;
  metaDescription?: string;
}

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
