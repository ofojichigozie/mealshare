import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { socketService } from '../services/socket.service';
import { notify } from '../utils/notification';
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
} from '../types/user.types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<AuthResponse | null>;
  register: (data: RegisterDto) => Promise<AuthResponse | null>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    isAuthenticated,
    isLoading: isInitializing,
    setUser,
    setToken,
    logout: logoutFromStore,
    initialize,
  } = useAuthStore();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General loading state (true if any operation is in progress)
  const isLoading = isLoggingIn || isRegistering || isLoggingOut;

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(
    async (data: LoginDto): Promise<AuthResponse | null> => {
      try {
        setIsLoggingIn(true);
        setError(null);
        const response = await authService.login(data);
        setUser(response.user);
        setToken(response.token);
        socketService.connect(response.token);
        notify.success('Login successful!');
        return response;
      } catch (error: any) {
        const errorMessage = error.message || 'Login failed';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [setUser, setToken]
  );

  const register = useCallback(
    async (data: RegisterDto): Promise<AuthResponse | null> => {
      try {
        setIsRegistering(true);
        setError(null);
        const response = await authService.register(data);
        setUser(response.user);
        setToken(response.token);
        socketService.connect(response.token);
        notify.success('Registration successful!');
        return response;
      } catch (error: any) {
        const errorMessage = error.message || 'Registration failed';
        setError(errorMessage);
        notify.error(errorMessage);
        return null;
      } finally {
        setIsRegistering(false);
      }
    },
    [setUser, setToken]
  );

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    try {
      logoutFromStore();
      notify.success('Logged out successfully');
    } catch (error: any) {
      notify.error('Error during logout');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logoutFromStore]);

  return {
    user,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};
