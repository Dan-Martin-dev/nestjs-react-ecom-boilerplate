import type { ApiError } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const IS_DEV = import.meta.env.DEV

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

    // Log requests in development
    if (IS_DEV) {
      console.log('🚀 API Request:', {
        method: config.method || 'GET',
        url,
        data: config.body,
      })
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

      // Log responses in development
      if (IS_DEV) {
        console.log('✅ API Response:', {
          status: response.status,
          url,
          data: responseData,
        })
      }
      
      if (!response.ok) {
        const errorMessage = (responseData as ApiError)?.message || 
                           (responseData as ApiError)?.error || 
                           `HTTP ${response.status}: ${response.statusText}`

        // Handle 401 Unauthorized - token refresh logic
        if (response.status === 401) {
          await this.handleUnauthorized()
        }

        // Show user-friendly error notifications via centralized event
        this.handleErrorNotification(response.status, errorMessage)
        
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
      if (IS_DEV) {
        console.error('❌ API request failed:', error)
      }

      // Dispatch centralized notification event instead of calling notifications.show here
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:notify', {
          detail: {
            title: 'Connection Error',
            message: 'Unable to connect to the server. Please check your internet connection.',
            color: 'red',
          }
        }))
      }
      
      throw new ApiClientError(
        0,
        'Network Error',
        error instanceof Error ? error.message : 'An unknown error occurred',
        undefined
      )
    }
  }

  private async handleUnauthorized(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          this.setToken(data.accessToken)
          
          // Also store refresh token if provided
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken)
          }
          return
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    // Refresh failed or no refresh token, clear auth state
    this.setToken(null)
    localStorage.removeItem('refresh_token')
    
    // Dispatch logout event for app-wide handling
    window.dispatchEvent(new CustomEvent('auth:logout'))
    
    // Dispatch centralized notification event instead of calling notifications.show here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notify', {
        detail: {
          title: 'Session Expired',
          message: 'Please log in again to continue.',
          color: 'orange',
          // optional marker to allow deduping or special handling by the listener
          code: 'session-expired',
        }
      }))
    }
  }

  private handleErrorNotification(status: number, message: string): void {
    // Don't show notifications for validation errors (422) - forms will handle these
    if (status === 422) return

    // Don't show notifications for 401 - handled by token refresh
    if (status === 401) return

    // Dispatch notification events for client/server errors
    if (typeof window !== 'undefined') {
      if (status >= 400 && status < 500) {
        window.dispatchEvent(new CustomEvent('app:notify', {
          detail: {
            title: 'Error',
            message,
            color: 'red',
          }
        }))
        return
      }

      if (status >= 500) {
        window.dispatchEvent(new CustomEvent('app:notify', {
          detail: {
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
            color: 'red',
          }
        }))
      }
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

  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalFields?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add any additional fields
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded * 100) / e.total)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response)
          } else {
            reject(new ApiClientError(
              xhr.status,
              xhr.statusText,
              response.message || 'Upload failed',
              response
            ))
          }
        } catch {
          reject(new ApiClientError(
            xhr.status,
            xhr.statusText,
            'Invalid response format',
            undefined
          ))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new ApiClientError(
          0,
          'Network Error',
          'Upload failed due to network error',
          undefined
        ))
      })

      xhr.open('POST', `${this.baseUrl}${endpoint}`)
      
      const token = this.getToken()
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.send(formData)
    })
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient()
