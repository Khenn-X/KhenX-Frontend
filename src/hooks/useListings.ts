import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/listings.api';
import type { ListingsQueryParams } from '../api/listings.api';
import { queryKeys } from '../constants/queryKeys';
import { ROUTES } from '../constants/routes';
import type { CreateListingPayload, UpdateListingPayload } from '../types/listing.types';
import { isListingPlanLimitError } from '../lib/listingPlanErrors';

export const useListings = (params?: ListingsQueryParams) => {
  return useQuery({
    queryKey: queryKeys.listings.all(params),
    queryFn: () => listingsApi.getListings(params),
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: queryKeys.listings.detail(id),
    queryFn: () => listingsApi.getListing(id),
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: queryKeys.listings.myListings,
    queryFn: () => listingsApi.getMyListings(),
  });
};

export const useListingUsage = () => {
  return useQuery({
    queryKey: queryKeys.listings.usage,
    queryFn: () => listingsApi.getListingUsage(),
  });
};

export const useCreateListing = (options?: { onPlanLimit?: (error: unknown) => void; onError?: (error: unknown) => void; onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ payload, photos }: { payload: CreateListingPayload; photos: File[] }) =>
      listingsApi.createListing(payload, photos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.myListings });
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
    mutationFn: (payload: UpdateListingPayload) => listingsApi.updateListing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.myListings });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.myListings });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all() });
    },
  });
};

export const useTogglePauseListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateListingPayload> }) =>
      listingsApi.updateListing(id, payload as UpdateListingPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.myListings });
    },
  });
};