import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatApiError, notify } from '../../../lib/notify';
import { apiClient } from '../../../lib/api';
import { useAuthStore } from '../../../stores';
import type { User } from '../../../types/api';

interface UpdateUserData {
  name?: string;
  email?: string;
}

export const useDashboard = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { user: authUser, setUser } = useAuthStore();
  
  // Fetch user profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      return apiClient.get<User>('/users/me');
    },
    enabled: !!authUser,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Update user profile
  const { mutate: updateUser } = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      setIsUpdating(true);
      try {
        const result = await apiClient.patch<User>(`/users/${authUser?.id}`, data);
        return result;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: (data) => {
      // Update auth store
      setUser(data);
      
      // Update query cache
      queryClient.setQueryData(['userProfile'], data);
      
      notify.success('Profile updated successfully');
    },
    onError: (err) => {
      notify.error(formatApiError(err));
    }
  });
  
  return {
    user,
    isLoading,
    isUpdating,
    error,
    updateUser,
  };
};
