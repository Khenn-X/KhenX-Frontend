import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { queryKeys } from '../constants/queryKeys';
import { ROUTES } from '../constants/routes';
import { useAuthStore } from '../store/auth.store';
import type { LoginPayload, SignupPayload, ForgotPasswordPayload, ResetPasswordPayload } from '../types/auth.types';

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await authApi.getMe();
      setUser(res.data.user);
      return res.data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res) => {
      // ── DEBUG: paste this and check your browser console ──
      console.log('LOGIN FULL RESPONSE:', res);
      console.log('res.data:', res.data);
      console.log('res.data.user:', res.data?.user);
      console.log('res.data.data:', res.data?.data);
      console.log('res.data.data.user:', res.data?.data?.user);
      // ──────────────────────────────────────────────────────

      // Figure out where user actually lives:
      const user = res.data?.user ?? res.data?.data?.user;
      console.log('RESOLVED USER:', user);
      console.log('ROLE:', user?.role);

      setUser(user);
      queryClient.setQueryData(queryKeys.auth.me, user);

      const role = user?.role;
      if (role === 'superadmin') navigate(ROUTES.SUPERADMIN_DASHBOARD);
      else if (role === 'admin')  navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === 'agent')  navigate(ROUTES.AGENT_DASHBOARD);
      else navigate(ROUTES.HOME);
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: () => {
      // After signup, user must verify email — send to login with message
      navigate(ROUTES.LOGIN, {
        state: { message: 'Account created! Please check your email to verify your account.' },
      });
    },
  });
};

export const useLogout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // Even if the API call fails, clear local state
      clearUser();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
};

export const useVerifyEmail = (token: string) => {
  return useQuery({
    queryKey: ['auth', 'verify-email', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });
};

export const useResetPassword = (token: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(token, payload),
    onSuccess: () => {
      navigate(ROUTES.LOGIN, {
        state: { message: 'Password reset successfully. Please log in.' },
      });
    },
  });
};


// ─── Convenience hook used by components ─────────────────────────────────────
export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  return {
    user,
    isAuthenticated: !!user,
  };
};