import { useQuery } from '@tanstack/react-query';
import { APP_CONFIG } from '../../../config';
import type { Product as SharedProduct } from '@repo/shared';
import { mapSharedProductToUi } from '../utils/productMapper';

async function fetchBestsellers(limit: number = 10): Promise<SharedProduct[]> {
  const response = await fetch(`${APP_CONFIG.api.baseUrl}/products/bestsellers?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bestsellers');
  }
  return response.json();
}

export function useBestsellers(limit: number = 10) {
  return useQuery({
    queryKey: ['bestsellers', limit],
    queryFn: () => fetchBestsellers(limit),
    select: (data) => data.map(mapSharedProductToUi),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });
}
