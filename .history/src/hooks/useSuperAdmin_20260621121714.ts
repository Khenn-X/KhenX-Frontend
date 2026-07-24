import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '../';
import { queryKeys } from '../constants/queryKeys';

/**
 * Fetch all admins currently in 'pending' status.
 * Superadmin-only endpoint.
 */
export const usePendingAdmins = () => {
  return useQuery({
    queryKey: queryKeys.superadmin.pendingAdmins,
    queryFn: () => superadminApi.getPendingAdmins(),
    select: (res) => res.data.data.admins,
    staleTime: 1000 * 30, // 30s — this list should stay fresh
  });
};

/**
 * Approve a pending admin account.
 * Invalidates the pending list on success.
 */
export const useApproveAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => superadminApi.approveAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.pendingAdmins });
    },
  });
};

/**
 * Reject a pending admin account.
 * Invalidates the pending list on success.
 */
export const useRejectAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => superadminApi.rejectAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.superadmin.pendingAdmins });
    },
  });
};