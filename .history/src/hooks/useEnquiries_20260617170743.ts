import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiriesApi } from '../api/enquiries.api';
import { queryKeys } from '../constants/queryKeys';
import type, { SubmitEnquiryPayload } from '../types/enquiry.types';

export const useAgentEnquiries = (status?: string) => {
  return useQuery({
    queryKey: queryKeys.enquiries.mine(status),
    queryFn: () => enquiriesApi.getMyEnquiries(status),
  });
};

export const useSubmitEnquiry = () => {
  return useMutation({
    mutationFn: (payload: SubmitEnquiryPayload) => enquiriesApi.submitEnquiry(payload),
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'read' | 'responded' }) =>
      enquiriesApi.updateEnquiryStatus(id, { status }),
    onSuccess: () => {
      // Invalidate all enquiry queries so the list refreshes
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
  });
};
