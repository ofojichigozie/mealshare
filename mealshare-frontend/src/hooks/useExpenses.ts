import { useState, useCallback } from 'react';
import { expensesService } from '../services/expenses.service';
import { notify } from '../utils/notification';
import type {
  ExpenseResponse,
  BalanceResponse,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../types/expense.types';

interface UseExpensesReturn {
  expenses: ExpenseResponse | null;
  balances: BalanceResponse | null;
  isLoading: boolean;
  isFetchingExpenses: boolean;
  isFetchingBalances: boolean;
  error: string | null;
  fetchExpenses: (
    householdId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  fetchBalances: (householdId: string) => Promise<void>;
  createExpense: (householdId: string, data: CreateExpenseDto) => Promise<void>;
  updateExpense: (
    householdId: string,
    expenseId: string,
    data: UpdateExpenseDto
  ) => Promise<void>;
  deleteExpense: (householdId: string, expenseId: string) => Promise<void>;
}

export const useExpenses = (): UseExpensesReturn => {
  const [expenses, setExpenses] = useState<ExpenseResponse | null>(null);
  const [balances, setBalances] = useState<BalanceResponse | null>(null);
  const [isFetchingExpenses, setIsFetchingExpenses] = useState(false);
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading = isFetchingExpenses || isFetchingBalances;

  const fetchExpenses = useCallback(
    async (householdId: string, startDate?: string, endDate?: string) => {
      try {
        setIsFetchingExpenses(true);
        setError(null);
        const expensesData = await expensesService.getExpenses(
          householdId,
          startDate,
          endDate
        );
        setExpenses(expensesData);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load expenses';
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setIsFetchingExpenses(false);
      }
    },
    []
  );

  const fetchBalances = useCallback(async (householdId: string) => {
    try {
      setIsFetchingBalances(true);
      setError(null);
      const balancesData = await expensesService.getBalances(householdId);
      setBalances(balancesData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load balances';
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setIsFetchingBalances(false);
    }
  }, []);

  const createExpense = useCallback(
    async (householdId: string, data: CreateExpenseDto) => {
      try {
        setError(null);
        await expensesService.create(householdId, data);
        notify.success('Expense recorded successfully');
        // Reload expenses and balances
        await Promise.all([
          fetchExpenses(householdId),
          fetchBalances(householdId),
        ]);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to record expense';
        setError(errorMessage);
        notify.error(errorMessage);
        throw error;
      }
    },
    [fetchExpenses, fetchBalances]
  );

  const updateExpense = useCallback(
    async (householdId: string, expenseId: string, data: UpdateExpenseDto) => {
      try {
        setError(null);
        await expensesService.update(householdId, expenseId, data);
        notify.success('Expense updated successfully');
        // Reload expenses and balances
        await Promise.all([
          fetchExpenses(householdId),
          fetchBalances(householdId),
        ]);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update expense';
        setError(errorMessage);
        notify.error(errorMessage);
        throw error;
      }
    },
    [fetchExpenses, fetchBalances]
  );

  const deleteExpense = useCallback(
    async (householdId: string, expenseId: string) => {
      try {
        setError(null);
        await expensesService.delete(householdId, expenseId);
        notify.success('Expense deleted successfully');
        // Reload expenses and balances
        await Promise.all([
          fetchExpenses(householdId),
          fetchBalances(householdId),
        ]);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete expense';
        setError(errorMessage);
        notify.error(errorMessage);
        throw error;
      }
    },
    [fetchExpenses, fetchBalances]
  );

  return {
    expenses,
    balances,
    isLoading,
    isFetchingExpenses,
    isFetchingBalances,
    error,
    fetchExpenses,
    fetchBalances,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
