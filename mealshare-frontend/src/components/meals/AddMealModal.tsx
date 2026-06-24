import { useState } from 'react';
import { useHousehold } from '../../hooks/useHousehold';
import { useMeals } from '../../hooks';
import type { MealType } from '../../types/meal.types';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  date: string;
  mealType: MealType;
}

export const AddMealModal = ({
  isOpen,
  onClose,
  onSuccess,
  date,
  mealType,
}: AddMealModalProps) => {
  const { household } = useHousehold();
  const { createMeal, isCreating } = useMeals();
  const [formData, setFormData] = useState({
    name: '',
    assignedTo: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;

    const meal = await createMeal(household.id, {
      name: formData.name,
      date,
      mealType,
      assignedTo: formData.assignedTo,
    });

    if (meal) {
      onSuccess();
      onClose();
      setFormData({ name: '', assignedTo: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Meal</h2>

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
              placeholder="e.g., Spaghetti Carbonara"
              required
            />
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
              <option value="">Select a member</option>
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
              disabled={isCreating}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
