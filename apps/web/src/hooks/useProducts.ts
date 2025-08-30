import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
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
    queryFn: async () => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      
      const endpoint = `/products?${params.toString()}`
      return apiClient.get<PaginatedResponse<Product>>(endpoint)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => apiClient.get<Product>(`/products/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Search products
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => {
      const params = new URLSearchParams({ q: query })
      return apiClient.get<PaginatedResponse<Product>>(`/products/search?${params.toString()}`)
    },
    enabled: query.length > 2, // Only search if query is longer than 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create product (admin only)
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productData: CreateProductDto) => 
      apiClient.post<Product>('/products', productData),
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

// Update product (admin only)
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDto> }) =>
      apiClient.put<Product>(`/products/${id}`, data),
    onSuccess: (data) => {
      // Update the specific product in cache
      queryClient.setQueryData(productKeys.detail(data.id), data)
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Delete product (admin only)
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
