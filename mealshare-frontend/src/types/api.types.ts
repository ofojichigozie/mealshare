export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data: T;
  message: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  data?: any;
}
