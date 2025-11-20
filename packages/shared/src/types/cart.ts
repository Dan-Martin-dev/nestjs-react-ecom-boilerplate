import { ProductVariant } from './product';

// Cart types and interfaces
export interface CartItem {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  priceAtAddition: string;
  productVariant: ProductVariant & {
    product: {
      id: string;
      name: string;
      slug: string;
      images?: { id: string; url: string; isDefault: boolean; }[];
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// DTOs now come from schemas/cart.ts (schema-first approach)
