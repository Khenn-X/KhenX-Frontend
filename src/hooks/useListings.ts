import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings.api';
import type { ListingsQueryParams } from '../api/listings.api';
import { queryKeys } from '../constants/queryKeys';
import { ROUTES } from '../constants/routes';
import { dashboardQueryOptions, invalidateDashboardQueries, publicQueryOptions } from '../lib/dashboardQuery';
import { isListingPlanLimitError } from '../lib/listingPlanErrors';
import type { CreateListingPayload, UpdateListingPayload } from '../types/listing.types';

export const useListings = (params?: ListingsQueryParams, scope: 'public' | 'dashboard' = 'public') => {
  return useQuery(
    (scope === 'dashboard' ? dashboardQueryOptions : publicQueryOptions)({
      queryKey: queryKeys.listings.all(params),
      queryFn: () => listingsApi.getListings(params),
    }),
  );
};

export const useListing = (id: string, scope: 'public' | 'dashboard' = 'public') => {
  return useQuery(
    (scope === 'dashboard' ? dashboardQueryOptions : publicQueryOptions)({
      queryKey: queryKeys.listings.detail(id),
      queryFn: () => listingsApi.getListing(id),
      enabled: !!id,
    }),
  );
};

export const useMyListings = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.listings.myListings,
      queryFn: () => listingsApi.getMyListings(),
    }),
  );
};

export const useListingUsage = () => {
  return useQuery(
    dashboardQueryOptions({
      queryKey: queryKeys.listings.usage,
      queryFn: () => listingsApi.getListingUsage(),
    }),
  );
};

export const useCreateListing = (options?: { onPlanLimit?: (error: unknown) => void; onError?: (error: unknown) => void; onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ payload, photos }: { payload: CreateListingPayload; photos: File[] }) =>
      listingsApi.createListing(payload, photos),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.listings.myListings, queryKeys.listings.all());
      options?.onSuccess?.();
      navigate(ROUTES.AGENT_LISTINGS, {
        state: { message: "Listing submitted for review. We'll notify you once it's approved." },
      });
    },
    onError: (error) => {
      if (isListingPlanLimitError(error)) {
        options?.onPlanLimit?.(error);
        return;
      }

      options?.onError?.(error);
    },
  });
};

export const useUpdateListing = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, photos }: { payload: UpdateListingPayload; photos?: File[] }) =>
      listingsApi.updateListing(id, payload, photos),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.listings.detail(id), response);
      invalidateDashboardQueries(
        queryClient,
        queryKeys.listings.detail(id),
        queryKeys.listings.myListings,
      );
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsApi.deleteListing(id),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.listings.myListings, queryKeys.listings.all());
    },
  });
};

export const useTogglePauseListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsApi.togglePause(id),
    onSuccess: () => {
      invalidateDashboardQueries(queryClient, queryKeys.listings.myListings);
    },
  });
};