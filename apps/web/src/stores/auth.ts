import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse, LoginDto, RegisterDto } from '../types/api'
import { apiClient, API_ENDPOINTS } from '../lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  clearError: () => void
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.LOGIN,
            credentials
          )
          
          const { user, access_token } = response
          
          // Set token in API client
          apiClient.setToken(access_token)
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.REGISTER,
            data
          )
          
          const { user, access_token } = response
          
          // Set token in API client
          apiClient.setToken(access_token)
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      logout: () => {
        // Clear token from API client
        apiClient.setToken(null)
        
        // Optionally call logout endpoint
        apiClient.post(API_ENDPOINTS.LOGOUT).catch(console.error)
        
        set({
          ...initialState,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshToken: async () => {
        const { token } = get()
        
        if (!token) {
          throw new Error('No refresh token available')
        }
        
        try {
          const response = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.REFRESH
          )
          
          const { user, access_token } = response
          
          // Set new token in API client
          apiClient.setToken(access_token)
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            error: null,
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore token in API client after hydration
        if (state?.token) {
          apiClient.setToken(state.token)
        }
      },
    }
  )
)
