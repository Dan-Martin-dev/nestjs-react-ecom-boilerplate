import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { 
  Address,
  CreateAddressDto 
} from '../types/api';

// Address Query Keys
export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  details: () => [...addressKeys.all, 'detail'] as const,
  detail: (id: string) => [...addressKeys.details(), id] as const,
} as const;

// Get user's addresses
export const useAddresses = () => {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: async (): Promise<Address[]> => {
      return apiClient.get<Address[]>('/addresses');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single address by ID
export const useAddress = (id: string | undefined) => {
  return useQuery({
    queryKey: addressKeys.detail(id || ''),
    queryFn: async (): Promise<Address> => {
      if (!id) throw new Error('Address ID is required');
      return apiClient.get<Address>(`/addresses/${id}`);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create address
export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: CreateAddressDto): Promise<Address> => {
      return apiClient.post<Address>('/addresses', addressData);
    },
    onSuccess: () => {
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
};

// Update address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateAddressDto> 
    }): Promise<Address> => {
      return apiClient.patch<Address>(`/addresses/${id}`, data);
    },
    onSuccess: (data) => {
      // Update cached address
      queryClient.setQueryData(addressKeys.detail(data.id), data);
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
};

// Delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Address> => {
      return apiClient.delete<Address>(`/addresses/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: addressKeys.detail(id) });
      // Invalidate addresses list
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() });
    },
  });
};
