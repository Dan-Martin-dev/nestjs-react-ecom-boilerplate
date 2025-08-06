import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '../lib/api';
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
    queryFn: (): Promise<Category[]> => {
      return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get category tree structure
export const useCategoryTree = () => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: (): Promise<Category[]> => {
      return apiClient.get<Category[]>(`${API_ENDPOINTS.CATEGORIES}/tree`);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single category by ID
export const useCategory = (id: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: (): Promise<Category> => {
      if (!id) throw new Error('Category ID is required');
      return apiClient.get<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id));
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get category by slug
export const useCategoryBySlug = (slug: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: categoryKeys.slug(slug || ''),
    queryFn: (): Promise<Category> => {
      if (!slug) throw new Error('Category slug is required');
      return apiClient.get<Category>(`${API_ENDPOINTS.CATEGORIES}/slug/${slug}`);
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create category (Admin only)
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData: CreateCategoryDto): Promise<Category> => {
      return apiClient.post<Category>(API_ENDPOINTS.CATEGORIES, categoryData);
    },
    onSuccess: (newCategory) => {
      // Add to cache
      queryClient.setQueryData(categoryKeys.detail(newCategory.id), newCategory);
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
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateCategoryDto> 
    }): Promise<Category> => {
      return apiClient.patch<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id), data);
    },
    onSuccess: (updatedCategory) => {
      // Update cached category
      queryClient.setQueryData(categoryKeys.detail(updatedCategory.id), updatedCategory);
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
    mutationFn: (id: string): Promise<void> => {
      return apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
      // Invalidate categories lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
};
