import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { 
  Review,
  CreateReviewDto,
  PaginatedResponse 
} from '../types/api';

// Review Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  productReviews: (productId: string, page: number, limit: number) => 
    [...reviewKeys.all, 'product', productId, { page, limit }] as const,
  userReviews: (page: number, limit: number) => 
    [...reviewKeys.all, 'user', { page, limit }] as const,
} as const;

// Get reviews for a product
export const useProductReviews = (
  productId: string | undefined, 
  page: number = 1, 
  limit: number = 10
) => {
  return useQuery({
    queryKey: reviewKeys.productReviews(productId || '', page, limit),
    queryFn: async (): Promise<PaginatedResponse<Review>> => {
      if (!productId) throw new Error('Product ID is required');
      return apiClient.get<PaginatedResponse<Review>>(
        `/reviews/product/${productId}`, 
        { page, limit }
      );
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user's reviews
export const useUserReviews = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: reviewKeys.userReviews(page, limit),
    queryFn: async (): Promise<PaginatedResponse<Review>> => {
      return apiClient.get<PaginatedResponse<Review>>('/reviews/user', { page, limit });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewDto): Promise<Review> => {
      return apiClient.post<Review>('/reviews', reviewData);
    },
    onSuccess: (data) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'product', data.productId] 
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'user'] 
      });
    },
  });
};

// Update review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateReviewDto> 
    }): Promise<Review> => {
      return apiClient.patch<Review>(`/reviews/${id}`, data);
    },
    onSuccess: (data) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'product', data.productId] 
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'user'] 
      });
    },
  });
};

// Delete review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Review> => {
      return apiClient.delete<Review>(`/reviews/${id}`);
    },
    onSuccess: (data) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'product', data.productId] 
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'user'] 
      });
    },
  });
};
