import api from './axios';
import type { ApiResponse } from '../types/api.types';

export type FraudReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface IFraudReport {
  _id: string;
  listingId: string;
  reportedBy?: string;
  reason: string;
  status: FraudReportStatus;
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFraudReportPayload {
  listingId: string;
  reason: string;
  reporterEmail?: string;
}

export interface UpdateFraudReportPayload {
  status: FraudReportStatus;
  adminNotes?: string;
}

export const fraudApi = {
  // Public — report a fraudulent listing
  submitReport: async (payload: SubmitFraudReportPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/fraud', payload);
    return data;
  },

  // Admin only — get all fraud reports
  getAllReports: async (): Promise<ApiResponse<{ reports: IFraudReport[] }>> => {
    const { data } = await api.get('/fraud');
    return data;
  },

  // Admin only — update fraud report status
  updateReport: async (
    id: string,
    payload: UpdateFraudReportPayload
  ): Promise<ApiResponse<{ report: IFraudReport }>> => {
    const { data } = await api.patch(`/fraud/${id}`, payload);
    return data;
  },
};
