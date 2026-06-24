import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('households/:householdId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(householdId, user.id, createExpenseDto);
  }

  @Get()
  async getExpenses(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getExpenses(householdId, user.id, startDate, endDate);
  }

  @Get('balances')
  async getBalances(@Param('householdId') householdId: string, @CurrentUser() user: any) {
    return this.expensesService.getBalances(householdId, user.id);
  }

  @Put(':expenseId')
  async update(
    @Param('householdId') householdId: string,
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: any,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(householdId, expenseId, user.id, updateExpenseDto);
  }

  @Delete(':expenseId')
  async remove(
    @Param('householdId') householdId: string,
    @Param('expenseId') expenseId: string,
    @CurrentUser() user: any,
  ) {
    return this.expensesService.remove(householdId, expenseId, user.id);
  }
}
