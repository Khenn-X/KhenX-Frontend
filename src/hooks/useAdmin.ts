import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminListingStatus, type PaymentAnalyticsParams } from '../api/admin.api';
import { queryKeys } from '../constants/queryKeys';
import { dashboardQueryOptions, invalidateDashboardQueries } from '../lib/dashboardQuery';
import type { ListingStatus } from '../types/listing.types';

export type { AdminListingStatus };

export type AdminListingsStatus = 'all' | ListingStatus;

/**
 * Axios response shape from GET /admin/stats:
 *   res.data.data → {
 *     listings:       { total, active, pending }
 *     agents:         { total, pendingKYC }
 *     fraud:          { open }
 *     enquiries:      { total }
 *     users:          { total }
 *     adminApprovals: { pending }
 *     landlords:      { total, pendingKYC }
 *   }
 *
 * Access in components: const stats = data?.data.data
 */
export const useAdminStats = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.admin.stats,
      queryFn: () => adminApi.getStats(),
      // No select — preserve raw axios response so consumers can read res.data.data
    }),
  );
};

export const useAdminListings = (status: AdminListingsStatus = 'all') => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.listings.admin(status),
      queryFn: () => adminApi.getAdminListings(status === 'all' ? undefined : status),
    }),
  );
};

export const useAdminPayments = (state?: string) => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: [...queryKeys.admin.payments, state ?? 'all'],
      queryFn: () => adminApi.getPayments(state),
    }),
  );
};

export const useAdminPaymentAnalytics = (params: PaymentAnalyticsParams) => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.admin.paymentAnalytics(params),
      queryFn: () => adminApi.getPaymentAnalytics(params),
    }),
  );
};

export const useAdminPendingListings = (status: AdminListingsStatus = 'pending') => {
  return useAdminListings(status);
};

export const useApproveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveListing(id),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.listings.admin(), queryKeys.admin.stats);
    },
  });
};

export const useRejectListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectListing(id, reason),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.listings.admin(), queryKeys.admin.stats);
    },
  });
};

export const useFeatureListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      adminApi.featureListing(id, isFeatured),
    onSuccess: (_data, variables) => {
      invalidateDashboardQueries(
        queryClient,
        queryKeys.listings.admin(),
        queryKeys.listings.detail(variables.id),
        queryKeys.listings.all(),
      );
    },
  });
};

export const useAdminAgents = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.admin.agents,
      queryFn: () => adminApi.getAllAgents(),
    }),
  );
};

export const useSuspendAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendAgent(id, reason),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.admin.agents, queryKeys.admin.stats);
    },
  });
};