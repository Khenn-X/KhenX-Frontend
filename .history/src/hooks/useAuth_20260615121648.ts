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
      setUser(res.data.user);
      queryClient.setQueryData(queryKeys.auth.me, res.data.user);

      const role = res.data.user.role;
      if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === 'agent') navigate(ROUTES.AGENT_DASHBOARD);
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
