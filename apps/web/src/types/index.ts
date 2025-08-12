// Re-export types from shared package for frontend use
// This file acts as an adapter between the shared types and any frontend-specific extensions
import * as SharedTypes from '@repo/shared';

// Re-export all shared types
export * from '@repo/shared';

// Frontend-specific types that extend shared types
export interface ClientCartItem extends SharedTypes.CartItem {
  // Add any client-side properties needed for UI
  imageUrl?: string; // Computed property for easier UI access
}

export interface ClientCart extends SharedTypes.Cart {
  // Add any client-side properties
  itemCount: number; // Computed property for UI
  subTotal: number; // Computed total before tax/shipping
  total: number;    // Final total with tax
}

// Type for client-side cart store
export interface CartStore {
  items: ClientCartItem[];
  isLoading: boolean;
  addItem: (item: SharedTypes.AddToCartDto) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

// Type for auth store
export interface AuthStore {
  user: SharedTypes.User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (userData: SharedTypes.User, token: string) => void;
  logout: () => void;
}
