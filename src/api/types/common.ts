// Common API Response Types
export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result?: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: string;
}
