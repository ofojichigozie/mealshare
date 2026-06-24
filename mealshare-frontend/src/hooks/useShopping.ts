import { useState, useCallback } from 'react';
import { useShoppingStore } from '../store/shoppingStore';
import { shoppingService } from '../services/shopping.service';
import { notify } from '../utils/notification';
import type {
  ShoppingItem,
  CreateItemDto,
  UpdateItemDto,
} from '../types/shopping.types';

interface UseShoppingReturn {
  items: ShoppingItem[];
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchItems: (householdId: string) => Promise<void>;
  createItem: (
    householdId: string,
    data: CreateItemDto
  ) => Promise<ShoppingItem | null>;
  updateItem: (
    householdId: string,
    itemId: string,
    data: UpdateItemDto
  ) => Promise<ShoppingItem | null>;
  deleteItem: (householdId: string, itemId: string) => Promise<boolean>;
  togglePurchased: (
    householdId: string,
    item: ShoppingItem
  ) => Promise<boolean>;
  clearItems: () => void;
}

export const useShopping = (): UseShoppingReturn => {
  const {
    items,
    setItems,
    addItem,
    updateItem: updateItemInStore,
    removeItem,
    clearItems,
  } = useShoppingStore();

  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading = isFetching || isCreating || isUpdating || isDeleting;

  const fetchItems = useCallback(
    async (householdId: string) => {
      try {
        setIsFetching(true);
        setError(null);
        const itemsData = await shoppingService.getAll(householdId);
        setItems(itemsData);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load shopping list';
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setIsFetching(false);
      }
    },
    [setItems]
  );

  const createItem = useCallback(
    async (
      householdId: string,
      data: CreateItemDto
    ): Promise<ShoppingItem | null> => {
      try {
        setIsCreating(true);
        setError(null);
        const item = await shoppingService.create(householdId, data);
        addItem(item);
        notify.success('Item added successfully!');
        return item;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add item';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [addItem]
  );

  const updateItem = useCallback(
    async (
      householdId: string,
      itemId: string,
      data: UpdateItemDto
    ): Promise<ShoppingItem | null> => {
      try {
        setIsUpdating(true);
        setError(null);
        const updatedItem = await shoppingService.update(
          householdId,
          itemId,
          data
        );
        updateItemInStore(itemId, updatedItem);
        notify.success('Item updated successfully!');
        return updatedItem;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update item';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateItemInStore]
  );

  const deleteItem = useCallback(
    async (householdId: string, itemId: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);
        await shoppingService.delete(householdId, itemId);
        removeItem(itemId);
        notify.success('Item deleted successfully!');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete item';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [removeItem]
  );

  const togglePurchased = useCallback(
    async (householdId: string, item: ShoppingItem): Promise<boolean> => {
      try {
        setIsUpdating(true);
        setError(null);
        const isPurchasing = !item.isPurchased;
        const updatedItem = await shoppingService.update(householdId, item.id, {
          isPurchased: isPurchasing,
        });
        updateItemInStore(item.id, updatedItem);
        notify.success(
          isPurchasing
            ? 'Item marked as purchased'
            : 'Item marked as unpurchased'
        );
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update item';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateItemInStore]
  );

  return {
    items,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    togglePurchased,
    clearItems,
  };
};
