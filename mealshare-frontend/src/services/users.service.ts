import type { User } from '../types/user.types';
import api from './api';
import type { ApiResponse } from '../types/api.types';

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export const usersService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<any, ApiResponse<User>>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateUserDto): Promise<User> => {
    const response = await api.put<any, ApiResponse<User>>(
      '/users/profile',
      data
    );
    // Update local storage
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
};
