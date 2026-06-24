import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHousehold } from '../hooks/useHousehold';
import { useShopping } from '../hooks';
import type { ShoppingItem } from '../types/shopping.types';
import { AddItemForm } from '../components/shopping/AddItemForm';
import { ShoppingItemCard } from '../components/shopping/ShoppingItemCard';

type FilterType = 'all' | 'pending' | 'purchased';

export const ShoppingList = () => {
  const { household, isLoading: householdLoading } = useHousehold();
  const { items, fetchItems, togglePurchased, deleteItem, isFetching } =
    useShopping();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (household && !householdLoading) {
      loadItems();
    }
  }, [household, householdLoading]);

  const loadItems = async () => {
    if (!household) return;
    await fetchItems(household.id);
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    if (!household) return;

    await togglePurchased(household.id, item);
  };

  const handleDeleteItem = async (item: ShoppingItem) => {
    if (!household) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    await deleteItem(household.id, item.id);
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.isPurchased;
    if (filter === 'purchased') return item.isPurchased;
    return true;
  });

  const pendingCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;

  if (isFetching || householdLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shopping list...</p>
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Shopping List
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be part of a household to manage shared shopping
              lists.
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shopping List
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {pendingCount} pending, {purchasedCount} purchased
          </p>
        </div>
      </div>

      {/* Add Item Form */}
      <AddItemForm onSuccess={loadItems} />

      {/* Filter Tabs */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            filter === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('purchased')}
          className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
            filter === 'purchased'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Purchased ({purchasedCount})
        </button>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500 text-sm sm:text-base">
            No items to display
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ShoppingItemCard
              key={item.id}
              item={item}
              onTogglePurchased={() => handleTogglePurchased(item)}
              onDelete={() => handleDeleteItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
