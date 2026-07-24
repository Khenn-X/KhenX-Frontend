import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IAgent } from '../types/agent.types';

export interface KYCSubmission {
  _id: string;
  userId: string;
  agentId: string;
  kycStatus: string;
  kycDocuments: string[];
  kycRejectionReason?: string;
  createdAt: string;
}

export const kycApi = {
  // Agent — submit KYC documents (document + selfie as multipart)
  submitKYC: async (document: File, selfie: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('document', document);
    formData.append('selfie', selfie);

    const { data } = await api.post('/kyc/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Agent — get own KYC status
  getKYCStatus: async (): Promise<ApiResponse<{ agent: IAgent }>> => {
    const { data } = await api.get('/kyc/status');
    return data;
  },

  // Admin only — get all pending KYC submissions
  getAllKYC: async (): Promise<ApiResponse<{ submissions: KYCSubmission[] }>> => {
    const { data } = await api.get('/kyc');
    return data;
  },

  // Admin only — approve an agent's KYC
  approveKYC: async (agentId: string): Promise<ApiResponse> => {
    const { data } = await api.patch(`/kyc/${agentId}/approve`);
    return data;
  },

  // Admin only — reject an agent's KYC with reason
  rejectKYC: async (agentId: string, reason: string): Promise<ApiResponse> => {
    const { data } = await api.patch(`/kyc/${agentId}/reject`, { reason });
    return data;
  },
};
