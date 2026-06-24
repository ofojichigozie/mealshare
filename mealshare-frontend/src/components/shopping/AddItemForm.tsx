import { useState } from 'react';
import { useHousehold } from '../../hooks/useHousehold';
import { useShopping } from '../../hooks';
import type { ShoppingCategory } from '../../types/shopping.types';

interface AddItemFormProps {
  onSuccess: () => void;
}

export const AddItemForm = ({ onSuccess }: AddItemFormProps) => {
  const { household } = useHousehold();
  const { createItem, isCreating } = useShopping();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: '' as ShoppingCategory | '',
    estimatedPrice: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Submitting item');
    console.log('Found house hold', household);

    e.preventDefault();
    if (!household) return;

    const item = await createItem(household.id, {
      name: formData.name,
      quantity: formData.quantity || undefined,
      category: formData.category || undefined,
      estimatedPrice: formData.estimatedPrice
        ? parseFloat(formData.estimatedPrice)
        : undefined,
    });

    if (item) {
      setFormData({ name: '', quantity: '', category: '', estimatedPrice: '' });
      setIsExpanded(false);
      onSuccess();
    }
  };

  const categories: ShoppingCategory[] = [
    'produce',
    'dairy',
    'meat',
    'pantry',
    'beverages',
    'other',
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="e.g., Milk"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="text"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="input-field"
              placeholder="e.g., 2 liters, 1 dozen"
            />
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ShoppingCategory,
                  })
                }
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedPrice}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedPrice: e.target.value })
                }
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {isExpanded ? 'Show Less' : 'Show More Options'}
          </button>

          <button type="submit" className="btn-primary" disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};
