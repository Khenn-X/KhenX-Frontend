import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { neighbourhoodApi } from '../api/neighbourhood.api';
import type {
  ResidentReportPayload,
  WaitlistPayload,
  FeaturedAreasQuery,
  INeighbourhoodIntelligence,
} from '../types/neighbourhood.types';

export const neighbourhoodKeys = {
  all:      ['neighbourhood'] as const,
  lists:    () => [...neighbourhoodKeys.all, 'list'] as const,
  featured: (limit?: number) => [...neighbourhoodKeys.all, 'featured', limit] as const,
  area:     (name: string) => [...neighbourhoodKeys.all, 'area', name] as const,
  paged:    (page: number) => [...neighbourhoodKeys.all, 'paged', page] as const,
};

// ─── Single area — NeighbourhoodPage + listing detail ────────────────────────
export const useNeighbourhood = (area: string) =>
  useQuery({
    queryKey: neighbourhoodKeys.area(area),
    queryFn:  () => neighbourhoodApi.getAreaIntelligence(area),
    enabled:  !!area,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

// ─── All areas (non-paginated) — Intelligence Hub ────────────────────────────
export const useAllAreas = () =>
  useQuery({
    queryKey: neighbourhoodKeys.lists(),
    queryFn:  () => neighbourhoodApi.getAllAreas(),
    staleTime: 1000 * 60 * 10,
  });

// ─── Featured areas — Homepage + NeighbourhoodPage ───────────────────────────
export const useFeaturedAreas = (limit?: number) =>
  useQuery({
    queryKey: neighbourhoodKeys.featured(limit),
    queryFn:  () => neighbourhoodApi.getFeaturedAreas({ limit } as FeaturedAreasQuery),
    staleTime: 1000 * 60 * 10,
  });

// ─── Paginated browse — NeighbourhoodPage browse grid ────────────────────────
const PAGE_SIZE = 6;

export const useAllNeighbourhoods = () => {
  const [page, setPage]                     = useState(1);
  const [allAreas, setAllAreas]             = useState<INeighbourhoodIntelligence[]>([]);
  const [totalPages, setTotalPages]         = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { isLoading, isError } = useQuery({
    queryKey: neighbourhoodKeys.paged(1),
    queryFn:  () => neighbourhoodApi.getAllAreas({ page: 1, limit: PAGE_SIZE }),
    staleTime: 1000 * 60 * 10,
    onSuccess: (data: any) => {
      setAllAreas(data?.data?.areas ?? []);
      setTotalPages(data?.data?.pages ?? 1);
      setPage(1);
    },
  });

  const loadMore = useCallback(async () => {
    if (isFetchingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const data: any = await neighbourhoodApi.getAllAreas({ page: nextPage, limit: PAGE_SIZE });
      setAllAreas((prev) => [...prev, ...(data?.data?.areas ?? [])]);
      setPage(nextPage);
      setTotalPages(data?.data?.pages ?? totalPages);
    } catch {
      toast.error('Failed to load more neighbourhoods. Please try again.');
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, page, totalPages]);

  return {
    areas: allAreas,
    isLoading,
    isError,
    hasMore: page < totalPages,
    isFetchingMore,
    loadMore,
  };
};

// ─── Submit resident report — ContributeDataPage ─────────────────────────────
export const useSubmitResidentReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResidentReportPayload) => neighbourhoodApi.submitResidentReport(data),
    onSuccess: (_, variables) => {
      toast.success('Report submitted. Thank you for helping your community!');
      queryClient.invalidateQueries({
        queryKey: neighbourhoodKeys.area(variables.areaName),
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    },
  });
};

// ─── Join waitlist — WaitlistForm + ContributeDataPage ───────────────────────
export const useJoinWaitlist = () =>
  useMutation({
    mutationFn: (data: WaitlistPayload) => neighbourhoodApi.joinWaitlist(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "You're on the list!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    },
  });