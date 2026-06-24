import { useState } from 'react';
import { useHousehold } from '../../hooks';

interface CreateHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateHouseholdModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateHouseholdModalProps) => {
  const [name, setName] = useState('');
  const { createHousehold, isCreating } = useHousehold();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const household = await createHousehold({ name });

    if (household) {
      // Update user in localStorage with householdId
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.householdId = household.id;
      localStorage.setItem('user', JSON.stringify(user));

      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Create Household
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="householdName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Household Name
              </label>
              <input
                type="text"
                id="householdName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g., Smith Family, Apartment 3B"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
