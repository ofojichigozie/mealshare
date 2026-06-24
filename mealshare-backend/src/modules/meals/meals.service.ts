import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MealsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private notificationsService: NotificationsService,
  ) {}

  async create(householdId: string, userId: string, createMealDto: CreateMealDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Check if meal already exists for this date and mealType
    const existingMeal = await this.db.query.meals.findFirst({
      where: and(
        eq(schema.meals.householdId, householdId),
        eq(schema.meals.date, createMealDto.date),
        eq(schema.meals.mealType, createMealDto.mealType),
      ),
    });

    if (existingMeal) {
      throw new ConflictException(
        `A ${createMealDto.mealType} meal already exists for ${createMealDto.date}`,
      );
    }

    const [meal] = await this.db
      .insert(schema.meals)
      .values({
        householdId,
        name: createMealDto.name,
        date: createMealDto.date,
        mealType: createMealDto.mealType,
        assignedTo: createMealDto.assignedTo,
        createdBy: userId,
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
      'meal_created',
      `${user?.name || 'Someone'} planned ${createMealDto.name} for ${createMealDto.mealType} on ${createMealDto.date}`,
    );

    return ApiResponseHelper.success(meal, 'Meal created successfully');
  }

  async findAll(householdId: string, userId: string, startDate?: string, endDate?: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    let whereConditions = eq(schema.meals.householdId, householdId);

    if (startDate && endDate) {
      whereConditions = and(
        whereConditions,
        gte(schema.meals.date, startDate),
        lte(schema.meals.date, endDate),
      );
    }

    // Use relationships to load user data efficiently
    const meals = await this.db.query.meals.findMany({
      where: whereConditions,
      with: {
        assignedToUser: {
          columns: {
            id: true,
            name: true,
            username: true,
          },
        },
        createdByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format response
    const formattedMeals = meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      date: meal.date,
      mealType: meal.mealType,
      assignedTo: meal.assignedToUser
        ? { id: meal.assignedToUser.id, name: meal.assignedToUser.name }
        : null,
      createdBy: meal.createdByUser
        ? { id: meal.createdByUser.id, name: meal.createdByUser.name }
        : null,
    }));

    return ApiResponseHelper.success(formattedMeals, 'Meals retrieved successfully');
  }

  async update(householdId: string, mealId: string, userId: string, updateMealDto: UpdateMealDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const [updatedMeal] = await this.db
      .update(schema.meals)
      .set(updateMealDto)
      .where(and(eq(schema.meals.id, mealId), eq(schema.meals.householdId, householdId)))
      .returning();

    if (!updatedMeal) {
      throw new NotFoundException('Meal not found');
    }

    // Get user info for notification
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true },
    });

    // Notify household members about the update
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'meal_updated',
      `${user?.name || 'Someone'} updated the meal "${updatedMeal.name}"`,
    );

    return ApiResponseHelper.success(updatedMeal, 'Meal updated successfully');
  }

  async remove(householdId: string, mealId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Get meal info before deletion for notification
    const meal = await this.db.query.meals.findFirst({
      where: and(eq(schema.meals.id, mealId), eq(schema.meals.householdId, householdId)),
    });

    const result = await this.db
      .delete(schema.meals)
      .where(and(eq(schema.meals.id, mealId), eq(schema.meals.householdId, householdId)))
      .returning();

    if (!result.length) {
      throw new NotFoundException('Meal not found');
    }

    // Get user info for notification
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true },
    });

    // Notify household members
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'meal_deleted',
      `${user?.name || 'Someone'} removed the meal "${meal?.name || 'a meal'}"`,
    );

    return ApiResponseHelper.success(null, 'Meal deleted successfully');
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
