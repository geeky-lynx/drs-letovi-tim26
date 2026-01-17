
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}


export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { [key: string]: string };  // Validacione greške po poljima
  statusCode?: number;
}


export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}