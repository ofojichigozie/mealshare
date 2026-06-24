import { create } from 'zustand';
import type { Household } from '../types/household.types';

interface HouseholdState {
  household: Household | null;
  setHousehold: (household: Household | null) => void;
  updateHousehold: (updates: Partial<Household>) => void;
  clearHousehold: () => void;
}

export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: null,

  setHousehold: (household) => set({ household }),

  updateHousehold: (updates) =>
    set((state) => ({
      household: state.household ? { ...state.household, ...updates } : null,
    })),

  clearHousehold: () => set({ household: null }),
}));
