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
// API returns all areas at once, so we slice client-side for Load More UX.
const PAGE_SIZE = 6;

export const useAllNeighbourhoods = () => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data, isLoading, isError } = useQuery({
    queryKey: neighbourhoodKeys.lists(),   // reuses the same cache as useAllAreas
    queryFn:  () => neighbourhoodApi.getAllAreas(),
    staleTime: 1000 * 60 * 10,
  });

  const allAreas: INeighbourhoodIntelligence[] = (data as any)?.data?.areas ?? [];
  const areas   = allAreas.slice(0, visibleCount);
  const hasMore = visibleCount < allAreas.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  return {
    areas,
    isLoading,
    isError,
    hasMore,
    isFetchingMore: false,   // instant — no network call needed
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