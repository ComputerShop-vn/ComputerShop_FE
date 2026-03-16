// Category API Types

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  categoryName: string;
  description?: string;
}
