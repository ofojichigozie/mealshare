import type { ShoppingItem } from '../../types/shopping.types';

interface ShoppingItemCardProps {
  item: ShoppingItem;
  onTogglePurchased: () => void;
  onDelete: () => void;
}

export const ShoppingItemCard = ({
  item,
  onTogglePurchased,
  onDelete,
}: ShoppingItemCardProps) => {
  return (
    <div
      className={`card transition-all ${
        item.isPurchased ? 'bg-gray-50 opacity-75' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={item.isPurchased}
            onChange={onTogglePurchased}
            className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
          />
          <div className="flex-1">
            <h3
              className={`font-semibold text-lg ${
                item.isPurchased
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}
            >
              {item.name}
            </h3>
            {item.quantity && (
              <p className="text-sm text-gray-600 mt-1">{item.quantity}</p>
            )}
          </div>
        </div>

        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {item.category && (
          <div className="flex items-center text-gray-600">
            <span className="font-medium mr-2">Category:</span>
            <span className="px-2 py-1 bg-secondary-100 text-secondary-800 rounded-full text-xs">
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-gray-600">
          <span>
            <span className="font-medium">Added by:</span> {item.addedBy.name}
          </span>
          {item.estimatedPrice && (
            <span className="text-gray-500">
              ~₦{item.estimatedPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
