import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold';
import { useExpenses } from '../hooks';
import { format } from 'date-fns';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';

export const CostSplitting = () => {
  const { household, isLoading: householdLoading } = useHousehold();
  const {
    expenses,
    balances,
    fetchExpenses,
    fetchBalances,
    createExpense,
    deleteExpense,
    isLoading,
  } = useExpenses();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (household && !householdLoading) {
      loadExpensesData();
    }
  }, [household, householdLoading]);

  const loadExpensesData = async () => {
    if (!household) return;

    await Promise.all([
      fetchExpenses(household.id),
      fetchBalances(household.id),
    ]);
  };

  const handleAddExpense = async (data: any) => {
    if (!household) return;
    await createExpense(household.id, data);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!household) return;
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(household.id, expenseId);
    }
  };

  if (isLoading || householdLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Cost Splitting
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be part of a household to track shared expenses and
              balances.
            </p>
            <Link to="/household" className="btn-primary inline-block">
              Go to Household
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Cost Splitting
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track expenses and balances
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Total Spent
          </h3>
          <p className="text-3xl sm:text-4xl font-bold">
            ₦{balances?.totalHouseholdExpenses.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs sm:text-sm mt-2 opacity-90">
            All household expenses
          </p>
        </div>

        <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Per Person
          </h3>
          <p className="text-3xl sm:text-4xl font-bold">
            ₦{expenses?.summary.perPersonShare.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs sm:text-sm mt-2 opacity-90">
            Equal split ({expenses?.summary.memberCount} members)
          </p>
        </div>
      </div>

      {/* Member Balances */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          Member Balances
        </h2>
        <div className="space-y-3 sm:space-y-4">
          {balances?.members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Spent: ₦{member.totalSpent.toFixed(2)} • Share: ₦
                    {member.share.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p
                  className={`text-xl sm:text-2xl font-bold ${
                    member.balance >= 0 ? 'text-primary-600' : 'text-red-600'
                  }`}
                >
                  {member.balance >= 0 ? '+' : ''}₦{member.balance.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {member.balance >= 0 ? 'Is owed' : 'Owes'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense History */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          Expense History
        </h2>

        {!expenses || expenses.expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            No expenses recorded yet. Click "Add Expense" to get started.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        {expense.description}
                        {expense.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {expense.category && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-800 rounded-full text-xs">
                          {expense.category.charAt(0).toUpperCase() +
                            expense.category.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {expense.paidBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ₦{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete expense"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-sm font-bold text-gray-900"
                  >
                    Total
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    ₦{expenses.summary.totalSpent.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
      />
    </div>
  );
};
