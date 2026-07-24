export type UserRole = 'seeker' | 'agent' | 'admin' | 'superadmin';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request Payloads ────────────────────────────────────────────────────────

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  role?: 'seeker' | 'agent' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
}
