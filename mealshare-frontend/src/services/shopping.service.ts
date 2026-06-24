import api from './api';
import type {
  ShoppingItem,
  CreateItemDto,
  UpdateItemDto,
} from '../types/shopping.types';
import type { ApiResponse } from '../types/api.types';

export const shoppingService = {
  getAll: async (householdId: string): Promise<ShoppingItem[]> => {
    const response = await api.get<any, ApiResponse<ShoppingItem[]>>(
      `/households/${householdId}/shopping-list`
    );
    // Transform estimatedPrice from string to number
    const items = response.data.map((item) => ({
      ...item,
      estimatedPrice: item.estimatedPrice
        ? parseFloat(item.estimatedPrice as any)
        : undefined,
    }));
    return items;
  },

  create: async (
    householdId: string,
    data: CreateItemDto
  ): Promise<ShoppingItem> => {
    const response = await api.post<any, ApiResponse<ShoppingItem>>(
      `/households/${householdId}/shopping-list`,
      data
    );
    // Transform estimatedPrice from string to number
    const item = {
      ...response.data,
      estimatedPrice: response.data.estimatedPrice
        ? parseFloat(response.data.estimatedPrice as any)
        : undefined,
    };
    return item;
  },

  update: async (
    householdId: string,
    itemId: string,
    data: UpdateItemDto
  ): Promise<ShoppingItem> => {
    const response = await api.put<any, ApiResponse<ShoppingItem>>(
      `/households/${householdId}/shopping-list/${itemId}`,
      data
    );
    // Transform estimatedPrice from string to number
    const item = {
      ...response.data,
      estimatedPrice: response.data.estimatedPrice
        ? parseFloat(response.data.estimatedPrice as any)
        : undefined,
    };
    return item;
  },

  delete: async (householdId: string, itemId: string): Promise<void> => {
    await api.delete(`/households/${householdId}/shopping-list/${itemId}`);
  },
};
