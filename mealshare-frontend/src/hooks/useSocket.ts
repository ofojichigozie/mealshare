import { useEffect } from 'react';
import { socketService } from '../services/socket.service';
import { useShoppingStore } from '../store/shoppingStore';
import { useNotificationsStore } from '../store/notificationsStore';
import { notify } from '../utils/notification';
import { browserNotificationService } from '../utils/browserNotification';
import type { ShoppingItem } from '../types/shopping.types';
import type { Notification } from '../types/notification.types';

export const useSocket = () => {
  const { addItem, updateItem, removeItem } = useShoppingStore();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socketService.isConnected()) {
      socketService.connect(token);

      // Request browser notification permission when socket connects
      if (browserNotificationService.isSupported()) {
        browserNotificationService.requestPermission();
      }
    }

    // Shopping list events - for real-time UI data sync
    socketService.on('shoppingItem:created', (item: ShoppingItem) => {
      addItem(item);
    });

    socketService.on('shoppingItem:updated', (item: ShoppingItem) => {
      updateItem(item.id, item);
    });

    socketService.on('shoppingItem:deleted', (itemId: string) => {
      removeItem(itemId);
    });

    // Notification events
    socketService.on('notification', (notification: Notification) => {
      addNotification(notification);
      notify.info(notification.message);

      // Show browser notification if app is not in focus and permission is granted
      if (!document.hasFocus()) {
        browserNotificationService.requestPermission().then((permission) => {
          if (permission === 'granted') {
            browserNotificationService.showNotification('MealShare', {
              body: notification.message,
              tag: `notification-${notification.id}`, // Prevent duplicate notifications
            });
          }
        });
      }
    });

    return () => {
      socketService.off('shoppingItem:created');
      socketService.off('shoppingItem:updated');
      socketService.off('shoppingItem:deleted');
      socketService.off('notification');
    };
  }, [addItem, updateItem, removeItem, addNotification]);

  return {
    isConnected: socketService.isConnected(),
  };
};
