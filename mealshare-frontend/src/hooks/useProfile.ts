import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { usersService } from '../services/users.service';
import { notify } from '../utils/notification';
import type { UpdateUserDto } from '../services/users.service';

interface UseProfileReturn {
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  error: string | null;
  updateProfile: (data: UpdateUserDto) => Promise<boolean>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<boolean>;
}

export const useProfile = (): UseProfileReturn => {
  const { setUser } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (data: UpdateUserDto): Promise<boolean> => {
      try {
        setIsUpdatingProfile(true);
        setError(null);
        const updatedUser = await usersService.updateProfile(data);
        setUser(updatedUser);
        notify.success('Profile updated successfully');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update profile';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [setUser]
  );

  const changePassword = useCallback(
    async (data: {
      currentPassword: string;
      newPassword: string;
    }): Promise<boolean> => {
      try {
        setIsChangingPassword(true);
        setError(null);
        await usersService.updateProfile({
          currentPassword: data.currentPassword,
          password: data.newPassword,
        });
        notify.success('Password changed successfully');
        return true;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to change password';
        setError(errorMessage);
        notify.error(errorMessage);
        return false;
      } finally {
        setIsChangingPassword(false);
      }
    },
    []
  );

  return {
    isUpdatingProfile,
    isChangingPassword,
    error,
    updateProfile,
    changePassword,
  };
};
