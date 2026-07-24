import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from './../types';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: IUser) =>
        set({ user, isAuthenticated: true }),

      clearUser: () =>
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'khenx-auth', // localStorage key
      // Only persist user identity — never tokens (cookie handles that)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Selectors (use these in components for memoized access) ─────────────────
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserRole = (state: AuthState) => state.user?.role ?? null;
export const selectIsAgent = (state: AuthState) => state.user?.role === 'agent';
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectIsEmailVerified = (state: AuthState) => state.user?.isEmailVerified ?? false;
