import axios from './axios'; // your existing axios instance
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { IUser } from '../types/auth.types';

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface AdminRequest {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin';
  adminStatus: 'pending' | 'approved' | 'rejected';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRequestsData {
  admins: AdminRequest[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const superadminApi = {
  /**
   * GET /api/superadmin/admin-requests
   * Returns all admin accounts with status 'pending'.
   */
  getPendingAdmins: () =>
    axios.get<ApiResponse<AdminRequestsData>>('/superadmin/admin-requests'),

  /**
   * PATCH /api/superadmin/admin-requests/:id/approve
   */
  approveAdmin: (id: string) =>
    axios.patch<ApiResponse<{ admin: AdminRequest }>>(`/superadmin/admin-requests/${id}/approve`),

  /**
   * PATCH /api/superadmin/admin-requests/:id/reject
   */
  rejectAdmin: (id: string) =>
    axios.patch<ApiResponse<{ admin: AdminRequest }>>(`/superadmin/admin-requests/${id}/reject`),
};