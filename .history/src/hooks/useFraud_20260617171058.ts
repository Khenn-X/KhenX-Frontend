import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  { fraudApi, } from '../api/fraud.api';
import type {SubmitFraudReportPayload, UpdateFraudReportPayload } from '../api/fraud.api'
import { queryKeys } from '../constants/queryKeys';

export const useAdminFraudReports = () => {
  return useQuery({
    queryKey: queryKeys.fraud.all,
    queryFn: () => fraudApi.getAllReports(),
  });
};

export const useSubmitFraudReport = () => {
  return useMutation({
    mutationFn: (payload: SubmitFraudReportPayload) => fraudApi.submitReport(payload),
  });
};

export const useUpdateFraudReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFraudReportPayload }) =>
      fraudApi.updateReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fraud.all });
    },
  });
};
