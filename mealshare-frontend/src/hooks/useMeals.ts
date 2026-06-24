import { useState, useCallback } from 'react';
import { useMealsStore } from '../store/mealsStore';
import { mealsService } from '../services/meals.service';
import { notify } from '../utils/notification';
import type { Meal, CreateMealDto, UpdateMealDto } from '../types/meal.types';

interface UseMealsReturn {
  meals: Meal[];
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  fetchMeals: (
    householdId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  createMeal: (
    householdId: string,
    data: CreateMealDto
  ) => Promise<Meal | null>;
  updateMeal: (
    householdId: string,
    mealId: string,
    data: UpdateMealDto
  ) => Promise<Meal | null>;
  deleteMeal: (householdId: string, mealId: string) => Promise<boolean>;
  clearMeals: () => void;
}

export const useMeals = (): UseMealsReturn => {
  const {
    meals,
    setMeals,
    addMeal,
    updateMeal: updateMealInStore,
    removeMeal,
    clearMeals,
  } = useMealsStore();

  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading = isFetching || isCreating || isUpdating || isDeleting;

  const fetchMeals = useCallback(
    async (householdId: string, startDate?: string, endDate?: string) => {
      try {
        setIsFetching(true);
        setError(null);
        const mealsData = await mealsService.getAll(
          householdId,
          startDate,
          endDate
        );
        setMeals(mealsData);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load meals';
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setIsFetching(false);
      }
    },
    [setMeals]
  );

  const createMeal = useCallback(
    async (householdId: string, data: CreateMealDto): Promise<Meal | null> => {
      try {
        setIsCreating(true);
        setError(null);
        const meal = await mealsService.create(householdId, data);
        addMeal(meal);
        notify.success('Meal added successfully!');
        return meal;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add meal';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [addMeal]
  );

  const updateMeal = useCallback(
    async (
      householdId: string,
      mealId: string,
      data: UpdateMealDto
    ): Promise<Meal | null> => {
      try {
        setIsUpdating(true);
        setError(null);
        const updatedMeal = await mealsService.update(
          householdId,
          mealId,
          data
        );
        updateMealInStore(mealId, updatedMeal);
        notify.success('Meal updated successfully!');
        return updatedMeal;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update meal';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateMealInStore]
  );

  const deleteMeal = useCallback(
    async (householdId: string, mealId: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);
        await mealsService.delete(householdId, mealId);
        removeMeal(mealId);
        notify.success('Meal deleted successfully!');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete meal';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [removeMeal]
  );

  return {
    meals,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    clearMeals,
  };
};
