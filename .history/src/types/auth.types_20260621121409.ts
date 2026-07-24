export type UserRole = 'seeker' | 'agent' | 'admin' | 'superadmin';
export type AdminStatus = 'pending' | 'approved' | 'rejected';

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  /**
   * Only present when role === 'admin'.
   * 'pending'  → awaiting superadmin approval
   * 'approved' → can access admin routes
   * 'rejected' → denied; cannot log in
   */
  adminStatus?: AdminStatus;
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