import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import type { 
  Category,
  CreateCategoryDto 
} from '../types/api';

// Category Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  slug: (slug: string) => [...categoryKeys.all, 'slug', slug] as const,
} as const;

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async (): Promise<Category[]> => {
      return apiClient.get<Category[]>('/categories');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get category tree structure
export const useCategoryTree = () => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async (): Promise<Category[]> => {
      return apiClient.get<Category[]>('/categories/tree');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single category by ID
export const useCategory = (id: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: async (): Promise<Category> => {
      if (!id) throw new Error('Category ID is required');
      return apiClient.get<Category>(`/categories/${id}`);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get category by slug
export const useCategoryBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.slug(slug || ''),
    queryFn: async (): Promise<Category> => {
      if (!slug) throw new Error('Category slug is required');
      return apiClient.get<Category>(`/categories/slug/${slug}`);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create category (Admin only)
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: CreateCategoryDto): Promise<Category> => {
      return apiClient.post<Category>('/categories', categoryData);
    },
    onSuccess: () => {
      // Invalidate categories lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

// Update category (Admin only)
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateCategoryDto> 
    }): Promise<Category> => {
      return apiClient.patch<Category>(`/categories/${id}`, data);
    },
    onSuccess: (data) => {
      // Update cached category
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      // Invalidate categories lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};

// Delete category (Admin only)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      return apiClient.delete<Category>(`/categories/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
      // Invalidate categories lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};
