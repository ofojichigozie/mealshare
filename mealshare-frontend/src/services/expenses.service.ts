import api from './api';
import type {
  ExpenseResponse,
  BalanceResponse,
  CreateExpenseDto,
  UpdateExpenseDto,
  Expense,
} from '../types/expense.types';
import type { ApiResponse } from '../types/api.types';

export const expensesService = {
  getExpenses: async (
    householdId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<any, ApiResponse<ExpenseResponse>>(
      `/households/${householdId}/expenses?${params.toString()}`
    );
    return response.data;
  },

  getBalances: async (householdId: string): Promise<BalanceResponse> => {
    const response = await api.get<any, ApiResponse<BalanceResponse>>(
      `/households/${householdId}/expenses/balances`
    );
    return response.data;
  },

  create: async (
    householdId: string,
    data: CreateExpenseDto
  ): Promise<Expense> => {
    const response = await api.post<any, ApiResponse<Expense>>(
      `/households/${householdId}/expenses`,
      data
    );
    return response.data;
  },

  update: async (
    householdId: string,
    expenseId: string,
    data: UpdateExpenseDto
  ): Promise<Expense> => {
    const response = await api.put<any, ApiResponse<Expense>>(
      `/households/${householdId}/expenses/${expenseId}`,
      data
    );
    return response.data;
  },

  delete: async (householdId: string, expenseId: string): Promise<void> => {
    await api.delete(`/households/${householdId}/expenses/${expenseId}`);
  },
};
