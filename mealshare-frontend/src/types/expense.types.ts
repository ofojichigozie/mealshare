export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  notes?: string;
  paidBy: {
    id: string;
    name: string;
  };
  date: string;
}

export interface ExpenseSummary {
  totalSpent: number;
  memberCount: number;
  perPersonShare: number;
}

export interface ExpenseResponse {
  expenses: Expense[];
  summary: ExpenseSummary;
}

export interface MemberBalance {
  userId: string;
  name: string;
  totalSpent: number;
  share: number;
  balance: number;
}

export interface BalanceResponse {
  members: MemberBalance[];
  totalHouseholdExpenses: number;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  category?: string;
  notes?: string;
  date?: string;
}

export interface UpdateExpenseDto {
  description?: string;
  amount?: number;
  category?: string;
  notes?: string;
  date?: string;
}
