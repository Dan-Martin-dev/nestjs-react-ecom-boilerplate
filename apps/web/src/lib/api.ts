import type { ApiError } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  PROFILE: '/auth/profile',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_SEARCH: '/products/search',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  
  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update',
  CART_REMOVE: '/cart/remove',
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Reviews
  REVIEWS: '/reviews',
  PRODUCT_REVIEWS: (productId: string) => `/reviews/product/${productId}`,
  
  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS_BY_ID: (id: string) => `/addresses/${id}`,
  
  // Discounts
  DISCOUNTS: '/discounts',
  DISCOUNT_VALIDATE: '/discounts/validate',
} as const

export class ApiClientError extends Error {
  status: number
  statusText: string
  data?: ApiError

  constructor(
    status: number,
    statusText: string,
    message: string,
    data?: ApiError
  ) {
    super(message);
    this.status = status
    this.statusText = statusText
    this.data = data
    this.name = 'ApiClientError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        localStorage.removeItem('authToken')
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authToken')
      if (stored) {
        this.token = stored
        return stored
      }
    }
    
    return null
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    let url = `${this.baseUrl}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    return url
  }

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { params, ...requestOptions } = options
    const url = this.buildUrl(endpoint, params)
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...requestOptions,
    }

    try {
      const response = await fetch(url, config)
      
      // Try to parse response body
      let responseData: unknown
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
      
      if (!response.ok) {
        const errorMessage = (responseData as ApiError)?.message || 
                           (responseData as ApiError)?.error || 
                           `HTTP ${response.status}: ${response.statusText}`
        throw new ApiClientError(
          response.status,
          response.statusText,
          errorMessage,
          responseData as ApiError
        )
      }
      
      return responseData as T
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }
      
      // Network or other errors
      console.error('API request failed:', error)
      throw new ApiClientError(
        0,
        'Network Error',
        error instanceof Error ? error.message : 'An unknown error occurred',
        undefined
      )
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient()
