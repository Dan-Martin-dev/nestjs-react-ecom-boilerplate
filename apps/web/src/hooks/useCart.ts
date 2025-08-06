import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '../lib/api';
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
    queryFn: (): Promise<Cart> => {
      return apiClient.get<Cart>(API_ENDPOINTS.CART);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItem: AddToCartDto) => {
      return apiClient.post<Cart>(API_ENDPOINTS.CART_ADD, cartItem);
    },
    onSuccess: (updatedCart) => {
      // Update cart in cache
      queryClient.setQueryData(cartKeys.detail(), updatedCart);
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      itemId, 
      quantity 
    }: { 
      itemId: string; 
      quantity: number 
    }) => {
      return apiClient.patch<Cart>(API_ENDPOINTS.CART_UPDATE, { itemId, quantity });
    },
    onSuccess: (updatedCart) => {
      // Update cart in cache
      queryClient.setQueryData(cartKeys.detail(), updatedCart);
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => {
      return apiClient.delete<Cart>(`${API_ENDPOINTS.CART_REMOVE}/${itemId}`);
    },
    onSuccess: (updatedCart) => {
      // Update cart in cache
      queryClient.setQueryData(cartKeys.detail(), updatedCart);
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return apiClient.delete<Cart>(API_ENDPOINTS.CART);
    },
    onSuccess: (updatedCart) => {
      // Update cart in cache
      queryClient.setQueryData(cartKeys.detail(), updatedCart);
    },
  });
};
