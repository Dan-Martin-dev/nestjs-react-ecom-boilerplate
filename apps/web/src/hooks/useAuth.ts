import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../stores';
import { queryKeys } from '../lib/react-query';
import type { 
  LoginDto, 
  RegisterDto, 
  User 
} from '@repo/shared';

// Auth Query Keys (keeping for backward compatibility)
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
} as const;

// Auth profile query
export const useAuthProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => apiClient.get<User>('/auth/profile'),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    meta: {
      errorNotification: false, // Don't show error notifications for profile fetch
    },
  })
}

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login, setLoading } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      setLoading(true)
      try {
        await login(credentials.email, credentials.password)
      } finally {
        setLoading(false)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
    meta: {
      errorNotification: true,
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { register, setLoading } = useAuthStore()

  return useMutation({
    mutationFn: async (userData: RegisterDto & { confirmPassword: string }) => {
      setLoading(true)
      try {
        // Ensure name is provided
        const registerData = {
          ...userData,
          name: userData.name || '', // Provide default empty string if undefined
        }
        await register(registerData)
      } finally {
        setLoading(false)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() })
    },
    meta: {
      errorNotification: true,
    },
  })
}

// Keep original useMe for backward compatibility
export const useMe = () => {
  return useAuthProfile()
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await logout()
    },
    onSuccess: () => {
      // Clear all queries when logging out
      queryClient.clear()
    },
    meta: {
      errorNotification: true,
      successNotification: 'Logged out successfully',
    },
  })
}

// Additional hooks for easier access to auth state
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user)
}

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated)
}

export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading)
}
