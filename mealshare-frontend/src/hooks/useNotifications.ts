import { useState, useCallback } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';
import { notificationsService } from '../services/notifications.service';
import { notify } from '../utils/notification';
import type { Notification } from '../types/notification.types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isMarking: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  clearNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const {
    notifications,
    unreadCount,
    setNotifications,
    markAsRead: markAsReadInStore,
    removeNotification,
    clearNotifications,
  } = useNotificationsStore();

  const [isFetching, setIsFetching] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading = isFetching || isMarking || isDeleting;

  const fetchNotifications = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const notificationsData = await notificationsService.getAll();
      setNotifications(notificationsData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load notifications';
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }, [setNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        setIsMarking(true);
        setError(null);
        await notificationsService.markAsRead(notificationId);
        markAsReadInStore(notificationId);
        return true;
      } catch (error: any) {
        const errorMessage =
          error.message || 'Failed to mark notification as read';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsMarking(false);
      }
    },
    [markAsReadInStore]
  );

  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);
        await notificationsService.delete(notificationId);
        removeNotification(notificationId);
        notify.success('Notification deleted successfully!');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete notification';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [removeNotification]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    isMarking,
    isDeleting,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    clearNotifications,
  };
};
