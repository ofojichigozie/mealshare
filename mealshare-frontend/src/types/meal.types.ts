export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Meal {
  id: string;
  name: string;
  date: string;
  mealType: MealType;
  assignedTo: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  householdId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMealDto {
  name: string;
  date: string;
  mealType: MealType;
  assignedTo: string;
}

export interface UpdateMealDto {
  name?: string;
  date?: string;
  mealType?: MealType;
  assignedTo?: string;
}
