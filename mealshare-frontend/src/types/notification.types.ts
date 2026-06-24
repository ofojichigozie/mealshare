export type NotificationType =
  | 'meal_reminder'
  | 'new_item'
  | 'purchase'
  | 'member_added';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  householdId?: string;
}
