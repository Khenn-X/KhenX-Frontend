import { create } from 'zustand';
import { IUser } from '../types/auth.types';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user: IUser) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;
export const selectIsAgent = (state: AuthState) => state.user?.role === 'agent';
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectIsEmailVerified = (state: AuthState) => state.user?.isEmailVerified ?? false;