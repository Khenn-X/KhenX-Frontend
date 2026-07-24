import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { queryKeys } from '../constants/queryKeys';

export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => adminApi.getStats(),
    staleTime: 1000 * 60 * 2, // 2 min — stats should be fairly fresh
  });
};

export const useAdminPendingListings = () => {
  return useQuery({
    queryKey: queryKeys.listings.pending,
    queryFn: () => adminApi.getPendingListings(),
  });
};

export const useApproveListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
};

export const useRejectListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectListing(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
};

export const useFeatureListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      adminApi.featureListing(id, isFeatured),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all() });
    },
  });
};

export const useAdminAgents = () => {
  return useQuery({
    queryKey: queryKeys.admin.agents,
    queryFn: () => adminApi.getAllAgents(),
  });
};

export const useSuspendAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendAgent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.agents });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
};
