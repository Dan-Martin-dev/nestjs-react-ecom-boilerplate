import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { 
  AuthResponse, 
  LoginDto, 
  RegisterDto, 
  User 
} from '../types/api';

// Auth Query Keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
} as const;

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginDto): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Set token in the API client
      apiClient.setToken(response.access_token);
      
      return response;
    },
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterDto): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      // Set token in the API client
      apiClient.setToken(response.access_token);
      
      return response;
    },
    onSuccess: (data) => {
      // Cache user data
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User> => {
      return apiClient.get<User>('/users/me');
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear token from API client
      apiClient.clearToken();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};
