import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import type { Meal, MealType } from '../types/meal.types';
import { AddMealModal } from '../components/meals/AddMealModal';
import { EditMealModal } from '../components/meals/EditMealModal';

export const MealPlanner = () => {
  const { household, isLoading: householdLoading } = useHousehold();
  const { meals, fetchMeals, deleteMeal, isFetching } = useMeals();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>('breakfast');

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (household && !householdLoading) {
      loadMeals();
    }
  }, [household, householdLoading]);

  const loadMeals = async () => {
    if (!household) return;

    const startDate = format(weekDays[0], 'yyyy-MM-dd');
    const endDate = format(weekDays[6], 'yyyy-MM-dd');
    await fetchMeals(household.id, startDate, endDate);
  };

  const getMealsForDate = (date: Date, mealType: MealType) => {
    return meals.filter(
      (meal) =>
        isSameDay(new Date(meal.date), date) && meal.mealType === mealType
    );
  };

  const handleAddMeal = (date: Date, mealType: MealType) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    setSelectedMealType(mealType);
    setShowAddModal(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
  };

  const handleDeleteMeal = async (meal: Meal) => {
    if (!household) return;

    if (!confirm(`Are you sure you want to delete "${meal.name}"?`)) return;

    await deleteMeal(household.id, meal.id);
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

  // Reusable meal card renderer
  const renderMealCard = (meal: Meal) => (
    <div
      key={meal.id}
      className="bg-primary-50 border border-primary-200 rounded-lg p-3 group hover:border-primary-300 transition-colors"
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-sm text-gray-900 flex-1 pr-2">
          {meal.name}
        </h4>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={() => handleEditMeal(meal)}
            className="text-primary-600 hover:text-primary-700 transition-colors"
            aria-label="Edit meal"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteMeal(meal)}
            className="text-red-600 hover:text-red-700 transition-colors"
            aria-label="Delete meal"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-600">{meal.assignedTo.name}</p>
    </div>
  );

  if (isFetching || householdLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meal planner...</p>
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Meal Planning
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be part of a household to plan meals and share
              responsibilities.
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
    <>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Meal Planner
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Plan your meals for the week
            </p>
          </div>
        </div>

        {/* Unified Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {weekDays.map((day) => (
            <div key={day.toString()} className="card">
              <div className="mb-4 pb-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  {format(day, 'EEEE')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {format(day, 'MMMM d, yyyy')}
                </p>
              </div>

              <div className="space-y-4">
                {mealTypes.map((mealType) => {
                  const mealsForSlot = getMealsForDate(day, mealType);
                  return (
                    <div key={`${day}-${mealType}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700 capitalize text-sm">
                          {mealType}
                        </h4>
                      </div>

                      {mealsForSlot.length === 0 ? (
                        <button
                          onClick={() => handleAddMeal(day, mealType)}
                          className="w-full bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-gray-400 text-sm">+ Add meal</p>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {mealsForSlot.map((meal) => renderMealCard(meal))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddMealModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadMeals}
        date={selectedDate}
        mealType={selectedMealType}
      />

      {editingMeal && (
        <EditMealModal
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          onSuccess={loadMeals}
          meal={editingMeal}
        />
      )}
    </>
  );
};
