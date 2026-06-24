import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or, and, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class HouseholdsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createHouseholdDto: CreateHouseholdDto) {
    // Check if user already has an active household
    const existingMembership = await this.db.query.householdMembers.findFirst({
      where: and(
        eq(schema.householdMembers.userId, userId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    if (existingMembership) {
      throw new ConflictException('User can only belong to one household at a time');
    }

    // Create household
    const [household] = await this.db
      .insert(schema.households)
      .values({
        name: createHouseholdDto.name,
        createdBy: userId,
      })
      .returning();

    // Add creator as member
    await this.db.insert(schema.householdMembers).values({
      householdId: household.id,
      userId: userId,
    });

    // Fetch the created household with relations
    const householdWithRelations = await this.db.query.households.findFirst({
      where: eq(schema.households.id, household.id),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(
      {
        id: householdWithRelations.id,
        name: householdWithRelations.name,
        createdBy: householdWithRelations.createdByUser
          ? {
              id: householdWithRelations.createdByUser.id,
              name: householdWithRelations.createdByUser.name,
            }
          : null,
        createdAt: householdWithRelations.createdAt,
        updatedAt: householdWithRelations.updatedAt,
      },
      'Household created successfully',
    );
  }

  async findOne(householdId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const household = await this.db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    // Get all active members
    const memberships = await this.db.query.householdMembers.findMany({
      where: and(
        eq(schema.householdMembers.householdId, householdId),
        isNull(schema.householdMembers.leftAt),
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    const members = memberships.map((membership) => ({
      id: membership.user.id,
      name: membership.user.name,
      username: membership.user.username,
      joinedAt: membership.joinedAt,
    }));

    return ApiResponseHelper.success(
      {
        id: household.id,
        name: household.name,
        createdBy: household.createdByUser
          ? { id: household.createdByUser.id, name: household.createdByUser.name }
          : null,
        createdAt: household.createdAt,
        updatedAt: household.updatedAt,
        members,
      },
      'Household retrieved successfully',
    );
  }

  async update(householdId: string, userId: string, updateHouseholdDto: UpdateHouseholdDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const [updatedHousehold] = await this.db
      .update(schema.households)
      .set({
        name: updateHouseholdDto.name,
      })
      .where(eq(schema.households.id, householdId))
      .returning();

    if (!updatedHousehold) {
      throw new NotFoundException('Household not found');
    }

    // Fetch the updated household with relations
    const householdWithRelations = await this.db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
      with: {
        createdByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(
      {
        id: householdWithRelations.id,
        name: householdWithRelations.name,
        createdBy: householdWithRelations.createdByUser
          ? {
              id: householdWithRelations.createdByUser.id,
              name: householdWithRelations.createdByUser.name,
            }
          : null,
        createdAt: householdWithRelations.createdAt,
        updatedAt: householdWithRelations.updatedAt,
      },
      'Household updated successfully',
    );
  }

  async addMember(householdId: string, userId: string, addMemberDto: AddMemberDto) {
    // Verify requesting user is the creator
    const household = await this.db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    if (household.createdBy !== userId) {
      throw new ForbiddenException('Only household creator can add members');
    }

    // Find user to add
    const userToAdd = await this.db.query.users.findFirst({
      where: or(
        eq(schema.users.username, addMemberDto.usernameOrEmail),
        eq(schema.users.email, addMemberDto.usernameOrEmail),
      ),
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has an active household
    const existingMembership = await this.db.query.householdMembers.findFirst({
      where: and(
        eq(schema.householdMembers.userId, userToAdd.id),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    if (existingMembership) {
      throw new ConflictException('User already belongs to a household');
    }

    // Add member
    await this.db.insert(schema.householdMembers).values({
      householdId,
      userId: userToAdd.id,
    });

    const { password: _, ...member } = userToAdd;

    // Notify household members about new member
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'member_added',
      `${userToAdd.name} joined the household`,
    );

    return ApiResponseHelper.success({ member }, 'Member added successfully');
  }

  async removeMember(householdId: string, requesterId: string, userIdToRemove: string) {
    // Verify requesting user is the creator
    const household = await this.db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    if (household.createdBy !== requesterId) {
      throw new ForbiddenException('Only household creator can remove members');
    }

    if (household.createdBy === userIdToRemove) {
      throw new BadRequestException('Creator cannot be removed from household');
    }

    // Mark member as left
    await this.db
      .update(schema.householdMembers)
      .set({ leftAt: new Date() } as any)
      .where(
        and(
          eq(schema.householdMembers.householdId, householdId),
          eq(schema.householdMembers.userId, userIdToRemove),
        ),
      );

    // Get removed user info for notification
    const removedUser = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userIdToRemove),
      columns: { name: true },
    });

    // Notify household members
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'member_removed',
      `${removedUser?.name || 'A member'} was removed from the household`,
    );

    return ApiResponseHelper.success(null, 'Member removed successfully');
  }

  async leaveHousehold(householdId: string, userId: string) {
    const household = await this.db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    if (household.createdBy === userId) {
      throw new BadRequestException('Creator cannot leave household. Transfer ownership first.');
    }

    // Mark member as left
    await this.db
      .update(schema.householdMembers)
      .set({ leftAt: new Date() } as any)
      .where(
        and(
          eq(schema.householdMembers.householdId, householdId),
          eq(schema.householdMembers.userId, userId),
        ),
      );

    // Get user info for notification
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { name: true },
    });

    // Notify household members
    await this.notificationsService.createHouseholdNotification(
      householdId,
      'member_left',
      `${user?.name || 'A member'} left the household`,
    );

    return ApiResponseHelper.success(null, 'Left household successfully');
  }

  async getUserHousehold(userId: string) {
    const membership = await this.db.query.householdMembers.findFirst({
      where: and(
        eq(schema.householdMembers.userId, userId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    if (!membership) {
      return ApiResponseHelper.success(null, 'No household found');
    }

    return this.findOne(membership.householdId, userId);
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
