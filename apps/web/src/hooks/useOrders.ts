import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { 
  Order,
  CreateOrderDto,
  PaginatedResponse 
} from '../types/api';

// Order Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...orderKeys.lists(), { page, limit }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderNumber: string) => [...orderKeys.details(), orderNumber] as const,
} as const;

// Get user's orders
export const useOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: orderKeys.list(page, limit),
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      return apiClient.get<PaginatedResponse<Order>>('/orders', { page, limit });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get all orders (Admin only)
export const useAllOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', 'admin', 'list', { page, limit }],
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      return apiClient.get<PaginatedResponse<Order>>('/orders/admin', { page, limit });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single order by order number
export const useOrder = (orderNumber: string | undefined) => {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber || ''),
    queryFn: async (): Promise<Order> => {
      if (!orderNumber) throw new Error('Order number is required');
      return apiClient.get<Order>(`/orders/${orderNumber}`);
    },
    enabled: !!orderNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderDto): Promise<Order> => {
      return apiClient.post<Order>('/orders', orderData);
    },
    onSuccess: () => {
      // Invalidate orders list and cart
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Update order status (Admin only)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderNumber, 
      status 
    }: { 
      orderNumber: string; 
      status: string 
    }) => {
      return apiClient.patch(`/orders/${orderNumber}/status`, { status });
    },
    onSuccess: (_, { orderNumber }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderNumber: string) => {
      return apiClient.post(`/orders/${orderNumber}/cancel`);
    },
    onSuccess: (_, orderNumber) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderNumber) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};
