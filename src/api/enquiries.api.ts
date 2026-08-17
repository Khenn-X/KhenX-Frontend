import api from './axios';
import type { ApiResponse } from '../types/api.types';
import type { IEnquiry, SubmitEnquiryPayload, UpdateEnquiryStatusPayload } from '../types/enquiry.types';

interface InspectionRequestPayload {
  listingId: string;
  preferredDate: string;
  timeSlot?: string;
  visitors?: number;
  contactName: string;
  message?: string;
}

export const enquiriesApi = {
  // Public — submit an enquiry on a listing
  submitEnquiry: async (payload: SubmitEnquiryPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/enquiries', payload);
    return data;
  },

  submitInspectionRequest: async (payload: InspectionRequestPayload): Promise<ApiResponse> => {
    const { data } = await api.post('/enquiries/inspection-request', payload);
    return data;
  },

  // Agent — get own enquiries
  getMyEnquiries: async (status?: string): Promise<ApiResponse<{ enquiries: IEnquiry[] }>> => {
    const { data } = await api.get('/enquiries/agent', {
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
