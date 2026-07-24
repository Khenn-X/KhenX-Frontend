import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { neighbourhoodApi } from '../api/neighbourhood.api';
import type {
  ResidentReportPayload,
  WaitlistPayload,
  FeaturedAreasQuery,
} from '../types/neighbourhood.types';

export const neighbourhoodKeys = {
  all:      ['neighbourhood'] as const,
  lists:    () => [...neighbourhoodKeys.all, 'list'] as const,
  featured: (limit?: number) => [...neighbourhoodKeys.all, 'featured', limit] as const,
  area:     (name: string) => [...neighbourhoodKeys.all, 'area', name] as const,
};

// Single area — NeighbourhoodPage + listing detail
export const useNeighbourhood = (area: string) =>
  useQuery({
    queryKey: neighbourhoodKeys.area(area),
    queryFn:  () => neighbourhoodApi.getAreaIntelligence(area),
    enabled:  !!area,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

// All areas — Intelligence Hub
export const useAllAreas = () =>
  useQuery({
    queryKey: neighbourhoodKeys.lists(),
    queryFn:  () => neighbourhoodApi.getAllAreas(),
    staleTime: 1000 * 60 * 10,
  });

// Featured areas — Homepage + NeighbourhoodPage
export const useFeaturedAreas = (limit?: number) =>
  useQuery({
    queryKey: neighbourhoodKeys.featured(limit),
    queryFn:  () => neighbourhoodApi.getFeaturedAreas({ limit } as FeaturedAreasQuery),
    staleTime: 1000 * 60 * 10,
  });

// Submit resident report — ContributeDataPage
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

// Join waitlist — WaitlistForm + ContributeDataPage
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