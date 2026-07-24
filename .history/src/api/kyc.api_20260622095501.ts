import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { KYCStatus } from '../types/agent.types';

export interface KYCSubmission {
  agent: {
    _id: string;
    kycStatus: KYCStatus;
    kycDocuments: string[];
    kycRejectionReason?: string;
    createdAt: string;
  };
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  listingCount: number;
}

// Shape returned by GET /api/kyc/status
export interface KYCStatusData {
  kycStatus: KYCStatus;
  kycRejectionReason?: string;
  verifiedAt?: string;
}

export const kycApi = {
  // ── Agent routes (/api/kyc/*) ─────────────────────────────────────────────

  submitKYC: async (document: File, selfie: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('document', document);
    formData.append('selfie', selfie);
    const { data } = await api.post('/kyc/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Returns { kycStatus, kycRejectionReason, verifiedAt } — NOT { agent }
  getKYCStatus: async (): Promise<ApiResponse<KYCStatusData>> => {
    const { data } = await api.get('/kyc/status');
    return data;
  },

  resubmitKYC: async (): Promise<ApiResponse> => {
    const { data } = await api.post('/kyc/resubmit');
    return data;
  },

  // ── Admin routes (/api/admin/*) ───────────────────────────────────────────

  getAllKYC: async (): Promise<ApiResponse<{ agents: KYCSubmission[] }>> => {
    const { data } = await api.get('/admin/agents', {
      params: { kycStatus: 'pending' },
    });
    return data;
  },

  approveKYC: async (agentId: string): Promise<ApiResponse> => {
    const { data } = await api.patch(`/admin/agents/${agentId}/approve-kyc`);
    return data;
  },

  rejectKYC: async (agentId: string, reason: string): Promise<ApiResponse> => {
    const { data } = await api.patch(`/admin/agents/${agentId}/reject-kyc`, { reason });
    return data;
  },

  getKYCDocumentUrls: async (agentId: string): Promise<ApiResponse<{ signedUrls: string[] }>> => {
    const { data } = await api.get(`/admin/agents/${agentId}/kyc-doc-url`);
    return data;
  },
};