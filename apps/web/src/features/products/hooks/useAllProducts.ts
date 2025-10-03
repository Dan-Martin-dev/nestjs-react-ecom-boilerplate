import { useQuery } from '@tanstack/react-query';
import { APP_CONFIG } from '../../../config';
import type { Product as SharedProduct } from '@repo/shared';

async function fetchAllProducts(limit: number = 20): Promise<SharedProduct[]> {
  const response = await fetch(`${APP_CONFIG.api.baseUrl}/products?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.data || data; // Handle both paginated and direct responses
}

export function useAllProducts(limit: number = 20) {
  return useQuery({
    queryKey: ['all-products', limit],
    queryFn: () => fetchAllProducts(limit),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });
}
