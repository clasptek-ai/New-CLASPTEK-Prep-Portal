import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  setUser: (user: UserSession | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
