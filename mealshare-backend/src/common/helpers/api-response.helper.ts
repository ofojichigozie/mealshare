import { ApiResponse } from '../interfaces/api-response.interface';

export class ApiResponseHelper {
  static success<T>(data: T, message: string = 'Request successful'): ApiResponse<T> {
    return {
      status: 'success',
      data,
      message,
    };
  }

  static error(message: string, data: any = null): ApiResponse<any> {
    return {
      status: 'error',
      data,
      message,
    };
  }
}
