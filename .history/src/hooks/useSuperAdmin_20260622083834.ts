import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '../api/';
import { queryKeys } from '../constants/queryKeys';

export const usePendingAdmins = () => {
  return useQuery({
    queryKey: queryKeys.superadmin.pendingAdmins,
    queryFn: () => superadminApi.getPendingAdmins(),
    select: (res) => res.data.data.requests, // ← backend sends `requests`
    staleTime: 1000 * 30,
  });
};

export const useApproveAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superadminApi.approveAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.pendingAdmins });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats }); // refresh badge count
    },
  });
};

export const useRejectAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      superadminApi.rejectAdmin(id, reason), // ← backend requires reason
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.pendingAdmins });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
};