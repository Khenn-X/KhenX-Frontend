import api from "./axios";
import type { ApiResponse } from "../types/api.types";
import type {
  IUser,
  SignupPayload,
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/auth.types";

export const authApi = {
  signup: async (
    payload: SignupPayload,
  ): Promise<ApiResponse<{ user: IUser }>> => {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },

  login: async (
    payload: LoginPayload,
  ): Promise<ApiResponse<{
    data: any; user: IUser 
}>> => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  logout: async (): Promise<ApiResponse> => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  getMe: async (): Promise<ApiResponse<{ user: IUser }>> => {
    const { data } = await api.get("/auth/me", {
      skipAuthRedirect: true,
    } as any);
    return data;
  },
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    return data;
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<ApiResponse> => {
    const { data } = await api.post("/auth/forgot-password", payload);
    return data;
  },

  resetPassword: async (
    token: string,
    payload: ResetPasswordPayload,
  ): Promise<ApiResponse> => {
    const { data } = await api.post(`/auth/reset-password/${token}`, payload);
    return data;
  },
};
