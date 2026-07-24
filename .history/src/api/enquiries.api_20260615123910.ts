import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IEnquiry, SubmitEnquiryPayload, UpdateEnquiryStatusPayload } from '../types/enquiry.types';

export const enquiriesApi = {
  // Public — submit an enquiry on a listing
  submitEnquiry: async (payload: SubmitEnquiryPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/enquiries', payload);
    return data;
  },

  // Agent — get own enquiries, optionally filtered by status
  getMyEnquiries: async (status?: string): Promise<ApiResponse<{ enquiries: IEnquiry[] }>> => {
    const { data } = await api.get('/enquiries/agent/my-enquiries', {
      params: status ? { status } : undefined,
    });
    return data;
  },

  // Agent — update enquiry status (read / responded)
  updateEnquiryStatus: async (
    id: string,
    payload: UpdateEnquiryStatusPayload
  ): Promise<ApiResponse<{ enquiry: IEnquiry }>> => {
    const { data } = await api.patch(`/enquiries/${id}/status`, payload);
    return data;
  },
};
