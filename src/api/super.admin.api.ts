import axios from './axios';
import type { ApiResponse } from '../types/api.types';

export interface AdminRequest {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin';
  adminApprovalStatus: 'pending' | 'approved' | 'rejected'; // ← matches backend field name
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRequestsData {
  requests: AdminRequest[]; // ← backend sends `requests`, not `admins`
}

export interface CreateAdminPayload {
  fullName: string;
  email: string;
}

export const superadminApi = {
  /**
   * POST /api/admin/users
   * Backend requires role: superadmin (double-checked via requireRole middleware)
   */
  createAdmin: (payload: CreateAdminPayload) =>
    axios.post<ApiResponse<{ user: { _id: string; fullName: string; email: string; role: 'admin'; adminApprovalStatus: 'approved' } }>>('/admin/users', payload),

  /**
   * GET /api/admin/admin-requests
   * Kept for compatibility, but the UI is now direct-create driven.
   */
  getPendingAdmins: () =>
    axios.get<ApiResponse<AdminRequestsData>>('/admin/admin-requests'),

  /**
   * PATCH /api/admin/admin-requests/:id/approve
   */
  approveAdmin: (id: string) =>
    axios.patch<ApiResponse<{ user: AdminRequest }>>(`/admin/admin-requests/${id}/approve`),

  /**
   * PATCH /api/admin/admin-requests/:id/reject
   * Backend requires a `reason` in the body
   */
  rejectAdmin: (id: string, reason: string) =>
    axios.patch<ApiResponse<{ user: AdminRequest }>>(`/admin/admin-requests/${id}/reject`, { reason }),
};