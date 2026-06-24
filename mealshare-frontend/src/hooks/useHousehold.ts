import { useEffect, useState, useCallback } from 'react';
import { useHouseholdStore } from '../store/householdStore';
import { householdService } from '../services/household.service';
import { notify } from '../utils/notification';
import type {
  Household,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  AddMemberDto,
} from '../types/household.types';

interface UseHouseholdReturn {
  household: Household | null;
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isAddingMember: boolean;
  isRemovingMember: boolean;
  isLeaving: boolean;
  error: string | null;
  fetchHousehold: () => Promise<void>;
  createHousehold: (data: CreateHouseholdDto) => Promise<Household | null>;
  updateHousehold: (
    householdId: string,
    data: UpdateHouseholdDto
  ) => Promise<Household | null>;
  addMember: (householdId: string, data: AddMemberDto) => Promise<boolean>;
  removeMember: (householdId: string, userId: string) => Promise<boolean>;
  leaveHousehold: (householdId: string) => Promise<boolean>;
  clearHousehold: () => void;
}

export const useHousehold = (): UseHouseholdReturn => {
  const { household, setHousehold, clearHousehold } = useHouseholdStore();

  const [isFetching, setIsFetching] = useState(!household);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading =
    isFetching ||
    isCreating ||
    isUpdating ||
    isAddingMember ||
    isRemovingMember ||
    isLeaving;

  useEffect(() => {
    const loadHousehold = async () => {
      // If household is already loaded, don't reload
      if (household) {
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        setError(null);
        const householdData = await householdService.getMyHousehold();
        setHousehold(householdData);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load household';
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setIsFetching(false);
      }
    };

    loadHousehold();
  }, [household, setHousehold]);

  const fetchHousehold = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const householdData = await householdService.getMyHousehold();
      setHousehold(householdData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load household';
      setError(errorMessage);
      notify.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  }, [setHousehold]);

  const createHousehold = useCallback(
    async (data: CreateHouseholdDto): Promise<Household | null> => {
      try {
        setIsCreating(true);
        setError(null);
        const newHousehold = await householdService.create(data);
        setHousehold(newHousehold);
        notify.success('Household created successfully!');
        return newHousehold;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create household';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [setHousehold]
  );

  const updateHousehold = useCallback(
    async (
      householdId: string,
      data: UpdateHouseholdDto
    ): Promise<Household | null> => {
      try {
        setIsUpdating(true);
        setError(null);
        const updatedHousehold = await householdService.update(
          householdId,
          data
        );
        setHousehold(updatedHousehold);
        notify.success('Household updated successfully!');
        return updatedHousehold;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update household';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [setHousehold]
  );

  const addMember = useCallback(
    async (householdId: string, data: AddMemberDto): Promise<boolean> => {
      try {
        setIsAddingMember(true);
        setError(null);
        await householdService.addMember(householdId, data);
        // Refetch household to get updated members list
        await fetchHousehold();
        notify.success('Member added successfully!');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add member';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsAddingMember(false);
      }
    },
    [fetchHousehold]
  );

  const removeMember = useCallback(
    async (householdId: string, userId: string): Promise<boolean> => {
      try {
        setIsRemovingMember(true);
        setError(null);
        await householdService.removeMember(householdId, userId);
        // Refetch household to get updated members list
        await fetchHousehold();
        notify.success('Member removed successfully!');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to remove member';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsRemovingMember(false);
      }
    },
    [fetchHousehold]
  );

  const leaveHousehold = useCallback(
    async (householdId: string): Promise<boolean> => {
      try {
        setIsLeaving(true);
        setError(null);
        await householdService.leave(householdId);
        clearHousehold();
        notify.success('You have left the household');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to leave household';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsLeaving(false);
      }
    },
    [clearHousehold]
  );

  return {
    household,
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isAddingMember,
    isRemovingMember,
    isLeaving,
    error,
    fetchHousehold,
    createHousehold,
    updateHousehold,
    addMember,
    removeMember,
    leaveHousehold,
    clearHousehold,
  };
};
