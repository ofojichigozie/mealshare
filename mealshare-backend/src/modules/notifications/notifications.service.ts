import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getNotifications(userId: string) {
    const notifications = await this.db.query.notifications.findMany({
      where: eq(schema.notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });

    return ApiResponseHelper.success(notifications, 'Notifications retrieved successfully');
  }

  async markAsRead(notificationId: string, userId: string) {
    const [updated] = await this.db
      .update(schema.notifications)
      .set({ isRead: true } as any)
      .where(
        and(eq(schema.notifications.id, notificationId), eq(schema.notifications.userId, userId)),
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Notification not found');
    }

    return ApiResponseHelper.success(updated, 'Notification marked as read');
  }

  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.db
      .delete(schema.notifications)
      .where(
        and(eq(schema.notifications.id, notificationId), eq(schema.notifications.userId, userId)),
      )
      .returning();

    if (!result.length) {
      throw new NotFoundException('Notification not found');
    }

    return ApiResponseHelper.success(null, 'Notification deleted successfully');
  }

  // Helper method to create and emit notifications to all household members
  async createHouseholdNotification(householdId: string, type: string, message: string) {
    // Get all active members of the household
    const members = await this.db.query.householdMembers.findMany({
      where: and(
        eq(schema.householdMembers.householdId, householdId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    // Create notification for each member
    const notifications = await Promise.all(
      members.map(async (member) => {
        const [notification] = await this.db
          .insert(schema.notifications)
          .values({
            userId: member.userId,
            householdId,
            type,
            message,
          })
          .returning();

        // Emit real-time notification
        this.notificationsGateway.emitToUser(member.userId, 'notification', notification);

        return notification;
      }),
    );

    return notifications;
  }
}
