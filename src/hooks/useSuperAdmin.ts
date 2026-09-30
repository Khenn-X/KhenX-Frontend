import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '../api/super.admin.api';
import { queryKeys } from '../constants/queryKeys';
import { dashboardQueryOptions, invalidateDashboardQueries } from '../lib/dashboardQuery';

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { fullName: string; email: string }) => superadminApi.createAdmin(payload),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.admin.stats, queryKeys.superadmin.pendingAdmins);
    },
  });
};

export const usePendingAdmins = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.superadmin.pendingAdmins,
      queryFn: () => superadminApi.getPendingAdmins(),
      select: (res) => res.data.data.requests,
    }),
  );
};

export const useApproveAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superadminApi.approveAdmin(id),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.superadmin.pendingAdmins, queryKeys.admin.stats);
    },
  });
};

export const useRejectAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      superadminApi.rejectAdmin(id, reason),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.superadmin.pendingAdmins, queryKeys.admin.stats);
    },
  });
};