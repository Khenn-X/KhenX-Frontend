import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedApi } from '../api/saved.api';
import { queryKeys } from '../constants/queryKeys';
import { dashboardQueryOptions, invalidateDashboardQueries, publicQueryOptions } from '../lib/dashboardQuery';
import { extractSavedListings } from '../lib/savedListings';
import { useAuthStore } from '../store/auth.store';

export const useSavedListings = (scope: 'public' | 'dashboard' = 'public') => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery(
    (scope === 'dashboard' ? dashboardQueryOptions : publicQueryOptions)({
      queryKey: queryKeys.saved.all,
      queryFn: () => savedApi.getSavedListings(),
      enabled: isAuthenticated,
      select: (response) => ({
        ...response,
        data: {
          ...response.data,
          listings: extractSavedListings(response),
        },
      }),
    }),
  );
};

export const useSaveListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => savedApi.saveListing(listingId),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.saved.all);
    },
  });
};

export const useUnsaveListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => savedApi.unsaveListing(listingId),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.saved.all);
    },
  });
};

/**
 * Convenience hook — returns whether a specific listing is saved.
 * Use on ListingCard and ListingDetail to show save/unsave button state.
 */
export const useIsListingSaved = (listingId: string): boolean => {
  const { data } = useSavedListings();
  const listings = Array.isArray(data?.data?.listings) ? data.data.listings : [];
  return listings.some((l) => l._id === listingId);
};
