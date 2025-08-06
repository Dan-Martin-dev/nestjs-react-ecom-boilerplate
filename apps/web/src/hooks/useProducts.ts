import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, API_ENDPOINTS } from '../lib/api'
import { type Product, type ProductFilterDto, type PaginatedResponse, type CreateProductDto } from '../types/api'

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilterDto) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
}

// Get products with filters
export function useProducts(filters: ProductFilterDto = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS, 
      filters as Record<string, string | number | boolean | undefined>
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single product by ID
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiClient.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id)),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Search products
export function useProductSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => apiClient.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCT_SEARCH, { q: query }),
    enabled: enabled && query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create product (admin only)
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productData: CreateProductDto) => 
      apiClient.post<Product>(API_ENDPOINTS.PRODUCTS, productData),
    onSuccess: (newProduct) => {
      // Add the new product to the cache
      queryClient.setQueryData(productKeys.detail(newProduct.id), newProduct)
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Update product (admin only)
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDto> }) =>
      apiClient.patch<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id), data),
    onSuccess: (updatedProduct) => {
      // Update the specific product in cache
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), updatedProduct)
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Delete product (admin only)
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id)),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) })
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
