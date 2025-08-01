import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { 
  Cart,
  AddToCartDto 
} from '../types/api';

// Cart Query Keys
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
} as const;

// Get user's cart
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: async (): Promise<Cart> => {
      return apiClient.get<Cart>('/cart');
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItem: AddToCartDto) => {
      return apiClient.post('/cart/items', cartItem);
    },
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      quantity 
    }: { 
      itemId: string; 
      quantity: number 
    }) => {
      return apiClient.patch(`/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return apiClient.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.delete('/cart');
    },
    onSuccess: () => {
      // Invalidate cart to refetch updated data
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
};
