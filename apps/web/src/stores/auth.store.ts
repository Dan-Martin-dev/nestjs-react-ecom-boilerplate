import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { User, AuthResponse } from '@repo/shared'
import { apiClient } from '../lib/api'

interface AuthState {
  // State
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  
  // Helpers
  checkAuth: () => void
  clearAuth: () => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  confirmPassword: string
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,

        // Login action
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true })
            
            const response = await apiClient.post<AuthResponse>('/auth/login', {
              email,
              password,
            })

            const { user, access_token, refresh_token, token } = response as AuthResponse

            // Prefer explicit access_token then token; ensure setToken gets string|null
            const authToken = access_token ?? token ?? null

            // Update API client token
            apiClient.setToken(authToken)

            set({
              user,
              token: authToken,
              refreshToken: refresh_token ?? null,
              isAuthenticated: true,
              isLoading: false,
            })

            // Store refresh token separately (secure storage in production)
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token)
            }
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Register action
        register: async (userData: RegisterData) => {
          try {
            set({ isLoading: true })
            
            // Extract confirmPassword and create clean register data
            const registerData = {
              email: userData.email,
              password: userData.password,
              name: userData.name,
            }
            
            const response = await apiClient.post<AuthResponse>('/auth/register', registerData)
            
            const { user, access_token, refresh_token, token } = response as AuthResponse

            const authToken = access_token ?? token ?? null
            apiClient.setToken(authToken)

            set({
              user,
              token: authToken,
              refreshToken: refresh_token ?? null,
              isAuthenticated: true,
              isLoading: false,
            })

            // Store refresh token separately
            if (refresh_token) {
              localStorage.setItem('refresh_token', refresh_token)
            }
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Logout action
        logout: async () => {
          try {
            const { token } = get()
            
            if (token) {
              // Call logout endpoint to invalidate token on server
              await apiClient.post('/auth/logout')
            }
          } catch (error) {
            console.error('Logout error:', error)
          } finally {
            // Clear local state regardless of server response
            get().clearAuth()
          }
        },

        // Refresh token action
        refreshAuth: async () => {
          try {
            const { refreshToken } = get()
            
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            const response = await apiClient.post<AuthResponse>('/auth/refresh', {
              refreshToken,
            })

            const { user, access_token, refresh_token: newRefreshToken, token } = response as AuthResponse

            const authToken = access_token ?? token ?? null
            apiClient.setToken(authToken)

            set({
              user,
              token: authToken,
              refreshToken: newRefreshToken ?? null,
              isAuthenticated: true,
            })

            // Update stored refresh token
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken)
            }
            
          } catch (error) {
            // Refresh failed, clear auth state
            get().clearAuth()
            throw error
          }
        },

        // Update profile action
        updateProfile: async (userData: Partial<User>) => {
          try {
            set({ isLoading: true })
            
            const response = await apiClient.put<User>('/auth/profile', userData)
            
            set({ 
              user: response,
              isLoading: false,
            })
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Set user
        setUser: (user: User | null) => {
          set({ 
            user,
            isAuthenticated: !!user,
          })
        },

        // Set loading
        setLoading: (isLoading: boolean) => {
          set({ isLoading })
        },

        // Check authentication status
        checkAuth: () => {
          const { token, refreshToken } = get()
          
          if (token) {
            // Set token in API client
            apiClient.setToken(token)
            
            // Verify token is still valid by fetching profile
            apiClient.get<User>('/auth/profile')
              .then((response) => {
                set({ 
                  user: response,
                  isAuthenticated: true,
                })
              })
              .catch(() => {
                // Token invalid, try refresh
                if (refreshToken) {
                  get().refreshAuth().catch(() => {
                    get().clearAuth()
                  })
                } else {
                  get().clearAuth()
                }
              })
          }
        },

        // Clear authentication state
        clearAuth: () => {
          // Clear API client token
          apiClient.setToken(null)
          
          // Clear local storage
          localStorage.removeItem('refresh_token')
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist non-sensitive data
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          // Don't persist refresh token in main storage for security
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// Listen for logout events from API client
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().clearAuth()
  })
}

export default useAuthStore
