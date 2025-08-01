// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  categoryId: string
  category?: Category
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Category types
export interface Category {
  id: string
  name: string
  description: string
  image?: string
  parentId?: string
  children?: Category[]
  createdAt: string
  updatedAt: string
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  name: string
  image?: string
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalPrice: number
  totalItems: number
  createdAt: string
  updatedAt: string
}

// Order types
export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  totalPrice: number
  shippingAddress: Address
  billingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error types
export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}
