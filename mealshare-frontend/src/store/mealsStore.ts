import { create } from 'zustand';
import type { Meal } from '../types/meal.types';

interface MealsState {
  meals: Meal[];
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  removeMeal: (id: string) => void;
  clearMeals: () => void;
}

export const useMealsStore = create<MealsState>((set) => ({
  meals: [],

  setMeals: (meals) => set({ meals }),

  addMeal: (meal) =>
    set((state) => ({
      meals: [...state.meals, meal],
    })),

  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((meal) =>
        meal.id === id ? { ...meal, ...updates } : meal
      ),
    })),

  removeMeal: (id) =>
    set((state) => ({
      meals: state.meals.filter((meal) => meal.id !== id),
    })),

  clearMeals: () => set({ meals: [] }),
}));
