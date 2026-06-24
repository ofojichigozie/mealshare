import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte, isNull, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { ApiResponseHelper } from '@/common/helpers/api-response.helper';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private notificationsService: NotificationsService,
  ) {}

  async create(householdId: string, userId: string, createExpenseDto: CreateExpenseDto) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    const [expense] = await this.db
      .insert(schema.expenses)
      .values({
        householdId,
        description: createExpenseDto.description,
        amount: createExpenseDto.amount.toString(),
        category: createExpenseDto.category,
        notes: createExpenseDto.notes,
        paidBy: userId,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
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
      'expense_added',
      `${user?.name || 'Someone'} recorded an expense: ₦${createExpenseDto.amount} for ${createExpenseDto.description}`,
    );

    return ApiResponseHelper.success(expense, 'Expense recorded successfully');
  }

  async getExpenses(householdId: string, userId: string, startDate?: string, endDate?: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Build where conditions
    let whereConditions = eq(schema.expenses.householdId, householdId);

    if (startDate && endDate) {
      whereConditions = and(
        whereConditions,
        gte(schema.expenses.date, new Date(startDate)),
        lte(schema.expenses.date, new Date(endDate)),
      );
    }

    // Get expenses with user relationships
    const expenses = await this.db.query.expenses.findMany({
      where: whereConditions,
      with: {
        paidByUser: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [desc(schema.expenses.date)],
    });

    // Get member count
    const members = await this.db.query.householdMembers.findMany({
      where: and(
        eq(schema.householdMembers.householdId, householdId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    const memberCount = members.length;

    // Format expenses
    const formattedExpenses = expenses.map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: parseFloat(expense.amount),
      category: expense.category,
      notes: expense.notes,
      paidBy: expense.paidByUser
        ? { id: expense.paidByUser.id, name: expense.paidByUser.name }
        : null,
      date: expense.date,
    }));

    // Calculate total spent
    const totalSpent = formattedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const perPersonShare = memberCount > 0 ? totalSpent / memberCount : 0;

    return ApiResponseHelper.success(
      {
        expenses: formattedExpenses,
        summary: {
          totalSpent,
          memberCount,
          perPersonShare,
        },
      },
      'Expenses retrieved successfully',
    );
  }

  async getBalances(householdId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Get all expenses
    const expenses = await this.db.query.expenses.findMany({
      where: eq(schema.expenses.householdId, householdId),
    });

    // Get all active members
    const members = await this.db.query.householdMembers.findMany({
      where: and(
        eq(schema.householdMembers.householdId, householdId),
        isNull(schema.householdMembers.leftAt),
      ),
    });

    // Get all active members with user details
    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await this.db.query.users.findFirst({
          where: eq(schema.users.id, member.userId),
          columns: {
            id: true,
            name: true,
          },
        });
        return { ...member, user };
      }),
    );

    const memberCount = membersWithUsers.length;
    const totalHouseholdExpenses = expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount);
      return sum + amount;
    }, 0);

    const perPersonShare = memberCount > 0 ? totalHouseholdExpenses / memberCount : 0;

    // Calculate each member's balance
    const memberBalances = membersWithUsers.map((member) => {
      // Calculate total spent by this member
      const memberExpenses = expenses.filter((expense) => expense.paidBy === member.userId);
      const totalSpent = memberExpenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount);
        return sum + amount;
      }, 0);

      // Balance = what they spent - what they owe (their share)
      // Positive balance means they are owed money
      // Negative balance means they owe money
      const balance = totalSpent - perPersonShare;

      return {
        userId: member.userId,
        name: member.user?.name || 'Unknown',
        totalSpent,
        share: perPersonShare,
        balance,
      };
    });

    return ApiResponseHelper.success(
      {
        members: memberBalances,
        totalHouseholdExpenses,
      },
      'Balances calculated successfully',
    );
  }

  async update(
    householdId: string,
    expenseId: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Verify expense exists and belongs to this household
    const expense = await this.db.query.expenses.findFirst({
      where: and(eq(schema.expenses.id, expenseId), eq(schema.expenses.householdId, householdId)),
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Build update data
    const updateData: any = {};
    if (updateExpenseDto.description) updateData.description = updateExpenseDto.description;
    if (updateExpenseDto.amount !== undefined)
      updateData.amount = updateExpenseDto.amount.toString();
    if (updateExpenseDto.category) updateData.category = updateExpenseDto.category;
    if (updateExpenseDto.notes !== undefined) updateData.notes = updateExpenseDto.notes;
    if (updateExpenseDto.date) updateData.date = new Date(updateExpenseDto.date);
    updateData.updatedAt = new Date();

    const [updatedExpense] = await this.db
      .update(schema.expenses)
      .set(updateData)
      .where(eq(schema.expenses.id, expenseId))
      .returning();

    return ApiResponseHelper.success(updatedExpense, 'Expense updated successfully');
  }

  async remove(householdId: string, expenseId: string, userId: string) {
    // Verify user is a member of this household
    await this.verifyMembership(householdId, userId);

    // Verify expense exists and belongs to this household
    const expense = await this.db.query.expenses.findFirst({
      where: and(eq(schema.expenses.id, expenseId), eq(schema.expenses.householdId, householdId)),
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const result = await this.db
      .delete(schema.expenses)
      .where(eq(schema.expenses.id, expenseId))
      .returning();

    return ApiResponseHelper.success(null, 'Expense deleted successfully');
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
