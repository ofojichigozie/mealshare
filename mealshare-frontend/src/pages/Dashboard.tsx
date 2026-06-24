import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals, useShopping, useNotifications, useExpenses } from '../hooks';
import { format, addDays, isWithinInterval, startOfDay } from 'date-fns';

export const Dashboard = () => {
  const { household, isLoading: householdLoading } = useHousehold();
  const { meals, fetchMeals } = useMeals();
  const { items, fetchItems } = useShopping();
  const { fetchNotifications } = useNotifications();
  const { balances, fetchBalances } = useExpenses();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (household && !householdLoading) {
      loadDashboardData();
    } else if (!household && !householdLoading) {
      setIsLoading(false);
    }
  }, [household, householdLoading]);

  const loadDashboardData = async () => {
    if (!household) return;

    setIsLoading(true);

    // Load meals, shopping list, notifications, and balances
    const today = format(new Date(), 'yyyy-MM-dd');
    const threeDaysLater = format(addDays(new Date(), 3), 'yyyy-MM-dd');

    await Promise.all([
      fetchMeals(household.id, today, threeDaysLater),
      fetchItems(household.id),
      fetchNotifications(),
      fetchBalances(household.id),
    ]);

    setIsLoading(false);
  };

  const upcomingMeals = meals.filter((meal) => {
    const mealDate = startOfDay(new Date(meal.date));
    const today = startOfDay(new Date());
    const threeDaysLater = startOfDay(addDays(new Date(), 3));
    return isWithinInterval(mealDate, { start: today, end: threeDaysLater });
  });

  const pendingItems = items.filter((item) => !item.isPurchased);
  const currentUserBalance = balances?.members?.find(
    (m: any) => m.userId === JSON.parse(localStorage.getItem('user') || '{}').id
  );

  if (householdLoading || (household && isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Welcome to MealShare!
            </h2>
            <p className="text-gray-600 mb-6">
              You need to create or join a household to get started with meal
              planning and sharing expenses.
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome to {household?.name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Upcoming Meals
          </h3>
          <p className="text-3xl sm:text-4xl font-bold">
            {upcomingMeals.length}
          </p>
          <p className="text-xs sm:text-sm mt-2 opacity-90">Next 3 days</p>
        </div>

        <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Pending Items
          </h3>
          <p className="text-3xl sm:text-4xl font-bold">
            {pendingItems.length}
          </p>
          <p className="text-xs sm:text-sm mt-2 opacity-90">Shopping list</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white sm:col-span-2 md:col-span-1">
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Your Balance
          </h3>
          <p className="text-3xl sm:text-4xl font-bold">
            ₦{(currentUserBalance?.balance ?? 0) >= 0 ? '+' : ''}
            {currentUserBalance?.balance?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs sm:text-sm mt-2 opacity-90">
            {(currentUserBalance?.balance ?? 0) >= 0
              ? 'You are owed'
              : 'You owe'}
          </p>
        </div>
      </div>

      {/* Upcoming Meals Section */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Upcoming Meals
          </h2>
          <Link
            to="/meal-planner"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            View All →
          </Link>
        </div>

        {upcomingMeals.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            No upcoming meals planned
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingMeals.slice(0, 5).map((meal) => (
              <div
                key={meal.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {meal.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {format(new Date(meal.date), 'EEEE, MMM d')} •{' '}
                    {meal.mealType}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Assigned to
                  </p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {meal.assignedTo.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping List Quick View */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Shopping List
          </h2>
          <Link
            to="/shopping-list"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            View All →
          </Link>
        </div>

        {pendingItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            All items purchased!
          </p>
        ) : (
          <div className="space-y-2">
            {pendingItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {item.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.quantity} {item.category && `• ${item.category}`}
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  Added by {item.addedBy.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Household Members */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Household Members
          </h2>
          <Link
            to="/household"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            Manage →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {household?.members?.map((member) => (
            <div
              key={member.id}
              className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl mx-auto mb-2">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {member.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                @{member.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
