import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycApi } from '../api/kyc.api';
import { queryKeys } from '../constants/queryKeys';

export const useKYCStatus = () => {
  return useQuery({
    queryKey: queryKeys.kyc.status,
    queryFn: () => kycApi.getKYCStatus(),
  });
};

export const useSubmitKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ document, selfie }: { document: File; selfie: File }) =>
      kycApi.submitKYC(document, selfie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status });
    },
  });
};

export const useAdminKYCSubmissions = () => {
  return useQuery({
    queryKey: queryKeys.kyc.all,
    queryFn: () => kycApi.getAllKYC(),
  });
};

export const useApproveKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => kycApi.approveKYC(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
    },
  });
};

export const useRejectKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, reason }: { agentId: string; reason: string }) =>
      kycApi.rejectKYC(agentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
    },
  });
};
