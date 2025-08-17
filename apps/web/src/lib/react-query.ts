import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { ApiClientError } from './api'
import type { Cart, CartItem } from '@repo/shared'

// Query client configuration
const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache time: Keep unused data for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry configuration
        retry: (failureCount, error) => {
          // Don't retry on client errors (4xx) except for network issues
          if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
            return false
          }
          // Retry up to 3 times for server errors
          return failureCount < 3
        },
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus only if data is stale
        refetchOnWindowFocus: 'always',
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Network mode
        networkMode: 'online',
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show error notifications for background queries
        // Interactive queries will handle their own errors
        if (query.meta?.errorNotification !== false) {
          handleQueryError(error)
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Show error notifications for mutations unless explicitly disabled
        if (mutation.meta?.errorNotification !== false) {
          handleMutationError(error)
        }
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        // Show success notifications for mutations if configured
        if (mutation.meta?.successNotification) {
          const config = mutation.meta.successNotification
          notifications.show({
            title: 'Success',
            message: typeof config === 'string' ? config : (config as { message: string }).message,
            color: 'green',
          })
        }
      },
    }),
  })
}

// Error handlers
const handleQueryError = (error: unknown): void => {
  let message = 'An unexpected error occurred'

  if (error instanceof ApiClientError) {
    // Don't show notifications for auth errors (handled by API client)
    if (error.status === 401) return
    
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  }

  notifications.show({
    title: 'Error',
    message,
    color: 'red',
  })
}

const handleMutationError = (error: unknown): void => {
  let message = 'Operation failed'

  if (error instanceof ApiClientError) {
    // Don't show notifications for validation errors (handled by forms)
    if (error.status === 422) return
    // Don't show notifications for auth errors (handled by API client)
    if (error.status === 401) return
    
    message = error.message
  } else if (error instanceof Error) {
    message = error.message
  }

  notifications.show({
    title: 'Error',
    message,
    color: 'red',
  })
}

// Create the global query client
export const queryClient = createQueryClient()

// Query key factories for consistent cache keys
export const queryKeys = {
  // Auth
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  
  // Products
  products: {
    all: () => ['products'] as const,
    lists: () => [...queryKeys.products.all(), 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    search: (query: string, filters?: Record<string, unknown>) => 
      [...queryKeys.products.all(), 'search', query, filters] as const,
  },
  
  // Categories
  categories: {
    all: () => ['categories'] as const,
    lists: () => [...queryKeys.categories.all(), 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  
  // Cart
  cart: {
    all: () => ['cart'] as const,
    current: () => [...queryKeys.cart.all(), 'current'] as const,
  },
  
  // Orders
  orders: {
    all: () => ['orders'] as const,
    lists: () => [...queryKeys.orders.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  
  // Reviews
  reviews: {
    all: () => ['reviews'] as const,
    byProduct: (productId: string) => [...queryKeys.reviews.all(), 'product', productId] as const,
  },
  
  // Addresses
  addresses: {
    all: () => ['addresses'] as const,
    lists: () => [...queryKeys.addresses.all(), 'list'] as const,
    list: () => [...queryKeys.addresses.lists()] as const,
    details: () => [...queryKeys.addresses.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.addresses.details(), id] as const,
  },
  
  // User
  user: {
    all: () => ['user'] as const,
    profile: () => [...queryKeys.user.all(), 'profile'] as const,
    wishlist: () => [...queryKeys.user.all(), 'wishlist'] as const,
  },
} as const

// Cache invalidation helpers
export const invalidateQueries = {
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all() }),
  categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() }),
  cart: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all() }),
  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() }),
  reviews: (productId?: string) => {
    if (productId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(productId) })
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() })
    }
  },
  addresses: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all() }),
  user: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.all() }),
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() }),
}

// Optimistic update helpers
export const optimisticUpdates = {
  addToCart: (productId: string, quantity: number) => {
    queryClient.setQueryData(queryKeys.cart.current(), (oldData: Cart | undefined) => {
      if (!oldData) return oldData
      
      // Find existing item
      const existingItem = oldData.items?.find((item: CartItem) => item.productVariantId === productId)
      
      if (existingItem) {
        // Update quantity
        return {
          ...oldData,
          items: oldData.items.map((item: CartItem) =>
            item.productVariantId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      } else {
        // Add new item (will be replaced by real data on success)
        return {
          ...oldData,
          items: [
            ...(oldData.items || []),
            { productVariantId: productId, quantity, id: `temp-${Date.now()}` } as CartItem,
          ],
        }
      }
    })
  },
  
  removeFromCart: (itemId: string) => {
    queryClient.setQueryData(queryKeys.cart.current(), (oldData: Cart | undefined) => {
      if (!oldData) return oldData
      
      return {
        ...oldData,
        items: oldData.items?.filter((item: CartItem) => item.id !== itemId) || [],
      }
    })
  },
}

export default queryClient
