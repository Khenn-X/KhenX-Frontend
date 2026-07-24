/**
 * Standard API response wrapper — mirrors backend apiResponse.ts shape.
 */
export interface ApiResponse<T = null> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data: T;
}

/**
 * Paginated response for list endpoints.
 */
export interface PaginatedResponse<T> {
  status: 'success';
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Validation error shape returned by express-validator on 400.
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: 'fail' | 'error';
  message: string;
  errors?: ValidationError[];
}
