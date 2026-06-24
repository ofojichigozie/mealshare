import api from './api';
import type { Meal, CreateMealDto, UpdateMealDto } from '../types/meal.types';
import type { ApiResponse } from '../types/api.types';

export const mealsService = {
  getAll: async (
    householdId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Meal[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<any, ApiResponse<Meal[]>>(
      `/households/${householdId}/meals?${params.toString()}`
    );
    return response.data;
  },

  create: async (householdId: string, data: CreateMealDto): Promise<Meal> => {
    const response = await api.post<any, ApiResponse<Meal>>(
      `/households/${householdId}/meals`,
      data
    );
    return response.data;
  },

  update: async (
    householdId: string,
    mealId: string,
    data: UpdateMealDto
  ): Promise<Meal> => {
    const response = await api.put<any, ApiResponse<Meal>>(
      `/households/${householdId}/meals/${mealId}`,
      data
    );
    return response.data;
  },

  delete: async (householdId: string, mealId: string): Promise<void> => {
    await api.delete(`/households/${householdId}/meals/${mealId}`);
  },
};
