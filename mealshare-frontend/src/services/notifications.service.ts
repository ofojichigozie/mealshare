import api from './api';
import type { Notification } from '../types/notification.types';
import type { ApiResponse } from '../types/api.types';

export const notificationsService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get<any, ApiResponse<Notification[]>>(
      '/notifications'
    );
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.put<any, ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  delete: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
