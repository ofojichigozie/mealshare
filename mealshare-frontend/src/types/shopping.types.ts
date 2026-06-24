export type ShoppingCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'pantry'
  | 'beverages'
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category?: ShoppingCategory;
  estimatedPrice?: number;
  isPurchased: boolean;
  addedBy: {
    id: string;
    name: string;
  };
  householdId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateItemDto {
  name: string;
  quantity?: string;
  category?: ShoppingCategory;
  estimatedPrice?: number;
}

export interface UpdateItemDto {
  name?: string;
  quantity?: string;
  category?: ShoppingCategory;
  isPurchased?: boolean;
  estimatedPrice?: number;
}
