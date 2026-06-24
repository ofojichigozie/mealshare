import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ShoppingListService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private notificationsService: NotificationsService,
  ) {}

  async create(householdId: string, userId: string, createItemDto: CreateItemDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const [item] = await this.db
      .insert(schema.shoppingItems)
      .values({
        householdId,
        name: createItemDto.name,
        quantity: createItemDto.quantity,
        category: createItemDto.category,
        estimatedPrice: createItemDto.estimatedPrice?.toString(),
        addedBy: userId,
      } as any)
      .returning();

    // Get user info for notification
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true },
    });

    // Notify household members
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'shopping_item_added',
      `${user?.name || 'Someone'} added ${createItemDto.name} to the shopping list`,
    );

    return ApiResponseHelper.success(item, 'Item added successfully');
  }

  async findAll(householdId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Use relationships to load user data efficiently
    const items = await this.db.query.shoppingItems.findMany({
      where: eq(schema.shoppingItems.householdId, householdId),
      with: {
        addedByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format response
    const formattedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      estimatedPrice: item.estimatedPrice,
      isPurchased: item.isPurchased,
      addedBy: item.addedByUser ? { id: item.addedByUser.id, name: item.addedByUser.name } : null,
    }));

    return ApiResponseHelper.success(formattedItems, 'Shopping list retrieved successfully');
  }

  async update(householdId: string, itemId: string, userId: string, updateItemDto: UpdateItemDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const updateData: any = {};

    if (updateItemDto.name) updateData.name = updateItemDto.name;
    if (updateItemDto.quantity) updateData.quantity = updateItemDto.quantity;
    if (updateItemDto.isPurchased !== undefined) {
      updateData.isPurchased = updateItemDto.isPurchased;
    }
    if (updateItemDto.estimatedPrice !== undefined) {
      updateData.estimatedPrice = updateItemDto.estimatedPrice?.toString();
    }
    updateData.updatedAt = new Date();

    const [updatedItem] = await this.db
      .update(schema.shoppingItems)
      .set(updateData)
      .where(
        and(eq(schema.shoppingItems.id, itemId), eq(schema.shoppingItems.householdId, householdId)),
      )
      .returning();

    if (!updatedItem) {
      throw new NotFoundException('Item not found');
    }

    // Notify household members only for purchases
    if (updateItemDto.isPurchased) {
      const user = await this.db.query.users.findFirst({
        where: eq(schema.users.id, userId),
        columns: { name: true },
      });

      await this.notificationsService.createHouseholdNotification(
        householdId,
        'shopping_item_purchased',
        `${user?.name || 'Someone'} purchased ${updatedItem.name}`,
      );
    }

    return ApiResponseHelper.success(updatedItem, 'Item updated successfully');
  }

  async remove(householdId: string, itemId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Get item info before deletion for notification
    const item = await this.db.query.shoppingItems.findFirst({
      where: and(
        eq(schema.shoppingItems.id, itemId),
        eq(schema.shoppingItems.householdId, householdId),
      ),
    });

    const result = await this.db
      .delete(schema.shoppingItems)
      .where(
        and(eq(schema.shoppingItems.id, itemId), eq(schema.shoppingItems.householdId, householdId)),
      )
      .returning();

    if (!result.length) {
      throw new NotFoundException('Item not found');
    }

    // Get user info for notification
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true },
    });

    // Notify household members
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'shopping_item_removed',
      `${user?.name || 'Someone'} removed ${item?.name || 'an item'} from the shopping list`,
    );

    return ApiResponseHelper.success(null, 'Item deleted successfully');
  }

  private async verifyMembership(householdId: string, userId: string) {
    const membership = await this.db.query.householdMembers.findFirst({
      where: and(
        eq(schema.householdMembers.householdId, householdId),
        eq(schema.householdMembers.userId, userId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this household');
    }

    return membership;
  }
}
