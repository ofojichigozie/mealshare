import { useState, useEffect } from 'react';
import { useHousehold } from '../../hooks/useHousehold';
import { useMeals } from '../../hooks';
import type { Meal, MealType } from '../../types/meal.types';
import { format } from 'date-fns';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meal: Meal;
}

export const EditMealModal = ({
  isOpen,
  onClose,
  onSuccess,
  meal,
}: EditMealModalProps) => {
  const { household } = useHousehold();
  const { updateMeal, isUpdating } = useMeals();
  const [formData, setFormData] = useState({
    name: meal.name,
    date: format(new Date(meal.date), 'yyyy-MM-dd'),
    mealType: meal.mealType as MealType,
    assignedTo: meal.assignedTo.id,
  });

  useEffect(() => {
    setFormData({
      name: meal.name,
      date: format(new Date(meal.date), 'yyyy-MM-dd'),
      mealType: meal.mealType,
      assignedTo: meal.assignedTo.id,
    });
  }, [meal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;

    const updatedMeal = await updateMeal(household.id, meal.id, formData);

    if (updatedMeal) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Meal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Type
            </label>
            <select
              value={formData.mealType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mealType: e.target.value as MealType,
                })
              }
              className="input-field"
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              className="input-field"
              required
            >
              {household?.members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
