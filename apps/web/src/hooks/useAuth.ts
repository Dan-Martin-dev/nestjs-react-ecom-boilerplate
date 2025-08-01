import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, API_ENDPOINTS } from '../lib/api'
import { type User, type LoginRequest, type RegisterRequest, type AuthTokens } from '../lib/types'
import { useAuthStore } from '../features/auth/stores/authStore'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

// Get current user profile
export function useProfile() {
  const { token, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => apiClient.get<User>(API_ENDPOINTS.PROFILE),
    enabled: isAuthenticated && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Login mutation
export function useLogin() {
  const { login } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient.post<{ user: User; tokens: AuthTokens }>(API_ENDPOINTS.LOGIN, credentials),
    onSuccess: (data) => {
      // Update auth store
      login(data.user, data.tokens.accessToken)
      // Set token for future API calls
      apiClient.setToken(data.tokens.accessToken)
      // Cache user profile
      queryClient.setQueryData(authKeys.profile(), data.user)
    },
  })
}

// Register mutation
export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterRequest) =>
      apiClient.post<{ user: User; tokens: AuthTokens }>(API_ENDPOINTS.REGISTER, userData),
  })
}

// Logout mutation
export function useLogout() {
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.post(API_ENDPOINTS.LOGOUT),
    onSuccess: () => {
      // Clear auth state
      logout()
      // Clear API client token
      apiClient.setToken(null)
      // Clear all cached data
      queryClient.clear()
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logout()
      apiClient.setToken(null)
      queryClient.clear()
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      apiClient.put<User>(API_ENDPOINTS.PROFILE, userData),
    onSuccess: (data) => {
      // Update cached profile
      queryClient.setQueryData(authKeys.profile(), data)
      // Update auth store
      useAuthStore.getState().updateUser(data)
    },
  })
}
