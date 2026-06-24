import { create } from 'zustand';
import type { User } from '../types/user.types';
import { authService } from '../services/auth.service';
import { socketService } from '../services/socket.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  logout: () => {
    authService.logout();
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();

    if (token && user) {
      set({ user, token, isAuthenticated: true, isLoading: false });
      socketService.connect(token);
    } else {
      set({ isLoading: false });
    }
  },
}));
