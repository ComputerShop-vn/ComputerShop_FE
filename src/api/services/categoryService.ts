// Category Service
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { CategoryResponse, CategoryRequest } from '../types/category';

export const categoryService = {
  // Get all categories (public)
  getAllCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>(
      API_ENDPOINTS.CATEGORIES
    );
    return response.result || [];
  },

  // Get category by ID (public)
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(
      API_ENDPOINTS.CATEGORY_BY_ID(id)
    );
    if (!response.result) {
      throw new Error('Category not found');
    }
    return response.result;
  },

  // Create category (requires STAFF/ADMIN)
  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      API_ENDPOINTS.CATEGORIES,
      data,
      true
    );
    if (!response.result) {
      throw new Error('Failed to create category');
    }
    return response.result;
  },

  // Update category (requires STAFF/ADMIN)
  updateCategory: async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(
      API_ENDPOINTS.CATEGORY_BY_ID(id),
      data,
      true
    );
    if (!response.result) {
      throw new Error('Failed to update category');
    }
    return response.result;
  },

  // Delete category (requires STAFF/ADMIN)
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORY_BY_ID(id), true);
  },
};

